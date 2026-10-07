// Workload Matcher — the nine engine classes and their capability map.
// Pure ES module: imported by the browser UI, the CLI, and node:test.
//
// Capability levels per workload property:
//   2 'native'  — the class was built around this
//   1 'partial' — possible via bolt-on or engineering effort (pgvector, JSONB,
//                 $graphLookup, recursive CTEs, read replicas)
//   0 'missing' — this class does not deliver it in practice
//
// These are illustrative teaching values for the class *shape*, not vendor
// benchmark data — see README "honest limits". Instances carry the source
// post's named comparisons as `postClaim`; they are claims, not verified picks.

export const LEVELS = { 0: 'missing', 1: 'partial', 2: 'native' };

export const ENGINE_CLASSES = [
  {
    id: 'oltp',
    name: 'Relational OLTP (row store)',
    tagline: 'correctness first — ACID, joins, constraints, one writer to rule them',
    capability: { transactions: 2, 'point-lookup': 1, joins: 2, documents: 1, traversal: 1, append: 1, analytics: 0, similarity: 1, 'scale-out': 1, 'open-files': 0 },
    instances: [
      { name: 'PostgreSQL', postClaim: 'the post names it the pick over MongoDB — transactions plus JSONB covering most document cases' },
      { name: 'MySQL', postClaim: 'the post lists SQL row stores in the transactional OLTP class' },
    ],
  },
  {
    id: 'document',
    name: 'Document store',
    tagline: 'flexible records — variable-shaped documents, sharded reads',
    capability: { transactions: 1, 'point-lookup': 1, joins: 1, documents: 2, traversal: 0, append: 1, analytics: 0, similarity: 0, 'scale-out': 2, 'open-files': 0 },
    instances: [
      { name: 'MongoDB', postClaim: 'the post frames it as what teams reach for when records outgrow the table' },
    ],
  },
  {
    id: 'keyvalue',
    name: 'Key-value store',
    tagline: 'latency is the product — in-memory point lookups, nothing else',
    capability: { transactions: 0, 'point-lookup': 2, joins: 0, documents: 0, traversal: 0, append: 1, analytics: 0, similarity: 0, 'scale-out': 1, 'open-files': 0 },
    instances: [
      { name: 'Redis', postClaim: 'the post names it the pick over Cassandra — a different class, not a better version of one' },
    ],
  },
  {
    id: 'widecolumn',
    name: 'Wide-column store',
    tagline: 'write availability — the cluster keeps accepting writes through failures',
    capability: { transactions: 0, 'point-lookup': 1, joins: 0, documents: 1, traversal: 0, append: 2, analytics: 0, similarity: 0, 'scale-out': 2, 'open-files': 0 },
    instances: [
      { name: 'Cassandra', postClaim: 'the post cites it as the distributed NoSQL example — chosen when writes must survive partitions' },
    ],
  },
  {
    id: 'graph',
    name: 'Graph database',
    tagline: 'relationships as data — multi-hop traversal is indexed, not computed',
    capability: { transactions: 1, 'point-lookup': 0, joins: 1, documents: 1, traversal: 2, append: 0, analytics: 1, similarity: 0, 'scale-out': 1, 'open-files': 0 },
    instances: [
      { name: 'Neo4j', postClaim: 'the post tags it as the graph-class example' },
    ],
  },
  {
    id: 'timeseries',
    name: 'Time-series database',
    tagline: 'append and window — ordered ingest, compression, time-bucketed aggregates',
    capability: { transactions: 0, 'point-lookup': 0, joins: 1, documents: 0, traversal: 0, append: 2, analytics: 1, similarity: 0, 'scale-out': 1, 'open-files': 0 },
    instances: [
      { name: 'TimescaleDB / InfluxDB', postClaim: 'the post lists time series as its own class — instance names are illustrative' },
    ],
  },
  {
    id: 'warehouse',
    name: 'Data warehouse',
    tagline: 'columnar scans over history — governed SQL BI at elastic scale',
    capability: { transactions: 0, 'point-lookup': 0, joins: 1, documents: 1, traversal: 0, append: 0, analytics: 2, similarity: 0, 'scale-out': 1, 'open-files': 1 },
    instances: [
      { name: 'Snowflake', postClaim: 'the post names it the pick over Databricks for warehouse-shaped analytics' },
      { name: 'BigQuery / Redshift', postClaim: 'the post lists data warehouses as the analytics class' },
    ],
  },
  {
    id: 'lakehouse',
    name: 'Lakehouse',
    tagline: 'open files on object storage — one copy, many engines, ML + SQL',
    capability: { transactions: 0, 'point-lookup': 0, joins: 1, documents: 1, traversal: 0, append: 1, analytics: 2, similarity: 0, 'scale-out': 2, 'open-files': 2 },
    instances: [
      { name: 'Databricks / Delta Lake', postClaim: 'the post names Databricks the pick when the platform is open-format and ML-heavy' },
    ],
  },
  {
    id: 'vector',
    name: 'Vector database',
    tagline: 'similarity is the storage model — ANN indexes over embeddings at scale',
    capability: { transactions: 0, 'point-lookup': 1, joins: 0, documents: 0, traversal: 0, append: 0, analytics: 0, similarity: 2, 'scale-out': 2, 'open-files': 0 },
    instances: [
      { name: 'Pinecone', postClaim: 'the post names it the pick over Postgres pgvector — native vs bolt-on' },
      { name: 'Milvus / Weaviate', postClaim: 'the post lists vector DBs as the similarity class' },
    ],
  },
];

export const CLASS_IDS = ENGINE_CLASSES.map(c => c.id);

export function classById(id) {
  return ENGINE_CLASSES.find(c => c.id === id);
}
