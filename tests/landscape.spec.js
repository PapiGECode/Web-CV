import { test, expect } from './fixtures.js';
import AxeBuilder from '@axe-core/playwright';

const keys = ['kicord', 'portfolio', 'kernelos', 'thiagoiutu', 'papigegamer-web'];
async function openView(page, key) {
  const root = page.locator(`[data-live-landscape="${key}"]`);
  await root.scrollIntoViewIfNeeded();
  await expect(root.locator('iframe')).toHaveCount(1);
  const frame = await (await root.locator('iframe').elementHandle()).contentFrame();
  await expect(frame.locator('h1')).toBeVisible();
  return { root, frame };
}
async function expectFit(root) {
  await expect.poll(() => root.evaluate(el => {
    const box = el.getBoundingClientRect(), frame = el.querySelector('iframe').getBoundingClientRect();
    return ['top', 'right', 'bottom', 'left'].every(edge => Math.abs(box[edge] - frame[edge]) < 1.5);
  })).toBe(true);
}

for (const width of [320, 390, 768, 1440]) for (const theme of ['dark', 'light']) {
  test(`five live landscape views fit ${width}px ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: theme });
    await page.goto('/');
    await page.waitForFunction(() => window.__portfolioReady);
    await expect(page.locator('[data-live-landscape]')).toHaveCount(5);
    await expect(page.locator('[data-live-landscape] template')).toHaveCount(5);
    await expect(page.locator('#work iframe')).toHaveCount(0);
    await expect(page.locator('#work .phone-bezel, #work [data-project-phone]')).toHaveCount(0);
    await expect(page.locator('.project-art-thiago-community img')).toHaveCount(1);
    for (const key of keys) {
      const { root, frame } = await openView(page, key);
      expect(await frame.evaluate(() => innerWidth)).toBe(1100);
      await expectFit(root);
      await expect(root).not.toHaveAttribute('aria-hidden');
      await expect(root).toHaveCSS('overflow', 'hidden');
      const fallback = root.locator('..').locator('.landscape-external');
      await expect(fallback).toBeVisible();
      expect((await fallback.boundingBox()).height).toBeGreaterThanOrEqual(44);
      expect((await fallback.boundingBox()).y).toBeGreaterThanOrEqual((await root.boundingBox()).y + (await root.boundingBox()).height);
      await fallback.focus();
      await expect(fallback).toBeFocused();
      await root.locator('..').screenshot({ path: `review-reports/landscape-${key}-${width}-${theme}.png` });
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const audit = await new AxeBuilder({ page }).include('#work').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(audit.violations.filter(v => ['serious', 'critical'].includes(v.impact))).toEqual([]);
  });
}

test('without JavaScript the five views remain inert with permanent external links', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(process.env.TEST_BASE_URL || 'http://localhost:3000');
    await expect(page.locator('iframe')).toHaveCount(0);
    await expect(page.locator('.landscape-external')).toHaveCount(5);
    for (const link of await page.locator('.landscape-external').all()) {
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  } finally { await context.close(); }
});

for (const theme of ['dark', 'light']) {
  test(`live previews gain desktop width without changing mobile or bot artwork in ${theme}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: theme });
    await page.goto('/');
    await page.waitForFunction(() => window.__portfolioReady);
    await page.evaluate(() => document.fonts.ready);
    for (const width of [320, 390, 768, 899, 900, 901, 1024, 1440]) {
      await page.setViewportSize({ width, height: 960 });
      const geometry = await page.locator('.work-entry').evaluateAll(rows => rows.map(row => {
        const art = row.querySelector('.project-art');
        const layout = row.querySelector('.work-layout');
        const info = row.querySelector('.panel-info');
        const box = element => {
          const { x, y, width, height } = element.getBoundingClientRect();
          return { x, y, width, height };
        };
        const style = getComputedStyle(layout);
        return {
          live: Boolean(art.dataset.liveLandscape), art: box(art), info: box(info),
          innerWidth: layout.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
          textFits: info.scrollWidth <= info.clientWidth + 1,
          radius: parseFloat(getComputedStyle(art).borderTopLeftRadius),
        };
      }));
      expect(geometry.filter(row => row.live)).toHaveLength(5);
      for (const [index, row] of geometry.entries()) {
        expect(row.textFits).toBe(true);
        expect(row.radius).toBeGreaterThanOrEqual(16);
        if (width <= 900) {
          expect(row.art.width).toBeCloseTo(row.innerWidth, 0);
          expect(row.art.y).toBeGreaterThanOrEqual(row.info.y + row.info.height);
        } else {
          expect(row.art.width / row.info.width).toBeCloseTo(row.live ? 1.3 : 1.1, 2);
          expect(row.info.width).toBeGreaterThan(300);
          expect(row.art.x < row.info.x).toBe(index % 2 === 1);
        }
        if (width === 1440) {
          // The previous 558.19px displays grow horizontally, not into taller panels.
          if (row.live) {
            expect(row.art.width).toBeGreaterThan(558.19 * 1.1);
            expect(row.art.height).toBeGreaterThan(400);
            expect(row.art.height).toBeLessThan(420);
          } else {
            expect(row.art.width).toBeCloseTo(558.19, 1);
            expect(row.art.height).toBeCloseTo(413.47, 1);
          }
        }
      }
      const title = page.locator('#work-portfolio');
      await expect(title).toHaveText('PabloSchefer.com');
      await expect(title.locator('a > span')).toHaveText(['PabloSchefer', '.com']);
      expect(await title.evaluate(el => [...el.querySelectorAll('span')].every(span => {
        const text = span.getBoundingClientRect(), heading = el.getBoundingClientRect();
        return text.left >= heading.left - 1 && text.right <= heading.right + 1;
      }))).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}
