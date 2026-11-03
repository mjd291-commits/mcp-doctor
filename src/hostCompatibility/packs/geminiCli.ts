import {
  HOST_RULE_SCHEMA_VERSION,
  type HostRulePack,
} from "../types.js";

const verifiedAt = "2026-10-31";

export const geminiCliRulePack: HostRulePack = {
  schemaVersion: HOST_RULE_SCHEMA_VERSION,
  packId: "google.gemini-cli.alpha",
  packVersion: "0.1.0",
  verifiedAt,
  host: {
    id: "google.gemini-cli",
    name: "Gemini CLI",
    vendor: "Google",
  },
  scopeSummary:
    "Gemini CLI MCP discovery, schema adaptation, naming, transport and OAuth environment behavior. The pack intentionally models host transformations and policy-engine constraints rather than treating them as MCP protocol failures.",
  sources: [
    {
      id: "gemini-cli-mcp-server",
      publisher: "Google",
      title: "MCP servers with Gemini CLI",
      url: "https://geminicli.com/docs/tools/mcp-server/",
      sourceType: "official-docs",
      retrievedAt: verifiedAt,
      lastUpdatedAt: "2026-10-06",
    },
    {
      id: "gemini-cli-configuration",
      publisher: "Google",
      title: "Gemini CLI configuration",
      url: "https://geminicli.com/docs/reference/configuration/",
      sourceType: "official-docs",
      retrievedAt: verifiedAt,
    },
    {
      id: "gemini-cli-policy-engine",
      publisher: "Google",
      title: "Policy engine",
      url: "https://geminicli.com/docs/reference/policy-engine/",
      sourceType: "official-docs",
      retrievedAt: verifiedAt,
    },
  ],
  rules: [
    {
      id: "google.gemini-cli.server-alias.no-underscore",
      host: "google.gemini-cli",
      surfaces: ["gemini-cli-mcp-config", "gemini-cli-policy-engine"],
      title: "Avoid underscores in Gemini CLI MCP server aliases",
      description:
        "Gemini CLI fully qualifies MCP tool names with the server alias, while its policy parser uses underscores as structural separators. Google warns that underscores in server aliases can cause the policy parser to misidentify the server and make wildcard/security rules fail silently.",
      ruleType: "recommendation",
      effective: { from: "2026-10-06" },
      sources: [
        {
          sourceId: "gemini-cli-mcp-server",
          locator: "Tool naming and namespaces",
          claim:
            "Google cautions against underscores in MCP server names because the policy parser can misinterpret server identity.",
        },
        {
          sourceId: "gemini-cli-policy-engine",
          locator: "MCP policy targeting caution",
          claim:
            "The policy-engine documentation repeats the underscore warning and describes the resulting security-policy ambiguity.",
        },
      ],
      check: {
        mode: "static",
        observationKeys: ["hostConfig.serverAlias"],
        assertion:
          "Warn when the configured Gemini CLI server alias contains an underscore; pass when the alias avoids underscores.",
      },
      severity: "warning",
      confidence: "high",
      autofixability: "safe",
      outcomes: {
        satisfied: "pass",
        unsatisfied: "warn",
        insufficientEvidence: "unknown",
        unexecuted: "not-tested",
      },
      protocolBoundary: "host-compatibility-only",
      deprecation: { status: "active" },
    },
    {
      id: "google.gemini-cli.tool-name.sanitization",
      host: "google.gemini-cli",
      surfaces: ["gemini-cli-tool-discovery"],
      title: "Gemini CLI sanitizes and truncates MCP tool names for Gemini API compatibility",
      description:
        "Gemini CLI rewrites unsupported tool-name characters and truncates names longer than 63 characters. A server may therefore be valid MCP yet expose a different effective name to Gemini, creating collision or selection risk.",
      ruleType: "documented-behavior",
      effective: { from: "2026-10-06" },
      sources: [
        {
          sourceId: "gemini-cli-mcp-server",
          locator: "Tool discovery process / Name sanitization",
          claim:
            "Gemini CLI replaces unsupported tool-name characters and truncates names longer than 63 characters during discovery.",
        },
      ],
      check: {
        mode: "static",
        observationKeys: ["tools[].name"],
        assertion:
          "Warn when any tool name would be rewritten or truncated by Gemini CLI; pass when names survive the documented transformation unchanged.",
      },
      severity: "warning",
      confidence: "high",
      autofixability: "suggested",
      outcomes: {
        satisfied: "pass",
        unsatisfied: "warn",
        insufficientEvidence: "unknown",
        unexecuted: "not-tested",
      },
      protocolBoundary: "host-compatibility-only",
      deprecation: { status: "active" },
    },
    {
      id: "google.gemini-cli.schema.additional-properties-stripped",
      host: "google.gemini-cli",
      surfaces: ["gemini-cli-tool-discovery"],
      title: "Gemini CLI strips additionalProperties from tool parameter schemas",
      description:
        "Gemini CLI sanitizes tool schemas for Gemini API compatibility and removes additionalProperties recursively. Servers that rely on additionalProperties to communicate open-ended argument semantics should be warned because Gemini receives a transformed schema.",
      ruleType: "documented-behavior",
      effective: { from: "2026-10-06" },
      sources: [
        {
          sourceId: "gemini-cli-mcp-server",
          locator: "Schema processing",
          claim:
            "Gemini CLI removes additionalProperties from tool parameter schemas, including nested schemas.",
        },
      ],
      check: {
        mode: "static",
        observationKeys: ["tools[].inputSchema"],
        assertion:
          "Warn when a tool input schema contains additionalProperties whose removal could affect model-visible argument semantics; otherwise pass.",
      },
      severity: "warning",
      confidence: "high",
      autofixability: "suggested",
      outcomes: {
        satisfied: "pass",
        unsatisfied: "warn",
        insufficientEvidence: "unknown",
        unexecuted: "not-tested",
      },
      protocolBoundary: "host-compatibility-only",
      deprecation: { status: "active" },
    },
    {
      id: "google.gemini-cli.schema.anyof-default-removed",
      host: "google.gemini-cli",
      surfaces: ["gemini-cli-tool-discovery"],
      title: "Gemini CLI removes defaults inside anyOf branches",
      description:
        "For Vertex AI compatibility, Gemini CLI removes default values from anyOf constructs during schema processing. Tools whose usability depends on those defaults should be flagged as a host-specific compatibility risk.",
      ruleType: "documented-behavior",
      effective: { from: "2026-10-06" },
      sources: [
        {
          sourceId: "gemini-cli-mcp-server",
          locator: "Schema processing",
          claim: "Gemini CLI removes default values from anyOf schemas during sanitization.",
        },
      ],
      check: {
        mode: "static",
        observationKeys: ["tools[].inputSchema"],
        assertion:
          "Warn when anyOf branches contain default values that Gemini CLI will remove; pass when this transformation does not apply.",
      },
      severity: "warning",
      confidence: "high",
      autofixability: "suggested",
      outcomes: {
        satisfied: "pass",
        unsatisfied: "warn",
        insufficientEvidence: "unknown",
        unexecuted: "not-tested",
      },
      protocolBoundary: "host-compatibility-only",
      deprecation: { status: "active" },
    },
    {
      id: "google.gemini-cli.oauth.browser-callback-environment",
      host: "google.gemini-cli",
      surfaces: ["gemini-cli-remote-oauth"],
      title: "Interactive Gemini CLI OAuth requires browser access and a localhost callback path",
      description:
        "Gemini CLI's automatic OAuth flow opens a local browser and receives the redirect on localhost. Google documents that this flow does not work in headless environments without browser access, remote SSH without appropriate forwarding, or containers lacking browser support.",
      ruleType: "requirement",
      effective: { from: "2026-10-06" },
      sources: [
        {
          sourceId: "gemini-cli-mcp-server",
          locator: "OAuth support for remote MCP servers / Browser redirect requirements",
          claim:
            "Interactive OAuth setup requires browser access and a localhost callback receiver; unsupported headless/remote environments cannot complete that flow as documented.",
        },
      ],
      check: {
        mode: "manual",
        observationKeys: [
          "auth.required",
          "hostEnvironment.browserAvailable",
          "hostEnvironment.localhostCallbackAvailable",
        ],
        assertion:
          "When Gemini CLI must perform interactive OAuth, fail if the host environment is deterministically unable to open a browser or receive the localhost callback; otherwise pass/unknown based on environment evidence.",
      },
      severity: "blocker",
      confidence: "high",
      autofixability: "suggested",
      outcomes: {
        satisfied: "pass",
        unsatisfied: "fail",
        insufficientEvidence: "unknown",
        unexecuted: "not-tested",
      },
      protocolBoundary: "host-compatibility-only",
      deprecation: { status: "active" },
    },
    {
      id: "google.gemini-cli.transport.supported-set",
      host: "google.gemini-cli",
      surfaces: ["gemini-cli-mcp-config"],
      title: "Gemini CLI supports stdio, SSE and Streamable HTTP MCP transports",
      description:
        "Gemini CLI documents support for local stdio, SSE and Streamable HTTP connections. A deployment configured with a different transport is outside the supported host path even if some other MCP host supports it.",
      ruleType: "requirement",
      effective: { from: "2026-10-06" },
      sources: [
        {
          sourceId: "gemini-cli-mcp-server",
          locator: "Transport mechanisms",
          claim: "Gemini CLI supports Stdio, SSE and Streamable HTTP transport mechanisms.",
        },
        {
          sourceId: "gemini-cli-configuration",
          locator: "mcpServers",
          claim:
            "Gemini CLI configuration provides command, url and httpUrl connection forms corresponding to supported MCP transports.",
        },
      ],
      check: {
        mode: "static",
        observationKeys: ["connection.transport"],
        assertion:
          "Pass for stdio, SSE or Streamable HTTP; fail for a deterministically unsupported configured transport.",
      },
      severity: "blocker",
      confidence: "high",
      autofixability: "suggested",
      outcomes: {
        satisfied: "pass",
        unsatisfied: "fail",
        insufficientEvidence: "unknown",
        unexecuted: "not-tested",
      },
      protocolBoundary: "host-compatibility-only",
      deprecation: { status: "active" },
    },
  ],
};
