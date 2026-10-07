// Side-by-side report: every example workload × every engine class.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { matchTask, evaluatePick } from '../public/matcher.mjs';
import { ENGINE_CLASSES } from '../public/classes.mjs';
import { EXAMPLE_TASKS } from '../public/examples.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const onDisk = JSON.parse(await readFile(`${root}examples/tasks.json`, 'utf8'));
const mark = { fit: ' FIT ', stretch: 'stretch', mismatch: 'MISMATCH' };

console.log('Workload Matcher — examples report\n');
const colW = 13;
console.log(`${'workload'.padEnd(30)}${ENGINE_CLASSES.map(c => c.id.padStart(colW)).join('')} → recommendation`);

let ok = true;
for (const task of EXAMPLE_TASKS) {
  const { ranked, recommendation, note } = matchTask(task.requires);
  const byId = Object.fromEntries(ranked.map(r => [r.classId, r.verdict]));
  console.log(`${task.title.padEnd(30)}${ENGINE_CLASSES.map(c => mark[byId[c.id]].padStart(colW)).join('')} → ${recommendation ? recommendation.className : 'none'}`);
  console.log(`${''.padEnd(30)}   ${note}`);
}

// The two traps the article names: a graph query on a document store, and an
// analytical scan on a row store. Both must come back MISMATCH or the
// capability map drifted from the article's claims.
console.log('\nThe traps the article warns about:');
for (const [taskId, classId, expect] of [
  ['friend-graph', 'document', 'mismatch'],
  ['company-bi', 'oltp', 'mismatch'],
  ['vector-search', 'oltp', 'stretch'],   // pgvector is a real partial — bolt-on, not absence
]) {
  const task = onDisk.find(t => t.id === taskId);
  const r = evaluatePick(classId, task.requires);
  console.log(`  ${task.title} → ${r.className}: ${r.verdict.toUpperCase()} (${r.summary})`);
  if (r.verdict !== expect) { ok = false; console.log(`    ^ expected ${expect} — capability map drifted`); }
}

// The post's four named comparisons must land on the post's classes.
console.log('\nThe post\'s named comparisons:');
const expected = { 'order-service': 'oltp', 'session-cache': 'keyvalue', 'company-bi': 'warehouse', 'ml-platform': 'lakehouse', 'vector-search': 'vector' };
for (const [taskId, classId] of Object.entries(expected)) {
  const task = onDisk.find(t => t.id === taskId);
  const { recommendation } = matchTask(task.requires);
  const hit = recommendation?.classId === classId;
  console.log(`  ${task.title} → ${recommendation?.className ?? 'none'} ${hit ? '✓' : '✗ expected ' + classId}`);
  if (!hit) ok = false;
}
process.exit(ok ? 0 : 1);
