# MCP Doctor — Operating Model

## Mission

Build the compatibility and repair layer for MCP: determine whether an MCP server works correctly across real AI hosts, explain failures with evidence, recommend the smallest safe fix, prove the fix by re-testing, and eventually normalize known incompatibilities at runtime.

## Source of truth

GitHub is the project database. Chats are work surfaces, not durable state.

Before substantive work, every workstream must read:

1. `docs/command-center/PROJECT_STATUS.md`
2. `docs/command-center/ACTIVE_WORK_QUEUE.md`
3. `docs/command-center/WORKSTREAM_MAP.md`
4. this file
5. its own workstream file under `docs/workstreams/`

When a material decision, finding, blocker, test result, or implementation state changes, update GitHub before considering the work complete.

## Product boundary

MCP Doctor is **not** a replacement for the official MCP Inspector or conformance suite.

We reuse official/free tooling wherever it is stronger:

- MCP Inspector: reference inspection/debugging behavior
- MCP Conformance: protocol/spec compliance
- Official MCP Registry API: discovery and candidate corpus
- GitHub Actions: CI and scheduled jobs

Our defensible layer is:

1. multi-host compatibility rules,
2. live host-behavior checks where feasible,
3. versioned compatibility evidence,
4. failure fingerprints,
5. repair suggestions,
6. proof-by-retest,
7. continuous external monitoring,
8. later, transparent runtime normalization/proxy repair.

## Work rules

- Evidence before conclusions.
- Deterministic checks before LLM judgment.
- Host-specific rules are versioned and source-cited.
- Never silently mutate an MCP server or tool definition.
- Every proposed repair declares the exact rule/failure it addresses.
- A repair is not considered validated until the affected checks are re-run.
- Preserve protocol-era differences; do not assume all hosts track the newest MCP revision.
- Keep unknown/untested states visible.
- Security scans are complementary; do not duplicate mature security scanners without a differentiated reason.
- Major implementation work uses isolated branches/PRs when practical.

## Coordination

Each workstream owns its architecture and documentation. Cross-workstream requests are recorded in GitHub issues/docs rather than manually relayed between chats.

The Command Center decides priority, resolves ownership conflicts, and maintains project-wide status. It should not become the implementation chat for every task.

## Release gates

A feature is not 'done' because code exists. Relevant gates are:

- install/typecheck/build,
- unit/integration tests,
- fixture tests,
- upstream conformance where applicable,
- security/static checks,
- compatibility evidence,
- documentation/update of status.

## Cost rule

Default to free/open-source tooling until a paid service removes a demonstrated bottleneck or unlocks revenue. Avoid overlapping SaaS products merely because they have free tiers.
