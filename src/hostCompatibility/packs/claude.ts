import {
  HOST_RULE_SCHEMA_VERSION,
  type HostRulePack,
} from "../types.js";

const verifiedAt = "2026-10-31";

export const claudeRulePack: HostRulePack = {
  schemaVersion: HOST_RULE_SCHEMA_VERSION,
  packId: "anthropic.claude.alpha",
  packVersion: "0.1.0",
  verifiedAt,
  host: {
    id: "anthropic.claude",
    name: "Claude",
    vendor: "Anthropic",
  },
  scopeSummary:
    "Current Claude remote custom connectors and Anthropic Messages API MCP connector behavior. Claude Desktop local MCP is treated as a separate surface so local-client behavior is not incorrectly applied to Claude cloud connectors.",
  sources: [
    {
      id: "anthropic-claude-remote-connectors",
      publisher: "Anthropic",
      title: "Get started with custom connectors using remote MCP",
      url: "https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp",
      sourceType: "official-help",
      retrievedAt: verifiedAt,
    },
    {
      id: "anthropic-messages-mcp-connector",
      publisher: "Anthropic",
      title: "MCP connector — Claude Platform Docs",
      url: "https://platform.claude.com/docs/en/agents-and-tools/mcp-connector",
      sourceType: "official-docs",
      retrievedAt: verifiedAt,
    },
  ],
  rules: [
    {
      id: "anthropic.claude.remote-connector.public-reachability",
      host: "anthropic.claude",
      surfaces: ["claude-remote-custom-connector"],
      title: "Claude remote connectors must be reachable from Anthropic cloud infrastructure",
      description:
        "Claude remote custom connectors originate from Anthropic's cloud, including when the user is in Claude Desktop. A remote MCP server that is only reachable on localhost, behind a VPN, or behind a firewall without the required allowlisting will not connect on this surface.",
      ruleType: "requirement",
      effective: { from: "2026-10-31" },
      sources: [
        {
          sourceId: "anthropic-claude-remote-connectors",
          locator: "Network requirements",
          claim:
            "Remote custom connectors connect from Anthropic cloud infrastructure and therefore require public reachability or network policy that permits Anthropic's published IP ranges.",
        },
      ],
      check: {
        mode: "live",
        observationKeys: [
          "connection.endpoint.publicReachability",
          "connection.endpoint.networkScope",
        ],
        assertion:
          "Pass when the remote endpoint is reachable from the public/allowed host network; fail on a deterministically local-only/private-only endpoint for the remote-connector surface.",
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
      id: "anthropic.claude.messages-api.endpoint-https",
      host: "anthropic.claude",
      surfaces: ["messages-api-mcp-connector"],
      title: "Anthropic Messages API MCP connector requires an HTTPS URL",
      description:
        "The Messages API MCP connector currently accepts URL-based MCP servers and documents that the URL must start with https://.",
      ruleType: "requirement",
      effective: {
        from: "2026-10-31",
        notes: "Current connector is beta and versioned by Anthropic beta headers.",
      },
      sources: [
        {
          sourceId: "anthropic-messages-mcp-connector",
          locator: "MCP server configuration / Field descriptions",
          claim: "The MCP server URL for the Messages API connector must start with https://.",
        },
      ],
      check: {
        mode: "static",
        observationKeys: ["connection.endpoint.scheme"],
        assertion: "Pass on HTTPS; fail on a deterministically non-HTTPS endpoint for this API surface.",
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
      id: "anthropic.claude.messages-api.remote-transport",
      host: "anthropic.claude",
      surfaces: ["messages-api-mcp-connector"],
      title: "Messages API connector supports remote Streamable HTTP and SSE, not direct stdio",
      description:
        "Anthropic's managed Messages API connector supports publicly exposed Streamable HTTP and SSE endpoints. Local stdio servers cannot be connected directly through this surface.",
      ruleType: "requirement",
      effective: { from: "2026-10-31" },
      sources: [
        {
          sourceId: "anthropic-messages-mcp-connector",
          locator: "Limitations",
          claim:
            "The connector requires a publicly exposed HTTP server, supports Streamable HTTP and SSE, and cannot directly connect a local stdio server.",
        },
      ],
      check: {
        mode: "static",
        observationKeys: ["connection.transport", "connection.endpoint.publicReachability"],
        assertion:
          "Pass on a public Streamable HTTP or SSE deployment; fail on direct stdio for the Messages API connector surface.",
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
      id: "anthropic.claude.messages-api.tools-only",
      host: "anthropic.claude",
      surfaces: ["messages-api-mcp-connector"],
      title: "Messages API managed MCP connector currently exposes tool calls only",
      description:
        "Anthropic documents that its managed Messages API MCP connector currently supports only the tool-calling portion of MCP. A server whose required user workflow is available only through prompts or resources is not ready for that surface, even if those capabilities are valid MCP elsewhere.",
      ruleType: "requirement",
      effective: {
        from: "2026-10-31",
        notes: "This limitation is explicitly surface-specific and must not be interpreted as an MCP conformance failure.",
      },
      sources: [
        {
          sourceId: "anthropic-messages-mcp-connector",
          locator: "Limitations",
          claim: "Anthropic states that only MCP tool calls are currently supported by this connector.",
        },
      ],
      check: {
        mode: "semantic",
        observationKeys: [
          "discovered.tools.count",
          "discovered.resources.count",
          "discovered.prompts.count",
          "workflow.requiredCapabilities",
        ],
        assertion:
          "Fail only when the scoped workflow requires prompts/resources and has no equivalent tool path; otherwise pass when the required workflow is tool-backed and use unknown when workflow dependency is not known.",
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
      id: "anthropic.claude.messages-api.oauth-token-owner",
      host: "anthropic.claude",
      surfaces: ["messages-api-mcp-connector"],
      title: "Messages API callers manage OAuth tokens for authenticated MCP servers",
      description:
        "For the Messages API MCP connector, Anthropic expects the API consumer to obtain, pass and refresh the OAuth access token. This is a deployment/integration behavior rather than an MCP server conformance requirement.",
      ruleType: "documented-behavior",
      effective: { from: "2026-10-31" },
      sources: [
        {
          sourceId: "anthropic-messages-mcp-connector",
          locator: "Authentication",
          claim:
            "API consumers obtain and refresh the OAuth access token and supply it in authorization_token for the managed MCP connector.",
        },
      ],
      check: {
        mode: "manual",
        observationKeys: ["auth.required", "deployment.oauthTokenOwner"],
        assertion:
          "Warn when an authenticated deployment assumes the Anthropic managed connector itself will perform the end-user OAuth flow; otherwise report pass/unknown based on deployment evidence.",
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
  ],
};
