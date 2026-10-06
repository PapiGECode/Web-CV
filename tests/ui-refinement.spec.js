import {test,expect} from './fixtures.js';
async function ready(page,width,motion='reduce') {
  await page.setViewportSize({width,height:960});
  await page.emulateMedia({colorScheme:'dark',reducedMotion:motion});
  await page.goto('/');await page.waitForFunction(()=>window.__portfolioReady);
}
for(const width of [320,390,768,1440]) test(`canonical phones preserve bezel alignment at ${width}px`,async({page})=>{
  for(const key of ['kicord','portfolio','kernelos']) {
    await ready(page,width);await page.goto('/projects/'+key);
    await page.locator('.project-demo summary').click();
    const phone=page.locator('[data-live-phone]');await phone.scrollIntoViewIfNeeded();
    const geometry=await phone.evaluate(el=>{
      const box=el.getBoundingClientRect();
      return {ratio:box.width/box.height,radius:getComputedStyle(el.querySelector('.pf-screen')).borderTopLeftRadius,
        controls:[...el.parentElement.querySelectorAll('.live-phone-tools a,.live-phone-tools button')].map(node=>node.getBoundingClientRect().height)};
    });
    expect(Math.abs(geometry.ratio-1470/3000)).toBeLessThan(.001);
    expect(parseFloat(geometry.radius)).toBeGreaterThan(0);
    expect(geometry.controls.every(height=>height>=44)).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
});
test('project controls are readable and clickable during reveal',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('console',msg=>{if(/GSAP target.*(?:null|not found)/i.test(msg.text()))errors.push(msg.text());});
  await ready(page,1440,'no-preference');
  const title=page.locator('.panel-title a').first();await title.scrollIntoViewIfNeeded();
  const before=await title.boundingBox();
  await expect(page.locator('.panel-desc').first()).toHaveCSS('opacity','1');
  await page.waitForTimeout(700);const after=await title.boundingBox();
  expect(Math.abs(before.x-after.x)).toBeLessThan(1);expect(Math.abs(before.y-after.y)).toBeLessThan(1);
  await title.click();await expect(page.locator('#case-study-modal')).toHaveAttribute('aria-hidden','false');
  await page.keyboard.press('Escape');await expect(page.locator('#case-study-modal')).toHaveAttribute('aria-hidden','true');
  expect(errors).toEqual([]);
});
