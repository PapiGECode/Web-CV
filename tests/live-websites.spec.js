import {test,expect,stubKiCord,remoteFixture} from './fixtures.js';
import fs from 'node:fs/promises';
const keys=['kicord','portfolio','kernelos'];
const sources={kicord:'https://www.kicord.es/es',portfolio:'/?phone-preview=1',kernelos:'https://kernelos.org/'};
async function ready(page,width=1440,path='/',theme='dark') {
  await page.setViewportSize({width,height:960});await page.emulateMedia({reducedMotion:'reduce',colorScheme:theme});
  await page.route('**/api/contact',r=>r.fulfill({json:{available:false}}));await page.goto(path);
  if(path==='/') await page.waitForFunction(()=>window.__portfolioReady);
  await page.evaluate(()=>document.fonts.ready);await fs.mkdir('review-reports',{recursive:true});
}
async function view(page,key,scope='.stack') {
  const phone=page.locator(`${scope} [data-live-phone="${key}"]`);
  const disclosure=phone.locator('xpath=ancestor::details');
  if(await disclosure.count() && await disclosure.evaluate(el=>!el.open)) await disclosure.locator('summary').click();
  await phone.scrollIntoViewIfNeeded();
  await expect(phone.locator('iframe')).toHaveCount(1);
  const frame=await(await phone.locator('iframe').elementHandle()).contentFrame();
  if(key==='portfolio') await expect(frame.locator('h1.hero-name')).toHaveAttribute('aria-label','Pablo Schefer');
  else await expect(frame.locator('h1')).toContainText('prueba de integración');
  return {phone,frame,tools:phone.locator('..').locator('.live-phone-tools')};
}
async function expectSafeViewport(phone) {
  await expect.poll(()=>phone.evaluate(el=>{
    const screen=el.querySelector('.pf-screen').getBoundingClientRect();
    const frame=el.querySelector('iframe').getBoundingClientRect();
    const bezel=el.querySelector('.phone-bezel').getBoundingClientRect();
    // The original 1470 × 3000 asset's island ends at approximately y=216.
    return frame.top > bezel.top+bezel.height*216/3000
      && Math.abs(frame.top-screen.top-screen.height*.07)<1.5
      && ['right','bottom','left'].every(edge=>Math.abs(screen[edge]-frame[edge])<1.5);
  })).toBe(true);
}
for(const theme of ['dark','light']) for(const width of [320,390,768,1440]) test(`all real websites fill the safe phone viewport at ${width}px in ${theme}`,async({page})=>{
  await ready(page,width,'/',theme);
  for(const key of keys) {
    const {phone,frame,tools}=await view(page,key);
    expect(await frame.evaluate(()=>innerWidth)).toBe(key==='kernelos'?430:390);
    await expect(phone.locator('iframe')).toHaveAttribute('src',sources[key]);
    await expect(phone.locator('.pf-status,.pf-toolbar,.pf-bottom,.pf-tabs')).toHaveCount(0);
    await expectSafeViewport(phone);
    const g=await phone.evaluate(el=>{const b=el.getBoundingClientRect(),t=el.parentElement.querySelector('.live-phone-tools').getBoundingClientRect();return {toolsTop:t.top,phoneBottom:b.bottom,clip:getComputedStyle(el.querySelector('.pf-screen')).overflow,bezel:getComputedStyle(el.querySelector('.phone-bezel')).pointerEvents};});
    expect(g.toolsTop).toBeGreaterThan(g.phoneBottom+7);expect(g.clip).toBe('hidden');expect(g.bezel).toBe('none');
    expect(await tools.locator('a,button').evaluateAll(nodes=>nodes.every(el=>el.getBoundingClientRect().height>=44))).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await phone.locator('..').screenshot({path:`review-reports/live-${key}-${width}-${theme}.png`});
  }
});
for(const key of keys) test(`${key}: canonical phone keeps its top navigation clickable below the island`,async({page})=>{
  if(key!=='portfolio') {
    const path=key==='kicord'?'/es/plugins':'/changelogs';
    const body=remoteFixture(key,path).replace('<main>',`<header style="height:44px;display:flex;justify-content:center"><a id="top-navigation" href="${path}" style="display:block;padding:12px">Navigation</a></header><main>`);
    await page.route(key==='kicord'?'https://www.kicord.es/**':'https://kernelos.org/**',r=>r.fulfill({contentType:'text/html; charset=utf-8',body}));
  }
  await ready(page,390,`/projects/${key}`);
  const {phone,frame}=await view(page,key,'.pp-visual');
  await expectSafeViewport(phone);
  const control=frame.locator(key==='portfolio'?'#nav-burger':'#top-navigation');
  await expect(control).toBeVisible();
  const local=await control.evaluate(el=>{const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,width:innerWidth};});
  const display=await phone.locator('iframe').boundingBox(),scale=display.width/local.width;
  await page.mouse.click(display.x+local.x*scale,display.y+local.y*scale);
  if(key==='portfolio') await expect(control).toHaveAttribute('aria-expanded','true');
  else await expect.poll(()=>frame.url()).toContain(key==='kicord'?'/es/plugins':'/changelogs');
  expect(new URL(page.url()).pathname).toBe(`/projects/${key}`);
});
test('mounted phones resize their remaining viewport without replacing browsing contexts',async({page})=>{
  await ready(page,390);
  const phones=[];
  for(const key of keys) phones.push(await view(page,key));
  for(const width of [1440,320,768,390]) {
    await page.setViewportSize({width,height:960});
    for(const {phone,frame} of phones) {
      await phone.scrollIntoViewIfNeeded();await expectSafeViewport(phone);
      expect(await(await phone.locator('iframe').elementHandle()).contentFrame()).toBe(frame);
      expect(await frame.evaluate(()=>innerWidth)).toBe(await phone.getAttribute('data-live-phone')==='kernelos'?430:390);
    }
  }
});
for(const key of ['kicord','kernelos']) test(`${key}: remote navigation and scrolling stay in the matching frame`,async({page})=>{
  await ready(page);const {phone,frame}=await view(page,key);const url=page.url();
  const link=frame.locator('#remote-navigation');await link.scrollIntoViewIfNeeded();
  const local=await link.evaluate(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,viewport:innerWidth};});
  const display=await phone.locator('iframe').boundingBox();const ratio=display.width/local.viewport;
  // Chromium's OOP iframe locator coordinates can omit the parent's CSS scale.
  // Use actual screen coordinates so this remains a genuine pointer-navigation test.
  await page.mouse.click(display.x+(local.x+local.width/2)*ratio,display.y+(local.y+local.height/2)*ratio);
  await expect.poll(()=>frame.url()).toContain(key==='kicord'?'/es/plugins':'/changelogs');expect(page.url()).toBe(url);
  const y=await page.evaluate(()=>scrollY),box=await phone.locator('iframe').boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.wheel(0,180);
  await expect.poll(()=>frame.evaluate(()=>scrollY)).toBeGreaterThan(0);expect(Math.abs(await page.evaluate(()=>scrollY)-y)).toBeLessThan(2);
  await expect(page.locator('#case-study-modal')).toHaveAttribute('aria-hidden','true');
});
test('the actual portfolio never creates recursive frames, including inside cases and new routes',async({page})=>{
  await ready(page,390);const {frame}=await view(page,'portfolio');
  await frame.waitForFunction(()=>window.__portfolioReady);await expect(frame.locator('html')).toHaveClass(/phone-preview/);
  await frame.evaluate(()=>scrollTo(0,document.body.scrollHeight));await expect(frame.locator('iframe')).toHaveCount(0);expect(frame.childFrames()).toHaveLength(0);
  await frame.locator('.panel-title a').first().click();await expect(frame.locator('#case-study-modal')).toHaveAttribute('aria-hidden','false');await expect(frame.locator('iframe')).toHaveCount(0);
  await frame.goto(new URL('/projects/portfolio',page.url()).href);await expect(frame.locator('h1')).toContainText('PabloSchefer.com');await expect(frame.locator('iframe')).toHaveCount(0);await expect(frame.locator('html')).toHaveClass(/phone-preview/);
  await frame.goto(new URL('/',page.url()).href);await frame.waitForFunction(()=>window.__portfolioReady);await expect(frame.locator('iframe')).toHaveCount(0);
});
test('a distant device stays unloaded; only its own reload button resets its website',async({page})=>{
  await ready(page,390);await expect(page.locator('.stack [data-live-phone=kernelos] iframe')).toHaveCount(0);
  const first=await view(page,'kicord');await first.frame.locator('#remote-navigation').press('Enter');
  const other=await view(page,'kernelos');await other.frame.locator('#remote-navigation').press('Enter');
  await other.tools.locator('button').click();await expect.poll(()=>other.frame.url()).toBe(sources.kernelos);expect(first.frame.url()).toContain('/es/plugins');
});
test('closing and reopening every case removes only its frame and retains browser history',async({page})=>{
  await ready(page,390);await view(page,'kicord');
  for(let i=0;i<keys.length;i++) {
    await page.locator('.panel-title a').nth(i).click();const modal=page.locator('#case-study-modal');await expect(modal).toHaveAttribute('aria-hidden','false');
    const {phone}=await view(page,keys[i],'#case-study-modal');await expectSafeViewport(phone);await page.locator('#cs-btn-close').click();await expect(modal).toHaveAttribute('aria-hidden','true');await expect(modal.locator('iframe')).toHaveCount(0);
    await page.goForward();await expect(modal).toHaveAttribute('aria-hidden','false');await view(page,keys[i],'#case-study-modal');await page.locator('#cs-btn-close').click();await expect(modal).toHaveAttribute('aria-hidden','true');
  }
  await expect(page.locator('.stack [data-live-phone=kicord] iframe')).toHaveCount(1);
});
test('page lifecycle restoration reuses existing browsing contexts without duplicates',async({page})=>{
  await ready(page);await view(page,'kicord');
  const result=await page.evaluate(()=>{const original=document.querySelector('.stack iframe');dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));return {same:original===document.querySelector('.stack iframe'),count:document.querySelectorAll('.stack [data-live-phone=kicord] iframe').length};});
  expect(result).toEqual({same:true,count:1});
});
test('CSP permits only intended origins and external sandboxes cannot navigate the parent',async({request,page})=>{
  const res=await request.get('/');const csp=res.headers()['content-security-policy'];
  expect(csp).toContain("frame-src 'self' https://www.kicord.es https://kicord.es https://kernelos.org https://www.kernelos.org;");expect(csp).toContain("script-src 'self';");expect(csp).toContain("frame-ancestors 'self';");
  await ready(page);for(const key of ['kicord','kernelos']) {const {phone}=await view(page,key);const frame=phone.locator('iframe');expect(await frame.getAttribute('sandbox')).not.toContain('allow-top-navigation');await expect(frame).toHaveAttribute('loading','lazy');await expect(frame).toHaveAttribute('referrerpolicy','strict-origin-when-cross-origin');}
});
test('blocked external pages leave visible external controls without false success',async({page})=>{
  await page.route('https://kernelos.org/**',r=>r.fulfill({status:403,headers:{'x-frame-options':'DENY'},body:'Blocked remote fixture'}));
  await ready(page,390,'/projects/kernelos');await page.locator('.project-demo summary').click();const wrapper=page.locator('[data-phone-presentation=kernelos]');
  await expect(wrapper.locator('.live-phone-tools a')).toBeVisible();await expect(wrapper.locator('.live-phone-tools button')).toBeVisible();await expect(wrapper.locator('.live-phone-tools a')).toHaveAttribute('target','_blank');await expect(wrapper).not.toContainText('Cargado correctamente');
});
test('no JavaScript provides real links without starting a recursion chain',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  try{await stubKiCord(context);const p=await context.newPage();await p.goto(process.env.TEST_BASE_URL || 'http://localhost:3000');await expect(p.locator('.stack [data-project-phone]')).toHaveCount(3);await expect(p.locator('iframe')).toHaveCount(0);for(const key of keys){const tools=p.locator(`[data-phone-presentation=${key}] .live-phone-tools`);await tools.scrollIntoViewIfNeeded();await expect(tools.locator('a')).toBeVisible();await expect(tools.locator('button')).toBeHidden();}}finally{await context.close();}
});
test('embedded portfolio visits never emit duplicate measurement events',async({page,context})=>{
  const events=[];await context.route('**/api/metrics',r=>{events.push({body:r.request().postData(),url:r.request().frame().url()});return r.fulfill({status:204});});
  await context.addInitScript(()=>localStorage.setItem('ps-measurement','yes'));
  await ready(page,390);const {frame}=await view(page,'portfolio');await frame.waitForFunction(()=>window.__portfolioReady);await frame.evaluate(()=>dispatchEvent(new Event('portfolio:consent')));
  await expect.poll(()=>events.filter(e=>!e.url.includes('phone-preview')).length).toBeGreaterThan(0);
  expect(events.filter(e=>e.url.includes('phone-preview'))).toHaveLength(0);
});
