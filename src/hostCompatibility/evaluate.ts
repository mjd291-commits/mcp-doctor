import type { Observation, ScanReport } from "../types.js";
import { alphaHostRulePacks } from "./packs/index.js";
import type { HostCompatibilityStatus, HostRule, HostRulePack } from "./types.js";
import { assertValidHostRulePack } from "./validate.js";

export interface HostRuleResult {
  ruleId: string;
  title: string;
  surfaces: string[];
  status: HostCompatibilityStatus;
  message: string;
  observationIds: string[];
  evidenceIds: string[];
  sources: Array<{ url: string; retrievedAt: string; claim: string; locator?: string }>;
}

export interface CompatibilityMatrix {
  schemaVersion: "1.0.0";
  evaluatedAt: string;
  target: string;
  basis: "local-observation-evaluation";
  realHostTested: false;
  protocolConformance: "not-tested";
  hosts: Array<{
    host: HostRulePack["host"];
    packId: string;
    packVersion: string;
    verifiedAt: string;
    scopeSummary: string;
    counts: Record<HostCompatibilityStatus, number>;
    results: HostRuleResult[];
  }>;
}

type Predicate = (get: (key: string) => unknown) => boolean | undefined;
const record = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

// Visit schema locations only: property names and enum/default payloads are not schemas.
function schemaHas(value: unknown, predicate: (v: Record<string, unknown>) => boolean): boolean {
  if (!record(value)) return false;
  if (predicate(value)) return true;
  for (const key of ["properties", "patternProperties", "$defs", "definitions", "dependentSchemas"]) {
    const map = value[key];
    if (record(map) && Object.values(map).some(v => schemaHas(v, predicate))) return true;
  }
  for (const key of ["items", "additionalProperties", "contains", "not", "if", "then", "else", "propertyNames"]) {
    if (schemaHas(value[key], predicate)) return true;
  }
  for (const key of ["anyOf", "allOf", "oneOf", "prefixItems"]) {
    if (Array.isArray(value[key]) && value[key].some(v => schemaHas(v, predicate))) return true;
  }
  return false;
}

const toolArray = (get: (key: string) => unknown, key: string): unknown[] | undefined => {
  const value = get(key);
  return Array.isArray(value) ? value : undefined;
};

const predicates: Record<string, Predicate> = {
  "openai.chatgpt.remote-endpoint.https-or-tunnel": get => {
    if (get("connection.secureMcpTunnel") === true) return true;
    // The scanner does not inspect tunnel deployment configuration.
    if (get("connection.secureMcpTunnel") !== false) return undefined;
    if (get("connection.endpoint.scheme") !== "https") return false;
    const reachable = get("connection.endpoint.publicReachability");
    return typeof reachable === "boolean" ? reachable : undefined;
  },
  "openai.chatgpt.remote-transport.streamable-http": get => {
    if (get("connection.secureMcpTunnel") === true) return undefined;
    if (get("connection.transport") === "streamable-http") return true;
    // Successful SSE fallback does not prove an endpoint is SSE-only.
    return undefined;
  },
  "openai.chatgpt.tool-description.plugin-quality": get => {
    const descriptions = toolArray(get, "tools[].description");
    if (descriptions?.some(d => typeof d !== "string" || !d.trim())) return false;
    return undefined; // Accurate behavior requires evidence beyond discovery metadata.
  },
  "anthropic.claude.messages-api.endpoint-https": get => {
    const scheme = get("connection.endpoint.scheme");
    return typeof scheme === "string" ? scheme === "https" : undefined;
  },
  "anthropic.claude.remote-connector.public-reachability": get => {
    const reachable = get("connection.endpoint.publicReachability");
    return typeof reachable === "boolean" ? reachable : undefined;
  },
  "anthropic.claude.messages-api.remote-transport": get => {
    const transport = get("connection.transport");
    if (transport === "stdio") return false;
    if (!["streamable-http", "sse"].includes(String(transport))) return undefined;
    const reachable = get("connection.endpoint.publicReachability");
    return typeof reachable === "boolean" ? reachable : undefined;
  },
  "google.gemini-cli.server-alias.no-underscore": get => {
    const alias = get("hostConfig.serverAlias");
    return typeof alias === "string" ? !alias.includes("_") : undefined;
  },
  "google.gemini-cli.transport.supported-set": get => {
    const transport = get("connection.transport");
    return typeof transport === "string" ? ["stdio", "sse", "streamable-http"].includes(transport) : undefined;
  },
  "google.gemini-cli.tool-name.sanitization": get => {
    const names = toolArray(get, "tools[].name");
    if (!names || names.some(n => typeof n !== "string")) return undefined;
    return names.every(n => typeof n === "string" && /^[A-Za-z_][A-Za-z0-9_-]{0,62}$/.test(n));
  },
  "google.gemini-cli.schema.additional-properties-stripped": get => {
    const schemas = toolArray(get, "tools[].inputSchema");
    if (!schemas || schemas.some(s => !record(s) || schemaHas(s, v => Object.hasOwn(v, "$ref") || Object.hasOwn(v, "$dynamicRef")))) return undefined;
    return !schemas.some(s => schemaHas(s, v => Object.hasOwn(v, "additionalProperties")));
  },
  "google.gemini-cli.schema.anyof-default-removed": get => {
    const schemas = toolArray(get, "tools[].inputSchema");
    if (!schemas || schemas.some(s => !record(s) || schemaHas(s, v => Object.hasOwn(v, "$ref") || Object.hasOwn(v, "$dynamicRef")))) return undefined;
    return !schemas.some(s => schemaHas(s, v => Array.isArray(v.anyOf) &&
      v.anyOf.some(branch => schemaHas(branch, b => Object.hasOwn(b, "default")))));
  },
};

