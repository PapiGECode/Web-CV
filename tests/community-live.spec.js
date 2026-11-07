import { test, expect } from './fixtures.js';
// Opt-in origin verification: no fixture for Thiago Community.
// LIVE_COMMUNITY=1 TEST_BASE_URL=http://localhost:3105 playwright test tests/community-live.spec.js
for (const width of [390,1440]) test(`deployed community loads and navigates safely inside portfolio at ${width}px`, async ({page,context}) => {
  test.skip(process.env.LIVE_COMMUNITY !== '1', 'Requires network and the authorized localhost:3105 origin');
  test.setTimeout(60000);
  await context.unroute('https://thiago-community-web.vercel.app/**');
  await page.setViewportSize({width,height:960});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');await page.waitForFunction(()=>window.__portfolioReady);
  const root=page.locator('[data-live-landscape=thiago-community]');
  await root.scrollIntoViewIfNeeded();
  await expect(root.locator('iframe')).toHaveCount(1);
  const frame=await(await root.locator('iframe').elementHandle()).contentFrame();
  await expect(frame.locator('.site-header .brand')).toBeVisible({timeout:20000});
  await expect(frame.locator('main h1')).toBeVisible();
  await root.screenshot({path:`review-reports/community-live-${width}.png`});
  // Locator auto-scroll miscalculates transformed cross-origin iframe coordinates.
  // Hit-test in the child and send a real pointer click in the parent viewport.
  async function clickInside(selector) {
    const node = frame.locator(selector);
    const point = await node.evaluate(el => {
      const r=el.getBoundingClientRect(), x=r.left+r.width/2, y=r.top+r.height/2;
      return {x,y,width:innerWidth,hit:el.contains(document.elementFromPoint(x,y))};
    });
    expect(point.hit).toBe(true);
    const box=await root.locator('iframe').boundingBox();
    await page.mouse.click(box.x+point.x*box.width/point.width, box.y+point.y*box.width/point.width);
  }
  await clickInside('.main-nav a[href="/legal/privacy"]');
  await expect.poll(()=>frame.url()).toContain('/legal/privacy');
  await expect(frame.locator('main h1')).toBeVisible();
  await clickInside('.login-link');
  await expect(frame.locator('h1')).toHaveText('Continúa en la web de la comunidad.');
  await expect(frame.locator('input[type=password], form')).toHaveCount(0);
  await expect(frame.locator('a[target=_blank]')).toHaveAttribute('href','/login');
  await frame.getByRole('link',{name:'Volver a la comunidad',exact:true}).press('Enter');
  await expect(frame.locator('.site-header .brand')).toBeVisible();
  expect(new URL(page.url()).pathname).toBe('/');
});
