# 07 — Compatibility Corpus & Data

## Role
Data engineer / applied intelligence engineer.

## Mission
Create the durable evidence corpus that lets MCP Doctor improve from individual scans into a version-aware compatibility and repair intelligence system.

## Owns
- persisted scan/evidence schema
- server/version fingerprints
- host/version/protocol matrix
- rule/result versioning
- registry metadata ingestion
- failure fingerprint storage
- repair outcome storage
- deduplication
- provenance and timestamps
- privacy/redaction policy at rest

## Canonical evidence dimensions
At minimum preserve:
- server identity/version/fingerprint,
- endpoint/package identity where safe,
- scan time,
- scanner version,
- MCP SDK version,
- protocol era/revision,
- transport/auth mode,
- host profile/version/effective date,
- rule version,
- raw observation hash/evidence reference,
- result state,
- repair attempted/version,
- retest outcome.

## Initial backlog
1. Define local JSON evidence model before database schema.
2. Define stable fingerprints that do not require storing secrets or sensitive response bodies.
3. Create rule/result versioning semantics.
4. Design registry sync using official API `updated_since` where useful.
5. Define public-vs-private evidence boundaries.
6. Prototype local SQLite/JSON corpus if sufficient before introducing Supabase.
7. Move to Supabase only when hosted persistence/user history requires it.
8. Define aggregate compatibility metrics that cannot be mistaken for current guarantees.

## Data quality rule
Never merge observations from different server versions, host versions or protocol eras merely because names match.

## Exit gate for Corpus Alpha
Two scans of different versions can coexist without ambiguity; every compatibility conclusion can be traced to a rule version and observation evidence; secrets/private payloads are not required for useful history.

## Cross-workstream dependencies
All technical workstreams emit evidence into this model. 08 owns scheduled ingestion; 09 may use only appropriately public/aggregate data for content.
