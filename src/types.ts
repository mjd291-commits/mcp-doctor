export type CheckStatus = "pass" | "warn" | "fail" | "info";

export interface CheckResult {
  id: string;
  title: string;
  status: CheckStatus;
  message: string;
  details?: unknown;
}

export interface ScanReport {
  target: string;
  startedAt: string;
  completedAt: string;
  transport: "streamable-http" | "sse";
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
  score: number;
  checks: CheckResult[];
}
