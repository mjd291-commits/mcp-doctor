# MCP Doctor — Automation Model

## Goal

Automate repetitive verification, synchronization, dependency hygiene, and project-status checks. Keep human/LLM attention for architecture, ambiguous compatibility behavior, repair design, and product decisions.

## Repository automation — implement immediately

### On every push / PR
- install dependencies from lockfile,
- typecheck,
- unit tests,
- integration/fixture tests,
- lint/format gate,
- CodeQL/security checks where supported,
- dependency/secret scanning,
- generated rule-pack/schema validation.

### Scheduled daily
- dependency advisory/update check,
- official MCP SDK/spec/Inspector/conformance/registry change watch,
- compatibility rule source staleness check,
- smoke tests against a small allowlisted set of public test/reference servers when safe.

### Scheduled weekly
- refresh registry sample/candidate corpus metadata,
- compatibility matrix regression run,
- dead/source-link audit for host rules,
- dependency upgrade PRs,
- product/competitor intelligence digest.

## Event-driven automation

When a host rule file changes:
1. validate schema,
2. run static fixtures for that host,
3. run allowed live checks,
4. compare against prior results,
5. block merge on unexplained regressions.

When a repair rule changes:
1. replay its failure fixture,
2. confirm the pre-repair failure still reproduces,
3. apply repair in a disposable/test representation,
4. re-run exact affected rules,
5. record pass/fail proof.

When a scanner release is tagged:
1. build/package,
2. run full local suite,
3. run upstream conformance/reference checks,
4. produce changelog/release notes,
5. publish only when gates pass.

## Chat/agent automation

### Command Center review
A scheduled project review should inspect GitHub issues/PRs/CI and upstream MCP changes, update project status when appropriate, and notify the user only about material blockers, completed milestones, or decisions needed.

### Ecosystem watch
A separate lower-frequency watch should track official MCP spec/SDK/Inspector/conformance/registry changes plus meaningful competitor changes. It should avoid generic AI news.

## Anti-automation rules

Do not automatically:
- call destructive tools on third-party MCP servers,
- store credentials discovered during scans,
- rewrite third-party server code,
- merge repairs merely because a model suggested them,
- create noisy issues for transient upstream failures,
- run aggressive load tests against servers we do not control.

## Efficiency rule

Prefer one automation with a clear source of truth over several overlapping tasks. Every scheduled process must have an explicit owner, output, and stop/notification condition.
