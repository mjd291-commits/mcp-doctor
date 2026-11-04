import { isRecord, redactTarget, safeJsonValue } from "./scanRuntime.js";
import type { ScanReport } from "./types.js";

export interface UpstreamResults {
  schemaVersion: "1";
  tool: "mcp-inspector" | "mcp-conformance";
  toolVersion: string;
  target: string;
  completedAt: string;
  protocolVersion?: string;
  /** Caller-normalized results, not a claim of native upstream JSON compatibility. */
  checks: Array<{ id: string; status: "pass" | "fail" | "warn"; scannerCheckId?: string }>;
}

export interface UpstreamComparison {
  provenance: "caller-supplied-unverified";
  run: UpstreamResults;
  comparisons: Array<{ upstreamCheckId: string; scannerCheckId?: string; outcome: "agree" | "differ" | "unmapped" }>;
}

/** Ingest explicit external-run evidence. Never starts upstream tools or MCP tools. */
export function compareUpstreamResults(input: unknown, report: ScanReport): UpstreamComparison {
  if (!isRecord(input) || input.schemaVersion !== "1" ||
      !["mcp-inspector", "mcp-conformance"].includes(String(input.tool)) ||
      typeof input.toolVersion !== "string" || !input.toolVersion.trim() ||
      typeof input.target !== "string" ||
      typeof input.completedAt !== "string" || !Number.isFinite(Date.parse(input.completedAt)) ||
      (input.protocolVersion !== undefined && typeof input.protocolVersion !== "string") ||
      !Array.isArray(input.checks) || input.checks.length > 1000) {
    throw new Error("Invalid upstream-results envelope (expected versioned, caller-normalized Inspector/Conformance results).");
  }
  if (redactTarget(input.target) !== report.target) throw new Error("Upstream target does not match this scan.");
  if (input.protocolVersion !== undefined && input.protocolVersion !== report.context.protocol.version) {
    throw new Error("Upstream protocol version does not match this scan.");
  }
  const ids = new Set<string>();
  for (const check of input.checks) {
    if (!isRecord(check) || typeof check.id !== "string" || !check.id || ids.has(check.id) ||
        !["pass", "fail", "warn"].includes(String(check.status)) ||
        (check.scannerCheckId !== undefined && typeof check.scannerCheckId !== "string")) {
      throw new Error("Invalid or duplicate upstream check.");
    }
    ids.add(check.id);
  }
  const run: UpstreamResults = {
    schemaVersion: "1", tool: input.tool as UpstreamResults["tool"],
    toolVersion: input.toolVersion, target: report.target, completedAt: input.completedAt,
    protocolVersion: input.protocolVersion as string | undefined,
    checks: input.checks.map(c => ({ id: c.id, status: c.status, scannerCheckId: c.scannerCheckId })),
  };
  const safe = safeJsonValue(run);
  if (!isRecord(safe) || safe.truncated || safe.serializationFailed) throw new Error("Upstream results exceed evidence size limit.");
  const sanitized = safe as unknown as UpstreamResults;
  return {
    provenance: "caller-supplied-unverified", run: sanitized,
    comparisons: sanitized.checks.map(check => {
      const scanner = report.checks.find(c => c.id === check.scannerCheckId);
      return { upstreamCheckId: check.id, scannerCheckId: check.scannerCheckId,
        outcome: !scanner ? "unmapped" : scanner.status === check.status ? "agree" : "differ" };
    }),
  };
}
