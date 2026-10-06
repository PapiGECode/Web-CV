import { test, expect } from './fixtures.js';

async function assertSignature(page) {
  const word = page.locator('#foot-word');
  await expect(word).toHaveAttribute('role', 'img');
  await expect(word).toHaveAttribute('aria-label', 'Schefer');
  await expect(word).toHaveText('Schefer');
  await expect(page.locator('h1.hero-name')).toHaveAttribute('aria-label', 'Pablo Schefer');
  const bounds = await word.evaluate(el => {
    const letters = [...el.querySelectorAll('.fchar')];
    const range = document.createRange();
    range.selectNodeContents(el);
    const rects = letters.length ? letters.map(char => char.getBoundingClientRect()) : [range.getBoundingClientRect()];
    return { left: Math.min(...rects.map(r => r.left)), right: Math.max(...rects.map(r => r.right)), viewport: el.getBoundingClientRect().right };
  });
  expect(bounds.left).toBeGreaterThanOrEqual(0);
  expect(bounds.right).toBeLessThanOrEqual(bounds.viewport);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

for (const width of [320, 390, 768, 1440]) for (const theme of ['dark', 'light']) {
  test(`surname signature fits and retains motion at ${width}px ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    await page.emulateMedia({ reducedMotion: 'no-preference', colorScheme: theme });
    await page.goto('/');
    await page.waitForFunction(() => window.__portfolioReady);
    await expect(page.locator('#foot-word .fchar')).toHaveCount(7);
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    const endOffset = await page.locator('#foot-word').evaluate(el => Math.min(16, el.clientWidth * 0.018) * 3);
    await expect.poll(() => page.locator('#foot-word .fchar').last().evaluate(el => Number(gsap.getProperty(el, 'x')))).toBeGreaterThan(endOffset * 0.98);
    await assertSignature(page);
    await page.screenshot({ path: `review-reports/footer-schefer-${width}-${theme}.png` });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await assertSignature(page);
    const transforms = await page.locator('#foot-word .fchar').evaluateAll(chars => chars.map(el => getComputedStyle(el).transform));
    expect(transforms.every(value => value === 'none' || value === 'matrix(1, 0, 0, 1, 0, 0)')).toBe(true);
  });

  test(`surname signature remains complete without JS at ${width}px ${theme}`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 960 }, colorScheme: theme });
    try {
      const page = await context.newPage();
      await page.goto(process.env.TEST_BASE_URL || 'http://localhost:3000');
      await page.locator('#foot-word').scrollIntoViewIfNeeded();
      await assertSignature(page);
    } finally {
      await context.close();
    }
  });
}
