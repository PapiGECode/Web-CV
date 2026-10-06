import {test,expect} from './fixtures.js';
import AxeBuilder from '@axe-core/playwright';

const communities=['EpicGames','Design-and-Code','Thread-Development','See-Bot','Open-Hub-Community','K1R4L-BS'];
for(const width of [320,390,768,1440]) for(const theme of ['dark','light']) {
  test(`editorial evidence and community index at ${width}px ${theme}`,async({page})=>{
    await page.setViewportSize({width,height:960});
    await page.emulateMedia({reducedMotion:'reduce',colorScheme:theme});
    await page.goto('/#skills');await page.waitForFunction(()=>window.__portfolioReady);
    const skills=page.locator('#skills');
    await expect(skills.locator('.cap-card')).toHaveCount(4);
    await expect(skills.locator('.cap-badge,.cap-stat-box,.cap-tags')).toHaveCount(0);
    await expect(skills).not.toContainText('YouTube Data API');
    await expect(skills.locator('a[href*=thiagoiutu-portfolio]')).toHaveCount(0);
    for(const name of communities) {
      const link=skills.locator(`.community-links a[href="https://github.com/${name}"]`);
      await expect(link).toBeVisible();
      const logo = link.locator('img');
      await logo.scrollIntoViewIfNeeded();
      await expect(logo).toHaveAttribute('alt', '');
      await expect(logo).toHaveAttribute('loading', 'lazy');
      await expect(logo).toHaveAttribute('decoding', 'async');
      await expect(logo).toHaveAttribute('src', new RegExp(`/assets/community-${name.toLowerCase()}\\.[a-f0-9]{12}\\.webp$`));
      await expect.poll(() => logo.evaluate(el => el.complete && el.naturalWidth === 96)).toBe(true);
      const logoBox = await logo.boundingBox();
      expect(logoBox.width).toBe(40);
      expect(logoBox.height).toBe(40);
      expect((await link.boundingBox()).height).toBeGreaterThanOrEqual(44);
    }
    const first=skills.locator('.cap-card').first();
    await first.scrollIntoViewIfNeeded();
    expect(await first.evaluate(el=>getComputedStyle(el).opacity)).toBe('1');
    const box=await first.boundingBox();await first.hover();
    expect((await first.boundingBox()).y).toBe(box.y);
    await expect(first).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
    await page.screenshot({path:`review-reports/editorial-evidence-${width}-${theme}.png`});
    await skills.locator('.community-index').scrollIntoViewIfNeeded();
    await page.screenshot({path:`review-reports/community-${width}-${theme}.png`});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const audit=await new AxeBuilder({page}).include('#skills').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(audit.violations.filter(v=>['serious','critical'].includes(v.impact))).toEqual([]);
  });
}

test('editorial evidence and membership links remain readable without JavaScript',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:900}});
  const page=await context.newPage();await page.goto(process.env.TEST_BASE_URL||'http://localhost:3000');
  await expect(page.locator('.community-links a')).toHaveCount(6);
  await page.locator('.community-links').scrollIntoViewIfNeeded();
  for (const logo of await page.locator('.community-links img').all()) {
    await expect.poll(() => logo.evaluate(el => el.complete && el.naturalWidth === 96)).toBe(true);
  }
  expect(await page.locator('.cap-card').evaluateAll(rows=>rows.map(el=>getComputedStyle(el).opacity))).toEqual(['1','1','1','1']);
  await page.locator('#skills a[href="/projects/thiagoiutu"]').click();
  await expect(page.locator('h1')).toHaveText('ThiagoIUTU');
  await context.close();
});
