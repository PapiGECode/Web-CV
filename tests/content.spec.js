import { test, expect, stubKiCord } from './fixtures.js';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';

async function ready(page, motion = 'no-preference', scheme = 'dark', path = '/') {
  await page.emulateMedia({ reducedMotion: motion, colorScheme: scheme });
  await page.route('**/api/contact', r => r.fulfill({ json: { available: false } }));
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  if (path.startsWith('/#') || path === '/') await page.waitForFunction(() => window.__portfolioReady);
}
for (const width of [390, 1440]) {
  for (const theme of ['dark', 'light']) {
    test(`evidence is fully visible with animation at ${width}px ${theme}`, async ({ page }) => {
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      await page.setViewportSize({ width, height: 960 });
      await ready(page, 'no-preference', theme, '/#skills');
      const cards = page.locator('#skills .cap-card');
      await expect(cards).toHaveCount(4);
      for (let i = 0; i < 4; i++) {
        await cards.nth(i).scrollIntoViewIfNeeded();
        await page.waitForTimeout(750);
        const style = await cards.nth(i).evaluate(el => ({ opacity: getComputedStyle(el).opacity, bg: getComputedStyle(el).backgroundColor }));
        expect(style.opacity).toBe('1'); expect(style.bg).not.toBe('rgba(0, 0, 0, 0)');
      }
      // Going back and toggling themes must not leave an opacity value behind.
      await cards.first().scrollIntoViewIfNeeded();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const audit = await new AxeBuilder({ page }).include('#skills').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      await fs.mkdir('review-reports', { recursive: true });
      await fs.writeFile(`review-reports/evidence-axe-${width}-${theme}.json`, JSON.stringify(audit.violations, null, 2));
      expect(audit.violations.filter(v => ['serious','critical'].includes(v.impact))).toEqual([]);
      await page.screenshot({ path: `review-reports/evidence-${width}-${theme}.png` });
      expect(errors).toEqual([]);
    });
  }
}

test('evidence survives absent JS and reduced motion', async ({ browser, page }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await stubKiCord(context); const p = await context.newPage(); await p.goto(process.env.TEST_BASE_URL || 'http://localhost:3000');
  const opacities = await p.locator('.cap-card').evaluateAll(cards => cards.map(c => getComputedStyle(c).opacity));
  expect(opacities).toEqual(['1','1','1','1']);
  await context.close();
  await ready(page, 'reduce');
  expect(await page.locator('.cap-card').evaluateAll(cards => cards.map(c => getComputedStyle(c).opacity))).toEqual(['1','1','1','1']);
});

test('featured project facts agree across cards, modals and canonical pages', async ({ page }) => {
  await ready(page, 'reduce');
  const panels = page.locator('.stack .panel');
  await expect(panels.nth(0)).toContainText('Código cerrado');
  await expect(panels.nth(0)).not.toContainText('Open Source');
  await expect(panels.nth(1)).toContainText('Esta misma web');
  await expect(panels.nth(1)).toContainText('HTML');
  await expect(panels.nth(2)).toContainText('ISO personalizada de Windows');
  await expect(page.locator('#work')).not.toContainText('NEXO');
  for (const [i,title,text] of [[0,'KiCord','código cerrado'],[1,'PabloSchefer.com','esta misma web'],[2,'KernelOS','ISO personalizada de Windows']]) {
    await page.locator('.panel-title a').nth(i).click();
    await expect(page.locator('#case-study-modal')).toHaveAttribute('aria-hidden', 'false');
    await expect(page.locator('#cs-top-name')).toHaveText(title);
    await expect(page.locator('#cs-content')).toContainText(text);
    await page.keyboard.press('Escape');
    await expect(page.locator('#case-study-modal')).toHaveAttribute('aria-hidden', 'true');
  }
  for (const [slug,text] of [['kicord','código cerrado'],['portfolio','esta misma web'],['kernelos','no como un sistema operativo creado por mí']]) {
    await page.goto('/projects/'+slug); await expect(page.locator('main')).toContainText(text);
  }
  await page.goto('/projects/papigegamer'); await expect(page).toHaveURL(/\/projects\/portfolio$/);
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href','https://www.pabloschefer.com/projects/portfolio');
});

test('curated public collaborations replace filler and preserve the bento layout', async ({ page }) => {
  await ready(page, 'reduce');
  await expect(page.locator('.bento-card')).toHaveCount(3);
  for (const repo of ['thiagoiutu-portfolio','KiCord-DOOM-Plugin','duolingo-streak-keeper']) {
    await expect(page.locator(`.bento-card a[href="https://github.com/PapiGECode/${repo}"]`)).toHaveCount(1);
  }
  await expect(page.locator('.bento-card')).not.toContainText(['github-achievements-lab','project-vi-technical-archive','History-commits']);
  await page.locator('#bento-projects-grid').scrollIntoViewIfNeeded();
  await page.screenshot({path:'review-reports/collaborations.png'});
});

test('contact keeps one copy-email action in context and no copy-message control', async ({ page }) => {
  await page.setViewportSize({width:390,height:844}); await ready(page,'reduce');
  await expect(page.locator('#copy-message')).toHaveCount(0);
  await expect(page.locator('footer [data-copy-email]')).toHaveCount(0);
  await expect(page.locator('#contact [data-copy-email]')).toHaveCount(1);
  await expect(page.locator('footer .site-tools > *')).toHaveCount(3);
  const copied=[]; await page.exposeFunction('testCopy', t=>copied.push(t));
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:window.testCopy}}));
  await page.locator('#contact [data-copy-email]').click();
  await expect.poll(()=>copied[0]).toBe('pablopme50@gmail.com');
  await expect(page.locator('#mail-draft')).toBeHidden();
  await page.locator('#name').fill('Prueba de interfaz'); await page.locator('#email').fill('test@example.com');
  await page.locator('#message').fill('Prueba local del borrador. No se envía correo real.');
  await page.locator('#contact-form [type=submit]').click();
  await expect(page.locator('#mail-draft')).toBeVisible();
  await expect(page.locator('#mail-draft')).toHaveAttribute('href',/^mailto:pablopme50@gmail.com\?/);
  await expect(page.locator('#form-ok')).toContainText('Borrador listo');
  await page.screenshot({path:'review-reports/contact-clean-390.png'});
  await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));
  await expect(page.locator('#foot-word')).toHaveText('Pablo');
  await expect(page.locator('.foot-grid .foot-col')).toHaveCount(2);
  await page.screenshot({path:'review-reports/footer-clean-390.png'});
});
