# MCP Doctor — Alpha Product Specification

## Primary workflow

1. User supplies a remote MCP endpoint.
2. MCP Doctor attempts modern Streamable HTTP.
3. If appropriate, MCP Doctor attempts legacy SSE fallback.
4. It records protocol/server metadata.
5. It discovers tools, resources, and prompts when supported.
6. It runs deterministic static checks.
7. It produces:
   - overall health score,
   - pass/warn/fail checks,
   - raw diagnostic evidence,
   - JSON output.

## Alpha checks

### Connectivity
- URL parse
- connection success/failure
- transport used
- fallback behavior

### Protocol
- negotiation success
- server identity
- capabilities
- modern vs legacy discovery signal where available

### Tools
- listing success
- unique names
- conservative name characters/length
- meaningful descriptions
- structurally reasonable root input schemas

### Resources
- listing success or unsupported state

### Prompts
- listing success or unsupported state

## Safety

Default Alpha scans do not execute arbitrary discovered tools.

Later active tests must use one of:

- explicitly safe test tools,
- user-approved tool invocations,
- disposable sandbox servers,
- mock payloads,
- server-declared test environments.

## Report format

Every check has:

```json
{
  "id": "tools.input-schema",
  "title": "Tool input schemas look structurally valid",
  "status": "pass | warn | fail | info",
  "message": "...",
  "details": {}
}
```

## Future compatibility matrix

A later release can model:

```text
MCP server
  x protocol revision
  x transport
  x auth method
  x host/client
  x runtime
  x capability
```

and record observed compatibility results.
