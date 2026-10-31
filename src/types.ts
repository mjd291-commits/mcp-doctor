export const SCANNER_VERSION = "0.1.0";
export const MCP_SDK_PACKAGE = "@modelcontextprotocol/client";
export const MCP_SDK_VERSION = "2.4.0";

export type CheckStatus = "pass" | "warn" | "fail" | "info";
export type ProtocolEra = "modern" | "legacy" | "unknown";
export type TransportMode = "streamable-http" | "sse" | "none";
export type ObservationStatus =
  | "observed"
  | "unsupported"
  | "failed"
  | "timed-out"
  | "cancelled";
export type ScanErrorKind =
  | "timeout"
  | "cancelled"
  | "authentication"
  | "transport"
  | "protocol"
  | "unknown";

export interface ScanError {
  kind: ScanErrorKind;
  message: string;
  name?: string;
  code?: string | number;
}

export interface Evidence {
  id: string;
  kind: "sdk-result" | "sdk-error" | "transport" | "scanner";
  source: string;
  capturedAt: string;
  data?: unknown;
}

export interface Observation {
  id: string;
  title: string;
  status: ObservationStatus;
  message: string;
  evidenceIds: string[];
  value?: unknown;
  error?: ScanError;
}

export interface CheckResult {
  id: string;
  title: string;
  status: CheckStatus;
  message: string;
  details?: unknown;
  observationIds?: string[];
}

export interface ScanReport {
  target: string;
  startedAt: string;
  completedAt: string;
  context: {
    scanner: {
      name: "mcp-doctor";
      version: string;
    };
    sdk: {
      package: string;
      version: string;
    };
    protocol: {
      era: ProtocolEra;
      version?: string;
    };
  };
  transport: TransportMode;
  server?: {
    name?: string;
    version?: string;
    instructionsPresent: boolean;
    capabilities?: unknown;
  };
  discovered: {
    tools: number;
    resources: number;
    prompts: number;
  };
  evidence: Evidence[];
  observations: Observation[];
  score: number;
  checks: CheckResult[];
}
