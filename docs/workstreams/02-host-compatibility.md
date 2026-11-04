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
- requirement, recommendation, or documented host behavior,
- source URL/reference and source-backed claim,
- check mode (`static`, `live`, `semantic`, `manual`, `real-host`),
- normalized observation keys expected from Workstream 01,
- severity,
- confidence,
- autofixability,
- explicit result semantics,
- deprecation/replacement metadata,
- `protocolBoundary: "host-compatibility-only"`.

Canonical Alpha schema: `src/hostCompatibility/types.ts`.
Validator: `src/hostCompatibility/validate.ts`.
Validation command: `npm run validate:host-rules`.

## Status semantics
- `pass`: observed server/configuration satisfies the scoped host rule.
- `fail`: deterministic violation of a source-backed host requirement.
- `warn`: recommendation, transformation, limitation, or risk that may degrade behavior but is not a proven blocker.
- `unknown`: rule applies but scanner evidence is insufficient; never guess.
- `not-tested`: required manual/actual-host execution was not run; make no compatibility claim.

## Key distinction
A host rule is not an MCP spec rule. Keep host/platform compatibility separate from protocol conformance.

Host packs consume normalized scanner observations from Workstream 01. They do not redefine MCP validity. A server can be protocol-conformant and still fail or warn for a specific host/surface. Conversely, a host accepting something does not prove MCP conformance.

## GitHub Issue #4 — current work
Branch: `workstream-02/issue-4-host-rules-alpha`

### Implemented in first pass
- versioned `HostRule` / `HostRulePack` TypeScript contract,
- validation for schema version, IDs, semver/date shape, official HTTPS sources, source references, host identity, status semantics, actual-host flagging, and protocol-boundary guardrail,
- OpenAI/ChatGPT Alpha rule pack,
- Claude Alpha rule pack,
- Gemini CLI Alpha rule pack,
- pack registry and validation command.

Current Alpha count: **3 host packs / 16 rules**.

### Third-host selection
Gemini CLI was selected ahead of Codex/VS Code/Cursor for the first three-pack milestone because current official Google documentation exposes unusually specific host behavior that can produce distinct readiness results from the same MCP server:
- server-alias underscore policy hazard,
- tool-name sanitization and 63-character truncation,
- recursive schema transformations including stripping `additionalProperties`,
- removal of defaults inside `anyOf`,
- explicit stdio/SSE/Streamable HTTP support,
- browser/localhost requirements for the documented interactive OAuth flow.

This makes Gemini CLI a stronger early proof of MCP Doctor's host-compatibility differentiation than a host whose current documentation mainly states broad/full MCP support.

## Initial source-backed rule packs

### OpenAI / ChatGPT
Official sources:
- `https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt`
- `https://developers.openai.com/plugins/deploy/connect-chatgpt`
- `https://developers.openai.com/plugins/build/auth`
- `https://developers.openai.com/plugins/plugin-guidelines`

Initial rules cover:
- public HTTPS reachability or Secure MCP Tunnel,
- current public endpoint expectation for Streamable HTTP,
- OAuth discovery/resource metadata/PKCE requirements,
- unsupported machine-to-machine grant assumptions for ChatGPT user linking,
- ChatGPT plugin-review requirement for nonempty, behavior-matching tool descriptions.

### Anthropic / Claude
Official sources:
- `https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp`
- `https://platform.claude.com/docs/en/agents-and-tools/mcp-connector`

Initial rules cover:
- Claude remote connectors originate from Anthropic cloud and need compatible reachability,
- Messages API MCP connector HTTPS URL requirement,
- Streamable HTTP/SSE support and no direct stdio on the managed API connector,
- current Messages API managed connector limitation to tool calls,
- API-consumer ownership of OAuth access-token acquisition/refresh for that connector surface.

Important surface split: Claude Desktop local MCP is not treated as equivalent to Claude remote custom connectors or the Messages API managed connector.

### Google / Gemini CLI
Official sources:
- `https://geminicli.com/docs/tools/mcp-server/`
- `https://geminicli.com/docs/reference/configuration/`
- `https://geminicli.com/docs/reference/policy-engine/`

Initial rules cover:
- avoid underscores in server aliases because policy parsing can fail silently,
- tool-name rewriting/truncation,
- stripping `additionalProperties`,
- removing defaults within `anyOf`,
- interactive OAuth environment requirements,
- supported transport set.

## Observation contract requested from Workstream 01
The current packs intentionally depend on stable normalized observation keys instead of reading scanner implementation details directly. Initial keys requested:
- `connection.transport`
- `connection.endpoint.scheme`
- `connection.endpoint.publicReachability`
- `connection.endpoint.networkScope`
- `connection.secureMcpTunnel`
- `auth.required`
- `auth.protectedResourceMetadata`
- `auth.authorizationServerMetadata`
- `auth.pkce.s256`
- `auth.resourceParameter`
- `auth.supportedGrantTypes`
- `discovered.tools.count`
- `discovered.resources.count`
- `discovered.prompts.count`
- `tools[].name`
- `tools[].description`
- `tools[].annotations`
- `tools[].inputSchema`

Host/deployment-context keys that do not belong to protocol scanning can be supplied separately:
- `hostConfig.serverAlias`
- `hostEnvironment.browserAvailable`
- `hostEnvironment.localhostCallbackAvailable`
- `deployment.oauthTokenOwner`
- `workflow.requiredCapabilities`

Workstream 01 should remain owner of raw protocol observations/evidence; Workstream 02 owns interpretation against host rules.

## Original follow-up list from PR #10 (superseded by integration notes below)
1. Coordinate normalized observation-key contract with Workstream 01.
2. Add fixture-backed evaluator cases showing the same server produces different host outcomes.
3. Add explicit actual-host/manual-test markers where local emulation is insufficient.
4. Produce the first machine-readable host-by-host readiness matrix.
5. Add source-staleness fingerprints/change detection with Workstream 07.
6. Expand the next host pack after the first matrix proves the contract.

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

## Alpha integration contract — 2026-11-03

The evaluator and normalized scanner keys now exist on integration/alpha-host-matrix.
Connection scheme/transport, successful catalog counts and tool name/description/schema
arrays are emitted as Observation IDs with Evidence references. Failed, redacted,
truncated or ambiguous facts do not support deterministic judgments. Auth, tunnel,
public reachability and host/deployment/workflow context are not inferred.

The machine-readable matrix includes all 16 outcomes and source/pack/surface provenance.
Local static predicates evaluate available evidence; unrun live/manual/actual-host checks
are not-tested and unsupported semantic checks are unknown. Counts span explicit
surfaces and are not host-wide certification. See ../command-center/ALPHA_INTEGRATION.md
for reproduction and remaining source-staleness/context/actual-host work.
