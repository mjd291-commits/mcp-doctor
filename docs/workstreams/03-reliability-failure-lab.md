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