function evaluateRule(report: ScanReport, pack: HostRulePack, rule: HostRule): HostRuleResult {
  const evidenceIds = new Set(report.evidence.map(e => e.id));
  const used = new Map<string, Observation>();
  const get = (key: string): unknown => {
    if (!rule.check.observationKeys.includes(key)) return undefined;
    const matches = report.observations.filter(o => o.id === key);
    if (matches.length !== 1) return undefined;
    const o = matches[0]!;
    if (o.status !== "observed" || !o.evidenceIds.length || o.evidenceIds.some(id => !evidenceIds.has(id))) return undefined;
    used.set(key, o);
    return o.value;
  };
  let status: HostCompatibilityStatus = "unknown";
  let message = "Insufficient observations or evaluator support; no compatibility conclusion.";
  const date = report.completedAt.slice(0, 10);
  if (rule.deprecation.status !== "active" || (rule.effective.from && date < rule.effective.from) ||
      (rule.effective.through && date > rule.effective.through) || rule.effective.hostVersion || rule.effective.planOrEdition?.length) {
    message = "Rule scope is inactive or cannot be established from this scan.";
  } else if (["manual", "real-host", "live"].includes(rule.check.mode) || rule.check.requiresActualHostExecution) {
    status = "not-tested";
    message = "Required manual, host-network, or actual-host execution was not performed.";
  } else {
    const outcome = predicates[rule.id]?.(get);
    if (outcome !== undefined) {
      status = outcome ? rule.outcomes.satisfied : rule.outcomes.unsatisfied;
      message = outcome ? "Observed metadata satisfies this scoped host rule." : "Observed metadata triggers this scoped host requirement or transformation risk.";
    }
  }
  return {
    ruleId: rule.id, title: rule.title, surfaces: rule.surfaces, status, message,
    observationIds: [...used.keys()], evidenceIds: [...new Set([...used.values()].flatMap(o => o.evidenceIds))],
    sources: rule.sources.map(claim => {
      const source = pack.sources.find(s => s.id === claim.sourceId)!;
      return { url: source.url, retrievedAt: source.retrievedAt, claim: claim.claim, locator: claim.locator };
    }),
  };
}

export function evaluateCompatibility(report: ScanReport, packs = alphaHostRulePacks): CompatibilityMatrix {
  return {
    schemaVersion: "1.0.0", evaluatedAt: report.completedAt, target: report.target,
    basis: "local-observation-evaluation", realHostTested: false, protocolConformance: "not-tested",
    hosts: packs.map(pack => {
      assertValidHostRulePack(pack);
      const results = pack.rules.map(rule => evaluateRule(report, pack, rule));
      const counts = { pass: 0, fail: 0, warn: 0, unknown: 0, "not-tested": 0 };
      for (const result of results) counts[result.status]++;
      return { host: pack.host, packId: pack.packId, packVersion: pack.packVersion,
        verifiedAt: pack.verifiedAt, scopeSummary: pack.scopeSummary, counts, results };
    }),
  };
}
