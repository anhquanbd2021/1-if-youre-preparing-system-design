// Workload fixtures — kept in sync with examples/tasks.json on disk
// (asserted by test/examples.test.mjs).

export const EXAMPLE_TASKS = [
  {
    id: 'order-service',
    title: 'E-commerce order service',
    requires: ['transactions', 'joins', 'documents'],
    blurb: 'Orders, line items, payments — multi-record writes with joins, plus flexible product attributes. The post\'s Postgres-over-MongoDB answer: JSONB covers the documents need, so the row store wins as a stretch over a mismatch.',
  },
  {
    id: 'session-cache',
    title: 'Session & cart cache',
    requires: ['point-lookup'],
    blurb: 'One key in, one value out, sub-millisecond, millions of times an hour. The post\'s Redis answer — and why "Redis vs Cassandra" was never a real comparison.',
  },
  {
    id: 'event-ingest',
    title: 'IoT event firehose',
    requires: ['append', 'scale-out'],
    blurb: 'Sensor events arriving ordered, never updated, at a rate one node cannot write. The post\'s Cassandra shape: keep accepting writes through node failures.',
  },
  {
    id: 'metrics-rollups',
    title: 'Metrics & monitoring rollups',
    requires: ['append', 'analytics'],
    blurb: 'High-rate appends plus time-windowed aggregates. A time-series engine stretches to cover both; nothing covers both natively — the honest answer is partial coverage, spoken out loud.',
  },
  {
    id: 'friend-graph',
    title: 'Friend-of-friend recommendations',
    requires: ['traversal'],
    blurb: 'Multi-hop relationship queries — "who is reachable within three hops." The trap: model it as nested documents and the traversal requirement comes back missing.',
  },
  {
    id: 'company-bi',
    title: 'Company-wide BI dashboards',
    requires: ['analytics', 'joins'],
    blurb: 'Scans and aggregates over governed historical tables. The post\'s Snowflake-over-Databricks answer: warehouse class wins when the access pattern is SQL BI, not ML pipelines.',
  },
  {
    id: 'ml-platform',
    title: 'ML platform on open data',
    requires: ['analytics', 'open-files', 'scale-out'],
    blurb: 'One copy of data on object storage feeding SQL, Spark, and training jobs. The post\'s Databricks answer — open formats flip the same analytics requirement to the lakehouse.',
  },
  {
    id: 'vector-search',
    title: 'Semantic product search at scale',
    requires: ['similarity', 'scale-out'],
    blurb: 'Nearest-neighbor over embeddings as a first-class workload. The post\'s Pinecone-over-pgvector answer: when similarity is the storage model, the bolt-on boundary shows.',
  },
];
