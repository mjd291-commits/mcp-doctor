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
