import { test, expect } from './fixtures.js';

async function assertCaseComposition(scope, slug) {
  const art = scope.locator('.project-art');
  const bounds = await art.boundingBox();
  if (slug === 'papigegamer-web') {
    for (const child of await art.locator('img, strong').all()) {
      const box = await child.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(bounds.x);
      expect(box.x + box.width).toBeLessThanOrEqual(bounds.x + bounds.width + 1);
      expect(box.y).toBeGreaterThanOrEqual(bounds.y);
      expect(box.y + box.height).toBeLessThanOrEqual(bounds.y + bounds.height + 1);
    }
  } else {
    const heading = scope.locator('h1');
    await expect(heading).toHaveText('PabloSchefer.com');
    const headingBox = await heading.boundingBox();
    for (const word of await heading.locator('span').all()) {
      const box = await word.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(headingBox.x);
      expect(box.x + box.width).toBeLessThanOrEqual(headingBox.x + headingBox.width + 1);
      expect(box.height).toBeLessThanOrEqual(await word.evaluate(el => parseFloat(getComputedStyle(el).lineHeight) + 1));
    }
  }
}

for (const width of [320, 390, 768, 1440]) for (const theme of ['dark', 'light']) {
  test(`case details and small controls stay composed at ${width}px in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: theme });
    for (const [slug, id] of [['portfolio', 'papige'], ['papigegamer-web', 'papigegamer-web']]) {
      await page.goto('/projects/' + slug);
      await page.evaluate(() => document.fonts.ready);
      await assertCaseComposition(page.locator('main'), slug);
      await page.locator('.pp-hero').screenshot({ path: `review-reports/polish-${slug}-${width}-${theme}.png` });
      await page.goto('/#case-study-' + id);
      await page.waitForFunction(() => window.__portfolioReady);
      await assertCaseComposition(page.locator('#cs-content'), slug);
      await page.locator('#cs-content .pp-hero').screenshot({ path: `review-reports/polish-modal-${slug}-${width}-${theme}.png` });
      await page.keyboard.press('Escape');
    }
    const button = page.locator('.now-collab-btn');
    await button.scrollIntoViewIfNeeded();
    const before = await button.boundingBox();
    const tags = await page.locator('#now-focus-tags').boundingBox();
    expect(before.height).toBeGreaterThanOrEqual(44);
    expect(before.y - tags.y - tags.height).toBeGreaterThanOrEqual(16);
    await button.hover();
    expect(await button.boundingBox()).toEqual(before);
    await page.locator('[data-open-preferences]').click();
    const checkbox = page.locator('#allow-measurement');
    const box = await checkbox.boundingBox();
    expect(box.width).toBe(20);
    expect(box.height).toBe(20);
    await expect(checkbox).not.toBeChecked();
    await page.locator('.preference-option').click();
    await expect(checkbox).toBeChecked();
    await page.locator('#preferences-dialog').screenshot({ path: `review-reports/polish-preferences-${width}-${theme}.png` });
    await page.keyboard.press('Escape');
  });
}

for (const theme of ['dark', 'light']) test(`compact case compositions work without JavaScript in ${theme}`, async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 960 }, colorScheme: theme });
  const page = await context.newPage();
  for (const slug of ['portfolio', 'papigegamer-web']) {
    await page.goto((process.env.TEST_BASE_URL || 'http://localhost:3000') + '/projects/' + slug);
    await assertCaseComposition(page.locator('main'), slug);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await context.close();
});
