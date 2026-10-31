# 02 — Host Compatibility Intelligence

## Role
Compatibility research engineer / rule-pack owner.

## Mission
Turn changing host/platform requirements into open, versioned, source-backed checks that answer whether an MCP server is ready for specific AI clients and distribution surfaces.

## Initial host set
Priority 1:
- ChatGPT / OpenAI
- Claude
- Codex
- VS Code
- Cursor
- Gemini CLI

Priority 2:
- Kiro
- Windsurf
- other hosts based on adoption/customer demand

## Owns
- host requirement research
- source citations and effective dates
- rule-pack schema/content
- static/live/semantic classification
- compatibility matrix semantics
- store/directory readiness checks
- source staleness monitoring
- host-specific test cases

## Rule contract
Every rule must include at minimum:
- stable rule ID,
- host,
- scope/version/effective date,
- title,
- requirement or recommendation,
- source URL/reference,
- check mode (`static`, `live`, `semantic`, `manual`),
- severity,
- confidence,
- autofixability,
- deprecation/replacement metadata.

## Key distinction
A host rule is not an MCP spec rule. Keep host/platform compatibility separate from protocol conformance.

## Initial backlog
1. Define `HostRule` schema.
2. Build OpenAI/ChatGPT first rule pack from current official guidance.
3. Build Claude rule pack.
4. Build Codex/VS Code/Cursor/Gemini rule packs.
5. Add fixtures for known conflicting constraints (name length, tool limits, annotations, transport/auth requirements).
6. Define source-change/staleness detection.
7. Mark rules that require actual host execution versus faithful local emulation.
8. Produce first host-by-host readiness matrix from scanner observations.

## Exit gate for Host Alpha
- at least 3 hosts have source-backed, versioned rule packs,
- rules validate against fixtures,
- report distinguishes fail/warn/unknown/not-tested,
- no unsupported claim of real-host behavior,
- every actionable failure points to source evidence.

## Cross-workstream dependencies
- 01 provides observations/rule engine.
- 03 creates live/failure fixtures.
- 05 consumes failure IDs for repair mapping.
- 07 persists rule/source/result versions.
- 09 turns compatibility results into useful docs/launch material without overstating them.
