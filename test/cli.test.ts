import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import test from "node:test";
import { startFixture } from "./fixtures/mcpFixtureServer.js";

const exec = promisify(execFile);
test("CLI emits a full JSON matrix and scoped terminal findings from a controlled server", async t => {
  const fixture = await startFixture("healthy");
  t.after(() => fixture.close());
  const cli = new URL("../src/cli.ts", import.meta.url).pathname;
  const options = { timeout: 5000, maxBuffer: 256_000 };
  const json = await exec(process.execPath, ["--import", "tsx", cli, fixture.url.href, "--json"], options);
  const report = JSON.parse(json.stdout);
  assert.equal(report.compatibility.hosts.length, 3);
  assert.equal(report.compatibility.realHostTested, false);
  assert.ok(report.evidence.length > 0);
  const terminal = await exec(process.execPath, ["--import", "tsx", cli, fixture.url.href], options);
  assert.match(terminal.stdout, /Claude/);
  assert.match(terminal.stdout, /real hosts and official conformance not tested/);
  assert.match(terminal.stdout, /messages-api-mcp-connector/);
  assert.ok(!fixture.snapshot().requests.some(r => r.method === "tools/call"));
  await assert.rejects(exec(process.execPath, ["--import", "tsx", cli, fixture.url.href, "--timeout-ms"], options), /requires a value/);
});
