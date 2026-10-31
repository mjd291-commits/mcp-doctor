# MCP Doctor — Project Status

Last updated: 2026-10-31

## Current phase

**Phase 0 complete / Phase 1 Alpha scanner starting**

## Completed

- Standalone GitHub repository created: `mjd291-commits/mcp-doctor`
- Product charter committed
- Alpha product specification committed
- Architecture and roadmap committed
- Active work queue and decision log committed
- TypeScript/Node project skeleton committed
- Remote scanner skeleton committed
- Streamable HTTP first with legacy SSE fallback
- Tool/resource/prompt discovery skeleton
- Deterministic tool-name/description/schema hygiene checks
- Terminal and JSON report output
- Read-only-by-default safety policy
- Bug and compatibility issue templates
- GitHub CI typecheck workflow committed
- P0 engineering issue created: #1

## Verified against current upstream docs

- `@modelcontextprotocol/client` is the current stable v2 client package.
- MCP v2 implements the 2026-07-28 protocol revision.
- `Client`, `StreamableHTTPClientTransport`, and `SSEClientTransport` are current supported client APIs.
- Recommended remote-client behavior is Streamable HTTP first, then SSE fallback on a fresh client.

## Not yet verified

The starter code has not yet completed a clean dependency install/typecheck/test run. The CI workflow was committed, but the connector-created commit did not produce an observable workflow run at setup time.

Do not treat the Alpha scanner as runnable until Issue #1's typecheck and fixture-test exit criteria pass.

## Immediate next work

See GitHub Issue #1 and `docs/ACTIVE_WORK_QUEUE.md`.

Priority order:

1. clean install + typecheck,
2. SDK drift fixes if any,
3. timeout/error taxonomy,
4. fixture MCP servers,
5. automated tests,
6. scoring model,
7. then web scanner.

## Product boundary

MCP Doctor is independent from MotorSelectIQ. MotorSelectIQ may be used later as an optional real-world test environment only.
