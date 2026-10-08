import test from 'node:test';
import assert from 'node:assert/strict';
import { metricPaths } from '../content/metric-paths.mjs';
import { projects } from '../content/projects.mjs';
import { createMetricsHandler } from '../server/metrics.js';

const origin = 'https://www.pabloschefer.com';
const request = path => new Request(origin + '/api/metrics', {
  method: 'POST',
  headers: { origin, 'content-type': 'application/json' },
  body: JSON.stringify({ kind: 'event', name: 'page_view', path }),
});

test('explicit metric paths cover canonical projects without implicitly allowing new URLs', () => {
  const expected = ['/', '/privacidad', '/projects/papigegamer', ...projects.map(project => '/projects/' + project.slug)];
  assert.deepEqual([...metricPaths].sort(), expected.sort());
  assert.ok(Object.isFrozen(metricPaths));
});

test('metrics accepts each public path and logs only the normalized event', async () => {
  const logs = [];
  const handler = createMetricsHandler({ log: row => logs.push(JSON.parse(row)) });
  for (const path of metricPaths) {
    assert.equal((await handler(request(path))).status, 204, path);
    assert.deepEqual(logs.at(-1), { type: 'portfolio_metric', kind: 'event', name: 'page_view', path });
  }
  assert.equal(logs.length, metricPaths.length);
});

test('metric path additions do not admit private, arbitrary, encoded or parameterized paths', async () => {
  const logs = [];
  const handler = createMetricsHandler({ log: row => logs.push(row) });
  for (const path of ['/admin', '/projects/not-published', '/projects/portfolio?email=private', '/projects/thiagoiutu#private', '/projects/%70ortfolio', origin + '/projects/portfolio']) {
    assert.equal((await handler(request(path))).status, 422, path);
  }
  assert.deepEqual(logs, []);
});
