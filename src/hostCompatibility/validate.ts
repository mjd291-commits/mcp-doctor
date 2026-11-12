import {
  HOST_RULE_SCHEMA_VERSION,
  type HostRulePack,
} from "./types.js";

export interface HostRuleValidationIssue {
  path: string;
  message: string;
}

const RULE_ID = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

function isOfficialUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateHostRulePack(pack: HostRulePack): HostRuleValidationIssue[] {
  const issues: HostRuleValidationIssue[] = [];

  if (pack.schemaVersion !== HOST_RULE_SCHEMA_VERSION) {
    issues.push({
      path: "schemaVersion",
      message: `expected ${HOST_RULE_SCHEMA_VERSION}`,
    });
  }

  if (!RULE_ID.test(pack.packId)) {
    issues.push({ path: "packId", message: "must be a stable lowercase dotted/dashed ID" });
  }

  if (!SEMVER.test(pack.packVersion)) {
    issues.push({ path: "packVersion", message: "must be semantic versioning" });
  }

  if (!ISO_DATE.test(pack.verifiedAt)) {
    issues.push({ path: "verifiedAt", message: "must be YYYY-MM-DD" });
  }

  if (!pack.host.id || !pack.host.name || !pack.host.vendor) {
    issues.push({ path: "host", message: "id, name and vendor are required" });
  }

  const sourceIds = new Set<string>();
  for (const [index, source] of pack.sources.entries()) {
    const path = `sources[${index}]`;
    if (!source.id || sourceIds.has(source.id)) {
      issues.push({ path: `${path}.id`, message: "source ID is required and must be unique" });
    }
    sourceIds.add(source.id);

    if (!source.publisher || !source.title) {
      issues.push({ path, message: "publisher and title are required" });
    }
    if (!isOfficialUrl(source.url)) {
      issues.push({ path: `${path}.url`, message: "must be a valid HTTPS official-source URL" });
    }
    if (!ISO_DATE.test(source.retrievedAt)) {
      issues.push({ path: `${path}.retrievedAt`, message: "must be YYYY-MM-DD" });
    }
  }

  const ruleIds = new Set<string>();
  for (const [index, rule] of pack.rules.entries()) {
    const path = `rules[${index}]`;

    if (!RULE_ID.test(rule.id) || ruleIds.has(rule.id)) {
      issues.push({ path: `${path}.id`, message: "rule ID must be stable, lowercase and unique" });
    }
    ruleIds.add(rule.id);

    if (rule.host !== pack.host.id) {
      issues.push({ path: `${path}.host`, message: "must match pack host.id" });
    }

    if (rule.surfaces.length === 0) {
      issues.push({ path: `${path}.surfaces`, message: "at least one host surface is required" });
    }

    if (rule.sources.length === 0) {
      issues.push({ path: `${path}.sources`, message: "at least one official-source claim is required" });
    }

    for (const [claimIndex, sourceClaim] of rule.sources.entries()) {
      if (!sourceIds.has(sourceClaim.sourceId)) {
        issues.push({
          path: `${path}.sources[${claimIndex}].sourceId`,
          message: `unknown source ID: ${sourceClaim.sourceId}`,
        });
      }
      if (!sourceClaim.claim.trim()) {
        issues.push({
          path: `${path}.sources[${claimIndex}].claim`,
          message: "source-backed claim must not be empty",
        });
      }
    }

    if (!rule.check.assertion.trim()) {
      issues.push({ path: `${path}.check.assertion`, message: "assertion must not be empty" });
    }

    if (
      rule.check.requiresActualHostExecution === true &&
      rule.check.mode !== "real-host"
    ) {
      issues.push({
        path: `${path}.check`,
        message: "requiresActualHostExecution=true requires check.mode=real-host",
      });
    }

    if (rule.protocolBoundary !== "host-compatibility-only") {
      issues.push({
        path: `${path}.protocolBoundary`,
        message: "host packs may not contain MCP protocol-conformance rules",
      });
    }

    if (rule.outcomes.insufficientEvidence !== "unknown") {
      issues.push({
        path: `${path}.outcomes.insufficientEvidence`,
        message: "insufficient evidence must map to unknown",
      });
    }

    if (rule.outcomes.unexecuted !== "not-tested") {
      issues.push({
        path: `${path}.outcomes.unexecuted`,
        message: "unexecuted checks must map to not-tested",
      });
    }

    if (rule.ruleType === "requirement" && rule.outcomes.unsatisfied !== "fail") {
      issues.push({
        path: `${path}.outcomes.unsatisfied`,
        message: "source-backed requirements must fail when deterministically violated",
      });
    }

    if (
      rule.ruleType !== "requirement" &&
      rule.outcomes.unsatisfied === "fail"
    ) {
      issues.push({
        path: `${path}.outcomes.unsatisfied`,
        message: "recommendations/documented behavior must not become hard failures",
      });
    }
  }

  return issues;
}

export function assertValidHostRulePack(pack: HostRulePack): void {
  const issues = validateHostRulePack(pack);
  if (issues.length === 0) return;

  const formatted = issues.map((issue) => `- ${issue.path}: ${issue.message}`).join("\n");
  throw new Error(`Invalid host rule pack ${pack.packId}@${pack.packVersion}:\n${formatted}`);
}
