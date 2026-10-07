import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { EXAMPLE_TASKS } from '../public/examples.mjs';
import { PROPERTY_IDS } from '../public/properties.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));

test('embedded examples match examples/tasks.json on disk', async () => {
  const onDisk = JSON.parse(await readFile(`${root}examples/tasks.json`, 'utf8'));
  assert.deepEqual(EXAMPLE_TASKS, onDisk);
});

test('every workload requirement is a real property id', () => {
  for (const t of EXAMPLE_TASKS) {
    assert.ok(t.requires.length >= 1, t.id);
    for (const r of t.requires) assert.ok(PROPERTY_IDS.includes(r), `${t.id}: ${r}`);
    assert.equal(new Set(t.requires).size, t.requires.length, `${t.id} dupes`);
  }
});

test('task ids are unique and slugs', () => {
  const ids = EXAMPLE_TASKS.map(t => t.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^[a-z0-9-]+$/);
});
