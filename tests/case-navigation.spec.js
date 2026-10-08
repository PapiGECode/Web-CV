import { test, expect } from './fixtures.js';
import { projects, getNextProject } from '../content/projects.mjs';

test('canonical and modal next links name and open the same curated destination', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const project of projects) {
    const next = getNextProject(project);
    for (const modal of project.showcase === false ? [false] : [false, true]) {
      await page.goto(modal ? '/#case-study-' + project.id : '/projects/' + project.slug);
      if (modal) await page.waitForFunction(() => window.__portfolioReady);
      const link = page.locator(modal ? '#cs-content .pp-next' : 'main .pp-next');
      await expect(link).toHaveAttribute('href', '/projects/' + next.slug);
      await expect(link.locator('strong')).toHaveText(next.title + ' ↗');
      await link.click();
      await expect(page).toHaveURL(new RegExp('/projects/' + next.slug + '$'));
      await expect(page.locator('h1')).toHaveText(next.title);
    }
  }
});

for (const theme of ['dark', 'light']) for (const preference of ['system', 'saved']) {
  test(`missing routes preserve the ${preference} ${theme} theme and return home`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: preference === 'system' ? theme : theme === 'light' ? 'dark' : 'light' });
    if (preference === 'saved') await page.addInitScript(theme => localStorage.setItem('ps-theme', theme), theme);
    const response = await page.goto('/missing-page-polish');
    expect(response.status()).toBe(404);
    await expect(page.locator('html')).toHaveClass(theme === 'light' ? /light/ : /^(?!.*light)/);
    await expect(page.locator('h1')).toHaveText('Perdido.');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `review-reports/polish-404-${preference}-${theme}.png` });
    await page.getByRole('link', { name: 'Volver al inicio' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('html')).toHaveClass(theme === 'light' ? /light/ : /^(?!.*light)/);
  });
}

test('next-project and missing-page return links work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 900 } });
  const page = await context.newPage();
  const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
  await page.goto(base + '/projects/kernelos');
  await page.locator('.pp-next').click();
  await expect(page.locator('h1')).toHaveText('ThiagoIUTU');
  await page.goto(base + '/missing-page-polish');
  await page.getByRole('link', { name: 'Volver al inicio' }).click();
  await expect(page.locator('#hero')).toBeVisible();
  await context.close();
});

for (const theme of ['dark', 'light']) test(`next-case destination is readable at320px in ${theme}`, async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: theme });
  await page.goto('/projects/kicord');
  const link = page.locator('.pp-next');
  await link.scrollIntoViewIfNeeded();
  await link.screenshot({ path: `review-reports/polish-next-${theme}.png` });
  const title = link.locator('strong');
  const box = await title.boundingBox();
  expect(box.height).toBeLessThanOrEqual(await title.evaluate(el => parseFloat(getComputedStyle(el).lineHeight) + 1));
});
