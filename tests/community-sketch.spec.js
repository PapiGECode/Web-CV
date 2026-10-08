import { test, expect } from './fixtures.js';

async function assertSketch(art, request) {
  await art.scrollIntoViewIfNeeded();
  await expect(art).toBeVisible();
  await expect(art).toHaveAttribute('aria-hidden', 'true');
  await expect(art).toHaveCSS('overflow', 'hidden');
  expect(await art.evaluate(el => parseFloat(getComputedStyle(el).borderRadius))).toBeGreaterThanOrEqual(16);
  await expect(art.locator('.project-art-note')).toHaveText('THIAGO COMMUNITY / BOT');
  const image = art.locator('img');
  await expect(image).toHaveAttribute('alt', '');
  await expect(image).toHaveAttribute('width', '1586');
  await expect(image).toHaveAttribute('height', '992');
  await expect.poll(() => image.evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true);
  const candidates = (await image.getAttribute('srcset')).split(',').map(value => value.trim().split(' '));
  expect(candidates.map(([, width]) => width)).toEqual(['640w', '960w', '1280w']);
  for (const [url] of candidates) {
    expect(url).toMatch(/^\/assets\/thiago-community-sketch-(640|960|1280)\.[a-f0-9]{12}\.webp$/);
    const response = await request.get(url);
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('image/webp');
  }
  expect(await image.evaluate(el => new URL(el.currentSrc).origin === location.origin)).toBe(true);
  await expect(image).not.toHaveAttribute('src', /banner/);
}

for (const width of [320, 390, 768, 1440]) for (const theme of ['dark', 'light']) {
  test(`conceptual community sketch on all surfaces at ${width}px in ${theme}`, async ({ page, request }) => {
    await page.setViewportSize({ width, height: 960 });
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await page.goto('/#work');
    await page.waitForFunction(() => window.__portfolioReady);
    const home = page.locator('.project-index .project-art-thiago-community');
    await assertSketch(home, request);
    await expect(page.locator('.project-index [data-live-landscape]')).toHaveCount(5);
    await home.screenshot({ path: `review-reports/community-sketch-home-${width}-${theme}.png` });
    await page.locator('.panel-links [data-open-case=thiago-community]').click();
    const modal = page.locator('#cs-content .project-art-thiago-community');
    await assertSketch(modal, request);
    await expect(modal).toHaveCSS('aspect-ratio', '1.6 / 1');
    await expect(modal.locator('img')).toHaveCSS('object-fit', 'cover');
    await modal.screenshot({ path: `review-reports/community-sketch-modal-${width}-${theme}.png` });
    await page.keyboard.press('Escape');
    await expect(page.locator('.panel-links [data-open-case=thiago-community]')).toBeFocused();
    await page.goto('/projects/thiago-community');
    const canonical = page.locator('main .project-art-thiago-community');
    await assertSketch(canonical, request);
    await expect(canonical).toHaveCSS('aspect-ratio', '1.6 / 1');
    await expect(canonical.locator('img')).toHaveCSS('object-fit', 'cover');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await canonical.screenshot({ path: `review-reports/community-sketch-case-${width}-${theme}.png` });
  });
}

for (const theme of ['dark', 'light']) test(`sketch and canonical navigation work without JavaScript in ${theme}`, async ({ browser, request }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, colorScheme: theme, viewport: { width: 320, height: 960 } });
  const page = await context.newPage();
  await page.goto(process.env.TEST_BASE_URL || 'http://localhost:3000');
  await assertSketch(page.locator('.project-index .project-art-thiago-community'), request);
  await page.locator('.panel-title [data-open-case=thiago-community]').click();
  await expect(page.locator('h1')).toHaveText('Thiago Community');
  await assertSketch(page.locator('main .project-art-thiago-community'), request);
  await context.close();
});
