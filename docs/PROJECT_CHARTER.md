# MCP Doctor — Project Charter

## Mission

Make MCP integrations easier to trust, debug, and operate across AI hosts.

## Problem

MCP creates a common protocol, but protocol compliance alone does not guarantee that a real server behaves reliably across different AI hosts and environments.

Developers still need to answer:

- Can the server be reached?
- Which transport/version actually works?
- What does the server expose?
- Are tool schemas usable?
- Are names/descriptions host-friendly?
- Does authentication fail in a diagnosable way?
- Are errors reproducible?
- Would another host behave differently?
- Can a known compatibility problem be normalized safely?

## Initial user

Developer or small AI product team integrating one or more MCP servers.

## V1 promise

**Paste an MCP endpoint and get an actionable compatibility report.**

## Long-term promise

**Route an MCP connection through MCP Doctor and automatically normalize known compatibility problems with transparent, reversible fixes.**

## Non-goals for Alpha

- Arbitrary autonomous tool execution
- Full penetration testing
- Secret harvesting
- Replacing MCP Inspector
- Becoming another generic LLM observability dashboard
- Supporting every MCP extension on day one

## Success criteria for Alpha

A developer can:

1. scan a remote MCP endpoint,
2. see connection/protocol failures,
3. discover tools/resources/prompts,
4. identify obvious schema/name quality problems,
5. receive a deterministic score and machine-readable JSON report,
6. reproduce the scan locally.

## Business model hypothesis

Free:
- CLI scanner
- Basic web scan
- Public/open-source compatibility rules

Paid:
- Saved scans/history
- Scheduled monitoring
- CI enforcement
- Team dashboards
- Private/authenticated server scanning
- Cross-host compatibility matrix
- Hosted compatibility proxy
- Automatic repair policies
- Enterprise audit/governance controls

## Defensibility hypothesis

The durable asset is not the scanner UI. It is the accumulated compatibility knowledge:

`server behavior -> host behavior -> failure -> diagnosis -> repair -> outcome`

Over time this can become a large compatibility/error/repair corpus.
