# Workload Matcher — companion demo

Interactive lab for the article *Which Database Is "Best"? Wrong Question —
What Problem Are You Solving?* Describe a workload by its properties and the
nine engine classes get graded **fit / stretch / mismatch** — then route the
workload to the wrong class and read the requirement audit a "top databases"
list never shows.

Zero dependencies — Node 20+ only. The property vocabulary, engine capability
map, and filter engine are plain ES modules shared by the browser UI, the CLI,
and the test suite.

## Two views, one engine

| View | What it proves |
|---|---|
| **The filter** | Pick an example workload (or toggle the ten properties) → ranked class verdicts plus a recommendation. The *e-commerce order service* returns the row store as a **stretch**, not a fit — JSONB covers documents partially, which is exactly the post's Postgres-over-MongoDB point. |
| **The audit** | Route any workload to any class manually and read per-requirement marks (✓ native / ~ partial / ✗ missing). Routing friend-of-friend recommendations to the document class returns `traversal: missing` — the graph-query-on-documents trap. Routing company BI to the row store returns `analytics: missing` — the OLAP-on-OLTP trap. |

## Run it

```text
npm start        # serve the lab on :3000
npm test         # matcher + classes + fixtures + server
npm run report   # every example workload × every class, as a table
npm run check    # both
```

## Layout

- `public/properties.mjs` — the ten workload properties (transactions, point
  lookups, joins, documents, traversal, append-only ingest, analytics,
  similarity, distributed write scale, open-format files).
- `public/classes.mjs` — nine engine classes with per-property capability
  levels (native / partial / missing) and named instances carrying the source
  post's comparisons verbatim.
- `public/matcher.mjs` — `matchTask(props)` ranks classes;
  `evaluatePick(classId, props)` audits one manual route.
- `examples/tasks.json` — eight workload fixtures, mirrored into
  `public/examples.mjs` (sync asserted by tests). The set encodes the post's
  named comparisons: order service → OLTP, cache → key-value, firehose →
  wide-column, BI → warehouse, ML platform → lakehouse, semantic search →
  vector.

## Honest limits

- Capability levels are **illustrative teaching values**, not measured
  benchmark data — the point is the *shape* of the classes, not the scores.
- Real classes blur: NewSQL is distributed OLTP, MongoDB has `$graphLookup`
  and Atlas Vector Search, TimescaleDB is Postgres under the hood, Redis
  persists. The filter is the lesson; the matrix is the example.
- Instance names carry the source post's comparisons — labeled as claims,
  not verified picks. TimescaleDB/InfluxDB and Milvus/Weaviate are
  illustrative class members, not post claims.
- "Partial" coverage is a real position: pgvector, JSONB, and recursive CTEs
  genuinely cover many workloads. A `stretch` verdict is often the right
  answer — one engine with a bolt-on beats two engines to babysit.
- Cost modeling, ops burden, managed-vs-self-hosted, and ecosystem maturity
  are deliberately out of scope — instance-level questions that arrive
  *after* the class decision.

This is an educational demo, not database-selection infrastructure.
