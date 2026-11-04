import type { CheckResult, Evidence, Observation, ProtocolEra, ScanReport, TransportMode } from "./types.js";
import { MCP_SDK_PACKAGE, MCP_SDK_VERSION, SCANNER_VERSION } from "./types.js";
import { inspectTools } from "./schemaChecks.js";
import { evaluateCompatibility } from "./hostCompatibility/evaluate.js";
import {
  capabilityAdvertised,
  classifyError,
  createSdkSession,
  DEFAULT_CLOSE_TIMEOUT_MS,
  DEFAULT_CONNECT_TIMEOUT_MS,
  DEFAULT_REQUEST_TIMEOUT_MS,
  isRecord,
  observationStatus,
  redactTarget,
  runBounded,
  safeJsonValue,
  type ScannerSession,
  type ScannerSessionFactory,
  type ToolLike,
} from "./scanRuntime.js";

export type { ScannerSession, ScannerSessionFactory } from "./scanRuntime.js";

export interface ScanOptions {
  connectTimeoutMs?: number;
  requestTimeoutMs?: number;
  closeTimeoutMs?: number;
  signal?: AbortSignal;
  allowLegacySseFallback?: boolean;
  fetch?: typeof globalThis.fetch;
  sessionFactory?: ScannerSessionFactory;
}

function scoreChecks(checks: CheckResult[]): number {
  let score = 100;
  for (const check of checks) {
    if (check.status === "fail") score -= 20;
    if (check.status === "warn") score -= 7;
  }
  return Math.max(0, Math.min(100, score));
}

