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

### 03 Reliability & Failure Lab
10. Add healthy modern fixture.
11. Add malformed/weak schema fixture.
12. Add timeout/hang and disconnect/recovery fixtures.
13. Reuse MCP Failure Lab scenarios instead of duplicating equivalent fault mechanics.

### 02 Host Compatibility
14. **IN PROGRESS — Issue #4 / branch `workstream-02/issue-4-host-rules-alpha`:** versioned `HostRule` schema and validator implemented in first pass.
15. **IN PROGRESS — Issue #4:** OpenAI/ChatGPT Alpha rule pack researched from current official sources (5 initial rules).
16. **IN PROGRESS — Issue #4:** Claude Alpha rule pack researched from current official sources (5 initial rules).
17. **IN PROGRESS — Issue #4:** Gemini CLI selected as third host based on strongest host-specific official evidence (6 initial rules).
18. Next: coordinate normalized observation keys with Workstream 01, add fixture-backed evaluator cases, and produce first host-by-host matrix with `pass/fail/warn/unknown/not-tested` semantics.

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
