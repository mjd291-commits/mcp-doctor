# MCP Doctor — Project Status

Last updated: 2026-11-03

## Phase

**Alpha integration candidate implemented on a separate draft-review branch; not released**

## Strategic position

MCP Doctor is being built as a **multi-host compatibility intelligence and repair layer**, not as another general MCP Inspector, conformance runner, security scanner, or registry.

The core question is:

> Will this exact MCP server/version work correctly in the AI hosts my users care about, and if not, what is the smallest safe change that fixes it?

## Current material milestone

`integration/alpha-host-matrix` reconciles the engineering snapshots from PRs #9,
#11 and #10 and adds a source/evidence-linked evaluator and machine-readable
ChatGPT, Claude and Gemini CLI matrix. The same controlled fixture yields different
host-specific outcomes. The original PRs remain open and unchanged; main remains
pre-integration and no Alpha release or merge is claimed.

See [ALPHA_INTEGRATION.md](ALPHA_INTEGRATION.md) for source commit SHAs,
reproduction, Observation/Evidence keys, support decisions and remaining gates.
The matrix is local metadata evaluation. No real-host or official conformance
execution occurred. Missing deployment/auth evidence remains unknown and unrun
manual/live/host paths remain not-tested.

## Upstream watch

- MCP 2026-07-28 remains the current protocol baseline and establishes the stateless core, extensions framework, MRTR, cacheable deterministic list results and authorization hardening.
- The official roadmap last updated 2026-08-22 continues to emphasize agent identity/DPoP and security evolution; no newer specification revision was found in this review.
- TypeScript SDK 2.4.0 remains the relevant stable line. Its current release notes include Skills over MCP (SEP-2640), stricter header/schema validation and modern per-request transport fixes.
- SEP-2640 Skills is an official extension and is tracked in Issue #12 as P1. Absence of Skills must not be treated as base-protocol non-conformance.
- Official Inspector remains deterministic server testing infrastructure and MCP Conformance remains the protocol-requirement authority; MCP Doctor should ingest/compare rather than duplicate their ownership.

## Current code / CI state

- Reproducible package-lock added; SDK client/server pinned to 2.4.0.
- Dependency install and clean lockfile install completed locally.
- TypeScript checks, all 3 packs / 16 rule validations, and all 27 automated tests
  passed locally on the integration candidate; results are recorded in its draft PR.
- Local npm audit reported zero known vulnerabilities.
- CI now runs npm ci, typecheck, pack validation and all test suites.
- Remote CI and CodeQL must be assessed on the integration PR; historical green
  results on main/#9 do not establish this candidate's security status.

## Current critical path

1. Review the combined integration candidate and current CI/CodeQL evidence.
2. Run official Inspector strict-lint / MCP Conformance and add native adapters;
   the caller-normalized ingestion/comparison hook is implemented but no official
   upstream run was performed.
3. Address SDK acceptance of duplicate-response IDs or explicitly delegate its
   conformance detection to the official tooling with evidence.
4. Keep legacy negotiation/SSE experimental and opt-in until a dedicated fixture
   verifies it; modern MCP 2026-07-28 is the tested Alpha path.
5. Collect explicit auth/deployment/workflow context for remaining unknown checks;
   add source staleness monitoring and actual-host evidence separately.
6. Prove repairs by deterministic re-test after matrix review.
7. Complete Issue #6 before hosted arbitrary-URL scanning.
8. Keep Skills/SEP-2640 (#12) P1 and separate from base-protocol conformance.

## Dependency notes

- Workstream 03 fixtures are an input to Workstream 01 scanner regression behavior.
- Workstream 01's Observation/Evidence keys now feed Workstream 02 evaluation on the integration candidate; additional auth/deployment keys remain uncollected.
- Workstream 02's first controlled-fixture matrix exists on the integration candidate; review and additional evidence precede repair proof.
- Workstream 04 security architecture gates hosted arbitrary-URL scanning; Web Product must not bypass it.
- Workstream 07 should later own source fingerprints/staleness and extension-version evidence for host rule packs.

## Cost posture

No paid infrastructure is currently required. Free/open-source tools remain sufficient for Alpha development and CI. Paid services should be introduced only against a demonstrated bottleneck or revenue need.
