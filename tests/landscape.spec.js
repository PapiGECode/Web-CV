import { test, expect } from './fixtures.js';
import AxeBuilder from '@axe-core/playwright';

const keys = ['kicord', 'portfolio', 'kernelos', 'thiagoiutu', 'papigegamer-web'];
async function openView(page, key) {
  const root = page.locator(`[data-live-landscape="${key}"]`);
  await root.scrollIntoViewIfNeeded();
  await expect(root.locator('iframe')).toHaveCount(1);
  const frame = await (await root.locator('iframe').elementHandle()).contentFrame();
  await expect(frame.locator('h1')).toBeVisible();
  return { root, frame };
}
async function expectFit(root) {
  await expect.poll(() => root.evaluate(el => {
    const box = el.getBoundingClientRect(), frame = el.querySelector('iframe').getBoundingClientRect();
    return ['top', 'right', 'bottom', 'left'].every(edge => Math.abs(box[edge] - frame[edge]) < 1.5);
  })).toBe(true);
}

for (const width of [320, 390, 768, 1440]) for (const theme of ['dark', 'light']) {
  test(`five live landscape views fit ${width}px ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: theme });
    await page.goto('/');
    await page.waitForFunction(() => window.__portfolioReady);
    await expect(page.locator('[data-live-landscape]')).toHaveCount(5);
    await expect(page.locator('[data-live-landscape] template')).toHaveCount(5);
    await expect(page.locator('#work iframe')).toHaveCount(0);
    await expect(page.locator('#work .phone-bezel, #work [data-project-phone]')).toHaveCount(0);
    await expect(page.locator('.project-art-thiago-community img')).toHaveCount(1);
    for (const key of keys) {
      const { root, frame } = await openView(page, key);
      expect(await frame.evaluate(() => innerWidth)).toBe(1100);
      await expectFit(root);
      await expect(root).not.toHaveAttribute('aria-hidden');
      await expect(root).toHaveCSS('overflow', 'hidden');
      const fallback = root.locator('..').locator('.landscape-external');
      await expect(fallback).toBeVisible();
      expect((await fallback.boundingBox()).height).toBeGreaterThanOrEqual(44);
      expect((await fallback.boundingBox()).y).toBeGreaterThanOrEqual((await root.boundingBox()).y + (await root.boundingBox()).height);
      await fallback.focus();
      await expect(fallback).toBeFocused();
      await root.locator('..').screenshot({ path: `review-reports/landscape-${key}-${width}-${theme}.png` });
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const audit = await new AxeBuilder({ page }).include('#work').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(audit.violations.filter(v => ['serious', 'critical'].includes(v.impact))).toEqual([]);
  });
}

test('without JavaScript the five views remain inert with permanent external links', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(process.env.TEST_BASE_URL || 'http://localhost:3000');
    await expect(page.locator('iframe')).toHaveCount(0);
    await expect(page.locator('.landscape-external')).toHaveCount(5);
    for (const link of await page.locator('.landscape-external').all()) {
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  } finally { await context.close(); }
});
