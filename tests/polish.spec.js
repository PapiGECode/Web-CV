import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';

async function openPortfolio(page, reduce = true) {
  await page.emulateMedia({ reducedMotion: reduce ? 'reduce' : 'no-preference', colorScheme: 'dark' });
  await page.route('**/api/contact', route => route.fulfill({ json: { available: false } }));
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => window.__portfolioReady === true);
}

for (const width of [390, 1440]) {
  test(`polish preserves hero and footer composition at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width > 1000 ? 960 : 844 });
    await openPortfolio(page);
    await expect(page.locator('h1.hero-name')).toHaveAttribute('aria-label', 'Pablo Schefer');
    await expect(page.locator('h1 .hero-line')).toHaveCount(2);
    await expect(page.locator('#foot-word')).toHaveText('Pablo');
    await expect(page.locator('.foot-grid .foot-col')).toHaveCount(2);
    await expect(page.locator('#orbit-canvas')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await fs.mkdir('review-reports', { recursive: true });
    await page.screenshot({ path: `review-reports/polished-hero-${width}.png` });
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    if (width < 681) {
      const heights = await page.locator('footer .foot-col a').evaluateAll(links => links.map(a => a.getBoundingClientRect().height));
      expect(heights.every(h => h >= 44)).toBe(true);
    }
    await page.screenshot({ path: `review-reports/polished-footer-${width}.png` });
    const margins = await page.locator('#nav').evaluate(nav => {
      const logo = nav.querySelector('.nav-logo').getBoundingClientRect();
      const bg = nav.querySelector('.nav-bg').getBoundingClientRect();
      return { left: logo.left - bg.left, right: bg.right - nav.querySelector('.nav-actions').getBoundingClientRect().right };
    });
    expect(margins.left).toBeGreaterThan(5);
    expect(margins.right).toBeGreaterThan(5);
  });
}

test('contact draft controls have designed states in both themes at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await openPortfolio(page);
  await page.locator('#name').fill('Prueba visual');
  await page.locator('#email').fill('test@example.com');
  await page.locator('#message').fill('Esto es una prueba visual local. No se envía ningún correo.');
  await page.locator('#contact-form [type=submit]').click();
  await expect(page.locator('#mail-draft')).toBeVisible();
  await expect(page.locator('#form-ok')).toContainText('Borrador listo');
  for (const theme of ['dark', 'light']) {
    if (theme === 'light') await page.locator('#theme-toggle').click();
    for (const selector of ['#copy-message', '#mail-draft']) {
      const style = await page.locator(selector).evaluate(el => ({ height: el.getBoundingClientRect().height, radius: getComputedStyle(el).borderRadius, border: getComputedStyle(el).borderTopWidth }));
      expect(style.height).toBeGreaterThanOrEqual(44);
      expect(style.radius).toBe('999px');
      expect(style.border).toBe('1px');
    }
    await page.locator('#contact-form').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `review-reports/polished-form-320-${theme}.png` });
    const audit = await new AxeBuilder({ page }).include('#contact').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(audit.violations.filter(v => ['critical', 'serious'].includes(v.impact))).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('magnetic feedback never translates the hero button hit area', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await openPortfolio(page, false);
  const button = page.locator('.hero-actions .btn').first();
  await button.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  const before = await button.boundingBox();
  await page.mouse.move(before.x + before.width * .8, before.y + before.height * .7);
  await page.waitForTimeout(350);
  const after = await button.boundingBox();
  expect(Math.abs(after.x - before.x)).toBeLessThan(.6);
  expect(Math.abs(after.y - before.y)).toBeLessThan(.6);
  expect(await button.evaluate(el => Math.abs(gsap.getProperty(el.querySelector('.btn-t'), 'x')))).toBeLessThanOrEqual(5.1);
});

test('modified anchor clicks remain native and do not swallow browser shortcuts', async ({ page }) => {
  await openPortfolio(page);
  const prevented = await page.locator('.hero-actions a[href="#work"]').evaluate(link => {
    return ['ctrlKey', 'metaKey', 'shiftKey', 'altKey'].map(key => {
      let result;
      document.addEventListener('click', event => { result = event.defaultPrevented; event.preventDefault(); }, { once: true });
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, [key]: true }));
      return result;
    });
  });
  expect(prevented).toEqual([false, false, false, false]);
});

test('active navigation exposes one current section and keeps its indication through Now', async ({ page }) => {
  await openPortfolio(page);
  for (const id of ['work', 'about', 'skills']) {
    await page.evaluate(id => scrollTo(0, document.getElementById(id).offsetTop), id);
    await expect(page.locator(`.nav-link[href="#${id}"]`)).toHaveAttribute('aria-current', 'location');
    await expect(page.locator('.nav-link[aria-current]')).toHaveCount(1);
  }
  await page.evaluate(() => scrollTo(0, document.getElementById('now').offsetTop));
  await expect(page.locator('.nav-link[href="#skills"]')).toHaveAttribute('aria-current', 'location');
});

test('project title and action remain clickable with existing scroll animation enabled', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 960 });
  await openPortfolio(page, false);
  await page.locator('.panel-title a').first().click();
  await expect(page.locator('#case-study-modal')).toHaveAttribute('aria-hidden', 'false');
  await page.keyboard.press('Escape');
  await expect(page.locator('#case-study-modal')).toHaveAttribute('aria-hidden', 'true');
  expect(errors).toEqual([]);
});
