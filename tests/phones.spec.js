import { test, expect, stubKiCord } from './fixtures.js';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';

async function ready(page, path='/', width=1440, theme='dark', motion='reduce') {
  await page.setViewportSize({width,height:960});
  await page.emulateMedia({colorScheme:theme,reducedMotion:motion});
  await page.route('**/api/contact', r=>r.fulfill({json:{available:false}}));
  await page.goto(path); await page.evaluate(()=>document.fonts.ready);
  if(path==='/') await page.waitForFunction(()=>window.__portfolioReady);
  await expect(page.locator('[data-phone-enhanced]').first()).toHaveAttribute('data-phone-enhanced','true');
  await fs.mkdir('review-reports',{recursive:true});
}

test('three interactive phones replace the image mockups without nested clickable cards',async({page})=>{
  const errors=[]; const urls=[];
  page.on('pageerror',e=>errors.push(e.message)); page.on('request',r=>urls.push(r.url()));
  await ready(page,'/',1440,'dark','no-preference');
  await expect(page.locator('.stack [data-project-phone]')).toHaveCount(3);
  await expect(page.locator('.phone-mockup')).toHaveCount(0);
  await expect(page.locator('iframe')).toHaveCount(1);
  for(const key of ['portfolio','kernelos']){
    const phone=page.locator(`.stack [data-project-phone="${key}"]`);
    await phone.scrollIntoViewIfNeeded();
    expect(await phone.evaluate(el=>el.closest('a,button')===null)).toBe(true);
    for(let i=0;i<3;i++){
      await phone.locator('[data-phone-tab]').nth(i).click();
      await expect(phone.locator('[role=tabpanel]:visible')).toHaveCount(1);
      await expect(phone.locator('[data-phone-tab]').nth(i)).toHaveAttribute('aria-selected','true');
      await expect(page.locator('#case-study-modal')).toHaveAttribute('aria-hidden','true');
    }
    await phone.locator('[data-phone-tab]').first().click();
    await phone.locator('.pf-scroll').evaluate(el=>el.scrollTo(0,0));
    await page.screenshot({path:`review-reports/phone-${key}-1440.png`});
  }
  expect(urls.some(url=>/youtube|googleapis/.test(url))).toBe(false);
  expect(errors).toEqual([]);
});

test('phone tabs support arrows, Home and End with linked unique panels',async({page})=>{
  await ready(page);
  const phone=page.locator('.stack [data-project-phone=portfolio]');
  await phone.locator('[role=tab]').first().focus();
  await page.keyboard.press('ArrowRight'); await expect(phone.locator('[role=tab]').nth(1)).toBeFocused();
  await expect(phone.locator('[role=tabpanel]:visible')).toContainText('Trabajo y colaboraciones');
  await page.keyboard.press('End'); await expect(phone.locator('[role=tab]').last()).toBeFocused();
  await page.keyboard.press('Home'); await expect(phone.locator('[role=tab]').first()).toBeFocused();
  await page.keyboard.press('ArrowLeft'); await expect(phone.locator('[role=tab]').last()).toBeFocused();
  const relations=await phone.locator('[role=tab]').evaluateAll(tabs=>tabs.every(t=>{
    const p=document.getElementById(t.getAttribute('aria-controls'));
    return p && p.getAttribute('aria-labelledby')===t.id;
  })); expect(relations).toBe(true);
});

