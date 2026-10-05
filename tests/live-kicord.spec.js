import { test, expect, stubKiCord } from './fixtures.js';
import fs from 'node:fs/promises';
async function open(page,width=1440,path='/') {
  await page.setViewportSize({width,height:960});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.route('**/api/contact',r=>r.fulfill({json:{available:false}}));
  await page.goto(path);
  if(path==='/') await page.waitForFunction(()=>window.__portfolioReady);
  const phone=page.locator('[data-kicord-live]').first();
  await phone.scrollIntoViewIfNeeded();
  await expect(phone).toHaveAttribute('data-phone-enhanced','true');
  const frame=await (await phone.locator('iframe').elementHandle()).contentFrame();
  await expect(frame.locator('h1')).toContainText('prueba de integración');
  return {phone,frame};
}
for (const width of [320,390,768,1440]) test(`live KiCord has 390px viewport inside original bezel at ${width}px`,async({page})=>{
  const {phone,frame}=await open(page,width);
  expect(await frame.evaluate(()=>innerWidth)).toBe(390);
  await expect(phone.locator('.pf-tabs,.pf-banner')).toHaveCount(0);
  const geometry=await phone.evaluate(el=>{
    const s=el.querySelector('.pf-screen').getBoundingClientRect(),f=el.querySelector('iframe').getBoundingClientRect(),b=el.querySelector('.pf-bottom').getBoundingClientRect();
    return {gap:Math.abs(s.width-f.width),separation:Math.abs(f.bottom-b.top),top:f.top-s.top,clip:getComputedStyle(el.querySelector('.pf-screen')).overflow,hit:el.querySelector('.pf-live-reload').getBoundingClientRect().height};
  });
  expect(geometry.gap).toBeLessThan(2); expect(geometry.separation).toBeLessThan(2);
  expect(geometry.top).toBeGreaterThan(20);expect(geometry.hit).toBeGreaterThanOrEqual(44);
  expect(geometry.clip).toBe('hidden');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await fs.mkdir('review-reports',{recursive:true});await phone.screenshot({path:`review-reports/live-frame-fixture-${width}.png`});
});
test('real-frame integration: inner navigation and scrolling remain inside the device',async({page})=>{
  const {phone,frame}=await open(page);
  const parent=page.url(); await frame.locator('a').click();await expect.poll(()=>frame.url()).toContain('/es/plugins');
  expect(page.url()).toBe(parent);
  const y=await page.evaluate(()=>scrollY),box=await phone.locator('iframe').boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.wheel(0,200);
  await expect.poll(()=>frame.evaluate(()=>scrollY)).toBeGreaterThan(0);
  expect(Math.abs(await page.evaluate(()=>scrollY)-y)).toBeLessThan(2);
});
test('reload resets KiCord only, leaving the portfolio and KernelOS unchanged',async({page})=>{
  const {phone,frame}=await open(page);
  const other=page.locator('[data-project-phone=kernelos]').first();
  const theme=await page.locator('html').getAttribute('class');
  await frame.locator('a').click();await expect.poll(()=>frame.url()).toContain('/es/plugins');
  await phone.locator('.pf-live-reload').click();await expect.poll(()=>frame.url()).toBe('https://www.kicord.es/es');
  await expect(other.locator('[role=tab]').first()).toHaveAttribute('aria-selected','true');
  expect(await page.locator('html').getAttribute('class')).toBe(theme);
});
test('modal cleans up its remote iframe and remounts; the main phone is retained',async({page})=>{
  await open(page,390);
  for(let i=0;i<2;i++) {
    await page.locator('.panel-title a').first().click();
    const modal=page.locator('#case-study-modal');await expect(modal).toHaveAttribute('aria-hidden','false');
    await expect(modal.locator('iframe')).toHaveAttribute('src','https://www.kicord.es/es');
    await page.locator('#cs-btn-close').click(); await expect(modal).toHaveAttribute('aria-hidden','true');
    await expect(modal.locator('iframe')).not.toHaveAttribute('src',/./);
    await expect(page.locator('.stack iframe')).toHaveAttribute('src','https://www.kicord.es/es');
  }
});
test('no JavaScript keeps live KiCord plus a direct external fallback',async({browser})=>{
  const ctx=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  try {await stubKiCord(ctx);const page=await ctx.newPage();await page.goto('http://localhost:3000/projects/kicord');
    const phone=page.locator('[data-kicord-live]');await expect(phone.locator('iframe')).toHaveAttribute('src','https://www.kicord.es/es');
    await expect(phone.locator('.pf-bottom a')).toBeVisible();await expect(phone.locator('.pf-live-reload')).toBeHidden();
  } finally {await ctx.close();}
});
test('CSP permits only KiCord frames and sandbox never grants top-level navigation',async({request,page})=>{
  const res=await request.get('/');const csp=res.headers()['content-security-policy'];
  expect(csp).toContain('frame-src https://www.kicord.es https://kicord.es;');
  expect(csp).toContain("script-src 'self';");
  await open(page);const iframe=page.locator('.stack iframe');const sandbox=await iframe.getAttribute('sandbox');
  expect(sandbox).toContain('allow-scripts');expect(sandbox).not.toContain('allow-top-navigation');
  await expect(iframe).toHaveAttribute('loading','lazy');await expect(iframe).toHaveAttribute('referrerpolicy','strict-origin-when-cross-origin');
});
test('a blocked external document leaves the open-separately action available without false success',async({page})=>{
  await page.route('https://www.kicord.es/**',r=>r.fulfill({status:403,headers:{'x-frame-options':'DENY'},body:'Frame blocked fixture'}));
  await page.goto('/projects/kicord');const phone=page.locator('[data-kicord-live]');await phone.scrollIntoViewIfNeeded();
  await expect(phone.locator('.pf-bottom a')).toBeVisible();await expect(phone.locator('.pf-bottom a')).toHaveAttribute('target','_blank');
  await expect(phone.locator('.pf-live-reload')).toBeVisible();
  await expect(phone).not.toContainText('Cargado correctamente');await expect(phone.locator('.pf-tabs')).toHaveCount(0);
});
