import assert from "node:assert/strict";
import test from "node:test";
import { scanRemote } from "../src/scanner.js";
import { evaluateCompatibility } from "../src/hostCompatibility/evaluate.js";
import { alphaHostRulePacks } from "../src/hostCompatibility/packs/index.js";
import { startFixture } from "./fixtures/mcpFixtureServer.js";

test("one real controlled scan yields distinct source-backed host findings without tool calls", async t => {
  const fixture = await startFixture("healthy");
  t.after(() => fixture.close());
  const report = await scanRemote(fixture.url.href, { connectTimeoutMs: 1000, requestTimeoutMs: 1000 });
  const matrix = report.compatibility!;
  assert.equal(matrix.hosts.length, 3);
  assert.equal(matrix.realHostTested, false);
  assert.equal(matrix.protocolConformance, "not-tested");
  const results = matrix.hosts.flatMap(h => h.results);
  assert.equal(results.find(r => r.ruleId === "anthropic.claude.messages-api.endpoint-https")?.status, "fail");
  assert.equal(results.find(r => r.ruleId === "google.gemini-cli.schema.additional-properties-stripped")?.status, "warn");
  assert.equal(results.find(r => r.ruleId === "openai.chatgpt.remote-transport.streamable-http")?.status, "pass");
  assert.equal(results.find(r => r.ruleId === "openai.chatgpt.remote-endpoint.https-or-tunnel")?.status, "unknown");
  assert.ok(results.some(r => r.status === "not-tested"));
  for (const result of results) {
    assert.ok(result.sources.length > 0);
    assert.ok(result.surfaces.length > 0);
    for (const id of result.evidenceIds) assert.ok(report.evidence.some(e => e.id === id));
    if (["pass", "fail", "warn"].includes(result.status)) assert.ok(result.observationIds.length > 0);
  }
  assert.equal(report.observations.find(o => o.id === "protocol.negotiation")?.status, "observed");
  assert.ok(!fixture.snapshot().requests.some(r => r.method === "tools/call"));
  assert.equal(report.checks.some(c => c.id.startsWith("anthropic.")), false);

  const missingEvidence = evaluateCompatibility({ ...report, evidence: [] });
  assert.ok(missingEvidence.hosts.every(h => h.results.every(r => ["unknown", "not-tested"].includes(r.status))));
  const failedDiscovery = evaluateCompatibility({ ...report, observations: report.observations.map(o =>
    o.id.startsWith("tools[]") ? { ...o, status: "failed" as const } : o) });
  assert.equal(failedDiscovery.hosts.flatMap(h => h.results).find(r => r.ruleId === "google.gemini-cli.tool-name.sanitization")?.status, "unknown");
  const duplicate = report.observations.find(o => o.id === "connection.endpoint.scheme")!;
  const ambiguous = evaluateCompatibility({ ...report, observations: [...report.observations, duplicate] });
  assert.equal(ambiguous.hosts.flatMap(h => h.results).find(r => r.ruleId === "anthropic.claude.messages-api.endpoint-https")?.status, "unknown");
});

test("connection failure never becomes a host transport failure or empty-catalog pass", async () => {
  const report = await scanRemote("https://fixture.invalid/mcp", {
    fetch: async () => { throw new Error("controlled connection failure"); },
    connectTimeoutMs: 100,
  });
  const results = report.compatibility!.hosts.flatMap(h => h.results);
  assert.equal(results.find(r => r.ruleId === "google.gemini-cli.transport.supported-set")?.status, "unknown");
  assert.equal(results.find(r => r.ruleId === "google.gemini-cli.tool-name.sanitization")?.status, "unknown");
  assert.equal(report.transport, "none");
});

test("reliability faults remain bounded and expose the SDK duplicate-response limitation", async t => {
  for (const id of ["hang", "malformed-json", "duplicate-response", "disconnect-recovery", "fake-auth"] as const) {
    await t.test(id, async t => {
      const fixture = await startFixture(id);
      t.after(() => fixture.close());
      const report = await scanRemote(fixture.url.href, { connectTimeoutMs: 500, requestTimeoutMs: 100 });
      if (id === "duplicate-response") {
        // SDK 2.4.0 accepts the first response. Preserve this observed limitation;
        // the raw fixture test proves duplicates, not scanner conformance detection.
        assert.equal(report.discovered.tools, 1);
        assert.equal(report.compatibility!.protocolConformance, "not-tested");
      } else {
        assert.ok(report.observations.some(o => ["failed", "timed-out"].includes(o.status)));
      }
      assert.equal(report.compatibility!.realHostTested, false);
      assert.ok(!fixture.snapshot().requests.some(r => r.method === "tools/call"));
      if (id === "disconnect-recovery") {
        const recovered = await scanRemote(fixture.url.href, { connectTimeoutMs: 500, requestTimeoutMs: 500 });
        assert.equal(recovered.discovered.tools, 1);
      }
    });
  }
});

test("inactive/future and actual-host rules never produce local passes", async t => {
  const fixture = await startFixture("healthy");
  t.after(() => fixture.close());
  const report = await scanRemote(fixture.url.href);
  const packs = structuredClone(alphaHostRulePacks);
  for (const pack of packs) for (const rule of pack.rules) rule.effective.from = "2099-01-01";
  assert.ok(evaluateCompatibility(report, packs).hosts.every(h => h.results.every(r => r.status === "unknown")));
  for (const pack of packs) for (const rule of pack.rules) {
    rule.effective.from = "2026-01-01";
    rule.check.mode = "real-host";
    rule.check.requiresActualHostExecution = true;
  }
  assert.ok(evaluateCompatibility(report, packs).hosts.every(h => h.results.every(r => r.status === "not-tested")));
});
