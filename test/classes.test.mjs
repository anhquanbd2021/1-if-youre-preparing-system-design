import test from 'node:test';
import assert from 'node:assert/strict';
import { ENGINE_CLASSES } from '../public/classes.mjs';
import { PROPERTY_IDS } from '../public/properties.mjs';

test('every class defines a capability level for every property', () => {
  for (const c of ENGINE_CLASSES) {
    for (const id of PROPERTY_IDS) {
      const level = c.capability[id];
      assert.ok([0, 1, 2].includes(level), `${c.id}.${id} = ${level}`);
    }
    assert.deepEqual(Object.keys(c.capability).sort(), [...PROPERTY_IDS].sort(), `${c.id} extra keys`);
  }
});

test('every class carries named instances with honest post-claim labels', () => {
  for (const c of ENGINE_CLASSES) {
    assert.ok(c.instances.length >= 1, c.id);
    for (const i of c.instances) {
      assert.ok(i.name.length > 0);
      assert.match(i.postClaim, /post (claims|calls|cites|credits|names|frames|lists|tags)/i, `${c.id}/${i.name} must read as a claim`);
    }
  }
});

test('the landscape is not one ladder — each class has a different strength set', () => {
  const signatures = ENGINE_CLASSES.map(c => PROPERTY_IDS.filter(id => c.capability[id] === 2).join(','));
  assert.equal(new Set(signatures).size, ENGINE_CLASSES.length, 'classes must differ in strengths');
});

test('"NoSQL" is three different signatures: document, key-value, wide-column', () => {
  const doc = ENGINE_CLASSES.find(c => c.id === 'document');
  const kv = ENGINE_CLASSES.find(c => c.id === 'keyvalue');
  const wide = ENGINE_CLASSES.find(c => c.id === 'widecolumn');
  assert.equal(doc.capability.documents, 2);
  assert.equal(kv.capability['point-lookup'], 2);
  assert.equal(wide.capability['scale-out'], 2);
  assert.equal(wide.capability.joins, 0, 'wide-column stores famously do not join');
});
