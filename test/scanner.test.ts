import assert from "node:assert/strict";
import test from "node:test";
import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import {
  scanRemote,
  type ScannerSession,
  type ScannerSessionFactory,
} from "../src/scanner.js";

function makeSession(overrides: Partial<ScannerSession> = {}): ScannerSession {
  return {
    connect: async () => undefined,
    close: async () => undefined,
    getProtocolEra: () => "modern",
    getNegotiatedProtocolVersion: () => "2026-07-28",
    getServerVersion: () => ({ name: "fixture", version: "1.0.0" }),
    getServerCapabilities: () => ({ tools: {} }),
    getInstructions: () => undefined,
    getDiscoverResult: () => ({ capabilities: { tools: {} } }),
    listTools: async () => [],
    listResources: async () => [],
    listPrompts: async () => [],
    ...overrides,
  };
}

test("healthy modern fixture negotiates 2026-07-28 without executing tools", async () => {
  let toolCalls = 0;
  const handler = createMcpHandler(() => {
    const server = new McpServer({ name: "healthy-modern", version: "1.0.0" });
    server.registerTool(
      "echo",
      {
        description: "Echo text back to the caller.",
        inputSchema: z.object({ text: z.string() }),
      },
      async ({ text }) => {
        toolCalls += 1;
        return { content: [{ type: "text", text }] };
      },
    );
    return server;
  });

  try {
    const report = await scanRemote("http://test.local/mcp", {
      allowLegacySseFallback: false,
      connectTimeoutMs: 1_000,
      requestTimeoutMs: 1_000,
      fetch: (url, init) => handler.fetch(new Request(url, init)),
    });

    assert.equal(report.context.protocol.era, "modern");
    assert.equal(report.context.protocol.version, "2026-07-28");
    assert.equal(report.transport, "streamable-http");
    assert.equal(report.discovered.tools, 1);
    assert.equal(toolCalls, 0, "default scans must never execute discovered tools");
    assert.equal(
      report.checks.find((check) => check.id === "tools.input-schema")?.status,
      "pass",
    );
  } finally {
    await handler.close();
  }
});

test("weak or malformed tool schemas remain raw evidence and produce separate judgments", async () => {
  const session = makeSession({
    listTools: async () => [
      { name: "bad tool", description: "x", inputSchema: { type: "string" } },
      { name: "bad tool", description: "", inputSchema: undefined },
    ],
  });
  const sessionFactory: ScannerSessionFactory = () => session;

  const report = await scanRemote("https://fixture.invalid/mcp", { sessionFactory });

  assert.equal(report.discovered.tools, 2);
  assert.equal(report.observations.find((item) => item.id === "discovery.tools")?.status, "observed");
  assert.ok(report.evidence.some((item) => item.source === "tools/list"));
  assert.equal(
    report.checks.find((check) => check.id === "tools.duplicate-names")?.status,
    "fail",
  );
  assert.equal(report.checks.find((check) => check.id === "tools.input-schema")?.status, "fail");
  assert.equal(report.checks.find((check) => check.id === "tools.name-hygiene")?.status, "warn");
});

test("hung connection is bounded and does not trigger legacy fallback after timeout", async () => {
  const modes: string[] = [];
  const sessionFactory: ScannerSessionFactory = (_url, mode) => {
    modes.push(mode);
    return makeSession({ connect: async () => new Promise<never>(() => undefined) });
  };
  const started = Date.now();

  const report = await scanRemote("https://fixture.invalid/mcp", {
    sessionFactory,
    connectTimeoutMs: 25,
  });

  assert.ok(Date.now() - started < 500, "scanner connect must return after the configured deadline");
  assert.deepEqual(modes, ["streamable-http"]);
  assert.equal(report.transport, "none");
  assert.equal(report.observations.find((item) => item.id === "connection")?.error?.kind, "timeout");
  assert.equal(report.checks.find((check) => check.id === "connection")?.status, "fail");
});

test("hung discovery is bounded and classified as a timeout", async () => {
  const session = makeSession({
    listTools: async () => new Promise<never>(() => undefined),
  });
  const sessionFactory: ScannerSessionFactory = () => session;
  const started = Date.now();

  const report = await scanRemote("https://fixture.invalid/mcp", {
    sessionFactory,
    requestTimeoutMs: 25,
  });

  assert.ok(Date.now() - started < 500, "scanner must return after the configured deadline");
  const observation = report.observations.find((item) => item.id === "discovery.tools");
  assert.equal(observation?.status, "timed-out");
  assert.equal(observation?.error?.kind, "timeout");
  assert.equal(report.checks.find((check) => check.id === "discovery.tools")?.status, "warn");
});

test("external cancellation aborts a hung discovery and is reported distinctly", async () => {
  const session = makeSession({
    listTools: async () => new Promise<never>(() => undefined),
  });
  const sessionFactory: ScannerSessionFactory = () => session;
  const controller = new AbortController();
  setTimeout(() => controller.abort(new Error("test cancellation")), 20);

  const report = await scanRemote("https://fixture.invalid/mcp", {
    sessionFactory,
    requestTimeoutMs: 1_000,
    signal: controller.signal,
  });

  const observation = report.observations.find((item) => item.id === "discovery.tools");
  assert.equal(observation?.status, "cancelled");
  assert.equal(observation?.error?.kind, "cancelled");
});

test("disconnect failure is observable and a later scan can recover cleanly", async () => {
  const failingFactory: ScannerSessionFactory = () =>
    makeSession({
      listTools: async () => {
        throw new Error("socket closed during tools/list");
      },
    });
  const recoveredFactory: ScannerSessionFactory = () =>
    makeSession({
      listTools: async () => [
        {
          name: "healthy-tool",
          description: "A healthy recovered tool fixture.",
          inputSchema: { type: "object", properties: {} },
        },
      ],
    });

  const failed = await scanRemote("https://fixture.invalid/mcp", {
    sessionFactory: failingFactory,
  });
  assert.equal(failed.observations.find((item) => item.id === "discovery.tools")?.status, "failed");
  assert.equal(failed.checks.find((check) => check.id === "discovery.tools")?.status, "warn");

  const recovered = await scanRemote("https://fixture.invalid/mcp", {
    sessionFactory: recoveredFactory,
  });
  assert.equal(recovered.observations.find((item) => item.id === "discovery.tools")?.status, "observed");
  assert.equal(recovered.checks.find((check) => check.id === "tools.input-schema")?.status, "pass");
});

test("sensitive target and evidence credentials are redacted from reports", async () => {
  const sessionFactory: ScannerSessionFactory = () =>
    makeSession({
      getDiscoverResult: () => ({ token: "discover-secret", authorization: "Bearer hidden-value" }),
      listTools: async () => [
        {
          name: "safe-tool",
          description: "authorization: Bearer hidden-description-token",
          inputSchema: { type: "object", properties: {} },
        },
      ],
    });
  const report = await scanRemote(
    "https://user:password@example.com/mcp?token=abc123&safe=yes#fragment",
    { sessionFactory },
  );
  const serialized = JSON.stringify(report);

  assert.doesNotMatch(serialized, /password|abc123|discover-secret|hidden-value|hidden-description-token|fragment/);
  assert.match(serialized, /REDACTED/);
});
