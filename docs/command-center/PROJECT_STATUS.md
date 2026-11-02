# MCP Doctor — Project Status

Last updated: 2026-11-02

## Phase

**Alpha 1 core work implemented on review branches / integration gate**

## Strategic position

MCP Doctor is being built as a **multi-host compatibility intelligence and repair layer**, not as another general MCP Inspector, conformance runner, security scanner, or registry.

The core question is:

> Will this exact MCP server/version work correctly in the AI hosts my users care about, and if not, what is the smallest safe change that fixes it?

## Current material milestone

The first three P0 engineering streams have produced reviewable isolated PRs:

- PR #9 / Issue #5 — deterministic Reliability & Failure Lab fixture suite; non-draft and reported CI + CodeQL green.
- PR #11 / Issue #1 — scanner modernization for MCP 2026-07-28 and TypeScript SDK 2.4.0; draft while Inspector/Conformance comparison hooks and legacy-era support decision remain.
- PR #10 / Issue #4 — versioned HostRule framework plus source-backed ChatGPT/OpenAI, Claude and Gemini CLI packs; draft pending alignment with the scanner Observation/Evidence model and first machine-readable readiness matrix.

These branches are intentionally isolated. Main remains the pre-integration baseline, so Alpha must not yet be represented as merged or released.

## Upstream watch

- MCP 2026-07-28 remains the current protocol baseline and establishes the stateless core, extensions framework, MRTR, cacheable deterministic list results and authorization hardening.
- The official roadmap last updated 2026-08-22 continues to emphasize agent identity/DPoP and security evolution; no newer specification revision was found in this review.
- TypeScript SDK 2.4.0 remains the relevant stable line. Its current release notes include Skills over MCP (SEP-2640), stricter header/schema validation and modern per-request transport fixes.
- SEP-2640 Skills is an official extension and is tracked in Issue #12 as P1. Absence of Skills must not be treated as base-protocol non-conformance.
- Official Inspector remains deterministic server testing infrastructure and MCP Conformance remains the protocol-requirement authority; MCP Doctor should ingest/compare rather than duplicate their ownership.

## Current code / CI state

- `main` clean install and typecheck baseline is green.
- CodeQL baseline on `main` is green.
- PR #9 reports dependency install, typecheck, tests and CodeQL passing.
- PRs #10 and #11 are mergeable drafts; they remain integration work, not completed Alpha release state.
- No material CI/security regression was found in this review.

## Current critical path

1. Review/integrate PR #9 reliability fixtures.
2. Complete PR #11 Inspector/Conformance comparison hooks and make an explicit legacy-era support decision.
3. Align PR #10 HostRule observation keys with PR #11's Observation/Evidence contract.
4. Produce the first machine-readable host compatibility/readiness matrix from actual scanner observations.
5. Prove repair suggestions by re-testing against deterministic fixtures.
6. Complete hosted-scanner security gate (Issue #6) before arbitrary public URL scanning.
7. Add official Skills-extension awareness (Issue #12) after the Alpha critical path, without expanding base-protocol conformance claims.

## Dependency notes

- Workstream 03 fixtures are an input to Workstream 01 scanner regression behavior.
- Workstream 01's normalized Observation/Evidence contract is the blocking interface for Workstream 02 evaluation.
- Workstream 02's first real matrix is the gate before repair-rule proof work becomes meaningful.
- Workstream 04 security architecture gates hosted arbitrary-URL scanning; Web Product must not bypass it.
- Workstream 07 should later own source fingerprints/staleness and extension-version evidence for host rule packs.

## Cost posture

No paid infrastructure is currently required. Free/open-source tools remain sufficient for Alpha development and CI. Paid services should be introduced only against a demonstrated bottleneck or revenue need.
