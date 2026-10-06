import {test,expect} from './fixtures.js';

for(const theme of ['dark','light']) test(`portrait depth keeps frame and overlay fixed in ${theme}`,async({page})=>{
  await page.setViewportSize({width:1440,height:960});
  await page.emulateMedia({reducedMotion:'no-preference',colorScheme:theme});
  await page.goto('/');await page.waitForFunction(()=>window.__portfolioReady);
  const portrait=page.locator('#portrait'), stat=portrait.locator('.portrait-stat');
  await portrait.scrollIntoViewIfNeeded();await page.waitForTimeout(900);
  const frame=await portrait.boundingBox(), overlay=await stat.boundingBox();
  const photo=portrait.locator(theme==='dark'?'.portrait-dark':'.portrait-light');
  const before=await photo.evaluate(el=>getComputedStyle(el).transform);
  await page.mouse.move(frame.x+frame.width*.9,frame.y+frame.height*.4);
  await page.waitForTimeout(900);
  expect(await photo.evaluate(el=>getComputedStyle(el).transform)).not.toBe(before);
  expect(await portrait.boundingBox()).toEqual(frame);
  expect(await stat.boundingBox()).toEqual(overlay);
  await expect(stat).toHaveCSS('color','rgb(238, 233, 223)');
  await expect(stat).toHaveText(`${new Date().getFullYear()-2015}+`);
  await expect(photo).toHaveCSS('opacity','1');
  await page.screenshot({path:`review-reports/portrait-1440-${theme}.png`});
  await page.evaluate(()=>window.scrollBy(0,120));await page.waitForTimeout(1000);
  const shifted=await photo.evaluate(el=>getComputedStyle(el).transform);
  expect(shifted).not.toBe(before);
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(photo).toHaveCSS('transform','none');
  expect(await portrait.evaluate(el=>getComputedStyle(el,'::before').opacity)).toBe('0');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await expect(photo).not.toHaveCSS('transform','none');
});

for(const width of [320,390]) test(`portrait remains still and readable at ${width}px with reduced motion`,async({page})=>{
  await page.setViewportSize({width,height:960});
  await page.emulateMedia({reducedMotion:'reduce',colorScheme:'light'});
  await page.goto('/#about');
  await page.locator('#portrait').scrollIntoViewIfNeeded();
  await expect(page.locator('.portrait-stat')).toHaveCSS('color','rgb(238, 233, 223)');
  await expect(page.locator('.portrait-light')).toHaveCSS('transform','none');
  await page.screenshot({path:`review-reports/portrait-${width}-light.png`});
});
