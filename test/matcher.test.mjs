import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePick, matchTask, normalizeProps } from '../public/matcher.mjs';
import { EXAMPLE_TASKS } from '../public/examples.mjs';

test('each example workload lands on its expected winner', () => {
  const expected = {
    'order-service': ['oltp', 'stretch'],
    'session-cache': ['keyvalue', 'fit'],
    'event-ingest': ['widecolumn', 'fit'],
    'metrics-rollups': ['timeseries', 'stretch'],
    'friend-graph': ['graph', 'fit'],
    'company-bi': ['warehouse', 'stretch'],
    'ml-platform': ['lakehouse', 'fit'],
    'vector-search': ['vector', 'fit'],
  };
  for (const t of EXAMPLE_TASKS) {
    const { recommendation } = matchTask(t.requires);
    const [cls, verdict] = expected[t.id];
    assert.equal(recommendation.classId, cls, `${t.id} class`);
    assert.equal(recommendation.verdict, verdict, `${t.id} verdict`);
  }
});

test('the document-store trap: graph query routed to documents is a mismatch', () => {
  const r = evaluatePick('document', ['traversal']);
  assert.equal(r.verdict, 'mismatch');
  assert.deepEqual(r.missing, ['traversal']);
  assert.match(r.summary, /missing:.*traversal/);
});

test('the row-store trap: analytical scan on OLTP is a mismatch', () => {
  const r = evaluatePick('oltp', ['analytics']);
  assert.equal(r.verdict, 'mismatch');
  assert.deepEqual(r.missing, ['analytics']);
});

test('NoSQL is not one thing: cache shape prefers key-value, firehose prefers wide-column', () => {
  assert.equal(matchTask(['point-lookup']).recommendation.classId, 'keyvalue');
  assert.equal(matchTask(['append', 'scale-out']).recommendation.classId, 'widecolumn');
});

test('native vs bolt-on: pgvector is a partial, Pinecone-class is native', () => {
  const bolt = evaluatePick('oltp', ['similarity']);
  assert.equal(bolt.verdict, 'stretch');
  assert.deepEqual(bolt.degraded, ['similarity']);
  const native = evaluatePick('vector', ['similarity']);
  assert.equal(native.verdict, 'fit');
});

test('a workload needing transactions AND similarity stretches on the row store — the honest pgvector answer', () => {
  const { recommendation, note } = matchTask(['transactions', 'similarity']);
  assert.equal(recommendation.classId, 'oltp');
  assert.equal(recommendation.verdict, 'stretch');
  assert.match(note, /bolt-on|partial/i);
});

test('empty requirements still return a recommendation', () => {
  const { ranked, recommendation } = matchTask([]);
  assert.equal(ranked.length, 9);
  assert.ok(recommendation, 'some class is recommended');
  for (const r of ranked) assert.equal(r.verdict, 'fit');
});

test('overkill is reported when native strengths go unused', () => {
  // the document store has native scale-out the session-cache shape never asked for
  const r = evaluatePick('document', ['point-lookup']);
  assert.equal(r.verdict, 'stretch');
  assert.deepEqual(r.overkill, ['documents', 'scale-out']);
});

test('normalizeProps dedupes, accepts objects, and drops unknown ids', () => {
  assert.deepEqual(normalizeProps(['joins', 'joins', 'bogus']), ['joins']);
  assert.deepEqual(normalizeProps({ traversal: true, append: false }), ['traversal', 'append']);
  assert.deepEqual(normalizeProps(undefined), []);
});

test('evaluatePick rejects an unknown class id', () => {
  assert.throws(() => evaluatePick('blockchain', []), /unknown engine class/);
});
