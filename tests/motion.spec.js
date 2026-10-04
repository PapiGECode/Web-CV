import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';

async function open(page) {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => window.__portfolioReady === true);
}
async function watchCanvas(page) {
  await page.addInitScript(() => {
    window.__artFrames = 0;
    const clear = CanvasRenderingContext2D.prototype.clearRect;
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      if (this.canvas.id === 'orbit-canvas') window.__artFrames++;
      return clear.apply(this, args);
    };
  });
}

test('artwork animates, can be paused and remembers the preference on project routes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.emulateMedia({ reducedMotion: 'no-preference', colorScheme: 'dark' });
  await watchCanvas(page);
  await open(page);
  await expect.poll(() => page.evaluate(() => window.__artFrames)).toBeGreaterThan(5);
  await page.locator('#motion-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'off');
  const frames = await page.evaluate(() => window.__artFrames);
  await page.waitForTimeout(350);
  expect(await page.evaluate(() => window.__artFrames)).toBe(frames);
  await page.reload();
  await expect(page.locator('#motion-toggle')).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/projects/kicord');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'off');
  await page.locator('#motion-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'on');
});

test('system reduced motion wins and changes are applied without reloading', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  await expect(page.locator('#motion-toggle')).toBeDisabled();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'off');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('#motion-toggle')).toBeEnabled();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'on');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'off');
  await expect(page.locator('h1')).toBeVisible();
});

test('canvas rendering stops when the artwork leaves the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await watchCanvas(page);
  await open(page);
  await expect.poll(() => page.evaluate(() => window.__artFrames)).toBeGreaterThan(5);
  await page.evaluate(() => window.scrollTo({ top: document.getElementById('contact').offsetTop, behavior: 'instant' }));
  await expect(page.locator('#orbit-canvas')).not.toBeInViewport();
  await page.waitForTimeout(250);
  const frames = await page.evaluate(() => window.__artFrames);
  await page.waitForTimeout(350);
  expect(await page.evaluate(() => window.__artFrames)).toBe(frames);
});

test('motion-enabled desktop and mobile have no page errors or horizontal overflow', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'no-preference', colorScheme: 'dark' });
  await fs.mkdir('review-reports', { recursive: true });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    await open(page);
    await page.waitForTimeout(1200);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `review-reports/design-motion-${width}.png` });
    await page.locator('.panel-title a').nth(1).click();
    await expect(page.locator('#case-study-modal')).toHaveAttribute('aria-hidden', 'false');
    await page.waitForTimeout(450);
    await page.screenshot({ path: `review-reports/design-case-${width}.png` });
    await page.locator('#cs-btn-close').click();
    await expect(page.locator('#case-study-modal')).toHaveAttribute('aria-hidden', 'true');
  }
  expect(errors).toEqual([]);
});

test('canonical projects preserve structured metadata and semantic approach controls', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  const detail = page.locator('#skills details').first();
  await detail.locator('summary').focus();
  const before = await detail.evaluate(el => el.open);
  await page.keyboard.press('Enter');
  expect(await detail.evaluate(el => el.open)).toBe(!before);
  for (const slug of ['kicord', 'papigegamer', 'kernelos']) {
    await page.goto('/projects/' + slug);
    const metadata = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(metadata.some(text => JSON.parse(text)['@type'] === 'CreativeWork')).toBe(true);
    await expect(page.locator('h1')).toBeVisible();
  }
});
