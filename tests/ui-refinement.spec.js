import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';

async function ready(page, width, motion='reduce') {
  await page.setViewportSize({width,height:960});
  await page.emulateMedia({colorScheme:'dark',reducedMotion:motion});
  await page.route('**/api/contact',r=>r.fulfill({json:{available:false}}));
  await page.goto('/');
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForFunction(()=>window.__portfolioReady === true);
  await fs.mkdir('review-reports',{recursive:true});
}

for(const width of [320,390,768,1440]) {
  test(`concentric phone surfaces and stable pane position at ${width}px`,async({page})=>{
    await ready(page,width);
    for(const key of ['kicord','portfolio','kernelos']) {
      const phone=page.locator(`.stack [data-project-phone="${key}"]`);
      await phone.scrollIntoViewIfNeeded();
      const curves=await phone.evaluate(el=>{
        const banner=getComputedStyle(el.querySelector('.pf-banner'));
        const button=getComputedStyle(el.querySelector('.pf-bottom a'));
        const screen=el.querySelector('.pf-screen');
        const footer=el.querySelector('.pf-bottom');
        const surface=el.querySelector('.pf-scroll');
        return {
          banner:parseFloat(banner.borderTopLeftRadius),
          buttonTop:parseFloat(button.borderTopLeftRadius),
          buttonBottom:parseFloat(button.borderBottomLeftRadius),
          overflow:getComputedStyle(screen).overflow,
          separation:footer.getBoundingClientRect().top-surface.getBoundingClientRect().bottom,
          targets:[...el.querySelectorAll('[role=tab],.pf-bottom a')].map(b=>b.getBoundingClientRect().height),
        };
      });
      expect(curves.banner).toBe(35);
      expect(curves.buttonBottom).toBe(curves.banner);
      expect(curves.buttonTop).toBe(22);
      expect(curves.overflow).toBe('hidden');
      expect(Math.abs(curves.separation)).toBeLessThan(1);
      expect(curves.targets.every(h=>h>=44)).toBe(true);
      for(const index of [1,2,0]) {
        await phone.locator('[data-phone-tab]').nth(index).click();
        const y=await page.evaluate(()=>scrollY);
        const position=await phone.evaluate(el=>{
          const scroller=el.querySelector('.pf-scroll');
          const tabs=el.querySelector('.pf-tabs');
          const scale=Number(el.style.getPropertyValue('--pf-scale'));
          return {actual:tabs.getBoundingClientRect().top-scroller.getBoundingClientRect().top,expected:8*scale};
        });
        expect(Math.abs(position.actual-position.expected)).toBeLessThan(2);
        await expect(phone.locator('[role=tabpanel]:visible')).toHaveCount(1);
        await phone.locator('[role=tabpanel]:visible').focus();
        expect(Math.abs(await page.evaluate(()=>scrollY)-y)).toBeLessThan(2);
      }
      await phone.locator('.pf-scroll').evaluate(el=>el.scrollTo(0,0));
      await phone.screenshot({path:`review-reports/ui-phone-${key}-${width}.png`});
    }
    const cards=page.locator('.panel-metrics .metric-pill');
    expect(await cards.evaluateAll(list=>list.every(el=>el.scrollWidth<=el.clientWidth+1))).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    if(width===390 || width===1440) {
      await page.locator('#theme-toggle').click();
      await page.locator('.stack [data-project-phone=kicord]').screenshot({path:`review-reports/ui-phone-light-${width}.png`});
      await page.locator('#bento-projects-grid').screenshot({path:`review-reports/ui-collaborations-light-${width}.png`});
      await page.locator('#skills').screenshot({path:`review-reports/ui-evidence-light-${width}.png`});
      await page.locator('#contact').screenshot({path:`review-reports/ui-contact-light-${width}.png`});
    }
  });
}

test('project reveal leaves device hit areas stable and copy readable from first visibility',async({page})=>{
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',msg=>{ if(/GSAP target.*(?:null|not found)/i.test(msg.text())) errors.push(msg.text()); });
  await ready(page,1440,'no-preference');
  await page.evaluate(()=>scrollTo(0,document.querySelector('.stack .panel').offsetTop));
  const stage=page.locator('.stack .panel .ph-stage').first();
  await expect(stage).toHaveCSS('transform','none');
  const before=await stage.boundingBox();
  await expect(page.locator('.stack .panel .panel-desc').first()).toHaveCSS('opacity','1');
  await expect(page.locator('.stack .panel .panel-links').first()).toHaveCSS('opacity','1');
  await page.waitForTimeout(700);
  const after=await stage.boundingBox();
  expect(Math.abs(before.x-after.x)).toBeLessThan(1);
  expect(Math.abs(before.y-after.y)).toBeLessThan(1);
  await page.locator('.stack .panel .panel-links .btn').first().click();
  await expect(page.locator('#case-study-modal')).toHaveAttribute('aria-hidden','false');
  await page.keyboard.press('Escape');
  await expect(page.locator('#case-study-modal')).toHaveAttribute('aria-hidden','true');
  expect(errors).toEqual([]);
});
