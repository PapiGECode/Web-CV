import { test, expect, stubKiCord } from './fixtures.js';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';

async function ready(page) {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => window.__portfolioReady === true);
}

test('320px modal navigation remains visible and operable', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
  await ready(page);
  await page.locator('.panel-title a').nth(1).click();
  await expect(page.locator('#case-study-modal')).toHaveAttribute('aria-hidden', 'false');
  for (const id of ['cs-btn-back', 'cs-btn-close']) {
    const control = page.locator('#' + id);
    await expect(control).toBeVisible();
    const box = await control.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(320);
  }
  await fs.mkdir('review-reports', { recursive: true });
  await page.screenshot({ path: 'review-reports/modal-320.png' });
  await page.locator('#cs-btn-close').click();
  await expect(page.locator('#case-study-modal')).toHaveAttribute('aria-hidden', 'true');
});

for (const scheme of ['dark', 'light']) {
  test(`home and modal contrast/accessibility in ${scheme} theme`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: scheme });
    await ready(page);
    const home = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    await fs.mkdir('review-reports', { recursive: true });
    await fs.writeFile(`review-reports/axe-home-${scheme}.json`, JSON.stringify(home.violations, null, 2));
    expect(home.violations.filter(v => ['critical', 'serious'].includes(v.impact))).toEqual([]);
    await page.locator('.panel-title a').first().click();
    const modal = await new AxeBuilder({ page }).include('#case-study-modal').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    await fs.writeFile(`review-reports/axe-modal-${scheme}.json`, JSON.stringify(modal.violations, null, 2));
    expect(modal.violations.filter(v => ['critical', 'serious'].includes(v.impact))).toEqual([]);
  });
}
