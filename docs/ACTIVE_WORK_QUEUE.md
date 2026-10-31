# MCP Doctor — Active Work Queue

## P0 — Must do next

1. Install dependencies.
2. Run TypeScript typecheck against the current official MCP client.
3. Fix any SDK API drift revealed by typecheck.
4. Add connection timeout handling.
5. Add 3 local fixture servers:
   - healthy modern MCP server,
   - malformed/weak tool schema server,
   - legacy SSE server.
6. Add automated scanner tests.
7. Define health-score weights from explicit rule severity instead of hard-coded status penalties.

## P1 — Alpha quality

8. Add structured error taxonomy.
9. Add JSON Schema validation beyond root-shape checks.
10. Add capability consistency checks.
11. Add endpoint security checks that do not require attacking the server.
12. Add redaction for URLs, headers, and diagnostic payloads.
13. Add Markdown report output.
14. Add GitHub Action example.

## P2 — Web product

15. Create Next.js web interface.
16. Add Supabase schema for scans/checks.
17. Add job execution boundary.
18. Add report pages.
19. Add authentication only when persistence/user accounts are needed.

## Explicitly deferred

- automatic repair
- hosted proxy
- billing
- AI-written explanations
- broad host matrix

These stay deferred until the deterministic scanner is useful.