export async function scanRemote(target: string, options: ScanOptions = {}): Promise<ScanReport> {
  const startedAt = new Date().toISOString();
  const checks: CheckResult[] = [];
  const evidence: Evidence[] = [];
  const observations: Observation[] = [];
  const url = new URL(target);
  const reportTarget = redactTarget(target);
  const connectTimeoutMs = options.connectTimeoutMs ?? DEFAULT_CONNECT_TIMEOUT_MS;
  const requestTimeoutMs = options.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
  const closeTimeoutMs = options.closeTimeoutMs ?? DEFAULT_CLOSE_TIMEOUT_MS;
  const allowLegacySseFallback = options.allowLegacySseFallback ?? false;
  const sessionFactory = options.sessionFactory ?? createSdkSession;

  let evidenceSequence = 0;
  const addEvidence = (kind: Evidence["kind"], source: string, data?: unknown): string => {
    const id = `evidence.${++evidenceSequence}`;
    evidence.push({ id, kind, source, capturedAt: new Date().toISOString(), data: safeJsonValue(data) });
    return id;
  };

  let session: ScannerSession | undefined;
  let transport: TransportMode = "none";
  let protocolEra: ProtocolEra = "unknown";
  let protocolVersion: string | undefined;
  let serverVersion: unknown;
  let capabilities: unknown;
  let instructions: string | undefined;
  let tools: ToolLike[] = [];
  let resources: unknown[] = [];
  let prompts: unknown[] = [];
  let toolsObserved = false;

  const closeSession = (candidate: ScannerSession) =>
    runBounded("client close", closeTimeoutMs, undefined, () => candidate.close());

  const connectMode = async (mode: Exclude<TransportMode, "none">): Promise<ScannerSession> => {
    const candidate = sessionFactory(url, mode, options.fetch);
    try {
      await runBounded(`${mode} connect`, connectTimeoutMs, options.signal, (signal) =>
        candidate.connect(signal, connectTimeoutMs),
      );
      return candidate;
    } catch (error) {
      try { await closeSession(candidate); } catch { /* best-effort bounded cleanup */ }
      throw error;
    }
  };

  const recordConnectFailure = (id: string, title: string, source: string, error: unknown) => {
    const failure = classifyError(error);
    const evidenceId = addEvidence("sdk-error", source, failure);
    observations.push({
      id,
      title,
      status: observationStatus(failure),
      message: failure.message,
      evidenceIds: [evidenceId],
      error: failure,
    });
    return failure;
  };

  try {
    try {
      session = await connectMode("streamable-http");
      transport = "streamable-http";
      const evidenceId = addEvidence("transport", "streamable-http", { connected: true });
      observations.push({
        id: "transport.streamable-http",
        title: "Streamable HTTP connection",
        status: "observed",
        message: "Connected using Streamable HTTP.",
        evidenceIds: [evidenceId],
        value: { connected: true },
      });
      checks.push({
        id: "transport.streamable-http",
        title: "Streamable HTTP connection",
        status: "pass",
        message: "Connected using Streamable HTTP.",
        observationIds: ["transport.streamable-http"],
      });
    } catch (streamableError) {
      const failure = recordConnectFailure(
        "transport.streamable-http",
        "Streamable HTTP connection",
        "streamable-http.connect",
        streamableError,
      );
      if (!allowLegacySseFallback || failure.kind === "cancelled" || failure.kind === "timeout") {
        throw streamableError;
      }
      checks.push({
        id: "transport.streamable-http",
        title: "Streamable HTTP connection",
        status: "info",
        message: `Streamable HTTP failed; attempting intentionally supported legacy SSE fallback. ${failure.message}`,
        observationIds: ["transport.streamable-http"],
      });

      try {
        session = await connectMode("sse");
        transport = "sse";
        const evidenceId = addEvidence("transport", "sse", { connected: true, legacyFallback: true });
        observations.push({
          id: "transport.sse",
          title: "Legacy SSE fallback",
          status: "observed",
          message: "Connected using legacy SSE fallback.",
          evidenceIds: [evidenceId],
          value: { connected: true, legacyFallback: true },
        });
        checks.push({
          id: "transport.sse-fallback",
          title: "Legacy SSE fallback",
          status: "pass",
          message: "Connected using intentionally supported legacy SSE fallback.",
          observationIds: ["transport.sse"],
        });
      } catch (sseError) {
        recordConnectFailure("transport.sse", "Legacy SSE fallback", "sse.connect", sseError);
        throw sseError;
      }
    }

    protocolEra = session.getProtocolEra() ?? "unknown";
    protocolVersion = session.getNegotiatedProtocolVersion();
    serverVersion = session.getServerVersion();
    capabilities = session.getServerCapabilities();
    instructions = session.getInstructions();
    const discoverResult = session.getDiscoverResult();
    const protocolEvidenceId = addEvidence("sdk-result", "client.protocol-metadata", {
      protocolEra,
      protocolVersion,
      serverVersion,
      capabilities,
      discoverResult,
    });
    observations.push({
      id: "protocol.negotiation",
      title: "Protocol era and version",
      status: "observed",
      message: protocolEra === "modern"
        ? `Modern MCP era negotiated${protocolVersion ? ` (${protocolVersion})` : ""}.`
        : protocolEra === "legacy"
          ? `Legacy MCP era negotiated${protocolVersion ? ` (${protocolVersion})` : ""}.`
          : "Protocol era could not be determined.",
      evidenceIds: [protocolEvidenceId],
      value: { protocolEra, protocolVersion },
    });
    checks.push({
      id: "protocol.negotiation",
      title: "Protocol negotiation",
      status: protocolEra === "unknown" ? "warn" : "pass",
      message: protocolEra === "modern"
        ? `Connected using the stateless modern era${protocolVersion ? ` (${protocolVersion})` : ""}; the scanner does not assume initialize/session state.`
        : protocolEra === "legacy"
          ? `Connected using the explicitly supported legacy era${protocolVersion ? ` (${protocolVersion})` : ""}.`
          : "Connection succeeded, but the SDK did not expose a protocol era.",
      observationIds: ["protocol.negotiation"],
    });

    const discover = async <T>(
      key: "tools" | "resources" | "prompts",
      title: string,
      operation: (signal: AbortSignal, timeoutMs: number) => Promise<T[]>,
    ): Promise<{ items: T[]; observed: boolean }> => {
      const observationId = `discovery.${key}`;
      if (!capabilityAdvertised(capabilities, key)) {
        const evidenceId = addEvidence("sdk-result", `capabilities.${key}`, { advertised: false });
        observations.push({
          id: observationId,
          title,
          status: "unsupported",
          message: `Server did not advertise the optional ${key} capability.`,
          evidenceIds: [evidenceId],
          value: { advertised: false, count: 0 },
        });
        checks.push({
          id: observationId,
          title,
          status: "info",
          message: `Server did not advertise the optional ${key} capability; this is not treated as unhealthy.`,
          observationIds: [observationId],
        });
        return { items: [], observed: false };
      }

      try {
        const items = await runBounded(`${key}/list`, requestTimeoutMs, options.signal, (signal) =>
          operation(signal, requestTimeoutMs),
        );
        const evidenceId = addEvidence("sdk-result", `${key}/list`, { count: items.length, items });
        observations.push({
          id: observationId,
          title,
          status: "observed",
          message: `${items.length} ${key} item(s) discovered.`,
          evidenceIds: [evidenceId],
          value: { count: items.length },
        });
        checks.push({
          id: observationId,
          title,
          status: "pass",
          message: `${items.length} ${key} item(s) discovered.`,
          observationIds: [observationId],
        });
        return { items, observed: true };
      } catch (error) {
        const failure = classifyError(error);
        const evidenceId = addEvidence("sdk-error", `${key}/list`, failure);
        observations.push({
          id: observationId,
          title,
          status: observationStatus(failure),
          message: failure.message,
          evidenceIds: [evidenceId],
          error: failure,
        });
        checks.push({
          id: observationId,
          title,
          status: failure.kind === "cancelled" ? "info" : "warn",
          message: `${title} failed: ${failure.message}`,
          observationIds: [observationId],
        });
        return { items: [], observed: false };
      }
    };

    const toolResult = await discover("tools", "Tool discovery", (signal, timeoutMs) =>
      session!.listTools(signal, timeoutMs),
    );
    tools = toolResult.items;
    toolsObserved = toolResult.observed;
    resources = (await discover("resources", "Resource discovery", (signal, timeoutMs) =>
      session!.listResources(signal, timeoutMs),
    )).items;
    prompts = (await discover("prompts", "Prompt discovery", (signal, timeoutMs) =>
      session!.listPrompts(signal, timeoutMs),
    )).items;
    if (toolsObserved) checks.push(...inspectTools(tools, "discovery.tools"));
  } catch (error) {
    const failure = classifyError(error);
    const evidenceId = addEvidence("sdk-error", "scanner.connection", failure);
    observations.push({
      id: "connection",
      title: "Connect to MCP server",
      status: observationStatus(failure),
      message: failure.message,
      evidenceIds: [evidenceId],
      error: failure,
    });
    checks.push({
      id: "connection",
      title: "Connect to MCP server",
      status: failure.kind === "cancelled" ? "info" : "fail",
      message: failure.message,
      observationIds: ["connection"],
    });
  } finally {
    if (session) {
      try {
        await closeSession(session);
        const evidenceId = addEvidence("scanner", "client.close", { closed: true });
        observations.push({
          id: "lifecycle.close",
          title: "Client cleanup",
          status: "observed",
          message: "Client closed within the cleanup deadline.",
          evidenceIds: [evidenceId],
          value: { closed: true },
        });
      } catch (error) {
        const failure = classifyError(error);
        const evidenceId = addEvidence("sdk-error", "client.close", failure);
        observations.push({
          id: "lifecycle.close",
          title: "Client cleanup",
          status: observationStatus(failure),
          message: failure.message,
          evidenceIds: [evidenceId],
          error: failure,
        });
        checks.push({
          id: "lifecycle.close",
          title: "Client cleanup",
          status: "warn",
          message: `Cleanup did not complete cleanly: ${failure.message}`,
          observationIds: ["lifecycle.close"],
        });
      }
    }
  }

  const normalized = (id: string, value: unknown, ids: string[]) => {
    const safe = safeJsonValue(value);
    // Truncated metadata cannot support a complete host judgment.
    if (isRecord(safe) && (safe.truncated || safe.serializationFailed)) return;
    // Redaction may change schema meaning or names. Do not evaluate altered facts.
    if (JSON.stringify(safe) !== JSON.stringify(value)) return;
    if (ids.some(id => {
      const data = evidence.find(e => e.id === id)?.data;
      return isRecord(data) && (data.truncated || data.serializationFailed);
    })) return;
    observations.push({ id, title: id, status: "observed", message: "Normalized scanner fact.", value: safe, evidenceIds: ids });
  };
  const targetEvidence = addEvidence("scanner", "target.configuration", { scheme: url.protocol.slice(0, -1) });
  normalized("connection.endpoint.scheme", url.protocol.slice(0, -1), [targetEvidence]);
  const connected = observations.find(o => o.id === `transport.${transport}` && o.status === "observed");
  if (connected) normalized("connection.transport", transport, connected.evidenceIds);
  for (const key of ["tools", "resources", "prompts"] as const) {
    const discovery = observations.find(o => o.id === `discovery.${key}` && o.status === "observed");
    if (discovery && isRecord(discovery.value)) normalized(`discovered.${key}.count`, discovery.value.count, discovery.evidenceIds);
  }
  if (toolsObserved) {
    const ids = observations.find(o => o.id === "discovery.tools")!.evidenceIds;
    for (const key of ["name", "description", "inputSchema"] as const) {
      normalized(`tools[].${key}`, tools.map(tool => tool[key] ?? null), ids);
    }
  }
  const versionRecord = isRecord(serverVersion) ? serverVersion : undefined;
  const report: ScanReport = {
    target: reportTarget,
    startedAt,
    completedAt: new Date().toISOString(),
    context: {
      scanner: { name: "mcp-doctor", version: SCANNER_VERSION },
      sdk: { package: MCP_SDK_PACKAGE, version: MCP_SDK_VERSION },
      protocol: { era: protocolEra, version: protocolVersion },
    },
    transport,
    server: {
      name: typeof versionRecord?.name === "string" ? versionRecord.name : undefined,
      version: typeof versionRecord?.version === "string" ? versionRecord.version : undefined,
      instructionsPresent: typeof instructions === "string" && instructions.trim().length > 0,
      capabilities: safeJsonValue(capabilities),
    },
    discovered: { tools: tools.length, resources: resources.length, prompts: prompts.length },
    evidence,
    observations,
    score: scoreChecks(checks),
    checks,
  };
  report.compatibility = evaluateCompatibility(report);
  return report;
}
