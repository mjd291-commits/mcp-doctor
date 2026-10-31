# 06 — Web Product & UX

## Role
Full-stack product engineer / product designer.

## Mission
Make complex compatibility evidence understandable and useful without hiding uncertainty or overstating what was actually tested.

## Owns
- hosted scan workflow
- report information architecture
- host matrix UI
- evidence/source display
- before/after repair view
- shareable reports
- dashboard/history
- authentication when persistence requires it
- accessibility/mobile/developer ergonomics

## Product UX principles
- Lead with the user's question: "Where will this work?"
- Distinguish `pass`, `fail`, `warning`, `unknown`, and `not tested`.
- Show protocol conformance separately from host compatibility and security signals.
- Every failure should expose why it failed, evidence, source, and next action.
- Show the exact server/version and check timestamp.
- Never collapse multiple host versions into a timeless compatibility badge.

## Alpha web flow
1. Enter public MCP endpoint or choose a safe example.
2. Select target hosts (or default priority set).
3. Run scan.
4. Show summary matrix.
5. Drill into failures/evidence.
6. Export JSON/Markdown.

## Initial backlog
1. Wireframe readiness matrix and finding detail page.
2. Define empty/loading/timeout/auth-required states.
3. Design safe URL input and network-policy messaging with Security.
4. Create report component contract from Core report schema.
5. Add share/export design that defaults private until privacy model is settled.
6. Add accessibility requirements before visual polish.
7. Choose hosted architecture only after Core scan runtime characteristics are measured.

## Exit gate for Web Alpha
A developer can submit a safe public endpoint and understand which host checks passed/failed/weren't tested, with source-backed drill-down and no misleading aggregate score.

## Cross-workstream dependencies
- 01 supplies report contract.
- 02 supplies host semantics/sources.
- 04 approves hosted network/evidence safety.
- 05 supplies repair evidence.
- 07 supplies persistence/history later.
- 08 deploys/observes hosted service.
