# MCP Doctor — Active Work Queue

Last updated: 2026-11-12

Draft integration PR: [#13](https://github.com/mjd291-commits/mcp-doctor/pull/13).

## Current milestone

**Alpha 1 integration gate: verified scanner core + first multi-host compatibility matrix**

MCP Doctor remains a versioned multi-host readiness and repair layer built on reliable protocol observations. Official Inspector and Conformance remain upstream authorities/tools to ingest or compare against, not functionality to duplicate.

## Security release checkpoint — 2026-11-12

- **Material upstream security update:** Official [Inspector 2.15.0](https://github.com/modelcontextprotocol/inspector/releases/tag/2.15.0), released 2026-11-12 00:46 UTC, fixes four vulnerabilities (fetch/OAuth cloud-metadata destination guard, unbounded event-stream recording, `mcpdo` daemon authentication, and unsafe `server.json` environment preview). **2.14.0 is superseded; do not introduce or execute it.** Detailed exposure review and acceptance criteria recorded in [Issue #14](https://github.com/mjd291-commits/mcp-doctor/issues/14).
- **Security dependency:** Workstream 04 / Issue #6 must add cloud-metadata alternate-address and stream memory-exhaustion cases to the hosted-scanner threat model. This is a **pre-hosted-scan** gate, not evidence of a current MCP Doctor vulnerability. The Alpha upstream comparison hook only accepts caller-normalized JSON; no Inspector execution has been demonstrated.
- **Release order unchanged:** Review/land stacked #18 into #13, rerun CI/CodeQL on the combined head, inspect final diff and obtain approval before merging to main. Any later native Inspector execution/adapter must target patched 2.15.0 or later and patched Node.
- Upstream watch: official TypeScript SDK v2.4.0 and Registry v1.8.9 remain latest observed releases; MCPJam v3.20.0 positioning is tracked in #19. No new host-specific change was independently established in this checkpoint.

## Verification checkpoint — 2026-11-10

- Stacked draft PR [#18](https://github.com/mjd291-commits/mcp-doctor/pull/18) fixes a scanner false negative for missing, whitespace-only and non-string tool names; includes regression coverage. Its [CI](https://github.com/mjd291-commits/mcp-doctor/actions/runs/42744551384) and [CodeQL](https://github.com/mjd291-commits/mcp-doctor/actions/runs/42744551743) both passed on head `e10096da`. This is a verified **PR checkpoint, not a merge or release**.
- Next: review #18, integrate it into this branch, verify the resulting #13 CI and CodeQL on the updated head, then obtain approval for merging #13 to main. Keep original workstream PRs and Worker 3 onboarding separate.
- As of the November 10 checkpoint, no additional release blocker was confirmed; the November 12 Inspector security update above supersedes that statement. Continue Issues #12, #14 and #15. Official conformance, real-host testing and hosted-scan security remain uncompleted.

## P0 — Now

### Integration candidate ready for review

The separate `integration/alpha-host-matrix` branch incorporates the file changes
from PRs #9, #11 and #10 without merging or modifying their branches. It resolves
shared package/CI/config conflicts and adds normalized observations, a HostRule
evaluator, a controlled-fixture machine-readable matrix and integration tests.
See [ALPHA_INTEGRATION.md](ALPHA_INTEGRATION.md) for the exact contract and evidence.

### 08 Infrastructure & Automation
- Package-lock added; clean npm ci and local audit performed.
- CI runs typecheck, 3-pack/16-rule validation and all automated tests.
- Review integration-PR CI/CodeQL; do not reuse historical main/#9 green claims.

### 03 Reliability & Failure Lab
- #9 healthy, weak-schema, timeout, disconnect/recovery, malformed JSON,
  duplicate-response and fake-auth fixtures are preserved and consumed.
- Integrated fault tests expose SDK 2.4.0 accepting the first duplicate response;
  detection remains unresolved and must not be reported as scanner conformance.
- Preserve the MCP Failure Lab boundary for broader runtime/tool-call scenarios.

### 01 Protocol & Scanner Core
- #11 modern lifecycle, bounded operations, redaction and Evidence/Observation
  separation are integrated. No arbitrary discovered tool runs by default.
- Modern 2026-07-28 is the tested path. Legacy negotiation is experimental; SSE
  fallback is opt-in until dedicated legacy fixtures exist.
- Generic caller-normalized Inspector/Conformance import/comparison hook added;
  native adapters and actual official upstream runs remain open under #1.

### 02 Host Compatibility
- #10 three versioned source-backed packs are integrated with local evaluation.
- First matrix and full scan evidence: examples/compatibility-matrix.json and
  examples/controlled-fixture-report.json; regenerate with npm run matrix:example.
- Host divergence is tested from one server. Every finding retains surface scope,
  source claims, observation/evidence references and pack version.
- Missing auth/deployment/workflow evidence and unsupported semantic predicates
  remain unknown; unrun live/manual/host checks remain not-tested.
- Real-host testing, source fingerprinting/staleness and new host packs follow
  the current matrix review; do not claim protocol conformance from host results.

## P1 — Make findings trustworthy

### 04 Security & Trust
- Complete hosted scanner SSRF/network threat model before arbitrary public URL scanning.
- Centralize redaction and max-size/time policies.
- Perform dependency/supply-chain/security review at the integration gate.

### 07 Compatibility Corpus & Data
- Define local versioned evidence model, source fingerprints and staleness handling.
- Define rule/result/repair provenance.
- Prototype Registry/API metadata sync without introducing a database prematurely.
- Track extension/version evidence independently from base-protocol conformance.

### 05 Repair & Runtime Proxy
- Define `FailureFingerprint` and `RepairRule` schemas only after the first real host matrix exists.
- Add first fixture-backed repair suggestions and require proof-by-retest before marking a repair validated.

### Official extensions
- Issue #12 tracks Skills/SEP-2640 awareness as P1. Do not expand Alpha scope or treat absence of Skills as base-protocol failure.

## P2 — Product surface

### 06 Web Product & UX
- Build readiness-matrix report UX after the matrix contract exists.
- Add safe public endpoint scan flow only after Security gate.
- Add export/share/history after privacy model is settled.

### 09 Growth & Commercial
- Update README/launch positioning around multi-host readiness + proven repair once the first matrix is demonstrable.
- Customer/developer discovery.
- Free-to-paid validation before billing implementation.

## Deferred until evidence exists

- runtime compatibility proxy,
- automatic third-party code mutation,
- aggressive external load testing,
- generic security scanner,
- generic registry,
- paid infrastructure,
- broad web dashboard before the CLI/core has differentiated results.

## Priority rule

Do not pull P2 work forward merely because UI is easier to demo. The critical path is:

`deterministic fixtures -> normalized observations/evidence -> versioned host rules -> machine-readable host matrix -> repair proof -> security-gated hosted product`
