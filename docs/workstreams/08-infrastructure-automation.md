# 08 — Infrastructure, CI & Release

## Role
DevOps / SRE / release engineer.

## Mission
Make every important project check repeatable, cheap, observable, and difficult to bypass accidentally.

## Owns
- GitHub Actions
- dependency automation
- CodeQL/security automation
- scheduled upstream watch jobs
- release/version automation
- deploy targets
- observability and uptime
- cost controls
- environment/secrets strategy

## Free-first stack
Default to:
- GitHub Actions for CI/schedules,
- Dependabot,
- GitHub secret scanning,
- CodeQL,
- GitHub Releases,
- Cloudflare Pages/Workers only where runtime fits free limits,
- Better Stack or UptimeRobot only after a hosted endpoint exists,
- PostHog only after real product analytics are useful.

## Initial backlog
1. Make CI run install/typecheck/test on push and PR.
2. Add Dependabot for npm + GitHub Actions.
3. Add CodeQL workflow appropriate for TypeScript/JavaScript.
4. Add package-lock and reproducible install policy.
5. Add scheduled upstream change watcher for MCP SDK/spec/Inspector/Conformance/Registry.
6. Add rule-pack source-staleness CI once 02 defines schema.
7. Add release checklist/action after Alpha is runnable.
8. Define hosted scan worker requirements from measured runtime before selecting infrastructure.

## Automation quality rules
- Pin third-party Actions by commit SHA where practical.
- Scheduled jobs should create/update one durable issue or artifact rather than spam new issues.
- External network tests must have explicit timeouts.
- Avoid workflows that can execute untrusted PR code with privileged secrets.
- Keep paid usage disabled/limited unless deliberately approved.

## Exit gate for Infrastructure Alpha
Every PR gets deterministic build/test/security feedback; dependencies are monitored; current upstream MCP changes have an automated detection path; no paid infrastructure is required for local/CI Alpha.

## Cross-workstream dependencies
All streams rely on this workstream's gates. 04 reviews CI/secrets security; 06 supplies deployment needs; 07 supplies scheduled corpus jobs later.
