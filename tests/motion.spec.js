import { test, expect, stubKiCord } from './fixtures.js';

async function ready(page) {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.waitForFunction(() => window.__portfolioReady);
}
async function countClicks(control) {
  await control.evaluate(el => {
    el.dataset.clicks = '0';
    el.addEventListener('click', event => {
      event.preventDefault(); event.stopImmediatePropagation();
      el.dataset.clicks = String(Number(el.dataset.clicks) + 1);
    }, true);
  });
}
async function position(control) {
  return control.evaluate(el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y }; });
}

test('magnetic surface freezes across long edge presses and native release without synthetic drag clicks', async ({ page }) => {
  await ready(page);
  const button = page.locator('.hero-actions .btn').first();
  await button.scrollIntoViewIfNeeded(); await countClicks(button);
  for (const edge of [.01, .99]) {
    await button.evaluate(el => el.blur());
    const initial = await button.boundingBox();
    await page.mouse.move(initial.x + initial.width * edge, initial.y + initial.height * .6);
    await page.waitForTimeout(300);
    const moved = await button.boundingBox();
    await page.mouse.move(moved.x + moved.width * edge, moved.y + moved.height * .6);
    await page.mouse.down();
    const held = await position(button);
    await page.waitForTimeout(500);
    expect(await position(button)).toEqual(held);
    await page.mouse.up();
  }
  await expect(button).toHaveAttribute('data-clicks', '2');
  const box = await button.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down(); await page.mouse.move(box.x + box.width + 80, box.y); await page.mouse.up();
  await expect(button).toHaveAttribute('data-clicks', '2');
});

test('bento edge clicks and contact/evidence entrance hit areas remain stationary', async ({ page }) => {
  await ready(page);
  const link = page.locator('.bento-btn-link').first();
  await link.scrollIntoViewIfNeeded(); await countClicks(link);
  const box = await link.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height - 1);
  await page.mouse.down(); const held = await position(link);
  await page.waitForTimeout(700); expect(await position(link)).toEqual(held);
  await page.mouse.up(); await expect(link).toHaveAttribute('data-clicks', '1');
  for (const selector of ['.cap-card', '.socials .social', '.form .f-field', '.form .f-submit']) {
    const item = page.locator(selector).first(); await item.scrollIntoViewIfNeeded();
    expect(await item.evaluate(el => Number(gsap.getProperty(el, 'y')))).toBe(0);
  }
});

test('keyboard and live reduced motion reset whole-button magnetism safely', async ({ page }) => {
  await ready(page);
  const button = page.locator('.hero-actions .btn').first();
  await button.scrollIntoViewIfNeeded(); await countClicks(button);
  const box = await button.boundingBox();
  await page.mouse.move(box.x + box.width * .8, box.y + box.height * .7);
  await page.waitForTimeout(350);
  expect(await button.evaluate(el => Number(gsap.getProperty(el, 'x')))).toBeGreaterThan(1);
  await button.focus(); await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('data-clicks', '1');
  expect(await button.evaluate(el => Number(gsap.getProperty(el, 'x')))).toBe(0);
  await button.evaluate(el => el.blur()); await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.mouse.move(box.x + box.width * .7, box.y + box.height * .7);
  await page.waitForTimeout(350);
  expect(await button.evaluate(el => Number(gsap.getProperty(el, 'x')))).toBe(0);
});

test('touch activation stays native and stationary', async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  try {
    await stubKiCord(context); const page = await context.newPage();
    await page.goto(process.env.TEST_BASE_URL || 'http://localhost:3000');
    await page.waitForFunction(() => window.__portfolioReady);
    const button = page.locator('.hero-actions .btn').first();
    await button.scrollIntoViewIfNeeded(); await countClicks(button); const before = await position(button);
    await button.tap(); await expect(button).toHaveAttribute('data-clicks', '1');
    expect(await position(button)).toEqual(before);
  } finally { await context.close(); }
});

test('marquee eases velocity without phase reset; stars, offscreen and live reduced motion follow it', async ({ page }) => {
  await ready(page);
  const marquee = page.locator('.marquee'); await marquee.scrollIntoViewIfNeeded();
  const state = () => marquee.evaluate(el => el.getAnimations({ subtree: true }).map(a => ({ name: a.animationName || 'travel', rate: a.playbackRate, time: a.currentTime, state: a.playState })));
  await page.mouse.move(0, 0); await page.waitForTimeout(950);
  const running = await state();
  expect(running.find(a => a.name === 'travel').rate).toBe(1);
  expect(running.filter(a => a.name === 'marquee-star').length).toBeGreaterThan(0);
  await marquee.hover(); await page.waitForTimeout(120);
  const slowing = (await state()).find(a => a.name === 'travel');
  expect(slowing.rate).toBeGreaterThan(0); expect(slowing.rate).toBeLessThan(1);
  expect(slowing.time).toBeGreaterThan(running.find(a => a.name === 'travel').time);
  await page.waitForTimeout(850); const stopped = await state();
  expect(stopped.every(a => a.rate === 0)).toBe(true);
  await page.mouse.move(0, 0); await page.waitForTimeout(120);
  const resuming = (await state()).find(a => a.name === 'travel');
  expect(resuming.rate).toBeGreaterThan(0); expect(resuming.rate).toBeLessThan(1);
  expect(resuming.time).toBeGreaterThanOrEqual(stopped.find(a => a.name === 'travel').time);
  // Decorative, aria-hidden marquee has no added tab stop; future focusable content can also stop it.
  await marquee.dispatchEvent('focusin'); await page.waitForTimeout(900);
  expect((await state()).every(a => a.rate === 0)).toBe(true);
  await marquee.dispatchEvent('focusout'); await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(100);
  expect((await state()).every(a => a.state === 'paused')).toBe(true);
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await page.waitForTimeout(950);
  expect((await state()).find(a => a.name === 'travel').rate).toBe(1);
  await page.locator('#contact').scrollIntoViewIfNeeded(); await page.waitForTimeout(100);
  expect((await state()).every(a => a.state === 'paused')).toBe(true);
});

test('canonical and freshly mounted modal buttons share whole-surface feedback', async ({ page }) => {
  await ready(page);
  for (const modal of [true, false]) {
    if (modal) await page.locator('.panel-title a').first().click();
    else await page.goto('/projects/kicord');
    const button = page.locator(modal ? '#cs-content .pp-actions .btn' : '.pp-actions .btn').first();
    await button.scrollIntoViewIfNeeded(); const before = await button.boundingBox();
    await page.mouse.move(before.x + before.width * .8, before.y + before.height * .7);
    await page.waitForTimeout(350);
    expect((await button.boundingBox()).x - before.x).toBeGreaterThan(1);
    if (modal) await page.keyboard.press('Escape');
  }
});
