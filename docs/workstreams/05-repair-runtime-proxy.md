# 05 — Repair & Runtime Proxy

## Role
Platform/gateway engineer / repair intelligence owner.

## Mission
Turn recurring compatibility failures into explicit, testable repair strategies, then eventually provide policy-controlled runtime normalization for repairs proven safe enough.

## Owns
- failure fingerprints
- repair rule schema
- suggested patches/transforms
- proof-by-retest workflow
- repair confidence/outcome history
- reversible runtime transformations
- proxy/gateway architecture
- repair audit trail

## Core contract
A repair record must identify:
- failure/rule ID,
- input condition,
- proposed transformation,
- what it may change,
- what it must not change,
- risk class,
- reversibility,
- expected affected tests,
- pre-repair evidence,
- post-repair evidence,
- outcome.

## Repair classes
1. **Advisory** — developer changes source/config manually.
2. **Patch suggestion** — MCP Doctor proposes exact change but does not apply it.
3. **Build-time transform** — deterministic generated compatibility layer.
4. **Runtime normalization** — proxy rewrites known-safe protocol/metadata shapes.

Start with 1 and 2 only.

## Initial backlog
1. Define stable failure fingerprint format from 01/02/03 outputs.
2. Define `RepairRule` schema.
3. Implement no-op/suggest-only repair pipeline against fixtures.
4. Create first deterministic repair examples: naming/annotation/schema metadata issues where semantics are preserved.
5. Require automated retest for every repair fixture.
6. Store repair success/failure outcomes for Corpus workstream.
7. Design proxy boundary but do not deploy until sufficient proven repair rules exist.

## Do not auto-repair
- auth/credential scopes,
- destructive/read-only semantics without evidence,
- business logic,
- tool output meaning,
- security-sensitive behavior,
- anything requiring guessing user intent.

## Exit gate for Repair Alpha
At least 5 deterministic compatibility failures have fixture-backed repair suggestions and automated proof-by-retest. No runtime proxy required for this milestone.

## Cross-workstream dependencies
- 02 supplies compatibility rule IDs.
- 03 supplies reproducible failures.
- 04 reviews repair safety and future proxy.
- 07 stores outcomes.
- 06 displays before/after evidence.
