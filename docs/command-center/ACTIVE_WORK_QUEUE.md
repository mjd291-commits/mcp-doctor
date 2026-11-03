# MCP Doctor — Active Work Queue

Last updated: 2026-11-03

## Current milestone

**Alpha 1 integration gate: verified scanner core + first multi-host compatibility matrix**

MCP Doctor remains a versioned multi-host readiness and repair layer built on reliable protocol observations. Official Inspector and Conformance remain upstream authorities/tools to ingest or compare against, not functionality to duplicate.

## P0 — Now

### Integration order
1. Review/integrate PR #9 (Reliability fixture suite). Its deterministic fixture contract is the regression input for scanner behavior.
2. Finish PR #11 (Scanner Core): add Inspector strict-lint and MCP Conformance comparison/ingestion hooks where useful; make the explicit legacy-era support decision; keep the normalized `Observation`/`Evidence` contract stable.
3. Align PR #10 HostRule observation keys to PR #11's normalized observations, then add evaluator + fixture cases and emit the first machine-readable host readiness matrix.
4. Keep all three branches isolated until their dependency interfaces are reconciled; do not represent Alpha as released while main remains pre-integration.

### 08 Infrastructure & Automation
- CI, CodeQL and Dependabot are confirmed active and green on the current main baseline.
- Add/confirm a reproducible dependency lockfile as integration lands.
- Do not take unrelated major dependency upgrades into the Alpha integration gate unless required for security or compatibility.

### 03 Reliability & Failure Lab
- Fixture implementation is complete on PR #9: healthy, weak/malformed schema, timeout/hang, disconnect/recovery and safe auth/fault paths.
- Preserve the boundary with MCP Failure Lab: reuse broader runtime/tool-call fault mechanics rather than growing a duplicate fault framework.

### 01 Protocol & Scanner Core
- Main modernization is implemented on PR #11 against MCP 2026-07-28 / TypeScript SDK 2.4.0: stateless lifecycle, timeout/cancellation, Evidence/Observation separation, redaction and non-destructive discovery.
- Remaining exit work: Inspector/Conformance comparison hooks and explicit legacy-era support decision.

### 02 Host Compatibility
- Versioned HostRule framework and source-backed ChatGPT/OpenAI, Claude and Gemini CLI packs are implemented on PR #10.
- Next: normalize observation keys against PR #11, implement evaluation, demonstrate divergent host outcomes from one scan, and produce the first machine-readable matrix using `pass/fail/warn/unknown/not-tested` semantics.
- Codex, VS Code and Cursor remain next host-pack candidates after the first matrix proves the evaluator contract.

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
