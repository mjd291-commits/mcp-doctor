import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { scanRemote } from "../src/scanner.js";
import {
  FIXTURE_FAKE_TOKEN,
  FIXTURE_PROTOCOL_VERSION,
  startFixture,
  type FixtureId,
} from "./fixtures/mcpFixtureServer.js";

const CLIENT_META = {
  "io.modelcontextprotocol/protocolVersion": FIXTURE_PROTOCOL_VERSION,
  "io.modelcontextprotocol/clientInfo": {
    name: "mcp-doctor-fixture-test",
    version: "1.0.0",
  },
  "io.modelcontextprotocol/clientCapabilities": {},
};

function requestBody(method: string, id = 1) {
  return JSON.stringify({
    jsonrpc: "2.0",
    id,
    method,
    params: { _meta: CLIENT_META },
  });
}

async function postRpc(
  url: URL,
  method: string,
  options: { signal?: AbortSignal; authorization?: string; id?: number } = {},
): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json, text/event-stream",
      "content-type": "application/json",
      "mcp-protocol-version": FIXTURE_PROTOCOL_VERSION,
      "mcp-method": method,
      ...(options.authorization ? { authorization: options.authorization } : {}),
    },
    body: requestBody(method, options.id ?? 1),
    signal: options.signal,
  });
}

async function withDeadline<T>(promise: Promise<T>, timeoutMs = 2_000): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Test deadline exceeded after ${timeoutMs} ms`)), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

const expectedIds: FixtureId[] = [
  "healthy",
  "weak-schema",
  "hang",
  "disconnect-recovery",
  "malformed-json",
  "duplicate-response",
  "fake-auth",
];

test("baseline manifest is versioned and covers the fixture contract", () => {
  const raw = readFileSync(new URL("./fixtures/baseline.v1.json", import.meta.url), "utf8");
  const baseline = JSON.parse(raw) as {
    schemaVersion: string;
    protocolVersion: string;
    fixtures: Array<{ id: FixtureId }>;
  };

  assert.equal(baseline.schemaVersion, "1");
  assert.equal(baseline.protocolVersion, FIXTURE_PROTOCOL_VERSION);
  assert.deepEqual(
    baseline.fixtures.map((fixture) => fixture.id),
    expectedIds,
  );
});

test("healthy fixture serves deterministic modern discovery and catalogs", async (t) => {
  const fixture = await startFixture("healthy");
  t.after(() => fixture.close());

  const discover = await postRpc(fixture.url, "server/discover");
  assert.equal(discover.status, 200);
  const discoverBody = (await discover.json()) as any;
  assert.deepEqual(discoverBody.result.supportedVersions, [FIXTURE_PROTOCOL_VERSION]);
  assert.equal(discoverBody.result._meta["io.modelcontextprotocol/serverInfo"].name, "mcp-doctor-fixture");

  const tools = await postRpc(fixture.url, "tools/list", { id: 2 });
  const toolsBody = (await tools.json()) as any;
  assert.equal(toolsBody.result.tools.length, 1);
  assert.equal(toolsBody.result.tools[0].name, "fixture.echo");

  const resources = await postRpc(fixture.url, "resources/list", { id: 3 });
  assert.deepEqual(((await resources.json()) as any).result.resources, []);

  const prompts = await postRpc(fixture.url, "prompts/list", { id: 4 });
  assert.deepEqual(((await prompts.json()) as any).result.prompts, []);
});

test("current scanner can consume the healthy fixture", async (t) => {
  const fixture = await startFixture("healthy");
  t.after(() => fixture.close());

  const report = await withDeadline(scanRemote(fixture.url.href));
  assert.equal(report.server?.name, "mcp-doctor-fixture");
  assert.equal(report.discovered.tools, 1);
  assert.equal(report.checks.find((check) => check.id === "tools.descriptions")?.status, "pass");
});

test("weak-schema fixture remains protocol-valid but produces a deterministic warning", async (t) => {
  const fixture = await startFixture("weak-schema");
  t.after(() => fixture.close());

  const report = await withDeadline(scanRemote(fixture.url.href));
  assert.equal(report.discovered.tools, 1);
  assert.equal(report.checks.find((check) => check.id === "tools.descriptions")?.status, "warn");
});

test("hang fixture is caller-cancellable and fixture teardown cannot leave CI hung", async (t) => {
  const fixture = await startFixture("hang");
  t.after(() => fixture.close());

  const started = Date.now();
  await assert.rejects(
    postRpc(fixture.url, "tools/list", { signal: AbortSignal.timeout(100) }),
    (error: unknown) => error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name),
  );
  assert.ok(Date.now() - started < 1_000, "hang fixture did not respect the caller cancellation boundary");
  assert.equal(fixture.snapshot().methodAttempts["tools/list"], 1);
});

test("disconnect-recovery fixture drops the first tools/list and succeeds on the next attempt", async (t) => {
  const fixture = await startFixture("disconnect-recovery");
  t.after(() => fixture.close());

  await assert.rejects(postRpc(fixture.url, "tools/list"));

  const recovered = await postRpc(fixture.url, "tools/list", { id: 2 });
  assert.equal(recovered.status, 200);
  const recoveredBody = (await recovered.json()) as any;
  assert.equal(recoveredBody.result.tools[0].name, "fixture.echo");
  assert.equal(fixture.snapshot().methodAttempts["tools/list"], 2);
});

test("malformed-json fixture returns an invalid JSON response without hanging", async (t) => {
  const fixture = await startFixture("malformed-json");
  t.after(() => fixture.close());

  const response = await postRpc(fixture.url, "tools/list");
  assert.equal(response.status, 200);
  await assert.rejects(response.json());
});

test("duplicate-response fixture returns duplicate JSON-RPC ids deterministically", async (t) => {
  const fixture = await startFixture("duplicate-response");
  t.after(() => fixture.close());

  const response = await postRpc(fixture.url, "tools/list", { id: 17 });
  const body = (await response.json()) as Array<{ id: number }>;
  assert.equal(body.length, 2);
  assert.deepEqual(
    body.map((entry) => entry.id),
    [17, 17],
  );
});

test("fake-auth fixture rejects a disposable token and never stores its value", async (t) => {
  const fixture = await startFixture("fake-auth");
  t.after(() => fixture.close());

  const response = await postRpc(fixture.url, "server/discover", {
    authorization: `Bearer ${FIXTURE_FAKE_TOKEN}`,
  });

  assert.equal(response.status, 401);
  assert.match(response.headers.get("www-authenticate") ?? "", /invalid_token/);

  const snapshot = fixture.snapshot();
  assert.equal(snapshot.requests[0]?.authorizationPresent, true);
  assert.equal(Object.hasOwn(snapshot.requests[0] ?? {}, "authorization"), false);
  assert.equal(JSON.stringify(snapshot).includes(FIXTURE_FAKE_TOKEN), false);
});
