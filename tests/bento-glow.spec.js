import { test, expect } from './fixtures.js';

for (const theme of ['dark', 'light']) {
  test(`both technical notes fade and resume without moving in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.emulateMedia({ reducedMotion: 'no-preference', colorScheme: theme });
    await page.goto('/');
    await page.waitForFunction(() => window.__portfolioReady);
    for (const [index, card] of (await page.locator('.bento-card').all()).entries()) {
      await card.scrollIntoViewIfNeeded();
      const initial = await card.boundingBox();
      const glow = card.locator('.bento-border-glow');
      await card.hover();
      await expect(glow).toHaveCSS('opacity', '1');
      const coordinates = await card.evaluate(el => [el.style.getPropertyValue('--mouse-x'), el.style.getPropertyValue('--mouse-y')]);
      await page.mouse.move(0, 0);
      await expect(glow).toHaveCSS('transition-duration', '0.55s');
      await page.waitForTimeout(120);
      const fading = Number(await glow.evaluate(el => getComputedStyle(el).opacity));
      expect(fading).toBeGreaterThan(0.15);
      expect(fading).toBeLessThan(1);
      expect(await card.evaluate(el => [el.style.getPropertyValue('--mouse-x'), el.style.getPropertyValue('--mouse-y')])).toEqual(coordinates);
      await page.screenshot({ path: `review-reports/glow-exit-${index}-${theme}.png` });
      await card.hover();
      await expect(glow).toHaveCSS('opacity', '1');
      await page.mouse.move(0, 0);
      await expect(glow).toHaveCSS('opacity', '0');
      expect(await card.boundingBox()).toEqual(initial);
      await card.locator('a').focus();
      await expect(glow).toHaveCSS('opacity', '0');
      await card.hover();
      await expect(glow).toHaveCSS('opacity', '1');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(glow).toHaveCSS('opacity', '0');
      await expect(glow).toHaveCSS('transition-duration', '0s');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.mouse.move(0, 0);
    }
  });
}

test('touch never activates a persistent decorative glow', async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    await page.goto(process.env.TEST_BASE_URL || 'http://localhost:3000');
    await page.waitForFunction(() => window.__portfolioReady);
    for (const card of await page.locator('.bento-card').all()) {
      await card.scrollIntoViewIfNeeded();
      await card.locator('.bento-card-title').tap();
      await expect(card.locator('.bento-border-glow')).toHaveCSS('opacity', '0');
      await expect(card).not.toHaveClass(/is-glow-active/);
    }
  } finally {
    await context.close();
  }
});
