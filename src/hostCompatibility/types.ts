export const HOST_RULE_SCHEMA_VERSION = "1.0.0" as const;

export type HostCompatibilityStatus =
  | "pass"
  | "fail"
  | "warn"
  | "unknown"
  | "not-tested";

export type HostRuleType =
  | "requirement"
  | "recommendation"
  | "documented-behavior";

export type HostRuleCheckMode =
  | "static"
  | "live"
  | "semantic"
  | "manual"
  | "real-host";

export type HostRuleSeverity = "blocker" | "error" | "warning" | "info";
export type HostRuleConfidence = "high" | "medium" | "low";
export type HostRuleAutofixability = "none" | "suggested" | "safe";

export interface HostRuleSource {
  id: string;
  publisher: string;
  title: string;
  url: string;
  sourceType: "official-docs" | "official-help" | "official-release-notes";
  retrievedAt: string;
  publishedAt?: string;
  lastUpdatedAt?: string;
  notes?: string;
}

export interface HostRuleSourceClaim {
  sourceId: string;
  claim: string;
  locator?: string;
}

export interface HostRuleEffectiveScope {
  from?: string;
  through?: string;
  hostVersion?: string;
  planOrEdition?: string[];
  notes?: string;
}

export interface HostRuleCheck {
  mode: HostRuleCheckMode;
  /**
   * Stable normalized observation keys expected from Workstream 01.
   * Host rules must consume observations; they must not redefine MCP conformance.
   */
  observationKeys: string[];
  /** Human-readable deterministic/semantic assertion until the rule engine DSL lands. */
  assertion: string;
  requiresActualHostExecution?: boolean;
}

export interface HostRuleOutcomes {
  satisfied: HostCompatibilityStatus;
  unsatisfied: HostCompatibilityStatus;
  insufficientEvidence: "unknown";
  unexecuted: "not-tested";
}

export interface HostRuleDeprecation {
  status: "active" | "deprecated" | "retired";
  replacedBy?: string;
  notes?: string;
}

export interface HostRule {
  /** Stable forever. Change behavior by adding a new rule/version, never by repurposing an ID. */
  id: string;
  host: string;
  surfaces: string[];
  title: string;
  description: string;
  ruleType: HostRuleType;
  effective: HostRuleEffectiveScope;
  sources: HostRuleSourceClaim[];
  check: HostRuleCheck;
  severity: HostRuleSeverity;
  confidence: HostRuleConfidence;
  autofixability: HostRuleAutofixability;
  outcomes: HostRuleOutcomes;
  /** Hard guardrail: protocol conformance rules belong to Workstream 01, not here. */
  protocolBoundary: "host-compatibility-only";
  deprecation: HostRuleDeprecation;
}

export interface HostRulePack {
  schemaVersion: typeof HOST_RULE_SCHEMA_VERSION;
  packId: string;
  packVersion: string;
  verifiedAt: string;
  host: {
    id: string;
    name: string;
    vendor: string;
  };
  scopeSummary: string;
  sources: HostRuleSource[];
  rules: HostRule[];
}

export const HOST_COMPATIBILITY_STATUS_SEMANTICS: Record<
  HostCompatibilityStatus,
  string
> = {
  pass: "The observed server/configuration satisfies the host-specific rule for the scoped surface.",
  fail: "The observed server/configuration violates a source-backed host requirement for the scoped surface.",
  warn: "The host documentation describes a recommendation, transformation, limitation, or risk that may degrade behavior but is not proven to block the scoped surface.",
  unknown: "The rule is applicable, but the scanner lacks enough evidence to judge it without guessing.",
  "not-tested": "The rule requires an execution path that was not run, especially actual-host or manual testing; no compatibility claim is made.",
};
