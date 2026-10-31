# MCP Doctor — Workstream Map

## 00 — Command Center
**Role:** product lead / technical program manager

Owns: priorities, roadmap, status, dependency resolution, release gates, scope control, major product decisions.

Does not own day-to-day implementation unless temporarily necessary.

## 01 — Protocol & Scanner Core
**Role:** MCP protocol engineer

Owns: MCP client behavior, protocol-era support, transports, discovery, scanner engine, deterministic rule runner, report schema, CLI, integration with official Inspector/conformance tooling.

Primary file: `docs/workstreams/01-protocol-scanner-core.md`

## 02 — Host Compatibility Intelligence
**Role:** compatibility research engineer

Owns: versioned rule packs for ChatGPT/OpenAI, Claude, Cursor, VS Code, Codex, Gemini CLI, Kiro, Windsurf and other material hosts; source evidence; static vs live checks; host-version drift.

Primary file: `docs/workstreams/02-host-compatibility.md`

## 03 — Reliability & Failure Lab
**Role:** QA / chaos / resilience engineer

Owns: fixtures, fault injection, timeouts, cancellations, malformed responses, disconnect/recovery, performance scenarios, regression baselines, integration with MCP Failure Lab and compatible open tooling.

Primary file: `docs/workstreams/03-reliability-failure-lab.md`

## 04 — Security & Trust
**Role:** application/security engineer

Owns: threat model, secret handling, SSRF/network safety, safe scan boundaries, malicious tool metadata/output handling, dependency/security automation, OWASP mapping, use of existing MCP security scanners instead of duplicating them.

Primary file: `docs/workstreams/04-security-trust.md`

## 05 — Repair & Runtime Proxy
**Role:** platform/gateway engineer

Owns: failure fingerprints, repair rule format, proposed transformations, proof-by-retest, reversible normalization, later runtime proxy/gateway architecture, audit trail.

Primary file: `docs/workstreams/05-repair-runtime-proxy.md`

## 06 — Web Product & UX
**Role:** full-stack product engineer / product designer

Owns: hosted scan workflow, report UX, comparison views, shareable evidence, dashboard, authentication when needed, accessibility, developer ergonomics.

Primary file: `docs/workstreams/06-web-product-ux.md`

## 07 — Compatibility Corpus & Data
**Role:** data engineer / applied intelligence engineer

Owns: scan/result model, server/version fingerprints, host/version matrix, registry ingestion, provenance, deduplication, privacy/redaction, datasets for repair/failure intelligence.

Primary file: `docs/workstreams/07-compatibility-corpus-data.md`

## 08 — Infrastructure, CI & Release
**Role:** DevOps/SRE/release engineer

Owns: GitHub Actions, dependency updates, CodeQL/secret scanning, scheduled upstream checks, release automation, deploy targets, observability, uptime, cost controls.

Primary file: `docs/workstreams/08-infrastructure-automation.md`

## 09 — Developer Growth & Commercial
**Role:** DevRel + product marketing + commercial lead

Owns: docs/examples, open-source adoption, registry presence, SEO/AEO, launch, community feedback, pricing hypotheses, paid conversion, partnerships and customer discovery.

Primary file: `docs/workstreams/09-growth-commercial.md`

## 10 — Concept Lab
**Role:** research / strategy lab

Owns: ideas that are not yet approved for production, market/competitor research, experiments, second-order effects, promotion packages for strong ideas.

Primary file: `docs/workstreams/10-concept-lab.md`

---

## Chat names

Create one ChatGPT Project chat per workstream using these exact names:

- `00 — MCP Doctor Command Center`
- `01 — MCP Doctor Protocol & Scanner Core`
- `02 — MCP Doctor Host Compatibility`
- `03 — MCP Doctor Reliability & Failure Lab`
- `04 — MCP Doctor Security & Trust`
- `05 — MCP Doctor Repair & Runtime Proxy`
- `06 — MCP Doctor Web Product & UX`
- `07 — MCP Doctor Compatibility Corpus & Data`
- `08 — MCP Doctor Infrastructure & Automation`
- `09 — MCP Doctor Growth & Commercial`
- `10 — MCP Doctor Concept Lab`

## Staffing principle

These are functional AI-team roles, not separate databases. All of them coordinate through the same GitHub repository and never rely on another chat's memory as authoritative state.
