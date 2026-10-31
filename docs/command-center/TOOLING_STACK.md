# MCP Doctor — Free-First Tooling Stack

Last reviewed: 2026-10-31

## Principle

Use mature free/open-source tools as building blocks and spend engineering effort only on MCP Doctor's differentiated layer: cross-host compatibility intelligence, failure fingerprints, repair proof, and later runtime normalization.

## Adopt now

### GitHub — source of truth and automation
- Public repository
- GitHub Actions for CI/scheduled jobs
- Dependabot
- GitHub secret scanning
- CodeQL/code scanning
- Issues/PRs/releases

Why: public repos receive free standard GitHub-hosted Actions runners; public secret scanning and CodeQL are available free. This gives us high-value automation without another vendor.

### Official MCP Inspector
Use as a reference/debugging client and as an upstream oracle, not as a product we clone.

Useful surfaces:
- Web/CLI/TUI
- modern + legacy transport/protocol behavior
- strict schema portability lint
- OAuth debugging
- protocol/network logs

### Official MCP Conformance Framework
Run it against our fixtures and later against scanned servers where appropriate. Protocol conformance is upstream's job; MCP Doctor should ingest/report it rather than reinvent it.

### Official MCP Registry API
Use for:
- discovery of public servers,
- version metadata,
- candidate compatibility corpus,
- scheduled change detection.

Never treat registry presence as proof of compatibility or safety.

### TypeScript / Node.js
Core scanner and rule engine. Keep rule packs data-driven where possible.

### Vitest + fixture servers
Local/unit/integration test harness.

### AJV / JSON Schema
Deterministic schema validation where the MCP SDK does not already provide the exact check we need.

### OpenTelemetry
Neutral tracing/metrics standard. Prefer emitting standard telemetry over inventing a proprietary tracing format.

## Adopt when web Alpha starts

### Supabase Free
Candidate for Postgres + auth + lightweight persistence.
Current free plan includes two free projects, 500 MB database/project and 50,000 MAU. Use only after persistence is actually required.

### Cloudflare Pages / Workers Free
Candidate for public docs/marketing/report shell and lightweight edge tasks. Workers Free currently allows 100,000 requests/day but only 10 ms CPU per invocation; therefore do **not** assume it can run the full scanner worker.

### PostHog Free
Use for product analytics/feature flags once real users exist. Current free allowances include 1M analytics events, 5K session replays and 1M feature-flag requests/month. Do not install before there is a product surface worth measuring.

### Better Stack Free
Use for basic uptime/logging/status once a hosted endpoint exists. Current free tier includes 10 monitors/heartbeats, 1 status page and small telemetry allowances.

## Optional / benchmark tools — integrate, do not duplicate

### MCP Failure Lab
Use its deterministic failure scenarios as external reference/fixtures for timeout, hang, disconnect, malformed/duplicate-response and recovery behavior.

### MCPJam
Competitor/reference. Useful for comparing model/host behavior, but we should not depend on its hosted credits for core product correctness.

### OWASP MCP Security Cheat Sheet
Use as a security-control source and cross-check.

### Existing MCP security scanners
Examples include Snyk Agent Scan, Cisco mcp-scanner, mcp-audit/MCPSafe-class tools. Our security workstream should orchestrate or interoperate when useful rather than rebuilding a saturated scanner category.

### SonarQube / Snyk Free
Optional supplemental static/security analysis if GitHub-native coverage proves insufficient. Avoid duplicate checks by default.

## Free AI inference for experiments only

Cloudflare Workers AI currently includes a daily free allocation. It may be useful for prototyping semantic repair suggestions, but production correctness must not depend on an unversioned free model. Long-term design should support BYOK/local/model-agnostic evaluation.

## Explicitly avoid for now

- Multiple overlapping observability vendors
- Paid database before persistence is needed
- Paid hosted queues before scan volume demands them
- Rebuilding official MCP conformance
- Rebuilding official Inspector interaction surfaces
- Building a generic MCP registry
- Building a standalone security scanner as the main product

## Trigger for spending money

A paid tool must satisfy at least one:
1. removes a measured engineering bottleneck,
2. materially improves reliability/security,
3. is required for a paying customer,
4. costs less than the engineering time it replaces,
5. unlocks a revenue-generating feature.
