import { test, expect, stubKiCord } from './fixtures.js';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';

test('three restrained technical notes fill one desktop row in both themes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.route('**/api/contact', route => route.fulfill({ json: { available: false } }));
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => window.__portfolioReady === true);
  const cards = page.locator('#bento-projects-grid > .bento-card');
  await expect(cards).toHaveCount(3);
  const boxes = await cards.evaluateAll(elements => elements.map(el => {
    const r = el.getBoundingClientRect();
    return { top:r.top, left:r.left, right:r.right, width:r.width };
  }));
  expect(Math.max(...boxes.map(b=>b.top)) - Math.min(...boxes.map(b=>b.top))).toBeLessThan(1);
  expect(Math.max(...boxes.map(b=>b.width)) - Math.min(...boxes.map(b=>b.width))).toBeLessThan(1);
  expect(boxes[0].right).toBeLessThan(boxes[1].left);
  await fs.mkdir('review-reports', {recursive:true});
  for (const theme of ['dark','light']) {
    if (theme === 'light') await page.locator('#theme-toggle').click();
    await page.locator('.bento-projects-wrap').scrollIntoViewIfNeeded();
    await page.screenshot({path:`review-reports/curated-collaborations-${theme}.png`});
    const audit = await new AxeBuilder({page}).include('#bento-projects-grid').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(audit.violations.filter(v=>['critical','serious'].includes(v.impact))).toEqual([]);
  }
});

for (const width of [320, 390, 768]) {
  test('three current repository cards remain readable at ' + width + 'px', async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const cards = page.locator('#bento-projects-grid > .bento-card');
    await expect(cards).toHaveCount(3);
    for (let index = 0; index < await cards.count(); index++) {
      const card = cards.nth(index);
      await card.scrollIntoViewIfNeeded();
      const box = await card.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      expect(await card.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
      await expect(card.locator('.bento-card-title')).toBeVisible();
      await expect(card.locator('.bento-btn-link')).toBeVisible();
      expect((await card.locator('.bento-btn-link').boundingBox()).height).toBeGreaterThanOrEqual(44);
      await page.screenshot({ path: 'review-reports/repository-' + index + '-' + width + '.png' });
    }
  });
}
