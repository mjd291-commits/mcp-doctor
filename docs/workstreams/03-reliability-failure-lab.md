# 03 — Reliability & Failure Lab

## Role
QA / chaos / resilience engineer.

## Mission
Make compatibility failures reproducible. Build deterministic fixtures and fault scenarios that prove how scanner/client/repair behavior responds to timeouts, malformed responses, disconnects, cancellation, version drift, and load.

## Owns
- healthy and broken fixture servers
- fault injection
- timeout/cancellation/recovery tests
- transport/session-era failure tests
- malformed/duplicate response fixtures
- performance/regression scenarios
- JUnit/CI-friendly outputs
- integration with MCP Failure Lab and other mature free test tools

## Safety
Never run stress/load tests against third-party servers without explicit authorization. Public external targets are smoke-tested conservatively only.

## Initial backlog
1. Healthy modern 2026-07-28 fixture.
2. Legacy-era fixture where still relevant.
3. Weak/malformed tool schema fixture.
4. Timeout/hang fixture.
5. disconnect/recovery fixture.
6. malformed/duplicate response fixture.
7. auth failure fixtures without real secrets.
8. Integrate selected MCP Failure Lab scenarios instead of recreating equivalent faults.
9. Define regression baseline format.
10. Later: functional-scenario-linked load test prototype.

## Exit gate for Reliability Alpha
- core scanner has deterministic fixtures for healthy/warn/fail states,
- failures reproduce consistently in CI,
- timeout tests cannot hang the pipeline indefinitely,
- recovery behavior is recorded explicitly,
- fixture versions are pinned.

## Cross-workstream dependencies
- 01 consumes fixtures.
- 02 supplies host-specific live cases.
- 05 requires reproducible pre-repair failure cases.
- 08 runs regression suites in CI/schedules.

## Issue #5 implementation — 2026-10-31

Branch: `workstream-03/issue-5-fixture-suite`

### Fixture contract

The deterministic fixture harness lives under `test/fixtures/` and targets MCP `2026-07-28`.

| Fixture | Fault point | Expected semantic | Contract |
| --- | --- | --- | --- |
| `healthy` | none | pass | valid `server/discover`, `tools/list`, `resources/list`, `prompts/list` |
| `weak-schema` | `tools/list` | warn | transport/protocol healthy; tool description/schema intentionally weak |
| `hang` | `tools/list` | fail | request never completes until caller cancellation or teardown |
| `disconnect-recovery` | first `tools/list` | recovery | first request socket drops; second request succeeds |
| `malformed-json` | `tools/list` | fail | HTTP 200 with invalid JSON body |
| `duplicate-response` | `tools/list` | fail | two JSON-RPC responses reuse the same request id |
| `fake-auth` | connect/discover path | fail | deterministic 401 Bearer challenge; fake/disposable token only |

`test/fixtures/baseline.v1.json` is the machine-readable regression contract. Workstream 01 should map these deterministic facts into its Observation/Evidence/error taxonomy rather than making Workstream 03 own scanner conclusions.

### Timeout safety

The `hang` fixture deliberately does not complete `tools/list`, but the test supplies a short AbortSignal deadline and fixture teardown destroys all open sockets before closing the server. This allows the fixture to expose missing scanner timeouts without making CI itself unbounded.

### Credential safety

The auth fixture never persists an Authorization value or request body. Its snapshot records only whether an Authorization header was present. Tests use the constant fake token `mcp-doctor-fixture-invalid-token`; real credentials are neither required nor appropriate.

### MCP Failure Lab evaluation

MCP Failure Lab `0.10.0` was reviewed before implementing these faults. It already provides mature delay/hang/disconnect/malformed/duplicate response scenarios and JSON/JUnit reporting for failures exercised through MCP tool calls.

For Issue #5, the scanner must remain non-destructive and does not call arbitrary discovered tools. The required failures therefore need to occur during `server/discover` / `tools/list`, not by invoking Failure Lab fault tools. The local harness is intentionally limited to those scanner-facing discovery faults rather than cloning Failure Lab's broader scenario runner.

Reuse plan:
- keep this harness for scanner/discovery regression cases;
- use MCP Failure Lab rather than extending this harness when Workstream 05 needs tool-call cancellation, late-response, session-loss or broader repair/runtime scenarios;
- do not introduce Failure Lab as a dependency until a test actually consumes one of those scenarios.

### CI integration

`npm test` runs the fixture suite and the main CI workflow executes it after typecheck. The workflow retains a 10-minute outer timeout in addition to per-test cancellation boundaries.

### Workstream 01 coordination

The fixture contract and branch were posted to GitHub Issue #1. Core owns timeout/retry policy and conversion of raw fixture behavior into structured Observation/Evidence/CheckResult output.
