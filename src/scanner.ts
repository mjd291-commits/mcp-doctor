import {
  Client,
  SSEClientTransport,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";
import type { CheckResult, ScanReport } from "./types.js";
import { inspectTools } from "./schemaChecks.js";

function errorText(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return String(error);
}

function scoreChecks(checks: CheckResult[]): number {
  let score = 100;
  for (const check of checks) {
    if (check.status === "fail") score -= 20;
    if (check.status === "warn") score -= 7;
  }
  return Math.max(0, Math.min(100, score));
}

async function tryClient(
  url: URL,
  mode: "streamable-http" | "sse",
): Promise<{ client: Client; transport: StreamableHTTPClientTransport | SSEClientTransport }> {
  const client = new Client(
    { name: "mcp-doctor", version: "0.1.0" },
    { versionNegotiation: { mode: "auto" } },
  );

  const transport =
    mode === "streamable-http"
      ? new StreamableHTTPClientTransport(url)
      : new SSEClientTransport(url);

  await client.connect(transport);
  return { client, transport };
}

export async function scanRemote(target: string): Promise<ScanReport> {
  const startedAt = new Date().toISOString();
  const checks: CheckResult[] = [];
  const url = new URL(target);

  let connection:
    | Awaited<ReturnType<typeof tryClient>>
    | undefined;
  let transportMode: "streamable-http" | "sse" = "streamable-http";

  try {
    try {
      connection = await tryClient(url, "streamable-http");
      checks.push({
        id: "transport.streamable-http",
        title: "Streamable HTTP connection",
        status: "pass",
        message: "Connected using Streamable HTTP.",
      });
    } catch (streamableError) {
      checks.push({
        id: "transport.streamable-http",
        title: "Streamable HTTP connection",
        status: "warn",
        message: `Streamable HTTP failed; attempting legacy SSE fallback. ${errorText(streamableError)}`,
      });

      transportMode = "sse";
      connection = await tryClient(url, "sse");
      checks.push({
        id: "transport.sse-fallback",
        title: "Legacy SSE fallback",
        status: "pass",
        message: "Connected using SSE fallback.",
      });
    }

    const { client } = connection;

    const serverVersion = client.getServerVersion?.();
    const capabilities = client.getServerCapabilities?.();
    const instructions = client.getInstructions?.();

    checks.push({
      id: "protocol.negotiation",
      title: "Protocol negotiation",
      status: "pass",
      message: "MCP connection and protocol negotiation completed.",
      details: {
        serverVersion,
        discoverResult: client.getDiscoverResult?.(),
      },
    });

    let tools: any[] = [];
    let resources: any[] = [];
    let prompts: any[] = [];

    try {
      const result = await client.listTools();
      tools = result.tools ?? [];
      checks.push({
        id: "discovery.tools",
        title: "Tool discovery",
        status: "pass",
        message: `${tools.length} tool(s) discovered.`,
      });
      checks.push(...inspectTools(tools));
    } catch (error) {
      checks.push({
        id: "discovery.tools",
        title: "Tool discovery",
        status: "warn",
        message: `Tool listing was unavailable or failed: ${errorText(error)}`,
      });
    }

    try {
      const result = await client.listResources();
      resources = result.resources ?? [];
      checks.push({
        id: "discovery.resources",
        title: "Resource discovery",
        status: "pass",
        message: `${resources.length} resource(s) discovered.`,
      });
    } catch (error) {
      checks.push({
        id: "discovery.resources",
        title: "Resource discovery",
        status: "info",
        message: `Resource listing was unavailable or unsupported: ${errorText(error)}`,
      });
    }

    try {
      const result = await client.listPrompts();
      prompts = result.prompts ?? [];
      checks.push({
        id: "discovery.prompts",
        title: "Prompt discovery",
        status: "pass",
        message: `${prompts.length} prompt(s) discovered.`,
      });
    } catch (error) {
      checks.push({
        id: "discovery.prompts",
        title: "Prompt discovery",
        status: "info",
        message: `Prompt listing was unavailable or unsupported: ${errorText(error)}`,
      });
    }

    const report: ScanReport = {
      target,
      startedAt,
      completedAt: new Date().toISOString(),
      transport: transportMode,
      server: {
        name:
          serverVersion && typeof (serverVersion as any).name === "string"
            ? (serverVersion as any).name
            : undefined,
        version:
          serverVersion && typeof (serverVersion as any).version === "string"
            ? (serverVersion as any).version
            : undefined,
        instructionsPresent: typeof instructions === "string" && instructions.trim().length > 0,
        capabilities,
      },
      discovered: {
        tools: tools.length,
        resources: resources.length,
        prompts: prompts.length,
      },
      score: scoreChecks(checks),
      checks,
    };

    return report;
  } catch (error) {
    checks.push({
      id: "connection",
      title: "Connect to MCP server",
      status: "fail",
      message: errorText(error),
    });

    return {
      target,
      startedAt,
      completedAt: new Date().toISOString(),
      transport: transportMode,
      server: { instructionsPresent: false },
      discovered: { tools: 0, resources: 0, prompts: 0 },
      score: scoreChecks(checks),
      checks,
    };
  } finally {
    try {
      await connection?.client.close();
    } catch {
      // A failed server should never prevent the report from being returned.
    }
  }
}
