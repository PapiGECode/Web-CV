import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
const captures = 'review-reports';
async function load(page, path = '/') {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  if (path === '/') await page.waitForFunction(() => window.__portfolioReady);
  await expect(page.locator('h1').first()).toBeVisible();
  expect(errors).toEqual([]);
}
async function capture(page, name) { await fs.mkdir(captures, { recursive: true }); await page.screenshot({ path: `${captures}/${name}.png` }); }
for (const size of [320, 390, 768, 1440]) {
  test(`layout at ${size}px: home, projects and contact`, async ({ page }) => {
    await page.setViewportSize({ width: size, height: size > 1000 ? 960 : 844 });
    await page.emulateMedia({ colorScheme: size === 1440 ? 'dark' : 'light', reducedMotion: 'reduce' });
    await load(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await capture(page, `home-${size}`);
    await page.evaluate(() => scrollTo(0, document.querySelector('#work').offsetTop - 90));
    await capture(page, `work-${size}`);
    await page.evaluate(() => scrollTo(0, document.querySelector('#contact').offsetTop - 90));
    await expect(page.locator('#contact-form')).toBeVisible();
    await capture(page, `contact-${size}`);
    for (const slug of ['kicord', 'papigegamer', 'kernelos']) {
      await load(page, '/projects/' + slug);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect(page.locator('h1')).toBeVisible();
    }
    await capture(page, `project-${size}`);
  });
}
test('theme persists across project routes', async ({ page }) => {
  await load(page); const previous = await page.locator('html').getAttribute('class');
  await page.locator('#theme-toggle').click();
  expect(await page.locator('html').getAttribute('class')).not.toBe(previous);
  const theme = await page.evaluate(() => localStorage.getItem('ps-theme'));
  await load(page, '/projects/papigegamer');
  expect(await page.locator('html').evaluate(el => el.classList.contains('light'))).toBe(theme === 'light');
});
test('menu: native scroll lock, keyboard trap, Escape, resize', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await load(page);
  await page.locator('#nav-burger').click();
  await expect(page.locator('#nav-burger')).toHaveAttribute('aria-expanded', 'true');
  expect(await page.locator('#main').evaluate(el => el.inert)).toBe(true);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe('hidden');
  await page.locator('#nav-overlay a').last().focus(); await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement.closest('#nav') !== null)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.locator('#nav-burger')).toBeFocused();
  expect(await page.locator('#main').evaluate(el => el.inert)).toBe(false);
  await page.locator('#nav-burger').click();
  await page.setViewportSize({ width: 1200, height: 900 });
  await expect(page.locator('#nav-burger')).toHaveAttribute('aria-expanded', 'false');
});
test('skip navigation transfers keyboard focus', async ({ page }) => {
  await load(page); await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter'); await expect(page.locator('#main')).toBeFocused();
});
test('case study is keyboard accessible and history closes/reopens correctly', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await load(page);
  const trigger = page.locator('.panel-title a').first(); await trigger.focus(); await page.keyboard.press('Enter');
  const modal = page.locator('#case-study-modal');
  await expect(modal).toHaveAttribute('aria-hidden', 'false');
  await expect(page.locator('#cs-btn-close')).toBeFocused();
  expect(await page.locator('#main').evaluate(el => el.inert)).toBe(true);
  await page.keyboard.press('Escape'); await expect(modal).toHaveAttribute('aria-hidden', 'true');
  await expect(trigger).toBeFocused();
  await page.goForward(); await expect(modal).toHaveAttribute('aria-hidden', 'false');
  await page.locator('#cs-btn-back').click(); await expect(modal).toHaveAttribute('aria-hidden', 'true');
});
async function fillContact(page) {
  await page.locator('#name').fill('Prueba de calidad');
  await page.locator('#email').fill('test@example.com');
  await page.locator('#message').fill('Mensaje de prueba de interfaz. No se envía a ningún destinatario real.');
}
test('manual contact fallback does not claim delivery', async ({ page }) => {
  await page.route('**/api/contact', route => route.fulfill({ json: { available: false } }));
  await page.emulateMedia({ reducedMotion: 'reduce' }); await load(page);
  await page.locator('#contact-form [type=submit]').click();
  await expect(page.locator('#name')).toHaveAttribute('aria-invalid', 'true');
  await fillContact(page); await page.locator('#contact-form [type=submit]').click();
  await expect(page.locator('#mail-draft')).toBeVisible();
  await expect(page.locator('#form-ok')).toContainText('Borrador listo');
  await expect(page.locator('#message')).not.toHaveValue('');
});
test('contact provider success/failure states use mocked transport', async ({ page }) => {
  let accepted = false;
  await page.route('**/api/contact', route => {
    if (route.request().method() === 'GET') return route.fulfill({ json: { available: true } });
    return accepted ? route.fulfill({ json: { ok: true, mode: 'sent', id: 'mock-only' } }) : route.fulfill({ status: 502, json: { ok: false, error: 'No se ha confirmado el envío.' } });
  });
  await page.emulateMedia({ reducedMotion: 'reduce' }); await load(page); await fillContact(page);
  await page.locator('#contact-form [type=submit]').click();
  await expect(page.locator('#form-ok')).toContainText('no se ha perdido');
  await expect(page.locator('#message')).not.toHaveValue('');
  accepted = true; await page.locator('#contact-form [type=submit]').click();
  await expect(page.locator('#form-ok')).toContainText('Mensaje enviado');
  await expect(page.locator('#message')).toHaveValue('');
});
test('measurement default off; consent can be enabled and revoked', async ({ page }) => {
  const events = [];
  await page.route('**/api/metrics', route => { events.push(route.request().postDataJSON()); return route.fulfill({ status: 204 }); });
  await load(page, '/projects/kicord'); await page.waitForTimeout(300); expect(events).toHaveLength(0);
  await page.locator('[data-open-preferences]').click(); await page.locator('#allow-measurement').check();
  await page.locator('#save-preferences').click(); await expect.poll(() => events.length).toBeGreaterThan(0);
  expect(events[0]).toEqual({ kind: 'event', name: 'page_view', path: '/projects/kicord' });
  await page.locator('[data-open-preferences]').click(); await page.locator('#allow-measurement').uncheck(); await page.locator('#save-preferences').click();
  const count = events.length;
  await page.evaluate(() => dispatchEvent(new CustomEvent('portfolio:event', { detail: 'contact_sent' })));
  await page.waitForTimeout(300); expect(events).toHaveLength(count);
});
test('no JavaScript: content, project links, CV and email still work', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false }); const page = await context.newPage();
  await page.goto(process.env.TEST_BASE_URL || 'http://localhost:3000');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.bento-card')).toHaveCount(7);
  await expect(page.locator('a[download]').first()).toBeVisible();
  await page.locator('.panel-title a').first().click(); await expect(page).toHaveURL(/projects\/kicord/);
  await context.close();
});
test('404 and published resources', async ({ request, page }) => {
  expect((await request.get('/not-a-page-quality-check')).status()).toBe(404);
  await load(page); const resources = await page.locator('script[src],link[rel=stylesheet]').evaluateAll(els => els.map(e => e.src || e.href));
  for (const resource of resources) expect((await request.get(resource)).status()).toBe(200);
});
test('accessibility audit of project and open preferences', async ({ page }) => {
  await load(page, '/projects/papigegamer');
  const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  await fs.mkdir(captures, { recursive: true }); await fs.writeFile(`${captures}/axe-project.json`, JSON.stringify(audit.violations, null, 2));
  expect(audit.violations.filter(v => v.impact === 'critical' || v.impact === 'serious')).toEqual([]);
  await page.locator('[data-open-preferences]').click();
  const dialog = await new AxeBuilder({ page }).include('#preferences-dialog').withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(dialog.violations.filter(v => v.impact === 'critical' || v.impact === 'serious')).toEqual([]);
});
