import { test, expect } from './fixtures.js';
import { projects } from '../content/projects.mjs';

for (const project of projects) test(`${project.slug}: canonical and modal content agree`, async ({ page, request }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/projects/' + project.slug);
  await expect(page.locator('h1')).toHaveText(project.title);
  await expect(page.locator('iframe')).toHaveCount(0);
  if (project.phone) await expect(page.locator('.project-demo')).not.toHaveAttribute('open', '');
  await expect(page.locator('main')).toContainText(project.role);
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://www.pabloschefer.com/projects/${project.slug}`);
  const response = await request.get('/projects/' + project.slug);
  expect(await response.text()).toContain(project.overview);
  await page.goto('/#case-study-' + project.id);
  await page.waitForFunction(() => window.__portfolioReady);
  await expect(page.locator('#case-study-modal')).toHaveAttribute('aria-hidden', 'false');
  await expect(page.locator('#cs-content')).toContainText(project.overview);
  await page.keyboard.press('Escape');
  await expect(page.locator('#case-study-modal')).toHaveAttribute('aria-hidden', 'true');
});

test('new work avoids unsupported public source links and preserves the historical redirect', async ({ page, request }) => {
  for (const slug of ['robleis','thiago-community','thiagoiutu']) {
    await page.goto('/projects/' + slug);
    await expect(page.locator('a[href*="github.com"]')).toHaveCount(0);
  }
  await page.goto('/projects/papigegamer');
  await expect(page).toHaveURL(/\/projects\/portfolio$/);
  await page.goto('/projects/papigegamer-web');
  await expect(page.locator('main')).toContainText('distinta de este portfolio');
  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const project of projects) expect(sitemap).toContain('/projects/' + project.slug);
});

for (const width of [320,390,768,1440]) for (const theme of ['dark','light']) {
  test(`editorial index is project-led at ${width}px in ${theme}`, async ({ page }) => {
    await page.setViewportSize({width,height:960});
    await page.emulateMedia({reducedMotion:'reduce',colorScheme:theme});
    await page.goto('/#work');
    await page.waitForFunction(() => window.__portfolioReady);
    await expect(page.locator('.work-entry')).toHaveCount(projects.length);
    await expect(page.locator('#work [data-project-phone], #work iframe')).toHaveCount(0);
    for (const project of projects) {
      const entry = page.locator('.work-entry').filter({has:page.locator(`#work-${project.slug}`)});
      await expect(entry).toContainText(project.role);
      await expect(entry.locator('.panel-title a')).toHaveAttribute('href','/projects/'+project.slug);
      await expect(entry.locator('.project-art')).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('.work-entry').first().scrollIntoViewIfNeeded();
    await page.screenshot({path:`review-reports/editorial-index-${width}-${theme}.png`});
    await page.locator('.panel-links [data-open-case=robleis]').click();
    await expect(page.locator('#cs-top-name')).toHaveText('Robleis');
    await page.keyboard.press('Escape');
    await expect(page.locator('.panel-links [data-open-case=robleis]')).toBeFocused();
  });
}

test('the complete project index remains navigable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({javaScriptEnabled:false});
  const page = await context.newPage();
  await page.goto(process.env.TEST_BASE_URL || 'http://localhost:3000');
  await expect(page.locator('.work-entry')).toHaveCount(projects.length);
  await page.locator('.panel-title a[data-open-case=thiagoiutu]').click();
  await expect(page.locator('h1')).toHaveText('ThiagoIUTU');
  await context.close();
});

test('every branded illustration decodes as an image in the production preview', async ({ page }) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  const images = page.locator('.project-index .project-art img');
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true);
  }
});

for (const theme of ['dark', 'light']) {
  test(`Thiago outlined lettering stays visible on every surface in ${theme}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: theme });
    const assertOutline = async (scope) => {
      const lettering = scope.locator('.project-art-thiagoiutu em');
      await expect(lettering).toBeVisible();
      await expect(lettering).toHaveCSS('-webkit-text-stroke-color', 'rgb(21, 25, 22)');
      await expect(lettering).toHaveCSS('-webkit-text-stroke-width', '1px');
      await expect(lettering).toHaveCSS('color', 'rgba(0, 0, 0, 0)');
    };
    await page.goto('/#work');
    await page.waitForFunction(() => window.__portfolioReady);
    await assertOutline(page.locator('.project-index'));
    await page.locator('.panel-title [data-open-case=thiagoiutu]').click();
    await assertOutline(page.locator('#cs-content'));
    await page.keyboard.press('Escape');
    await page.goto('/projects/thiagoiutu');
    await assertOutline(page.locator('main'));
    await page.locator('.project-art-thiagoiutu').screenshot({
      path: `review-reports/thiago-outline-${theme}.png`
    });
  });
}
