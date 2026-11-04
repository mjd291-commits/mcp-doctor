# Alpha integration candidate

Review date: 2026-11-03 (America/New_York).
Branch: `integration/alpha-host-matrix`; main is not an Alpha release.

## Integrated engineering work

The candidate incorporates the reviewed file changes from these open PR heads,
resolving shared package scripts, CI, TypeScript configuration and documentation:

- Reliability #9: `85d6f4335a883aedf59d8f3a9879f4a54a067fe7`.
- Scanner #11: `f97c3311aa6274313c2ef7dd18e22d9858bf0049`.
- Host Compatibility #10: `d521d2426a557cd34495db45f7ffc989faa8629d`.

The source PRs and branches remain open and unchanged. No PR was merged.
The integration diff includes their work for review against main.

The scanner now emits normalized Observation IDs for endpoint scheme, successful
transport, successfully discovered catalog counts, tool names, descriptions and
schemas. Each links to Evidence. Failed/unsupported discovery does not become an
observed empty catalog. Redacted/truncated metadata does not support complete host
judgments. No public reachability, tunnel configuration or OAuth capability is
inferred from a successful connection from the scanner's own network.

The evaluator validates all three packs, applies deterministic predicates where
evidence exists, and emits all 16 rule outcomes. Manual, actual-host and host-network
live checks remain not-tested; unsupported predicates and missing context remain
unknown. In particular OAuth grant semantics and required-workflow equivalence
are not implemented. Host configuration/environment collection is a follow-up.
Inactive/date/version/edition scopes cannot silently pass. Schema traversal follows
schema locations, does not resolve references, and returns unknown for references.

Every finding includes host surfaces, rule ID, source claims/URLs/retrieval dates,
observation IDs and evidence IDs. Each host retains pack ID/version and scope.
Counts summarize findings across the explicitly named surfaces; they are not a
single pass/fail certification of ChatGPT, Claude or Gemini CLI. Protocol diagnostics,
host findings and upstream comparisons remain separate.

## Reproduction and evidence

```bash
npm ci
npm run check
npm run matrix:example
npm audit
```

`examples/controlled-fixture-report.json` contains the actual controlled-fixture
scan and all supporting evidence. `examples/compatibility-matrix.json` is its
machine-readable host matrix. Regeneration changes timestamps and the local port.
The local HTTP fixture deliberately fails the Claude Messages API HTTPS rule while
passing ChatGPT's Streamable HTTP rule and warning for Gemini CLI transformations.
Public reachability/tunnel readiness remains unknown, not assumed false or true.

The regression suite preserves all original fixture/scanner cases and adds host
divergence, missing/failed/ambiguous evidence, rule scope, real-host execution
boundaries, integrated faults/recovery and upstream-result comparison cases.
No discovered tools are executed. Test auth uses fake credentials only.

## Upstream comparison hook

`--upstream-results` accepts a regular JSON file up to 64,000 bytes in a
caller-normalized envelope (this is not a native upstream JSON adapter):

```json
{
  "schemaVersion": "1",
  "tool": "mcp-inspector",
  "toolVersion": "REPLACE-WITH-ACTUAL-VERSION",
  "target": "https://your-controlled-server.example/mcp",
  "completedAt": "2026-11-04T00:00:00Z",
  "protocolVersion": "2026-07-28",
  "checks": [
    { "id": "upstream-check-id", "status": "pass", "scannerCheckId": "tools.input-schema" }
  ]
}
```

`tool` may also be `mcp-conformance`. IDs/mappings must come from the caller's
actual run; the example is illustrative, not execution evidence. The hook rejects
target/protocol mismatches and duplicate IDs, redacts imported fields, bounds data,
and records agree/differ/unmapped plus `caller-supplied-unverified` provenance.
No upstream process or server tool is automatically invoked. Host compatibility
and `protocolConformance: not-tested` remain unchanged by imports.

## Explicit support decision and unresolved gates

- Modern MCP 2026-07-28 / SDK 2.4.0 is the tested Alpha path. SDK legacy negotiation
  remains available, but legacy-era certification is deferred pending a dedicated
  fixture. SSE fallback is disabled by default and opt-in/experimental.
- SDK 2.4.0 accepts the first result from the duplicate-response fixture. Raw
  fixtures prove the duplicate IDs, but scanner detection is not implemented. The
  integrated regression records this limitation rather than claiming rejection.
- Official Inspector strict-lint and MCP Conformance have not been run. Native
  output adapters, upstream comparison mappings and independently verified runs
  remain Issue #1 follow-ups. The generic normalized import hook is implemented.
- No real ChatGPT, Claude or Gemini CLI execution occurred. OAuth/manual/network
  checks and unsupported semantic evaluators need additional evidence paths.
- Sources retain the original packs' 2026-10-31 retrieval claims. They were not
  re-researched during integration; fingerprints/staleness monitoring remains #4
  and Workstream 07 work.
- Hosted SSRF/DNS/redirect isolation and response-size exhaustion controls remain
  Issue #6 gates. Evidence serialization bounds are not a network response-size
  security guarantee. No hosted endpoint or public scan service was created.
- Repair proof-by-retest remains subsequent work. No repair or paid service was
  introduced, and no other repository was modified.

## Local validation results

- npm install and clean npm ci: passed (Node 24.22.1; CI uses Node 22).
- npm run typecheck: passed.
- npm run validate:host-rules: passed, 3 packs / 16 rules.
- npm test: passed, 27 tests including 5 fault subtests.
- npm run matrix:example: passed; committed actual fixture evidence and matrix.
- npm audit --audit-level=low: passed, zero known vulnerabilities.
- git diff --check: passed.
- CodeQL CLI is unavailable locally. Remote CI/CodeQL outcomes are recorded on
  the integration PR; no local CodeQL success is claimed.
Existing PRs must be reconciled by maintainers after reviewing this combined diff;
the candidate does not authorize merging them.
