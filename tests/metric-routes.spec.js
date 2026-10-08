import { test, expect } from './fixtures.js';
import { projects } from '../content/projects.mjs';

async function captureMetrics(page) {
  const events = [];
  await page.route('**/api/metrics', route => {
    events.push(route.request().postDataJSON());
    return route.fulfill({ status: 204 });
  });
  return events;
}

for (const project of projects) test(`${project.slug}: consent enables only sanitized route metrics and revocation stops them`, async ({ page }) => {
  const events = await captureMetrics(page);
  const path = '/projects/' + project.slug;
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(path + '?private=test-value#overview');
  expect(events).toEqual([]);
  await page.locator('[data-open-preferences]').click();
  await page.locator('#allow-measurement').check();
  await page.locator('#save-preferences').click();
  await expect.poll(() => events.filter(event => event.name === 'page_view')).toEqual([{ kind: 'event', name: 'page_view', path }]);
  await page.evaluate(() => dispatchEvent(new CustomEvent('portfolio:event', { detail: 'contact_sent' })));
  await expect.poll(() => events.some(event => event.name === 'contact_sent')).toBe(true);
  for (const event of events) {
    expect(event.path).toBe(path);
    expect(Object.keys(event).sort()).toEqual(event.kind === 'vital' ? ['kind', 'name', 'path', 'value'] : ['kind', 'name', 'path']);
  }
  await page.locator('[data-open-preferences]').click();
  await page.locator('#allow-measurement').uncheck();
  await page.locator('#save-preferences').click();
  await page.evaluate(() => dispatchEvent(new CustomEvent('portfolio:event', { detail: 'contact_sent' })));
  await page.waitForTimeout(100);
  expect(events.filter(event => event.name === 'contact_sent')).toHaveLength(1);
});

test('persisted consent measures current canonical routes once per navigation', async ({ page }) => {
  const events = await captureMetrics(page);
  await page.addInitScript(() => localStorage.setItem('ps-measurement', 'yes'));
  for (const project of projects) {
    const path = '/projects/' + project.slug;
    await page.goto(path);
    await expect.poll(() => events.filter(event => event.name === 'page_view' && event.path === path).length).toBe(1);
    await page.evaluate(() => dispatchEvent(new Event('portfolio:consent')));
  }
  expect(events.filter(event => event.name === 'page_view')).toHaveLength(projects.length);
});

for (const exclusion of ['doNotTrack', 'globalPrivacyControl', 'phone-preview']) test(`all case routes still suppress metrics under ${exclusion}`, async ({ page }) => {
  const events = await captureMetrics(page);
  await page.addInitScript(exclusion => {
    localStorage.setItem('ps-measurement', 'yes');
    if (exclusion !== 'phone-preview') Object.defineProperty(navigator, exclusion, { get: () => exclusion === 'doNotTrack' ? '1' : true });
  }, exclusion);
  for (const project of projects) {
    await page.goto('/projects/' + project.slug + (exclusion === 'phone-preview' ? '?phone-preview=1' : ''));
    await page.evaluate(() => {
      dispatchEvent(new Event('portfolio:consent'));
      dispatchEvent(new CustomEvent('portfolio:event', { detail: 'contact_sent' }));
    });
  }
  expect(events).toEqual([]);
});
