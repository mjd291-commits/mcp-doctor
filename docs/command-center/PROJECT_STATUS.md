# MCP Doctor — Project Status

Last updated: 2026-10-31

## Phase

**Alpha 1 scanner modernization in implementation / review**

## Strategic position

MCP Doctor is being built as a **multi-host compatibility intelligence and repair layer**, not as another general MCP Inspector, conformance runner, security scanner, or registry.

The core question is:

> Will this exact MCP server/version work correctly in the AI hosts my users care about, and if not, what is the smallest safe change that fixes it?

## Why positioning changed

Current market research shows:
- official MCP Inspector v2 already covers broad interactive inspection and strict schema portability lint and has Connection Doctor, assertions/CI, OTLP export and registry browsing on its active roadmap;
- official MCP Conformance owns protocol requirement testing;
- security scanning and generic MCP eval/testing are crowded;
- the stronger open gap is versioned many-host compatibility rules backed by live evidence, repair suggestions proven by re-testing, continuous compatibility monitoring and eventually safe runtime normalization.

## Project organization completed

- command-center operating model
- workstream map
- product positioning
- free-first tooling stack
- automation model
- dedicated starter prompt for every project chat
- 00 Command Center workstream
- 01 Protocol & Scanner Core
- 02 Host Compatibility Intelligence
- 03 Reliability & Failure Lab
- 04 Security & Trust
- 05 Repair & Runtime Proxy
- 06 Web Product & UX
- 07 Compatibility Corpus & Data
- 08 Infrastructure, CI & Release
- 09 Developer Growth & Commercial
- 10 Concept Lab

## Automation completed

- GitHub CI runs Node/TypeScript clean install + typecheck
- the first infrastructure failure (npm caching without a lockfile) was diagnosed and fixed
- clean install and `npm run typecheck` now pass on `main`
- Dependabot configured for npm and GitHub Actions and has begun opening update PRs
- CodeQL workflow added for JavaScript/TypeScript and is executing on `main`
- GitHub public repository gives access to free standard Actions runners and public-repo security capabilities
- one ChatGPT `MCP Doctor Command Center` scheduled automation created; because the account task limit was reached, ecosystem/spec/competitor monitoring was merged into this same automation rather than creating a redundant second task

## Current code state

GitHub Issue #1 scanner modernization is implemented on isolated branch `issue-1-modernize-scanner-core` in **draft PR #11**. The current code has passed dependency installation, TypeScript typecheck, and the automated scanner test suite in GitHub Actions; the PR remains unmerged for review and the remaining Issue #1 upstream-tooling work.

The implementation audit against MCP 2026-07-28 and the current TypeScript SDK establishes the following architecture:
- modern connections use SDK version negotiation and are treated as stateless at the MCP core layer;
- scanner code does not assume modern `initialize` / `initialized` or MCP session state;
- connect/discovery/cleanup operations are bounded and propagate cancellation;
- raw `Evidence` and `Observation` records are distinct from compatibility `CheckResult` judgments;
- missing optional capabilities are not treated as unhealthy;
- default discovery does not execute arbitrary tools;
- output now carries scanner, SDK, protocol-era and negotiated protocol-version context;
- persisted report evidence is size-bounded and credential-like values are redacted;
- deterministic scanner tests cover modern healthy, malformed schema, connect/request timeout, cancellation and disconnect/recovery behavior.

Issue #1 remains open until PR #11 is reviewed and the remaining upstream Inspector/Conformance integration hooks plus any intentional legacy-era fixture are completed.

## Current critical path

1. review PR #11 and finish remaining Issue #1 upstream-tooling hooks
2. deterministic fixtures/failure tests
3. HostRule schema
4. first OpenAI/ChatGPT + Claude + third-host rule packs
5. first versioned host compatibility matrix
6. repair-rule proof pipeline
7. hosted product only after security gate

See `docs/command-center/ACTIVE_WORK_QUEUE.md` for detailed ordering.

## Cost posture

No paid infrastructure is currently required. Free/open-source tools are sufficient for Alpha development and CI. Paid services should be introduced only against a demonstrated bottleneck or revenue need.
