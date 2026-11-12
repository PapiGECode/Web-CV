import { test, expect } from './fixtures.js';

for (const motion of ['no-preference', 'reduce']) {
  test('clicked navigation matches the visible section with ' + motion, async ({ page }) => {
    await page.setViewportSize({ width: 1390, height: 1244 });
    await page.emulateMedia({ reducedMotion: motion });
    await page.goto('/#work');
    await page.waitForFunction(() => window.__portfolioReady);
    for (const id of ['about', 'skills', 'work', 'contact', 'about', 'about', 'work']) {
      await page.locator('.nav-link[href="#' + id + '"]').click();
      await page.waitForTimeout(1200);
      await expect(page.locator('.nav-link.active')).toHaveAttribute('href', '#' + id);
      await expect(page.locator('.nav-link[aria-current="location"]')).toHaveAttribute('href', '#' + id);
      const top = await page.locator('#' + id).evaluate(el => el.getBoundingClientRect().top);
      expect(top).toBeGreaterThanOrEqual(60);
      expect(top).toBeLessThan(130);
    }
  });
}

for (const motion of ['no-preference', 'reduce']) {
  test('mobile menu and manual scrolling keep navigation in sync with ' + motion, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: motion });
    await page.goto('/');
    await page.waitForFunction(() => window.__portfolioReady);
    for (const id of ['work', 'about', 'skills', 'contact', 'about']) {
      await page.locator('#nav-burger').click();
      await page.locator('#nav-overlay a[href="#' + id + '"]').click();
      await expect(page.locator('#nav-burger')).toHaveAttribute('aria-expanded', 'false');
      await page.waitForTimeout(1100);
      await expect(page.locator('.nav-link[aria-current]')).toHaveAttribute('href', '#' + id);
      const top = await page.locator('#' + id).evaluate(el => el.getBoundingClientRect().top);
      expect(top).toBeGreaterThanOrEqual(90);
      expect(top).toBeLessThan(102);
    }
    // Scrollspy must not remain locked to the last clicked destination.
    for (const id of ['skills', 'contact', 'about', 'work']) {
      await page.locator('#' + id).evaluate(el => window.scrollTo({
        top: el.getBoundingClientRect().top + scrollY - 96, behavior: 'instant'
      }));
      await expect(page.locator('.nav-link.active')).toHaveAttribute('href', '#' + id);
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect(page.locator('.nav-link[aria-current]')).toHaveCount(0);
  });
}

test('native fragments, history and resize keep one current section', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#skills');
  await page.waitForFunction(() => window.__portfolioReady);
  await expect(page.locator('.nav-link.active')).toHaveAttribute('href', '#skills');
  await page.evaluate(() => { location.hash = '#contact'; });
  await expect(page.locator('.nav-link.active')).toHaveAttribute('href', '#contact');
  await page.goBack();
  await expect(page.locator('.nav-link[aria-current]')).toHaveAttribute('href', '#skills');
  await page.setViewportSize({ width: 1024, height: 900 });
  // Explicit viewport-relative scroll after reflow, independent of offsetParent.
  await page.locator('#about').evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 96, behavior: 'instant' }));
  await expect(page.locator('.nav-link[aria-current]')).toHaveAttribute('href', '#about');
  await page.screenshot({ path: 'review-reports/navigation-profile-active.png' });
});

test('native anchors reserve one navigation clearance without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 960 } });
  try {
    const page = await context.newPage();
    await page.goto(process.env.TEST_BASE_URL || 'http://localhost:3000');
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.nav-link[href="#about"]').click();
    await expect(page).toHaveURL(/#about$/);
    const top = await page.locator('#about').evaluate(el => el.getBoundingClientRect().top);
    expect(top).toBeGreaterThanOrEqual(90);
    expect(top).toBeLessThan(102);
  } finally { await context.close(); }
});
