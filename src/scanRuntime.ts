import {
  Client,
  SSEClientTransport,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";
import type {
  ObservationStatus,
  ProtocolEra,
  ScanError,
  TransportMode,
} from "./types.js";
import { SCANNER_VERSION } from "./types.js";

export const DEFAULT_CONNECT_TIMEOUT_MS = 10_000;
export const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;
export const DEFAULT_CLOSE_TIMEOUT_MS = 1_000;
const MAX_EVIDENCE_JSON_CHARS = 64_000;
const SENSITIVE_KEYS = new Set([
  "access_token",
  "apikey",
  "api_key",
  "authorization",
  "auth",
  "client_secret",
  "cookie",
  "id_token",
  "key",
  "password",
  "refresh_token",
  "secret",
  "set-cookie",
  "token",
]);

export type ToolLike = {
  name?: unknown;
  description?: unknown;
  inputSchema?: unknown;
};

export type ScannerSession = {
  connect(signal: AbortSignal, timeoutMs: number): Promise<void>;
  close(): Promise<void>;
  getProtocolEra(): ProtocolEra | undefined;
  getNegotiatedProtocolVersion(): string | undefined;
  getServerVersion(): unknown;
  getServerCapabilities(): unknown;
  getInstructions(): string | undefined;
  getDiscoverResult(): unknown;
  listTools(signal: AbortSignal, timeoutMs: number): Promise<ToolLike[]>;
  listResources(signal: AbortSignal, timeoutMs: number): Promise<unknown[]>;
  listPrompts(signal: AbortSignal, timeoutMs: number): Promise<unknown[]>;
};

export type ScannerSessionFactory = (
  url: URL,
  mode: Exclude<TransportMode, "none">,
  customFetch?: typeof globalThis.fetch,
) => ScannerSession;

class ScanOperationTimeoutError extends Error {
  constructor(readonly operation: string, readonly timeoutMs: number) {
    super(`${operation} exceeded ${timeoutMs}ms`);
    this.name = "ScanOperationTimeoutError";
  }
}

class ScanCancelledError extends Error {
  constructor(readonly operation: string) {
    super(`${operation} was cancelled`);
    this.name = "ScanCancelledError";
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function redactText(value: string): string {
  return value
    .replace(/Bearer\s+[A-Za-z0-9._~+\/-]+=*/gi, "Bearer [REDACTED]")
    .replace(
      /\b(authorization|api[-_]?key|access[-_]?token|token|secret|password)\s*[:=]\s*([^\s,;]+)/gi,
      "$1=[REDACTED]",
    );
}

function safeJsonReplacer(key: string, item: unknown): unknown {
  if (key && SENSITIVE_KEYS.has(key.toLowerCase())) return "[REDACTED]";
  if (typeof item === "string") return redactText(item);
  if (typeof item === "bigint") return item.toString();
  return item;
}

export function redactTarget(target: string): string {
  try {
    const url = new URL(target);
    if (url.username) url.username = "[REDACTED]";
    if (url.password) url.password = "[REDACTED]";
    for (const key of [...url.searchParams.keys()]) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) url.searchParams.set(key, "[REDACTED]");
    }
    url.hash = "";
    return url.toString();
  } catch {
    return redactText(target);
  }
}

export function safeJsonValue(value: unknown): unknown {
  try {
    const json = JSON.stringify(value, safeJsonReplacer);
    if (json === undefined) return undefined;
    if (json.length <= MAX_EVIDENCE_JSON_CHARS) return JSON.parse(json) as unknown;
    return {
      truncated: true,
      originalJsonCharacters: json.length,
      preview: json.slice(0, MAX_EVIDENCE_JSON_CHARS),
    };
  } catch {
    return { serializationFailed: true, type: typeof value };
  }
}

export function classifyError(error: unknown): ScanError {
  const name = error instanceof Error ? error.name : undefined;
  const message = redactText(error instanceof Error ? error.message : String(error));
  const code = isRecord(error) && (typeof error.code === "string" || typeof error.code === "number")
    ? error.code
    : undefined;
  const fingerprint = `${name ?? ""} ${String(code ?? "")} ${message}`.toLowerCase();

  if (error instanceof ScanOperationTimeoutError || /timeout|timed out|requesttimeout/.test(fingerprint)) {
    return { kind: "timeout", message, name, code };
  }
  if (error instanceof ScanCancelledError || /abort|cancel/.test(fingerprint)) {
    return { kind: "cancelled", message, name, code };
  }
  if (/unauthor|forbidden|authentication|oauth|401|403/.test(fingerprint)) {
    return { kind: "authentication", message, name, code };
  }
  if (/protocol|json-rpc|unsupportedprotocol|methodnotsupported/.test(fingerprint)) {
    return { kind: "protocol", message, name, code };
  }
  if (/fetch|network|socket|connect|econn|transport|sse|http/.test(fingerprint)) {
    return { kind: "transport", message, name, code };
  }
  return { kind: "unknown", message, name, code };
}

export function observationStatus(error: ScanError): ObservationStatus {
  if (error.kind === "timeout") return "timed-out";
  if (error.kind === "cancelled") return "cancelled";
  return "failed";
}

export async function runBounded<T>(
  operation: string,
  timeoutMs: number,
  parentSignal: AbortSignal | undefined,
  task: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  if (parentSignal?.aborted) throw new ScanCancelledError(operation);

  const controller = new AbortController();
  let reason: "timeout" | "cancelled" | undefined;
  const onParentAbort = () => {
    reason = "cancelled";
    controller.abort(parentSignal?.reason);
  };
  parentSignal?.addEventListener("abort", onParentAbort, { once: true });
  const timer = setTimeout(() => {
    reason = "timeout";
    controller.abort(new ScanOperationTimeoutError(operation, timeoutMs));
  }, timeoutMs);

  const aborted = new Promise<never>((_resolve, reject) => {
    controller.signal.addEventListener(
      "abort",
      () => reject(
        reason === "timeout"
          ? new ScanOperationTimeoutError(operation, timeoutMs)
          : new ScanCancelledError(operation),
      ),
      { once: true },
    );
  });

  try {
    return await Promise.race([task(controller.signal), aborted]);
  } finally {
    clearTimeout(timer);
    parentSignal?.removeEventListener("abort", onParentAbort);
  }
}

export function capabilityAdvertised(capabilities: unknown, key: string): boolean {
  return isRecord(capabilities) && Object.prototype.hasOwnProperty.call(capabilities, key);
}

export function createSdkSession(
  url: URL,
  mode: Exclude<TransportMode, "none">,
  customFetch?: typeof globalThis.fetch,
): ScannerSession {
  const client = new Client(
    { name: "mcp-doctor", version: SCANNER_VERSION },
    { versionNegotiation: { mode: "auto" } },
  );
  const transport = mode === "streamable-http"
    ? new StreamableHTTPClientTransport(url, customFetch ? { fetch: customFetch } : undefined)
    : new SSEClientTransport(url, customFetch ? { fetch: customFetch } : undefined);

  return {
    connect: (signal, timeoutMs) => client.connect(transport, { signal, timeout: timeoutMs }),
    close: () => client.close(),
    getProtocolEra: () => client.getProtocolEra?.() ?? undefined,
    getNegotiatedProtocolVersion: () => client.getNegotiatedProtocolVersion?.(),
    getServerVersion: () => client.getServerVersion?.(),
    getServerCapabilities: () => client.getServerCapabilities?.(),
    getInstructions: () => client.getInstructions?.(),
    getDiscoverResult: () => client.getDiscoverResult?.(),
    listTools: async (signal, timeoutMs) => {
      const result = await client.listTools(undefined, { signal, timeout: timeoutMs });
      return (result.tools ?? []) as ToolLike[];
    },
    listResources: async (signal, timeoutMs) => {
      const result = await client.listResources(undefined, { signal, timeout: timeoutMs });
      return result.resources ?? [];
    },
    listPrompts: async (signal, timeoutMs) => {
      const result = await client.listPrompts(undefined, { signal, timeout: timeoutMs });
      return result.prompts ?? [];
    },
  };
}
