# MCP Doctor — Product Positioning

Last reviewed: 2026-10-31

## Market reality

The MCP tooling market is crowded in:

- manual inspection/debugging,
- protocol conformance,
- basic schema linting,
- generic evals,
- security scanning,
- simple MCP gateways.

The official MCP Inspector is actively expanding into connection diagnosis, strict schema portability lint, saved calls/assertions, CI flows, conformance integration, OTLP export and registry browsing. MCP Doctor must not depend on those remaining unbuilt.

## Defensible wedge

**MCP Doctor answers a different question:**

> "Will this exact MCP server/version work correctly in the AI hosts my users actually use, and if it will not, what is the smallest safe change that fixes it?"

## Product layers

### Layer 1 — Host Readiness
Versioned, source-backed rule packs for major hosts and distribution surfaces.

Examples:
- host naming/length limits,
- required annotations,
- tool-count constraints,
- transport/auth requirements,
- output/schema expectations,
- startup/timeout behavior,
- directory/store submission rules.

Each rule declares:
- host,
- host/version or effective date,
- source,
- check type: static/live/semantic,
- severity,
- autofixability,
- confidence.

### Layer 2 — Live Compatibility
Where possible, exercise the server through real or faithful host/client behavior rather than checking definitions only.

Output is version-specific evidence, not a timeless badge.

### Layer 3 — Repair Intelligence
Map failures to known repair strategies.

`fingerprint -> diagnosis -> proposed patch/transform -> retest -> outcome`

No repair is trusted until the relevant compatibility checks pass again.

### Layer 4 — Continuous Compatibility
Re-run important checks when:
- the server changes,
- its tool definitions change,
- an MCP SDK/spec revision changes,
- a host changes its requirements,
- authentication/transport behavior changes.

### Layer 5 — Runtime Compatibility Proxy
Only after the repair corpus is mature: transparently normalize known safe compatibility issues at runtime with explicit policies and auditability.

## Primary initial customer

An MCP server developer/team preparing to support more than one AI host or marketplace and tired of maintaining separate compatibility checklists.

## Initial product promise

**One command / one scan -> a host-by-host readiness matrix with evidence and actionable fixes.**

## What we intentionally do not claim

- "MCP Doctor proves a server is secure." Use specialist security scanners.
- "MCP Doctor defines MCP conformance." The official conformance suite does.
- "MCP Doctor replaces Inspector." It complements it.
- "A passing host check guarantees future compatibility." Results are versioned and time-bound.

## Moat

The long-term asset is the compatibility knowledge graph/corpus:

`server version + host version + protocol era + auth/transport + rule/failure + repair + retest outcome`

The UI is not the moat. The accumulated evidence and repair success history are.
