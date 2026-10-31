/* Run with Playwright installed externally: NODE_PATH=... node --test tests/conversion.spec.cjs
   Tests intercept delivery/analytics. No real submissions or subscriptions are created. */
const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const {chromium} = require('@playwright/test');
const base = process.env.KIG_TEST_URL || 'http://127.0.0.1:8911';
let browser;
before(async () => { browser = await chromium.launch({headless:true}); });
after(async () => { await browser.close(); });
async function page(path, width=1440) {
  const page = await browser.newPage({viewport:{width,height:950}});
  await page.route('https://www.googletagmanager.com/**',route=>route.abort());
  await page.route('https://*.google-analytics.com/**',route=>route.abort());
  await page.goto(base+path); await page.locator('.kig-nav-cta').waitFor();
  return page;
}
async function fill(form) {await form.locator('[name=email]').fill('fixture@example.com');await form.locator('[name=message]').fill('Fixture requirement for protective intelligence.');}
const expected = 'Principal & Executive Protective Intelligence';
test('Proposal: two required fields, defaults, optional scope, one request, success and privacy-safe lead', async()=>{
 const p=await page('/request-proposal?inquiry=principal');
 const form=p.locator('#kig-contact-form');
 assert.equal(await form.locator(':required').count(),2);
 assert.equal(await form.locator('[name=inquiry_type]').inputValue(),expected);
 let calls=[];
 await p.route('https://formspree.io/f/mykbaegd',async route=>{calls.push(route.request().postData());await new Promise(r=>setTimeout(r,150));await route.fulfill({json:{ok:true}})});
 await fill(form);await form.locator('summary').click();await form.locator('[name=region]').fill('Fixture region');await form.locator('[name=timing]').fill('Next month');
 await form.locator('[type=submit]').click();await p.evaluate(()=>document.querySelector('form#kig-contact-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
 await p.locator('.form-done').waitFor();
 assert.equal(calls.length,1);assert.match(calls[0],/Proposal Request/);assert.match(calls[0],/Fixture region/);assert.match(calls[0],/Next month/);assert.match(calls[0],/request-proposal/);
 const events=await p.evaluate(()=>window.dataLayer.map(x=>Array.from(x)).filter(x=>x[0]==='event'&&x[1]==='generate_lead'));
 assert.equal(events.length,1);assert.equal(events[0][2].inquiry_type,expected);assert.equal(events[0][2].form_type,'proposal');assert.equal(events[0][2].page,'request-proposal');assert.doesNotMatch(JSON.stringify(events),/fixture@example|Fixture requirement/);
 await p.close();
});
test('Proposal: validation, failed delivery retains brief and retry succeeds',async()=>{
 const p=await page('/request-proposal');const f=p.locator('#kig-contact-form');let calls=0;
 await p.route('https://formspree.io/f/mykbaegd',route=>{calls++;return route.fulfill({status:calls===1?500:200,json:{ok:calls>1}})});
 await f.locator('[type=submit]').click();assert.equal(calls,0);
 await fill(f);await f.locator('[type=submit]').click();await p.locator('#kig-form-note[role=alert]').waitFor();
 assert.equal(await f.locator('[name=message]').inputValue(),'Fixture requirement for protective intelligence.');
 assert.equal(await f.locator('[type=submit]').isEnabled(),true);
 assert.equal(await p.evaluate(()=>window.dataLayer.filter(x=>x[1]==='generate_lead').length),0);
 await f.locator('[type=submit]').click();await p.locator('.form-done').waitFor();assert.equal(calls,2);await p.close();
});
test('Proposal: honeypot does not submit',async()=>{
 const p=await page('/request-proposal');let calls=0;await p.route('https://formspree.io/**',r=>{calls++;return r.abort()});
 const f=p.locator('#kig-contact-form');await fill(f);await f.locator('[name=_gotcha]').evaluate(el=>el.value='bot');await f.locator('[type=submit]').click();assert.equal(calls,0);await p.close();
});
test('Contact and homepage accept email plus message with General Inquiry',async()=>{
 for(const path of ['/contact','/']){
 const p=await page(path);let posted;
 await p.route('https://formspree.io/**',r=>{posted=r.request().postData();return r.fulfill({json:{ok:true}})});
 const f=p.locator('#kig-contact-form');assert.equal(await f.locator(':required').count(),2);await fill(f);await f.locator('[type=submit]').click();await p.locator('.form-done').waitFor();assert.match(posted,/General Inquiry/);await p.close();
 }
});
test('Pillar context propagates to proposal, message form and quick inquiry',async()=>{
 const p=await page('/principal-protective-intelligence');const href=await p.locator('.kig-nav-cta').getAttribute('href');assert.equal(new URL(href,base).searchParams.get('inquiry'),expected);
 const f=p.locator('#kig-bf-form');assert.equal(await f.locator('[name=inquiry_type]').inputValue(),expected);
 let posted=[];await p.route('https://formspree.io/**',r=>{posted.push(JSON.parse(r.request().postData()));return r.fulfill({json:{ok:true}})});
 await fill(f);await f.locator('[type=submit]').click();await p.locator('.kig-bf-done').waitFor();assert.equal(posted[0].inquiry_type,expected);assert.equal(posted[0].page,'principal-protective-intelligence');
 await p.locator('#qb-btn').click();await p.locator('#qb-form [name=email]').waitFor({state:'visible'});assert.equal(await p.evaluate(()=>document.activeElement.name),'email');await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>document.activeElement.id),'qb-btn');
 await p.locator('#qb-btn').click();await p.locator('#qb-form [name=email]').fill('fixture@example.com');await p.locator('#qb-form [name=need]').fill('Fixture direct inquiry');await p.locator('#qb-form [type=submit]').click();await p.locator('#qb-done.on').waitFor();assert.equal(posted[1].inquiry_type,expected);await p.close();
});
test('Full inquiry values and article context survive proposal navigation',async()=>{
 const p=await page('/contact?inquiry='+encodeURIComponent(expected));assert.equal(await p.locator('[name=inquiry_type]').inputValue(),expected);await p.close();
 const a=await page('/insights/counterparty-vetting');const h=await a.locator('.kig-nav-cta').getAttribute('href');assert.equal(new URL(h,base).searchParams.get('inquiry'),'Counterparty & Deal-Level Intelligence');await a.close();
});
test('Mobile: visible header, tap navigation, sticky hides for form/focus and has working destinations',async()=>{
 const p=await page('/principal-protective-intelligence',390);assert.equal(await p.locator('.kig-nav-cta').isVisible(),true);
 await p.locator('.kig-menu-toggle').click();await p.locator('.kig-nav-drop-btn').click();assert.equal(await p.locator('.kig-nav-drop-menu a:visible').count(),5);await p.locator('.kig-menu-toggle').click();
 await p.evaluate(()=>scrollTo(0,innerHeight*1.8));await p.waitForFunction(()=>document.querySelector('#kig-sticky-bar').classList.contains('show'));
 assert.match(await p.locator('.kig-sb-primary').getAttribute('href'),/request-proposal/);assert.doesNotMatch(await p.locator('.kig-sb-secondary').getAttribute('href'),/^#/);
 await p.locator('#kig-bf-form [name=email]').focus();await p.waitForFunction(()=>!document.querySelector('#kig-sticky-bar').classList.contains('show'));assert.equal(await p.locator('#qb-btn').isVisible(),false);await p.close();
});
test('Newsletter markup and provider submission are retained',async()=>{
 const p=await page('/newsletter');const f=p.locator('#kig-sub-form');assert.equal(await f.getAttribute('action'),'https://kronusempire.activehosted.com/proc.php');assert.equal(await f.locator('input[type=email]').count(),1);assert.equal(await f.locator('[type=submit]').isVisible(),true);await p.close();
});
