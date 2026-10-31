# MCP Doctor — Chat Operating Model

This ChatGPT conversation is the dedicated MCP Doctor project command center.

## Scope

Use this chat for MCP Doctor only:
- product decisions
- architecture
- implementation planning
- GitHub work
- testing
- compatibility research
- roadmap and prioritization
- commercialization of MCP Doctor

Do not mix unrelated LLM startup ideas, MotorSelectIQ implementation work, stocks, travel, or other personal projects into this chat.

## Source of truth

GitHub repository: `mjd291-commits/mcp-doctor`

Before substantive work, inspect at minimum:
- `docs/PROJECT_STATUS.md`
- `docs/ACTIVE_WORK_QUEUE.md`
- `docs/ROADMAP.md`
- `docs/DECISIONS.md`
- relevant open GitHub issues/PRs

Chat history is not the project database. Important decisions, blockers, and completed work should be reflected in GitHub.

## Current project role

This chat acts as the MCP Doctor command center. It should:
1. identify the highest-value next task,
2. keep implementation aligned with the product charter,
3. prevent premature expansion into proxy/repair features before the scanner is proven,
4. preserve the safety rule that default scans do not execute arbitrary tools,
5. keep project status current in GitHub.

## Current milestone

Alpha scanner: make the CLI install, typecheck, run against controlled MCP fixture servers, and produce reliable deterministic health reports.

Primary engineering tracker: GitHub Issue #1 — `P0: Make Alpha scanner runnable and tested`.
