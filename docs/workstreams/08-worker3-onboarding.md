# Worker 3 — MCP Doctor safe onboarding

Tracking: Issue #16. Workstream owner: **08 — Infrastructure, CI & Release**.

## Purpose and current status

Connect an existing *shared* Debian machine to the MCP Doctor **development checkout** without changing its other project's bridge, heartbeat, agents, services, deploy keys, queues, or installed software. The first stage is manual local validation only. A local clone is not a remotely managed worker.

The MCP Doctor repository is public; Stage 1 needs no new GitHub access token or SSH deploy key.

## Stage 1: manual bootstrap

On Worker 3, check that Node 20+, npm, and Git are installed. Run the reviewed script from this repository's `infra/worker3-safe-onboarding` branch:

```bash
git clone --depth 1 --branch infra/worker3-safe-onboarding \
  https://github.com/mjd291-commits/mcp-doctor.git \
  ~/mcp-doctor-onboarding
less ~/mcp-doctor-onboarding/scripts/workers/bootstrap-worker3.sh
bash ~/mcp-doctor-onboarding/scripts/workers/bootstrap-worker3.sh
cat ~/mcp-doctor-worker3/last-bootstrap-status.txt
```

The script clones **main** into `~/mcp-doctor-worker3/source`, resolves only its own npm dependencies with lifecycle scripts disabled, and performs `npm run typecheck`. It does **not** schedule recurring jobs, register a GitHub Actions runner, run arbitrary remote MCP servers, expose ports, alter any other checkout, or store GitHub credentials. Re-running uses the existing checkout and does not reset/pull.

If `git clone` refuses to proceed because the onboarding directory exists, reuse the existing script there rather than deleting anything blindly. No `sudo` is necessary.

Do not publish the local login, IP, full environment, secrets, or unredacted diagnostic output to public GitHub.

## Stage 1 verification

- Command completes with `PASS` and `result=local-validation-passed`.
- `~/mcp-doctor-worker3/source` exists and contains MCP Doctor, not another project's repository.
- The original project's heartbeat/bridge remain independently functional.
- In the Command Center, status is **local checkout validated / NOT remotely connected**.

## Stage 2: authenticated worker connection (not yet implemented)

Before enabling any remote jobs:

1. Security workstream 04 approves an **outbound-only**, short-lived least-privilege authentication and heartbeat approach.
2. Infrastructure defines unique `worker_node_id`, last-successful-heartbeat timestamp, capabilities, resource limits, health state, and an auditable acceptance/rejection decision for jobs.
3. Restrict initial jobs to repository-owned deterministic fixture/test execution. Do not enable arbitrary public URL scans or untrusted PR code.
4. Worker process uses a dedicated Unix user or sandbox with separate resource ceilings and secrets from the other project's worker.
5. Add job lease/cancellation, timeouts, clear concurrency/cost caps, logs with redaction, and verified safe shutdown.
6. Prove a single nonprivileged test job end to end before marking Worker 3 **online**.
7. Leave automated dispatch **disabled** until all checks have explicit sign-off.

Do not attach a self-hosted GitHub Actions runner directly to a public repository on this shared host without a separately approved trust design.

## Ownership

- Workstream 08: bootstrap, runtime isolation, heartbeat/dispatch controls.
- Workstream 04: security and secrets review.
- Workstream 03: deterministic, non-network fixture payload.
- Command Center: report worker state accurately; no online claims on clone alone.
