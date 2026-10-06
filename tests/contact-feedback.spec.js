import {test,expect} from './fixtures.js';

for(const theme of ['dark','light']) test(`contact feedback preserves input geometry and caret in ${theme}`,async({page})=>{
  await page.setViewportSize({width:390,height:960});
  await page.emulateMedia({reducedMotion:'no-preference',colorScheme:theme});
  await page.goto('/');await page.waitForFunction(()=>window.__portfolioReady);
  const name=page.locator('#name'), field=page.locator('.f-field').filter({has:name});
  await name.scrollIntoViewIfNeeded();await page.waitForTimeout(800);
  const before=await name.boundingBox(), placeholder=await name.getAttribute('placeholder');
  await name.focus();await name.pressSequentially('Pablo',{delay:40});
  await expect(field).toHaveClass(/is-typing/);
  await expect(name).toHaveValue('Pablo');
  expect(await name.evaluate(el=>el.selectionStart)).toBe(5);
  expect(await name.boundingBox()).toEqual(before);
  await expect(name).toHaveAttribute('placeholder',placeholder);
  await expect(field.locator('.f-label')).toHaveText('Nombre');
  await expect(page.locator('#form-ok')).not.toHaveClass(/show/);
  await page.waitForTimeout(450);
  await expect(name).toHaveCSS('background-size','100% 1px');
  await page.screenshot({path:`review-reports/contact-feedback-390-${theme}.png`});
  await page.emulateMedia({reducedMotion:'reduce'});
  expect(await field.locator('.f-label').evaluate(el=>getComputedStyle(el,'::after').animationName)).toBe('none');
  await page.locator('#email').focus();await expect(field).not.toHaveClass(/is-typing/);
  await name.fill('Another name');
  await page.locator('#contact-form').evaluate(el=>el.reset());
  await expect(name).toHaveValue('');await expect(field).not.toHaveClass(/is-typing/);
  await page.locator('#email').focus();
  expect(await field.locator('.f-label').evaluate(el=>getComputedStyle(el,'::after').opacity)).toBe('0');
});

test('contact feedback retains failed values and resets only after accepted delivery',async({page})=>{
  let accepted=false;
  await page.route('**/api/contact',route=>{
    if(route.request().method()==='GET') return route.fulfill({json:{available:true}});
    return accepted ? route.fulfill({json:{ok:true,mode:'sent',id:'test-only'}}) : route.fulfill({status:502,json:{ok:false,error:'No se ha confirmado el envío.'}});
  });
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await page.locator('#name').fill('Prueba');await page.locator('#email').fill('test@example.com');
  const message='Mensaje de prueba de feedback visual, sin entrega real.';
  await page.locator('#message').fill(message);
  await page.locator('#contact-form [type=submit]').click();
  await expect(page.locator('#message')).toHaveValue(message);
  await expect(page.locator('#form-ok')).toContainText('no se ha perdido');
  accepted=true;await page.locator('#contact-form [type=submit]').click();
  await expect(page.locator('#form-ok')).toContainText('Mensaje enviado');
  await expect(page.locator('#message')).toHaveValue('');
  await expect(page.locator('.is-typing')).toHaveCount(0);
  await expect(page.locator('#message-count')).toHaveText('0 / 4.000');
});
