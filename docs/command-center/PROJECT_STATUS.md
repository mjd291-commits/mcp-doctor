# MCP Doctor — Project Status

Last updated: 2026-10-31

## Phase

**Project restructured / Alpha 1 implementation starting**

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

- GitHub CI exists for Node/TypeScript typecheck
- Dependabot configured for npm and GitHub Actions
- CodeQL workflow added for JavaScript/TypeScript
- GitHub public repository gives access to free standard Actions runners and public-repo security capabilities
- one ChatGPT `MCP Doctor Command Center` scheduled automation created; because the account task limit was reached, ecosystem/spec/competitor monitoring was merged into this same automation rather than creating a redundant second task

## Current code state

The scanner skeleton exists but is **not yet verified runnable**. Do not claim Alpha works until GitHub Issue #1 exit criteria pass.

Important technical audit required: verify the initial scanner code against the current MCP 2026-07-28 stateless lifecycle and current SDK v2 APIs. Earlier project language around initialization/session behavior may be stale and must be corrected before it becomes architecture.

## Current critical path

1. CI/install/typecheck verification
2. current-protocol scanner correction
3. deterministic fixtures/failure tests
4. HostRule schema
5. first OpenAI/ChatGPT + Claude + third-host rule packs
6. first versioned host compatibility matrix
7. repair-rule proof pipeline
8. hosted product only after security gate

See `docs/command-center/ACTIVE_WORK_QUEUE.md` for detailed ordering.

## Cost posture

No paid infrastructure is currently required. Free/open-source tools are sufficient for Alpha development and CI. Paid services should be introduced only against a demonstrated bottleneck or revenue need.
