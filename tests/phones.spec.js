import {test,expect} from './fixtures.js';
import AxeBuilder from '@axe-core/playwright';
const keys=['kicord','portfolio','kernelos'];
async function ready(page,key,width=390,theme='dark') {
  await page.setViewportSize({width,height:960});
  await page.emulateMedia({reducedMotion:'reduce',colorScheme:theme});
  await page.goto('/projects/'+key);
  await expect(page.locator('iframe')).toHaveCount(0);
  await page.locator('.project-demo summary').click();
}
test('real devices have no fake tabs or nested clickable cards',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const key of keys) {
    await ready(page,key,1440);
    await expect(page.locator('[data-project-phone]')).toHaveCount(1);
    await expect(page.locator('.phone-mockup,.pf-tabs,.pf-status,.pf-toolbar,.pf-bottom')).toHaveCount(0);
    const phone=page.locator('[data-live-phone]');await phone.scrollIntoViewIfNeeded();
    await expect(phone.locator('iframe')).toHaveCount(1);
    expect(await phone.evaluate(el=>el.closest('a,button')===null)).toBe(true);
  }
  expect(errors).toEqual([]);
});
for(const width of [320,390]) test(`device controls remain outside the display at ${width}px`,async({page})=>{
  for(const key of keys) {
    await ready(page,key,width,'light');const phone=page.locator('[data-live-phone]');
    await phone.scrollIntoViewIfNeeded();
    const geometry=await phone.evaluate(el=>{
      const box=el.getBoundingClientRect(),bezel=el.querySelector('.phone-bezel').getBoundingClientRect();
      const tools=el.parentElement.querySelector('.live-phone-tools').getBoundingClientRect();
      return {bottom:box.bottom,tools:tools.top,bezelDifference:Math.abs(bezel.height-box.height)};
    });
    expect(geometry.tools).toBeGreaterThan(geometry.bottom);
    expect(geometry.bezelDifference).toBeLessThan(1);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
});
test('reload controls have visible keyboard focus and preserve the parent route',async({page})=>{
  await ready(page,'kernelos');const parentURL=page.url();
  await page.keyboard.press('Tab');
  const button=page.locator('[data-phone-reload]');await button.focus();
  await expect(button).toBeFocused();await expect(button).toHaveCSS('outline-style','solid');
  await page.keyboard.press('Enter');expect(page.url()).toBe(parentURL);
});
for(const theme of ['dark','light']) test(`device controls have no serious accessibility findings in ${theme}`,async({page})=>{
  for(const key of keys) {
    await ready(page,key,390,theme);await page.locator('.live-phone-tools').scrollIntoViewIfNeeded();
    const audit=await new AxeBuilder({page}).include('.live-phone-tools').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(audit.violations.filter(v=>['critical','serious'].includes(v.impact))).toEqual([]);
  }
});
