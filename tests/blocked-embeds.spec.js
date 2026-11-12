import { test, expect } from './fixtures.js';
import AxeBuilder from '@axe-core/playwright';
for (const width of [320,390,768,1440]) for (const theme of ['dark','light']) {
  test(`KernelOS local tour is interactive, honest and isolated ${width} ${theme}`, async ({page}) => {
    await page.setViewportSize({width,height:960});
    await page.emulateMedia({reducedMotion:'reduce',colorScheme:theme});
    const remote=[];
    page.on('request',r=>{if (/^https:\/\/(www\.)?kernelos\.org/.test(r.url())) remote.push(r.url());});
    await page.goto('/');
    const root=page.locator('[data-live-landscape=kernelos]');
    await root.scrollIntoViewIfNeeded();
    const iframe=root.locator('iframe');
    await expect(iframe).toHaveAttribute('src','/demos/kernelos');
    await expect(iframe).toHaveAttribute('sandbox','allow-scripts allow-popups allow-popups-to-escape-sandbox');
    const frame=await(await iframe.elementHandle()).contentFrame();
    await expect(frame.locator('.notice')).toContainText('No es la web oficial');
    await frame.locator('nav a[href="#soporte"]').press('Enter');
    await expect(frame.locator('#soporte')).toBeInViewport();
    const detail=frame.locator('#soporte details').first();
    await detail.locator('summary').press('Enter');
    await expect(detail).toHaveAttribute('open','');
    await expect(detail.locator('p')).toBeVisible();
    await expect(root.locator('..')).toContainText('Recorrido local interactivo');
    const external=root.locator('..').locator('.landscape-external');
    await expect(external).toHaveAttribute('href','https://kernelos.org/');
    expect((await external.boundingBox()).height).toBeGreaterThanOrEqual(44);
    expect(remote).toEqual([]);
    expect(await frame.evaluate(()=>{try {return !!parent.document.body;}catch{return false;}})).toBe(false);
    await root.screenshot({path:`review-reports/kernelos-tour-${width}-${theme}.png`});
    const audit=await new AxeBuilder({page}).include('#work').analyze();
    expect(audit.violations.filter(v=>['serious','critical'].includes(v.impact))).toEqual([]);
  });
}
for (const key of ['kicord','kernelos']) test(`${key} case demos stay inert until disclosed`,async({page})=>{
  await page.goto('/projects/'+key);
  await expect(page.locator('iframe')).toHaveCount(0);
  await page.locator('.project-demo summary').click();
  await page.locator('[data-live-phone]').scrollIntoViewIfNeeded();
  await expect(page.locator('iframe')).toHaveCount(1);
  await expect(page.locator('.pp-actions a[target=_blank]')).toBeVisible();
});
test('without JS all projects retain real external links; local tour disclosures work',async({browser})=>{
  const ctx=await browser.newContext({javaScriptEnabled:false});
  try {
    const page=await ctx.newPage();
    await page.goto(process.env.TEST_BASE_URL || 'http://localhost:3000');
    await expect(page.locator('iframe')).toHaveCount(0);
    await expect(page.locator('.landscape-external')).toHaveCount(6);
    await page.goto((process.env.TEST_BASE_URL || 'http://localhost:3000')+'/demos/kernelos');
    await page.locator('details summary').first().click();
    await expect(page.locator('details').first()).toHaveAttribute('open','');
  } finally {await ctx.close();}
});
