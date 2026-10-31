# MCP Doctor — Architecture

## Phase 1

```text
CLI
 |
 v
Scanner
 |-- Transport connector
 |-- Protocol metadata
 |-- Discovery
 |-- Deterministic rules
 |
 v
Report
```

## Phase 2

```text
Web App
   |
API / Job Runner
   |
Scan Engine
   |-- HTTP/SSE
   |-- Auth adapters
   |-- Rule engine
   |-- Compatibility corpus
   |
Postgres
```

## Phase 3

```text
AI Host
   |
   v
MCP Doctor Proxy
   |-- policy
   |-- normalization
   |-- retry/backoff
   |-- compatibility transforms
   |-- audit
   v
MCP Server
```

## Core modules

### Connector
Owns MCP connection and version/transport behavior.

### Discovery
Collects server identity, capabilities, tools, resources, prompts, and later extensions.

### Rule engine
Runs deterministic compatibility checks.

Rules must be:
- versioned,
- testable,
- attributable,
- individually suppressible.

### Evidence store
Stores raw facts needed to reproduce why a diagnostic was emitted.

### Repair engine
Future module. A repair is never just “AI changed something.” It must declare:
- trigger,
- transformation,
- scope,
- risk,
- reversibility,
- evidence.

### Host adapters
Future module for OpenAI/ChatGPT, Claude, Cursor, VS Code, Codex, and other MCP clients where host-specific behavior materially differs.

## Data model sketch

```text
servers
scan_runs
observations
checks
rules
rule_results
host_profiles
compatibility_results
repairs
repair_outcomes
```

## Technology direction

Initial:
- TypeScript
- Node.js 20+
- official MCP TypeScript client
- CLI

Hosted:
- Next.js
- Supabase/Postgres
- background job runner
- Vercel for UI/API where suitable

Long-running scans/proxy traffic should not be forced into a serverless execution model if it becomes operationally awkward.
