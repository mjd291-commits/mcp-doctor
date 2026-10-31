# 01 — Protocol & Scanner Core

## Role
MCP protocol engineer / core runtime owner.

## Mission
Build the smallest reliable engine that can collect facts from an MCP server across relevant protocol eras/transports and feed those facts into versioned compatibility rules.

## Owns
- MCP client lifecycle and transport support
- modern and legacy protocol-era handling
- discovery of tools/resources/prompts/capabilities/extensions
- timeout/error classification
- scanner orchestration
- deterministic rule-runner interface
- report/event schema
- CLI
- integration with official Inspector and Conformance tooling

## Does not own
- host rule content (02)
- security rule corpus (04)
- repair transformations (05)
- hosted UX (06)
- long-term corpus schema (07)

## Architectural rules
- Track the actual current MCP spec; do not preserve obsolete handshake assumptions accidentally.
- Preserve raw observations separately from rule conclusions.
- A server that does not implement an optional capability is not automatically unhealthy.
- Protocol conformance comes from the official conformance framework where possible.
- Default scan remains non-destructive.

## Initial backlog
1. Verify the committed scanner against SDK v2/current 2026-07-28 lifecycle.
2. Correct any stale initialization/session assumptions.
3. Add explicit timeout/cancellation behavior.
4. Define `Observation` and `Evidence` types independent from `CheckResult`.
5. Create fixture interface consumed by Reliability workstream.
6. Add official Inspector `--strict` comparison fixture.
7. Add official Conformance invocation/ingestion adapter.
8. Produce machine-readable JSON report with version fields for scanner, SDK and protocol.

## Exit gate for Alpha Core
- clean install/typecheck/test,
- modern healthy fixture passes,
- legacy fixture produces explicit era result,
- malformed fixture produces deterministic findings,
- no arbitrary tool is called by default,
- report is stable enough for Host Compatibility to consume.

## Cross-workstream dependencies
- 02 supplies host rule interface requirements.
- 03 supplies faults/fixtures.
- 04 reviews network/credential safety.
- 07 defines persisted evidence identifiers later.

## Issue #1 implementation audit — 2026-10-31

Status: **in progress in draft PR #11** on branch `issue-1-modernize-scanner-core`.

### Upstream lifecycle findings
- `@modelcontextprotocol/client` 2.4.0 is the current stable client line used for this work.
- The SDK defaults to legacy behavior unless version negotiation is enabled. MCP Doctor intentionally uses `versionNegotiation: { mode: "auto" }` so the SDK performs `server/discover` probing for the 2026-07-28 modern era and falls back to the legacy initialize flow only when appropriate.
- A negotiated modern 2026-07-28 connection is stateless at the MCP core layer. Scanner architecture must not invent or depend on `initialize` / `initialized` or `Mcp-Session-Id` state for that era.
- `Client.connect()` accepts request options including `signal` and `timeout`; discovery calls such as `listTools`, `listResources`, and `listPrompts` accept the same bounded request controls.
- On modern Streamable HTTP, request cancellation is represented by aborting the in-flight request stream. The scanner therefore propagates `AbortSignal` rather than implementing a legacy cancellation message itself.

### Implemented in PR #11
- bounded connect, discovery, and cleanup operations;
- external cancellation propagation and typed scanner error categories;
- no SSE fallback after an HTTP timeout/cancellation, because silence on modern HTTP is not evidence of a legacy server;
- intentionally supported legacy SSE fallback for definitive Streamable HTTP connection failure;
- raw `Evidence` and `Observation` layers separated from `CheckResult` compatibility judgments;
- checks reference their source observations;
- optional, unadvertised tools/resources/prompts are informational rather than unhealthy;
- scanner, SDK, protocol-era, and negotiated-version context in JSON/terminal reports;
- bounded evidence serialization and basic credential/target redaction;
- a scanner session seam so Reliability fixtures can inject deterministic faults without pretending mocks are protocol conformance;
- automated coverage for healthy modern behavior, malformed schemas, timeout, cancellation, disconnect/recovery, and redaction;
- healthy fixture verifies that default discovery never executes a discovered tool.

### Still required before closing Issue #1
- official Inspector strict-lint ingestion/comparison hook;
- official MCP Conformance ingestion/comparison hook;
- explicit legacy-era fixture if legacy support remains in the Alpha support matrix;
- merge only after CI/typecheck/test verification and review.
