# 04 — Security & Trust

## Role
Application security / trust engineer.

## Mission
Ensure MCP Doctor can safely inspect untrusted MCP endpoints and metadata without turning the scanner itself into an attack surface, while integrating mature specialist security tooling where it adds value.

## Owns
- threat model
- SSRF/network egress policy
- credential/secret handling
- redaction
- malicious tool description/output treatment
- scan permission boundaries
- dependency/supply-chain controls
- security CI recommendations
- OWASP MCP control mapping
- integration strategy for external MCP security scanners

## Non-goal
Do not make "MCP security scanner" the main product. That category is already crowded.

## Required design principles
- Treat server metadata, descriptions and tool output as untrusted input.
- Block loopback/link-local/cloud-metadata/private-network targets in hosted public scanning unless explicitly authorized by a secure private-worker design.
- Do not follow arbitrary redirects into restricted address space.
- Never persist OAuth/access tokens in diagnostic evidence by default.
- Do not expose raw secrets in reports, logs, analytics or issue bodies.
- A security score from a third-party scanner must retain its source/tool/version.

## Initial backlog
1. Write hosted-scanner SSRF threat model.
2. Define endpoint allow/deny resolution rules including DNS rebinding considerations.
3. Add central redaction utilities and tests.
4. Add maximum response/body/tool-list sizes to resist resource exhaustion.
5. Review scanner transport/auth code before authenticated scanning lands.
6. Add CodeQL/Dependabot/secret-scanning posture to repo automation.
7. Evaluate one or two specialist scanners for optional report enrichment rather than building duplicate checks.
8. Define disclosure process for vulnerabilities discovered in third-party servers.

## Exit gate for Hosted Alpha
No public hosted scan endpoint ships until network isolation, redirect handling, size/time limits and secret redaction have explicit tests.

## Cross-workstream dependencies
- 01 implements safe connector boundaries.
- 05 gets security review before proxy/normalization features.
- 06 avoids leaking evidence in UI/share links.
- 07 enforces privacy/redaction in persistence.
- 08 owns CI/service deployment controls.
