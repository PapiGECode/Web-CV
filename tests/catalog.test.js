import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { projects, renderProjectPage, renderCaseTemplates } from '../scripts/project-catalog.mjs';
import { showcaseProjects, getNextProject } from '../content/projects.mjs';

test('catalog produces escaped indexable pages and consistent inert cases', async () => {
  const template = await fs.readFile('projects/template.html', 'utf8');
  const cases = renderCaseTemplates();
  for (const project of projects) {
    const page = renderProjectPage(template, project);
    const heading = page.match(/<h1 class="pp-title cs-title long[^\"]*">(.*?)<\/h1>/)[1];
    assert.equal(heading.replace(/<[^>]+>/g, ''), project.title);
    if (project.slug === 'portfolio') assert.ok(heading.includes('</span><wbr><span>.com'));
    assert.ok(page.includes(`https://www.pabloschefer.com/projects/${project.slug}`));
    assert.equal(cases.includes(project.overview), project.showcase !== false);
    assert.ok(!page.includes('{{'));
  }
  const escaped = renderProjectPage(template, { ...projects[0], title: '<script>bad</script>' });
  assert.ok(escaped.includes('&lt;script&gt;bad&lt;/script&gt;'));
  assert.ok(!escaped.includes('<script>bad</script>'));
});

test('next-case navigation visits the complete curated selection exactly once', () => {
  let current = showcaseProjects[0];
  const visited = [];
  for (let index = 0; index < showcaseProjects.length; index++) {
    visited.push(current.slug);
    current = getNextProject(current);
  }
  assert.deepEqual(visited, ['kicord', 'portfolio', 'kernelos', 'thiagoiutu', 'thiago-community', 'papigegamer-web']);
  assert.equal(current.slug, visited[0]);
  assert.equal(getNextProject(projects.find(project => project.slug === 'robleis')).slug, 'thiago-community');
});


test('owned sites embed real URLs and KernelOS uses an honest isolated local tour', async () => {
  const { renderProjectLandscape, renderProjectPhone } = await import('../scripts/project-phones.mjs');
  for (const key of ['kicord', 'portfolio', 'thiagoiutu', 'thiago-community', 'papigegamer-web']) {
    const html = renderProjectLandscape(key);
    assert.ok(html.includes('<template data-live-template><iframe'));
    assert.ok(html.includes('target="_blank" rel="noopener noreferrer"'));
    assert.ok(!html.includes('allow-top-navigation'));
  }
  for (const html of [renderProjectLandscape('kernelos'), renderProjectPhone('kernelos', 'test-kernelos')]) {
    assert.ok(html.includes('data-frame-src="/demos/kernelos"'));
    assert.ok(html.includes('recorrido local interactivo'));
    assert.ok(html.includes('href="https://kernelos.org/"'));
    assert.ok(!html.includes('allow-same-origin'));
    assert.ok(!html.includes('data-frame-src="https://kernelos.org/"'));
  }
});