for(const width of [320,390]){
  test(`phone geometry, mobile hit targets and card separation at ${width}px`,async({page})=>{
    await ready(page,'/',width,'light');
    for(const key of ['portfolio','kernelos']){
      const phone=page.locator(`.stack [data-project-phone="${key}"]`);
      await phone.scrollIntoViewIfNeeded();
      const geometry=await phone.evaluate(el=>{
        const p=el.getBoundingClientRect(),slot=el.closest('.panel-visual').getBoundingClientRect();
        const info=el.closest('.panel-grid').querySelector('.panel-info').getBoundingClientRect();
        return {p:{top:p.top,bottom:p.bottom,width:p.width},slot:{top:slot.top,bottom:slot.bottom},infoBottom:info.bottom,
          targets:[...el.querySelectorAll('[role=tab],.pf-bottom a')].map(t=>t.getBoundingClientRect().height)};
      });
      expect(geometry.p.top).toBeGreaterThan(geometry.infoBottom);
      expect(geometry.p.top).toBeGreaterThanOrEqual(geometry.slot.top);
      expect(geometry.p.bottom).toBeLessThanOrEqual(geometry.slot.bottom+.5);
      expect(geometry.targets.every(height=>height>=43.9)).toBe(true);
      await phone.locator('[data-phone-tab="1"]').click();
      await expect(phone.locator('[role=tabpanel]:visible')).toHaveCount(1);
      await phone.screenshot({path:`review-reports/phone-device-${key}-${width}.png`});
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.goto('/projects/portfolio');
    const phone=page.locator('[data-project-phone]');await phone.scrollIntoViewIfNeeded();
    expect(await phone.locator('[role=tab]').evaluateAll(tabs=>tabs.every(t=>t.getBoundingClientRect().height>=43.9))).toBe(true);
    const device=await phone.boundingBox();
    const bezel=await phone.locator('.phone-bezel').boundingBox();
    expect(Math.abs(device.height-bezel.height)).toBeLessThan(1);
    await page.screenshot({path:`review-reports/phone-route-${width}.png`});
  });
}

test('phone scrolling uses the inner surface and the bezel never intercepts controls',async({page})=>{
  await ready(page);
  const phone=page.locator('.stack [data-project-phone=portfolio]');await phone.scrollIntoViewIfNeeded();
  await phone.locator('[data-phone-tab="1"]').click();
  await phone.locator('.pf-scroll').evaluate(el=>el.scrollTop=0);
  const y=await page.evaluate(()=>scrollY);
  const box=await phone.locator('.pf-scroll').boundingBox();
  await page.mouse.move(box.x+box.width*.5,box.y+box.height*.65);
  await page.mouse.wheel(0,90);await page.waitForTimeout(150);
  await expect.poll(()=>phone.locator('.pf-scroll').evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
  expect(Math.abs(await page.evaluate(()=>scrollY)-y)).toBeLessThan(2);
  await phone.locator('.pf-scroll').evaluate(el=>el.scrollTop=el.scrollHeight);
  await page.mouse.wheel(0,300);await page.waitForTimeout(150);
  expect(Math.abs(await page.evaluate(()=>scrollY)-y)).toBeLessThan(2);
  expect(await phone.locator('.phone-bezel').evaluate(el=>getComputedStyle(el).pointerEvents)).toBe('none');
});

test('case-study phones mount, dispose and remount without duplicate IDs or broken history',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await ready(page,'/',390);
  for(let i=0;i<4;i++){
    await page.locator('.panel-title a').nth(i%3).click();
    const modal=page.locator('#case-study-modal');await expect(modal).toHaveAttribute('aria-hidden','false');
    await expect(modal.locator('[data-phone-enhanced]')).toHaveCount(1);
    if(i%3===0) { await expect(modal.locator('iframe.pf-live-frame')).toHaveCount(1); } else {
      await modal.locator('[role=tab]').nth(1).click();
      await expect(modal.locator('[role=tabpanel]:visible')).toHaveCount(1);
    }
    const duplicate=await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return ids.length!==new Set(ids).size;});
    expect(duplicate).toBe(false);
    await page.keyboard.press('Escape');await expect(modal).toHaveAttribute('aria-hidden','true');
  }
  expect(errors).toEqual([]);
});

for(const theme of ['dark','light']){
  test(`phone panes have no serious accessibility violations in ${theme} theme`,async({page})=>{
    await ready(page,'/',390,theme);
    for(const key of ['portfolio','kernelos']){
      const phone=page.locator(`.stack [data-project-phone="${key}"]`);await phone.scrollIntoViewIfNeeded();
      for(let i=0;i<3;i++){
        await phone.locator('[data-phone-tab]').nth(i).click();
        const audit=await new AxeBuilder({page}).include(`.stack [data-project-phone="${key}"]`).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
        const serious=audit.violations.filter(v=>['critical','serious'].includes(v.impact));
        if(serious.length) await fs.writeFile(`review-reports/phone-axe-${key}-${theme}-${i}.json`,JSON.stringify(serious,null,2));
        expect(serious).toEqual([]);
      }
    }
  });
}

test('phones offer real content without JavaScript and no external runtime dependencies',async({browser})=>{
  const ctx=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  try{
    await stubKiCord(ctx); const page=await ctx.newPage();await page.goto(process.env.TEST_BASE_URL||'http://localhost:3000');
    await expect(page.locator('.stack [data-project-phone]')).toHaveCount(3);
    const phone=page.locator('.stack [data-project-phone=portfolio]');
    await phone.scrollIntoViewIfNeeded();
    await expect(phone.locator('.pf-profile')).toContainText('Pablo Schefer');
    await expect(phone.locator('.pf-tabs')).toBeHidden();
    await expect(phone.locator('[role=tabpanel]').first()).toContainText('El portfolio que estás visitando');
    await expect(phone.locator('.pf-bottom a')).toHaveAttribute('href','https://github.com/PapiGECode/Web-CV');
    await expect(page.locator('iframe.pf-live-frame')).toHaveCount(1);
    await page.screenshot({path:'review-reports/phone-no-js.png'});
  }finally{await ctx.close();}
});
