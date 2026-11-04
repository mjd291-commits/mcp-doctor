# MCP Doctor

**MCP Doctor** is a compatibility, diagnostics, and repair layer for Model Context Protocol (MCP) integrations.

The first product goal is deliberately narrow:

> Give MCP Doctor a remote MCP endpoint and receive a clear health report explaining whether the server can be reached, negotiated, discovered, and understood safely.

The long-term product expands from a scanner into a compatibility proxy that can normalize common MCP integration problems at runtime.

## Status

**Alpha integration candidate — controlled-server CLI and local host-rule evaluation**

This repository starts with a CLI scanner. It does **not** execute discovered tools by default.

## Why this exists

MCP lets AI applications connect to tools and data through a common protocol, but real integrations can still fail because of transport differences, version negotiation, authentication, malformed or weak schemas, naming collisions, incomplete descriptions, incompatible server behavior, timeouts, and host-specific assumptions.

MCP Doctor aims to make those failures:

1. detectable,
2. understandable,
3. reproducible,
4. eventually repairable.

## Initial architecture

```text
Developer / AI Host
        |
        v
+-------------------+
|    MCP Doctor     |
|-------------------|
| Connectivity      |
| Negotiation       |
| Capability checks |
| Schema checks     |
| Safety checks     |
| Compatibility     |
| Report engine     |
+-------------------+
        |
        v
     MCP Server
```

Later:

```text
AI Host -> MCP Doctor Proxy -> MCP Server
```

## Quick start

Requirements:

- Node.js 20+
- npm

Install:

```bash
npm ci
```

Run a scan:

```bash
npm run scan -- https://example.com/mcp
```

JSON output:

```bash
npm run scan -- https://example.com/mcp --json
```

The scanner currently performs read-only discovery where the server permits it:

- Connect / protocol negotiation
- Server identity
- Server capabilities
- Tool discovery
- Resource discovery
- Prompt discovery
- Basic tool schema hygiene checks
- Duplicate-name checks
- Report scoring

It deliberately does **not** call arbitrary tools during the first phase.

The integration candidate includes evidence-linked ChatGPT, Claude and Gemini CLI
findings under `compatibility` in JSON output. Each finding retains its host surface,
versioned rule pack, official-source claim, observation IDs and evidence IDs. These
are local metadata evaluations; no real-host execution or official protocol
conformance is claimed. Counts span the named surfaces and are not an overall host
certification. Missing auth, tunnel, network or deployment evidence stays unknown;
unperformed live/manual/host checks stay not-tested.

Run the controlled fixtures and generate the example matrix:

```bash
npm run check
npm run matrix:example
```

The latter starts a local fixture, scans it without calling tools, writes
`examples/controlled-fixture-report.json` and `examples/compatibility-matrix.json`,
then closes the fixture. The sample intentionally produces different findings:
ChatGPT Streamable HTTP passes, Claude Messages API HTTPS fails on the local HTTP
endpoint, and Gemini CLI warns about schema/name transformations.

Use only controlled/authorized endpoints for this Alpha. Modern MCP 2026-07-28 is
the verified path. Legacy negotiation/SSE remains experimental and SSE fallback is
opt-in with `--legacy-sse-fallback`. Hosted arbitrary-URL scanning remains blocked
by Issue #6. See `docs/command-center/ALPHA_INTEGRATION.md` for validation and gaps.

External Inspector/Conformance results can be normalized and attached with
`--upstream-results <file.json>`. This comparison hook neither runs upstream tools
nor verifies the caller's evidence. Its envelope is documented in the integration
notes; imported results do not change the report's conformance claim.

## Product principles

- Never execute destructive tools during a default scan.
- Separate protocol facts from MCP Doctor opinions.
- Preserve raw errors for reproducibility.
- Prefer deterministic checks before AI-generated explanations.
- Do not “repair” behavior silently.
- Every automatic repair must eventually be explainable and reversible.
- Compatibility across hosts matters more than optimizing for one LLM vendor.

## Key project docs

- `docs/PROJECT_CHARTER.md`
- `docs/PRODUCT_SPEC.md`
- `docs/ARCHITECTURE.md`
- `docs/ROADMAP.md`
- `docs/ACTIVE_WORK_QUEUE.md`
- `docs/DECISIONS.md`

## Working name

Product name: **MCP Doctor**

The name is a working product name. Trademark/domain review should happen before public launch.
