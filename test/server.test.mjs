import test from 'node:test';
import assert from 'node:assert/strict';
import { createStaticServer } from '../app/server.js';
import { once } from 'node:events';

async function withServer(fn) {
  const server = createStaticServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  try { await fn(base); } finally { server.close(); }
}

test('health and version endpoints answer', async () => {
  await withServer(async base => {
    const health = await fetch(`${base}/health`);
    assert.equal(health.status, 200);
    assert.equal(await health.text(), 'ok');

    const version = await fetch(`${base}/version`);
    assert.equal(version.status, 200);
    const body = await version.json();
    assert.equal(body.name, 'workload-matcher-demo');
  });
});

test('static allowlist serves the app and rejects unknown paths', async () => {
  await withServer(async base => {
    for (const path of ['/', '/guide.html', '/styles.css', '/app.js', '/matcher.mjs', '/classes.mjs', '/properties.mjs', '/examples.mjs']) {
      const res = await fetch(`${base}${path}`);
      assert.equal(res.status, 200, path);
      assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    }
    for (const path of ['/package.json', '/%2e%2e/secrets', '/server.js']) {
      const res = await fetch(`${base}${path}`);
      assert.equal(res.status, 404, path);
    }
  });
});
