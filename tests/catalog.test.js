import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { projects, renderProjectPage, renderCaseTemplates } from '../scripts/project-catalog.mjs';

test('catalog produces escaped indexable pages and consistent inert cases', async () => {
  const template = await fs.readFile('projects/template.html', 'utf8');
  const cases = renderCaseTemplates();
  for (const project of projects) {
    const page = renderProjectPage(template, project);
    assert.ok(page.includes(`<h1 class="pp-title cs-title long">${project.title}</h1>`));
    assert.ok(page.includes(`https://www.pabloschefer.com/projects/${project.slug}`));
    assert.equal(cases.includes(project.overview), project.showcase !== false);
    assert.ok(!page.includes('{{'));
  }
  const escaped = renderProjectPage(template, { ...projects[0], title: '<script>bad</script>' });
  assert.ok(escaped.includes('&lt;script&gt;bad&lt;/script&gt;'));
  assert.ok(!escaped.includes('<script>bad</script>'));
});
