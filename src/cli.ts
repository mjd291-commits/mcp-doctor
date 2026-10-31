#!/usr/bin/env node
import { scanRemote } from "./scanner.js";

function printUsage(): void {
  console.log(`
MCP Doctor Alpha

Usage:
  npm run scan -- <mcp-url>
  npm run scan -- <mcp-url> --json

Examples:
  npm run scan -- https://example.com/mcp
  npm run scan -- https://example.com/mcp --json
`);
}

const args = process.argv.slice(2);
const target = args.find((arg) => !arg.startsWith("-"));
const jsonMode = args.includes("--json");

if (!target) {
  printUsage();
  process.exitCode = 1;
} else {
  try {
    const report = await scanRemote(target);

    if (jsonMode) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(`\nMCP Doctor — ${report.target}`);
      console.log(`Health score: ${report.score}/100`);
      console.log(`Transport: ${report.transport}`);
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

    if (report.score < 50) process.exitCode = 2;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
