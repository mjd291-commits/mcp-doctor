import assert from "node:assert/strict";
import test from "node:test";
import { compareUpstreamResults } from "../src/upstreamResults.js";
import { scanRemote } from "../src/scanner.js";

test("upstream comparison preserves provenance, mismatches, unmapped checks and protocol boundary", async () => {
  const report = await scanRemote("https://fixture.invalid/mcp", {
    fetch: async () => { throw new Error("controlled failure"); },
  });
  const run = {
    schemaVersion: "1", tool: "mcp-conformance", toolVersion: "fixture-only",
    target: report.target, completedAt: report.completedAt,
    checks: [
      { id: "a", status: "fail", scannerCheckId: "connection" },
      { id: "b", status: "pass", scannerCheckId: "connection" },
      { id: "c", status: "pass" },
    ],
  };
  const comparison = compareUpstreamResults(run, report);
  assert.equal(comparison.provenance, "caller-supplied-unverified");
  assert.deepEqual(comparison.comparisons.map(c => c.outcome), ["agree", "differ", "unmapped"]);
  assert.equal(report.compatibility!.protocolConformance, "not-tested");
  assert.throws(() => compareUpstreamResults({ ...run, target: "https://other.invalid" }, report), /target/);
  assert.throws(() => compareUpstreamResults({ ...run, protocolVersion: "wrong" }, report), /protocol/);
  assert.throws(() => compareUpstreamResults({ ...run, checks: [run.checks[0], run.checks[0]] }, report), /duplicate/);
});
