import { test, expect } from './fixtures.js';
import { projects } from '../content/projects.mjs';

for (const project of projects) test(`${project.slug}: canonical and modal content agree`, async ({ page, request }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/projects/' + project.slug);
  await expect(page.locator('h1')).toHaveText(project.title);
  await expect(page.locator('iframe')).toHaveCount(0);
  if (project.phone) await expect(page.locator('.project-demo')).not.toHaveAttribute('open', '');
  await expect(page.locator('main')).toContainText(project.role);
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://www.pabloschefer.com/projects/${project.slug}`);
  const response = await request.get('/projects/' + project.slug);
  expect(await response.text()).toContain(project.overview);
  await page.goto('/#case-study-' + project.id);
  await page.waitForFunction(() => window.__portfolioReady);
  await expect(page.locator('#case-study-modal')).toHaveAttribute('aria-hidden', 'false');
  await expect(page.locator('#cs-content')).toContainText(project.overview);
  await page.keyboard.press('Escape');
  await expect(page.locator('#case-study-modal')).toHaveAttribute('aria-hidden', 'true');
});

test('new work avoids unsupported public source links and preserves the historical redirect', async ({ page, request }) => {
  for (const slug of ['robleis','thiago-community','thiagoiutu']) {
    await page.goto('/projects/' + slug);
    await expect(page.locator('a[href*="github.com"]')).toHaveCount(0);
  }
  await page.goto('/projects/papigegamer');
  await expect(page).toHaveURL(/\/projects\/portfolio$/);
  await page.goto('/projects/papigegamer-web');
  await expect(page.locator('main')).toContainText('distinta de este portfolio');
  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const project of projects) expect(sitemap).toContain('/projects/' + project.slug);
});
