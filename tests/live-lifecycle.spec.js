import {test,expect} from './fixtures.js';
for(const [index,key] of [[0,'kicord'],[1,'portfolio'],[2,'kernelos']]) {
  test(`closing ${key} still works after navigation within its modal iframe`,async({page})=>{
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.route('**/api/contact',r=>r.fulfill({json:{available:false}}));
    await page.goto('/');await page.waitForFunction(()=>window.__portfolioReady);
    await page.locator('.panel-title a').nth(index).click();
    const modal=page.locator('#case-study-modal');
    await expect(modal).toHaveAttribute('aria-hidden','false');
    await modal.locator('.project-demo summary').click();
    const device=modal.locator(`[data-live-phone=${key}]`);await device.scrollIntoViewIfNeeded();
    await expect(device.locator('iframe')).toHaveCount(1);
    const frame=await(await device.locator('iframe').elementHandle()).contentFrame();
    if(key==='portfolio') {
      await frame.waitForFunction(()=>window.__portfolioReady);
      await frame.locator('.panel-title a').first().press('Enter');
      await expect(frame.locator('#case-study-modal')).toHaveAttribute('aria-hidden','false');
    } else {
      // Keyboard activation isolates history behavior from scaled-frame pointer coordinates.
      await frame.locator('#remote-navigation').press('Enter');
      await expect.poll(()=>frame.url()).toContain(key==='kicord'?'/es/plugins':'/changelogs');
    }
    await page.locator('#cs-btn-close').click();
    await expect(modal).toHaveAttribute('aria-hidden','true');
    await expect(modal.locator('iframe')).toHaveCount(0);
    await expect(page).not.toHaveURL(/#case-study-/);
  });
}

test('older browsers without Navigation API close a navigated frame without leaving the page',async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(window,'navigation',{value:undefined,configurable:true}));
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.route('**/api/contact',r=>r.fulfill({json:{available:false}}));
  await page.goto('/');await page.waitForFunction(()=>window.__portfolioReady);
  const original=new URL(page.url());
  await page.locator('.panel-title a[data-open-case=kernelos]').click();
  await page.locator('#case-study-modal .project-demo summary').click();
  const device=page.locator('#case-study-modal [data-live-phone=kernelos]');await device.scrollIntoViewIfNeeded();
  await expect(device.locator('iframe')).toHaveCount(1);
  const frame=await(await device.locator('iframe').elementHandle()).contentFrame();
  await frame.locator('#remote-navigation').press('Enter');await expect.poll(()=>frame.url()).toContain('/changelogs');
  await page.locator('#cs-btn-close').click();await expect(page.locator('#case-study-modal')).toHaveAttribute('aria-hidden','true');
  expect(new URL(page.url()).pathname).toBe(original.pathname);await expect(page).not.toHaveURL(/#case-study-/);
});
