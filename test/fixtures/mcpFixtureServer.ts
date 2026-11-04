import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { AddressInfo, Socket } from "node:net";

export const FIXTURE_PROTOCOL_VERSION = "2026-07-28";
export const FIXTURE_FAKE_TOKEN = "mcp-doctor-fixture-invalid-token";

export type FixtureId =
  | "healthy"
  | "weak-schema"
  | "hang"
  | "disconnect-recovery"
  | "malformed-json"
  | "duplicate-response"
  | "fake-auth";

export interface FixtureRequestObservation {
  sequence: number;
  method?: string;
  protocolVersionHeader?: string;
  mcpMethodHeader?: string;
  mcpNameHeader?: string;
  authorizationPresent: boolean;
}

export interface FixtureSnapshot {
  id: FixtureId;
  requestCount: number;
  methodAttempts: Readonly<Record<string, number>>;
  requests: readonly FixtureRequestObservation[];
}

export interface RunningFixture {
  id: FixtureId;
  url: URL;
  snapshot(): FixtureSnapshot;
  close(): Promise<void>;
}

type JsonRpcRequest = {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: unknown;
};

const HEALTHY_TOOL = {
  name: "fixture.echo",
  description: "Returns fixture text without producing external side effects.",
  inputSchema: {
    type: "object",
    properties: {
      text: { type: "string" },
    },
    required: ["text"],
    additionalProperties: false,
  },
};

const WEAK_TOOL = {
  name: "fixture.weak",
  description: "weak",
  inputSchema: {
    type: "object",
  },
};

function jsonRpcResult(id: JsonRpcRequest["id"], result: Record<string, unknown>) {
  return {
    jsonrpc: "2.0" as const,
    id: id ?? null,
    result,
  };
}

function listResult(payload: Record<string, unknown>) {
  return {
    resultType: "complete",
    ttlMs: 0,
    cacheScope: "private",
    ...payload,
  };
}

function discoverResult() {
  return {
    resultType: "complete",
    supportedVersions: [FIXTURE_PROTOCOL_VERSION],
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
    _meta: {
      "io.modelcontextprotocol/serverInfo": {
        name: "mcp-doctor-fixture",
        version: "1.0.0",
      },
    },
  };
}

function writeJson(
  response: ServerResponse,
  statusCode: number,
  payload: unknown,
  headers: Record<string, string> = {},
): void {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(body).toString(),
    ...headers,
  });
  response.end(body);
}

async function readBody(request: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

function parseRpcRequest(body: string): JsonRpcRequest | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return undefined;
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return undefined;
  const candidate = parsed as Partial<JsonRpcRequest>;
  if (candidate.jsonrpc !== "2.0" || typeof candidate.method !== "string") return undefined;
  return candidate as JsonRpcRequest;
}

function headerText(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value.join(",");
  return value;
}

