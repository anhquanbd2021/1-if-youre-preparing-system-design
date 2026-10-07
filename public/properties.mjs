// Workload Matcher — the workload properties the filter runs on.
// Pure ES module: imported by the browser UI, the CLI, and node:test.
//
// A workload is a set of these property ids — yes/no facts about the data and
// the traffic that exist before any database name enters the room.

export const WORKLOAD_PROPERTIES = [
  { id: 'transactions', label: 'multi-record ACID writes',
    hint: 'money moves, inventory — all-or-nothing across rows' },
  { id: 'point-lookup', label: 'sub-ms point lookups',
    hint: 'read one key at huge volume — sessions, carts, rate limits' },
  { id: 'joins', label: 'relational joins',
    hint: 'normalized tables joined in the app serving path' },
  { id: 'documents', label: 'variable document records',
    hint: 'nested, schema-flexible records that differ row to row' },
  { id: 'traversal', label: 'multi-hop traversal',
    hint: 'friends-of-friends, path finding — edges are the query' },
  { id: 'append', label: 'append-only event ingest',
    hint: 'time-ordered writes that never update — metrics, logs, IoT' },
  { id: 'analytics', label: 'analytical scans & aggregates',
    hint: 'read millions of rows, aggregate, return one number — OLAP' },
  { id: 'similarity', label: 'vector similarity search',
    hint: 'nearest-neighbor over embeddings — semantic search, RAG' },
  { id: 'scale-out', label: 'distributed write scale',
    hint: 'write throughput beyond one node — many writers, not replicas' },
  { id: 'open-files', label: 'open-format files',
    hint: 'one copy on object storage, many engines over it — ML + SQL' },
];

export const PROPERTY_IDS = WORKLOAD_PROPERTIES.map(p => p.id);

export function propertyById(id) {
  return WORKLOAD_PROPERTIES.find(p => p.id === id);
}
