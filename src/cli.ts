#!/usr/bin/env node
import { scanRemote } from "./scanner.js";

function printUsage(): void {
  console.log(`
MCP Doctor Alpha

Usage:
  npm run scan -- <mcp-url>
  npm run scan -- <mcp-url> --json
  npm run scan -- <mcp-url> --timeout-ms 10000
  npm run scan -- <mcp-url> --no-sse-fallback

The scanner only performs non-destructive discovery by default. It does not call discovered tools.
`);
}

function parsePositiveInteger(value: string | undefined, flag: string): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${flag} must be a positive integer.`);
  }
  return parsed;
}

const args = process.argv.slice(2);
let target: string | undefined;
let jsonMode = false;
let timeoutMs: number | undefined;
let allowLegacySseFallback = true;

try {
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]!;
    if (arg === "--json") {
      jsonMode = true;
      continue;
    }
    if (arg === "--no-sse-fallback") {
      allowLegacySseFallback = false;
      continue;
    }
    if (arg === "--timeout-ms") {
      timeoutMs = parsePositiveInteger(args[index + 1], "--timeout-ms");
      index += 1;
      continue;
    }
    if (arg.startsWith("-")) throw new Error(`Unknown option: ${arg}`);
    if (target) throw new Error("Only one MCP target URL may be scanned at a time.");
    target = arg;
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  printUsage();
  process.exitCode = 1;
}

if (!process.exitCode) {
  if (!target) {
    printUsage();
    process.exitCode = 1;
  } else {
    const controller = new AbortController();
    const onSigint = () => controller.abort(new Error("Interrupted by SIGINT"));
    process.once("SIGINT", onSigint);

    try {
      const report = await scanRemote(target, {
        connectTimeoutMs: timeoutMs,
        requestTimeoutMs: timeoutMs,
        signal: controller.signal,
        allowLegacySseFallback,
      });

      if (jsonMode) {
        console.log(JSON.stringify(report, null, 2));
      } else {
        const protocolVersion = report.context.protocol.version ?? "unknown";
        console.log(`\nMCP Doctor — ${report.target}`);
        console.log(
          `Scanner: ${report.context.scanner.version} | SDK: ${report.context.sdk.package}@${report.context.sdk.version}`,
        );
        console.log(
          `Protocol: ${report.context.protocol.era} (${protocolVersion}) | Transport: ${report.transport}`,
        );
        console.log(`Health score: ${report.score}/100`);
        console.log(
          `Discovered: ${report.discovered.tools} tools, ${report.discovered.resources} resources, ${report.discovered.prompts} prompts`,
        );
        console.log("");

        for (const check of report.checks) {
          const icon =
            check.status === "pass"
              ? "PASS"
              : check.status === "fail"
                ? "FAIL"
                : check.status === "warn"
                  ? "WARN"
                  : "INFO";
          console.log(`[${icon}] ${check.title}`);
          console.log(`       ${check.message}`);
        }
        console.log("");
      }

      if (report.observations.some((item) => item.status === "cancelled")) {
        process.exitCode = 130;
      } else if (report.checks.some((check) => check.status === "fail")) {
        process.exitCode = 2;
      }
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    } finally {
      process.removeListener("SIGINT", onSigint);
    }
  }
}
