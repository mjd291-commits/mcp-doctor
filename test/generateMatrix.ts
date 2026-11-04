import { mkdir, writeFile } from "node:fs/promises";
import { scanRemote } from "../src/scanner.js";
import { startFixture } from "./fixtures/mcpFixtureServer.js";

const fixture = await startFixture("healthy");
try {
  const report = await scanRemote(fixture.url.href, { connectTimeoutMs: 1000, requestTimeoutMs: 1000 });
  await mkdir(new URL("../examples/", import.meta.url), { recursive: true });
  await writeFile(new URL("../examples/controlled-fixture-report.json", import.meta.url), JSON.stringify(report, null, 2) + "\n");
  await writeFile(new URL("../examples/compatibility-matrix.json", import.meta.url), JSON.stringify(report.compatibility, null, 2) + "\n");
  console.log("Wrote examples/controlled-fixture-report.json from a controlled local scan; no real hosts tested.");
} finally {
  await fixture.close();
}