export async function startFixture(id: FixtureId): Promise<RunningFixture> {
  const requests: FixtureRequestObservation[] = [];
  const methodAttempts: Record<string, number> = {};
  const sockets = new Set<Socket>();

  const server = createServer((request, response) => {
    void (async () => {
      if (id === "fake-auth") {
        requests.push({
          sequence: requests.length + 1,
          protocolVersionHeader: headerText(request.headers["mcp-protocol-version"]),
          mcpMethodHeader: headerText(request.headers["mcp-method"]),
          mcpNameHeader: headerText(request.headers["mcp-name"]),
          authorizationPresent: typeof request.headers.authorization === "string",
        });
        writeJson(
          response,
          401,
          { error: "fixture_auth_required" },
          {
            "www-authenticate": 'Bearer realm="mcp-doctor-fixture", error="invalid_token"',
          },
        );
        return;
      }

      if (request.method !== "POST") {
        writeJson(response, 405, { error: "fixture_post_only" }, { allow: "POST" });
        return;
      }

      const body = await readBody(request);
      const rpc = parseRpcRequest(body);
      const method = rpc?.method;

      requests.push({
        sequence: requests.length + 1,
        method,
        protocolVersionHeader: headerText(request.headers["mcp-protocol-version"]),
        mcpMethodHeader: headerText(request.headers["mcp-method"]),
        mcpNameHeader: headerText(request.headers["mcp-name"]),
        authorizationPresent: typeof request.headers.authorization === "string",
      });

      if (!rpc) {
        writeJson(response, 400, {
          jsonrpc: "2.0",
          id: null,
          error: { code: -32700, message: "Invalid fixture JSON-RPC request" },
        });
        return;
      }

      methodAttempts[rpc.method] = (methodAttempts[rpc.method] ?? 0) + 1;

      if (rpc.method === "server/discover") {
        writeJson(response, 200, jsonRpcResult(rpc.id, discoverResult()));
        return;
      }

      if (rpc.method === "tools/list") {
        if (id === "hang") {
          // Intentionally leave the HTTP request open. The caller MUST supply a
          // timeout/cancellation boundary; close() still destroys the socket.
          return;
        }

        if (id === "disconnect-recovery" && methodAttempts[rpc.method] === 1) {
          request.socket.destroy();
          return;
        }

        if (id === "malformed-json") {
          response.writeHead(200, { "content-type": "application/json" });
          response.end('{"jsonrpc":"2.0","id":');
          return;
        }

        const tools = [id === "weak-schema" ? WEAK_TOOL : HEALTHY_TOOL];
        const payload = jsonRpcResult(rpc.id, listResult({ tools }));

        if (id === "duplicate-response") {
          writeJson(response, 200, [payload, payload]);
          return;
        }

        writeJson(response, 200, payload);
        return;
      }

      if (rpc.method === "resources/list") {
        writeJson(response, 200, jsonRpcResult(rpc.id, listResult({ resources: [] })));
        return;
      }

      if (rpc.method === "prompts/list") {
        writeJson(response, 200, jsonRpcResult(rpc.id, listResult({ prompts: [] })));
        return;
      }

      if (rpc.method === "ping") {
        writeJson(response, 200, jsonRpcResult(rpc.id, { resultType: "complete" }));
        return;
      }

      if (rpc.method === "tools/call") {
        writeJson(
          response,
          200,
          jsonRpcResult(rpc.id, {
            resultType: "complete",
            content: [{ type: "text", text: "fixture-ok" }],
            isError: false,
          }),
        );
        return;
      }

      writeJson(response, 200, {
        jsonrpc: "2.0",
        id: rpc.id ?? null,
        error: { code: -32601, message: `Fixture method not found: ${rpc.method}` },
      });
    })().catch((error: unknown) => {
      if (response.headersSent) {
        response.destroy(error instanceof Error ? error : undefined);
        return;
      }
      writeJson(response, 500, { error: "fixture_internal_error" });
    });
  });

  server.on("connection", (socket) => {
    sockets.add(socket);
    socket.once("close", () => sockets.delete(socket));
  });

  await new Promise<void>((resolve, reject) => {
    const onError = (error: Error) => {
      server.off("listening", onListening);
      reject(error);
    };
    const onListening = () => {
      server.off("error", onError);
      resolve();
    };
    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(0, "127.0.0.1");
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    for (const socket of sockets) socket.destroy();
    server.close();
    throw new Error("Fixture server failed to acquire a TCP port.");
  }

  const port = (address as AddressInfo).port;
  let closed = false;

  return {
    id,
    url: new URL(`http://127.0.0.1:${port}/mcp`),
    snapshot() {
      return {
        id,
        requestCount: requests.length,
        methodAttempts: { ...methodAttempts },
        requests: requests.map((request) => ({ ...request })),
      };
    },
    async close() {
      if (closed) return;
      closed = true;
      for (const socket of sockets) socket.destroy();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
}
