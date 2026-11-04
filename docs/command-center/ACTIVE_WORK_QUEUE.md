# MCP Doctor — Active Work Queue

Last updated: 2026-11-03

## Current milestone

**Alpha 1 integration gate: verified scanner core + first multi-host compatibility matrix**

MCP Doctor remains a versioned multi-host readiness and repair layer built on reliable protocol observations. Official Inspector and Conformance remain upstream authorities/tools to ingest or compare against, not functionality to duplicate.

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
