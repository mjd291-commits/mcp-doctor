# MCP Doctor — Roadmap

## Phase 0 — Foundation
Target: now

- Repository
- Charter
- architecture
- CLI skeleton
- deterministic report type
- safe read-only scan policy

## Phase 1 — Alpha scanner
Target: first usable product

- Remote Streamable HTTP
- SSE fallback
- protocol negotiation
- tools/resources/prompts discovery
- schema/name/description rules
- better timeout/error classification
- fixture MCP servers
- automated tests
- JSON report
- terminal report

Exit condition:
A developer can diagnose common basic MCP connection/discovery problems locally.

## Phase 2 — Web scanner
- paste endpoint UI
- scan job
- report page
- saved scan IDs
- redaction
- shareable public report for public servers
- private reports by default
- no credentials stored unless explicitly designed

## Phase 3 — CI / GitHub
- CLI exit policies
- baseline comparison
- regression detection
- GitHub Actions example
- PR compatibility report

## Phase 4 — Compatibility corpus
- fingerprint recurring errors
- known-server fingerprints
- host compatibility profiles
- rule telemetry
- anonymized failure signatures
- opt-in corpus contribution

## Phase 5 — Authenticated scanning
- OAuth
- bearer/header strategies
- secret isolation
- ephemeral credential handling
- auditable scan permissions

## Phase 6 — Proxy
- transparent forwarding
- retries/backoff
- name/schema normalization
- configurable transforms
- repair audit log
- reversible repair policies

## Phase 7 — Commercial platform
- scheduled monitoring
- team workspaces
- alerts
- historical SLA
- enterprise policies
- billing
