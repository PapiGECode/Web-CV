import { test, expect } from './fixtures.js';

const externalKeys = ['kicord', 'kernelos', 'thiagoiutu', 'papigegamer-web'];
async function ready(page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForFunction(() => window.__portfolioReady);
}
async function openView(page, key) {
  const root = page.locator(`[data-live-landscape="${key}"]`);
  await root.scrollIntoViewIfNeeded();
  await expect(root.locator('iframe')).toHaveCount(1);
  const frame = await (await root.locator('iframe').elementHandle()).contentFrame();
  await expect(frame.locator('h1')).toBeVisible();
  return { root, frame };
}

test('landscape requests start near the viewport and retain contexts offscreen', async ({ page }) => {
  const requests = [];
  page.on('request', request => { if (externalKeys.some(key => request.url().includes(key === 'papigegamer-web' ? 'papigegamer.com' : key))) requests.push(request.url()); });
  await ready(page);
  expect(requests).toEqual([]);
  await expect(page.locator('#work iframe')).toHaveCount(0);
  const { root, frame } = await openView(page, 'kicord');
  expect(requests.some(url => url.includes('kicord.es'))).toBe(true);
  expect(requests.some(url => url.includes('kernelos.org'))).toBe(false);
  await page.evaluate(() => scrollTo(0, 0));
  await expect(root.locator('iframe')).toHaveCount(1);
  expect(await (await root.locator('iframe').elementHandle()).contentFrame()).toBe(frame);
});

test('all mounted landscape contexts survive resize and persisted lifecycle events', async ({ page }) => {
  await ready(page);
  for (const key of [...externalKeys, 'portfolio']) {
    const { root, frame } = await openView(page, key);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 960 });
      await root.scrollIntoViewIfNeeded();
      await expect.poll(() => root.evaluate(el => {
        const box = el.getBoundingClientRect(), embedded = el.querySelector('iframe').getBoundingClientRect();
        return Math.abs(box.width - embedded.width) < 1.5 && Math.abs(box.height - embedded.height) < 1.5;
      })).toBe(true);
      expect(await (await root.locator('iframe').elementHandle()).contentFrame()).toBe(frame);
      expect(await frame.evaluate(() => innerWidth)).toBe(1100);
    }
  }
  // Synthetic events exercise our BFCache hooks, not browser cache admission policy.
  expect(await page.evaluate(() => {
    const before = [...document.querySelectorAll('#work iframe')];
    dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
    dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    return before.length === 5 && before.every((frame, i) => frame === document.querySelectorAll('#work iframe')[i]);
  })).toBe(true);
  await expect(page.locator('#work iframe')).toHaveCount(5);
});

test('external landscapes retain exact sandbox isolation and block top navigation', async ({ page }) => {
  await ready(page);
  const parentURL = page.url();
  for (const key of externalKeys) {
    const { root, frame } = await openView(page, key);
    await expect(root.locator('iframe')).toHaveAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');
    await expect(root.locator('iframe')).toHaveAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    expect(await frame.evaluate(() => {
      try { top.location.href = 'https://example.com/'; return false; } catch (error) { return error.name === 'SecurityError'; }
    })).toBe(true);
    expect(page.url()).toBe(parentURL);
  }
});

test('blocked landscapes retain keyboard accessible external fallbacks without success claims', async ({ page }) => {
  await page.route('https://thiagoiutu.com/**', route => route.fulfill({ status: 403, headers: { 'x-frame-options': 'DENY' }, body: 'Blocked fixture' }));
  await ready(page);
  const wrapper = page.locator('[data-live-landscape="thiagoiutu"]').locator('..');
  const fallback = wrapper.locator('.landscape-external');
  await expect(fallback).toHaveAttribute('href', 'https://thiagoiutu.com/');
  await wrapper.scrollIntoViewIfNeeded();
  await expect(wrapper.locator('iframe')).toHaveCount(1);
  await expect(fallback).toBeVisible();
  await fallback.focus();
  await expect(fallback).toBeFocused();
  await expect(wrapper).not.toContainText(/cargad[ao] correctamente|web cargada/i);
});

test('self landscape never recurses or measures after navigation loses the preview query', async ({ page, context }) => {
  const senders = [];
  await context.route('**/api/metrics', route => { senders.push(route.request().frame()); return route.fulfill({ status: 204 }); });
  await context.addInitScript(() => localStorage.setItem('ps-measurement', 'yes'));
  await ready(page);
  const { frame } = await openView(page, 'portfolio');
  for (const path of ['/?phone-preview=1', '/projects/kicord', '/projects/portfolio', '/projects/thiagoiutu', '/projects/thiago-community', '/projects/papigegamer-web', '/']) {
    await frame.goto(new URL(path, page.url()).href);
    await frame.evaluate(() => scrollTo(0, document.body.scrollHeight));
    await expect(frame.locator('html')).toHaveClass(/phone-preview/);
    await expect(frame.locator('iframe')).toHaveCount(0);
    expect(frame.childFrames()).toHaveLength(0);
    await frame.evaluate(() => {
      dispatchEvent(new Event('portfolio:consent'));
      dispatchEvent(new CustomEvent('portfolio:event', { detail: 'contact_sent' }));
    });
  }
  await expect.poll(() => senders.length).toBeGreaterThan(0);
  expect(senders.every(frame => frame === page.mainFrame())).toBe(true);
  await frame.locator('.panel-title a').first().press('Enter');
  await expect(frame.locator('#case-study-modal')).toHaveAttribute('aria-hidden', 'false');
  await frame.locator('.project-demo summary').press('Enter');
  await expect(frame.locator('iframe')).toHaveCount(0);
});

test('index frame navigation survives modal navigation and native Back/Forward', async ({ page }) => {
  await ready(page);
  const { root, frame } = await openView(page, 'kicord');
  await frame.locator('#remote-navigation').press('Enter');
  await expect.poll(() => frame.url()).toContain('/es/plugins');
  await page.locator('.panel-title a[data-open-case="kernelos"]').click();
  const modal = page.locator('#case-study-modal');
  await modal.locator('.project-demo summary').click();
  const phone = modal.locator('[data-live-phone="kernelos"]');
  await phone.scrollIntoViewIfNeeded();
  await expect(phone.locator('iframe')).toHaveCount(1);
  const modalFrame = await (await phone.locator('iframe').elementHandle()).contentFrame();
  await modalFrame.locator('#remote-navigation').press('Enter');
  await expect.poll(() => modalFrame.url()).toContain('/changelogs');
  await page.locator('#cs-btn-close').click();
  await expect(modal).toHaveAttribute('aria-hidden', 'true');
  await expect(modal.locator('iframe')).toHaveCount(0);
  await expect(page.locator('.panel-title a[data-open-case="kernelos"]')).toBeFocused();
  expect(await (await root.locator('iframe').elementHandle()).contentFrame()).toBe(frame);
  expect(frame.url()).toContain('/es/plugins');
  // Joint-history traversal changes a child document without a main-frame load.
  await page.evaluate(() => history.back());
  await expect.poll(() => frame.url()).toBe('https://www.kicord.es/es');
  await page.evaluate(() => history.forward());
  await expect.poll(() => frame.url()).toContain('/es/plugins');
  await expect(modal).toHaveAttribute('aria-hidden', 'true');
  await page.evaluate(() => history.forward());
  await expect(modal).toHaveAttribute('aria-hidden', 'false');
  await page.locator('#cs-btn-close').click();
  await expect(modal).toHaveAttribute('aria-hidden', 'true');
});
