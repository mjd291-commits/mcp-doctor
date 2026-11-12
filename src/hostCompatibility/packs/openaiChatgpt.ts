import {
  HOST_RULE_SCHEMA_VERSION,
  type HostRulePack,
} from "../types.js";

const verifiedAt = "2026-10-31";

export const openaiChatgptRulePack: HostRulePack = {
  schemaVersion: HOST_RULE_SCHEMA_VERSION,
  packId: "openai.chatgpt.alpha",
  packVersion: "0.1.0",
  verifiedAt,
  host: {
    id: "openai.chatgpt",
    name: "ChatGPT",
    vendor: "OpenAI",
  },
  scopeSummary:
    "Current ChatGPT custom MCP/plugin connectivity and plugin-review requirements. These are host requirements and documented host behaviors, not MCP protocol-conformance rules.",
  sources: [
    {
      id: "openai-chatgpt-custom-mcp",
      publisher: "OpenAI",
      title: "Connecting custom MCP servers in ChatGPT",
      url: "https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt",
      sourceType: "official-help",
      retrievedAt: verifiedAt,
    },
    {
      id: "openai-plugin-connect-test",
      publisher: "OpenAI",
      title: "Connect and test your plugin",
      url: "https://developers.openai.com/plugins/deploy/connect-chatgpt",
      sourceType: "official-docs",
      retrievedAt: verifiedAt,
    },
    {
      id: "openai-plugin-auth",
      publisher: "OpenAI",
      title: "Authentication — Plugins",
      url: "https://developers.openai.com/plugins/build/auth",
      sourceType: "official-docs",
      retrievedAt: verifiedAt,
    },
    {
      id: "openai-plugin-guidelines",
      publisher: "OpenAI",
      title: "Plugin guidelines",
      url: "https://developers.openai.com/plugins/plugin-guidelines",
      sourceType: "official-docs",
      retrievedAt: verifiedAt,
    },
  ],
  rules: [
    {
      id: "openai.chatgpt.remote-endpoint.https-or-tunnel",
      host: "openai.chatgpt",
      surfaces: ["custom-mcp", "plugin"],
      title: "ChatGPT requires a reachable HTTPS endpoint or Secure MCP Tunnel",
      description:
        "A custom MCP connection must be reachable by ChatGPT through a public HTTPS MCP endpoint, unless the connection uses OpenAI Secure MCP Tunnel for a private/local server.",
      ruleType: "requirement",
      effective: {
        from: "2026-10-31",
        notes: "Verified against current ChatGPT custom MCP guidance on this date.",
      },
      sources: [
        {
          sourceId: "openai-chatgpt-custom-mcp",
          locator: "Configure the server connection / Can I connect to a local MCP server?",
          claim:
            "ChatGPT accepts a public HTTPS MCP endpoint, while private/local servers require Secure MCP Tunnel rather than a direct local connection.",
        },
      ],
      check: {
        mode: "static",
        observationKeys: [
          "connection.endpoint.scheme",
          "connection.endpoint.publicReachability",
          "connection.secureMcpTunnel",
        ],
        assertion:
          "Pass when Secure MCP Tunnel is configured, or when the endpoint is HTTPS and publicly reachable from the host; otherwise fail when deterministically known.",
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
      id: "openai.chatgpt.remote-transport.streamable-http",
      host: "openai.chatgpt",
      surfaces: ["plugin", "custom-mcp-public-endpoint"],
      title: "Current ChatGPT public MCP setup expects Streamable HTTP",
      description:
        "OpenAI's current plugin connection guide directs public MCP endpoints to support Streamable HTTP. Treat an SSE-only public deployment as incompatible with this current setup path unless separately verified in the real host.",
      ruleType: "requirement",
      effective: {
        from: "2026-10-31",
        notes: "Scoped to current ChatGPT plugin/custom-MCP public-endpoint setup, not MCP generally.",
      },
      sources: [
        {
          sourceId: "openai-plugin-connect-test",
          locator: "Test an MCP server / Prepare the endpoint",
          claim:
            "OpenAI instructs developers to ensure a public MCP endpoint supports Streamable HTTP, typically at /mcp.",
        },
      ],
      check: {
        mode: "static",
        observationKeys: ["connection.transport", "connection.secureMcpTunnel"],
        assertion:
          "For a direct public ChatGPT endpoint, pass on Streamable HTTP; fail on a deterministically SSE-only deployment; tunnel-backed configurations are evaluated by the tunnel path instead.",
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
      id: "openai.chatgpt.oauth.discovery-and-pkce",
      host: "openai.chatgpt",
      surfaces: ["custom-mcp-authenticated", "plugin-authenticated"],
      title: "Authenticated tools must support ChatGPT's OAuth discovery and PKCE flow",
      description:
        "When a ChatGPT-connected MCP server requires user authentication, the server must expose protected-resource/OAuth metadata and support the authorization-code flow with PKCE as documented by OpenAI.",
      ruleType: "requirement",
      effective: { from: "2026-10-31" },
      sources: [
        {
          sourceId: "openai-plugin-auth",
          locator: "Custom auth with OAuth 2.1 / MCP authorization spec requirements",
          claim:
            "OpenAI expects protected resource metadata, OAuth metadata, resource parameter handling and authorization-code PKCE support for authenticated MCP servers.",
        },
      ],
      check: {
        mode: "live",
        observationKeys: [
          "auth.required",
          "auth.protectedResourceMetadata",
          "auth.authorizationServerMetadata",
          "auth.pkce.s256",
          "auth.resourceParameter",
        ],
        assertion:
          "If authentication is required, verify discovery metadata and PKCE S256 support; fail only on a deterministic missing/unsupported requirement.",
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
      id: "openai.chatgpt.oauth.unsupported-machine-grants",
      host: "openai.chatgpt",
      surfaces: ["custom-mcp-authenticated", "plugin-authenticated"],
      title: "Do not require OAuth client-credentials or service-account grants from ChatGPT",
      description:
        "ChatGPT does not support machine-to-machine OAuth grants such as client credentials, service accounts or JWT bearer assertions as its end-user linking mechanism. A server that exclusively requires those grants cannot complete the documented ChatGPT auth flow.",
      ruleType: "requirement",
      effective: { from: "2026-10-31" },
      sources: [
        {
          sourceId: "openai-plugin-auth",
          locator: "Client identification",
          claim:
            "OpenAI states that ChatGPT does not support machine-to-machine OAuth grants such as client credentials, service accounts or JWT bearer assertions for this flow.",
        },
      ],
      check: {
        mode: "semantic",
        observationKeys: ["auth.required", "auth.supportedGrantTypes"],
        assertion:
          "Fail only when the server's only usable auth path requires a machine-to-machine grant that ChatGPT explicitly does not support.",
      },
      severity: "blocker",
      confidence: "high",
      autofixability: "none",
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
      id: "openai.chatgpt.tool-description.plugin-quality",
      host: "openai.chatgpt",
      surfaces: ["plugin-review"],
      title: "Plugin tools need nonempty, accurate, behavior-matching descriptions",
      description:
        "OpenAI's plugin guidelines require tool descriptions that accurately explain purpose, behavior, usage conditions, limitations and side effects. This is a ChatGPT/plugin readiness rule, not an MCP schema-validity rule.",
      ruleType: "requirement",
      effective: { from: "2026-10-31" },
      sources: [
        {
          sourceId: "openai-plugin-guidelines",
          locator: "MCP requirements / Tools / Descriptions that match behavior",
          claim:
            "Plugin tool descriptions must be nonempty and accurately match the tool's purpose, schema and behavior.",
        },
      ],
      check: {
        mode: "semantic",
        observationKeys: ["tools[].description", "tools[].annotations", "tools[].behaviorEvidence"],
        assertion:
          "Fail plugin-review readiness when a tool description is empty or demonstrably contradicts the tool's observed/schema behavior; otherwise use unknown for unverifiable semantic accuracy.",
      },
      severity: "error",
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
