# MCP Doctor — Active Work Queue

Last updated: 2026-10-31

## Current milestone

**Alpha 1: verified scanner core + first multi-host compatibility matrix**

The product is no longer scoped as a generic MCP inspector/connection doctor. Official MCP tooling already covers or plans much of that territory. MCP Doctor's differentiated Alpha is a versioned host-readiness layer built on top of reliable protocol observations.

## P0 — Now

### 08 Infrastructure & Automation
1. Confirm CI actually executes on current repo pushes/PRs.
2. Confirm CodeQL workflow is accepted/runs.
3. Confirm Dependabot config is active.
4. Add reproducible dependency lockfile as soon as clean install is available.

### 01 Protocol & Scanner Core
5. Complete GitHub Issue #1: clean install/typecheck and fix SDK drift.
6. Audit current scanner against the 2026-07-28 stateless lifecycle; remove stale initialization/session assumptions.
7. Add explicit timeout/cancellation and structured error taxonomy.
8. Separate raw `Observation`/`Evidence` from compatibility `CheckResult`.
9. Add adapters to ingest official Inspector strict-lint and official MCP Conformance results where useful.

**Current implementation:** draft PR #11 (`issue-1-modernize-scanner-core`) completes the scanner lifecycle audit/correction, bounded connect/discovery/cleanup, cancellation propagation, raw evidence/observation separation, report version context, credential-aware evidence redaction and automated modern/malformed/connect-timeout/request-timeout/cancellation/disconnect tests. Items 5–8 are implemented and have passed GitHub Actions typecheck/tests in the PR but remain unmerged pending review. Item 9 and an intentional legacy-era fixture remain open before Issue #1 closes.

### 03 Reliability & Failure Lab
10. Add healthy modern fixture.
11. Add malformed/weak schema fixture.
12. Add timeout/hang and disconnect/recovery fixtures.
13. Reuse MCP Failure Lab scenarios instead of duplicating equivalent fault mechanics.

PR #11 now supplies initial scanner-level fixtures for items 10–12; Workstream 03 should build on the shared scanner session seam rather than duplicate these cases.

### 02 Host Compatibility
14. Define versioned `HostRule` schema.
15. Build current OpenAI/ChatGPT rule pack from official sources.
16. Build Claude rule pack.
17. Add third priority host (Codex/VS Code/Cursor/Gemini based on best available evidence).
18. Produce first host-by-host matrix with `pass/fail/warn/unknown/not-tested` semantics.

## P1 — Make findings trustworthy

### 04 Security & Trust
19. Hosted scanner SSRF/network threat model.
20. Central redaction and max-size/time policies.
21. Dependency/supply-chain/security review.

### 07 Compatibility Corpus & Data
22. Define local versioned evidence model and fingerprints.
23. Define rule/result/repair provenance.
24. Prototype registry metadata sync without introducing a database prematurely.

### 05 Repair & Runtime Proxy
25. Define `FailureFingerprint` and `RepairRule` schemas.
26. Add first 5 fixture-backed repair suggestions.
27. Require proof-by-retest before a repair is marked validated.

## P2 — Product surface

### 06 Web Product & UX
28. Build readiness-matrix report UX.
29. Add safe public endpoint scan flow only after Security gate.
30. Add export/share/history after privacy model is settled.

### 09 Growth & Commercial
31. Update README/launch positioning around multi-host readiness + proven repair.
32. Customer/developer discovery.
33. Free-to-paid validation before billing implementation.

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

`verified observations -> versioned host rules -> reproducible failures -> repair proof -> hosted product`
