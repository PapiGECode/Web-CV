import { test, expect } from './fixtures.js';

for (const theme of ['dark', 'light']) {
  test(`all technical notes fade and resume without moving in ${theme}`, async ({ page }) => {
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

for (const width of [320,390,768,1440]) test(`organization links have bounded keyboard targets at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:960});
  await page.goto('/');
  for(const link of await page.locator('.community-links a').all()) {
    await link.scrollIntoViewIfNeeded(); await link.focus();
    await expect(link).toBeFocused();
    const box=await link.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(64);
    expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width);
    expect(await link.evaluate(el=>parseFloat(getComputedStyle(el).borderRadius))).toBeGreaterThanOrEqual(16);
  }
});
test('glow coordinates follow the clipped inner card at its corners',async({page})=>{
  await page.setViewportSize({width:1440,height:960});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/');await page.waitForFunction(()=>window.__portfolioReady);
  for(const card of await page.locator('.bento-card').all()) {
    await card.scrollIntoViewIfNeeded(); const box=await card.boundingBox();
    await page.mouse.move(box.x+box.width-12,box.y+box.height-12);
    const g=await card.evaluate(el=>({x:parseFloat(el.style.getPropertyValue('--mouse-x')),y:parseFloat(el.style.getPropertyValue('--mouse-y')),w:el.clientWidth,h:el.clientHeight,clip:getComputedStyle(el).overflow,radius:parseFloat(getComputedStyle(el).borderRadius)}));
    expect(g.x).toBeGreaterThan(0);expect(g.x).toBeLessThanOrEqual(g.w);
    expect(g.y).toBeGreaterThan(0);expect(g.y).toBeLessThanOrEqual(g.h);
    expect(g.clip).toBe('hidden');expect(g.radius).toBeGreaterThanOrEqual(16);
    await page.mouse.move(box.x+box.width+5,box.y+box.height-12);
    await expect(card).not.toHaveClass(/is-glow-active/);
    await expect(card.locator('.bento-border-glow')).toHaveCSS('opacity','0');
  }
});
