import {test,expect} from './fixtures.js';
import AxeBuilder from '@axe-core/playwright';

for(const [path,label] of [['/','home'],['/privacidad','privacy'],['/projects/portfolio','case']]) {
  for(const width of [320,390,1440]) for(const theme of ['dark','light']) {
    test(`measurement utilities ${label} at ${width}px ${theme}`,async({page})=>{
      const events=[];
      await page.route('**/api/metrics',route=>{events.push(route.request().postData());return route.fulfill({status:204});});
      await page.setViewportSize({width,height:960});
      await page.emulateMedia({reducedMotion:'reduce',colorScheme:theme});
      await page.goto(path);
      const tools=page.locator('.site-tools'), button=tools.locator('[data-open-preferences]');
      await tools.scrollIntoViewIfNeeded();
      await expect(button).toHaveText('Preferencias de medición');
      if(label==='privacy') await expect(tools.locator('a')).toHaveAttribute('href','/');
      for(const item of await tools.locator('a,button').all()) {
        const box=await item.boundingBox();
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width);
      }
      expect(events).toEqual([]);
      await button.focus();await page.keyboard.press('Enter');
      await expect(page.locator('#preferences-dialog')).toBeVisible();
      await expect(page.locator('#allow-measurement')).not.toBeChecked();
      await expect(page.locator('#preferences-dialog')).toContainText('velocidad de carga');
      await page.keyboard.press('Escape');await expect(button).toBeFocused();
      await page.screenshot({path:`review-reports/utility-${label}-${width}-${theme}.png`});
      const audit=await new AxeBuilder({page}).include('.site-tools').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      expect(audit.violations.filter(v=>['critical','serious'].includes(v.impact))).toEqual([]);
    });
  }
}
for(const signal of ['doNotTrack','globalPrivacyControl']) test(`measurement preferences respect ${signal}`,async({page})=>{
  await page.addInitScript(signal=>{
    Object.defineProperty(navigator,signal,{get:()=>signal==='doNotTrack'?'1':true});
    localStorage.setItem('ps-measurement','yes');
  },signal);
  const events=[];
  await page.route('**/api/metrics',route=>{events.push(route.request().postData());return route.fulfill({status:204});});
  for(const path of ['/','/privacidad','/projects/portfolio']) {
    await page.goto(path);
    const button=page.locator('[data-open-preferences]');await button.click();
    await expect(page.locator('#allow-measurement')).toBeDisabled();
    await expect(page.locator('#allow-measurement')).not.toBeChecked();
    await expect(page.locator('#measurement-note')).toContainText('no ser medido');
    await page.locator('#save-preferences').click();await expect(button).toBeFocused();
  }
  expect(events).toEqual([]);
});
