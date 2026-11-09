const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const brand=process.argv[2], base=process.argv[3];
(async()=>{
const browser=await chromium.launch({headless:true});
fs.mkdirSync('/tmp/consent-shots',{recursive:true});
for(const width of [390,1440]){
 const p=await browser.newPage({viewport:{width,height:900}});
 let tracker=0;
 await p.route('https://diffuser-cdn.app-us1.com/**',r=>{tracker++;return r.abort()});
 await p.route('https://formspree.io/**',r=>r.abort());
 await p.goto(base+'/');
 const prompt=p.locator('#visitor-tracking-prompt');
 await prompt.waitFor();
 const b=await prompt.boundingBox();
 assert.ok(b.x>=0&&b.x+b.width<=width+1);
 assert.ok(b.y>=72&&b.y+b.height<=900);
 const buttons=prompt.locator('button');
 const a=await buttons.nth(0).boundingBox(),d=await buttons.nth(1).boundingBox();
 assert.ok(Math.abs(a.width-d.width)<=1);assert.ok(a.height>=44&&d.height>=44);
 const bar=p.locator('#kig-sticky-bar');
 if(await bar.isVisible()){const s=await bar.boundingBox();assert.ok(b.y+b.height<=s.y||s.y+s.height<=b.y);}
 await p.screenshot({path:`/tmp/consent-shots/${brand}-${width}-prompt.png`});
 await buttons.nth(1).focus();await p.keyboard.press('Enter');
 assert.equal(await prompt.count(),0);assert.equal(tracker,0);
 await p.reload();assert.equal(await prompt.count(),0);
 const prefs=p.locator('#visitor-tracking-preferences');
 await prefs.locator('summary').click();
 await prefs.getByRole('button',{name:'Allow visitor tracking',exact:true}).click();
 assert.equal(await p.evaluate(()=>localStorage.getItem('visitor-tracking-consent-v1')),'granted');
 assert.equal(tracker,0); // previews/local intentionally cannot load vendor
 await prefs.locator('summary').click();
 await prefs.getByRole('button',{name:'Decline / turn off',exact:true}).click();
 assert.equal(await p.evaluate(()=>localStorage.getItem('visitor-tracking-consent-v1')),'denied');
 await p.close();
 console.log(`${brand} ${width}: visible equal-choice prompt, bounds, sticky non-overlap, keyboard decline, persistence and revoke PASS`);
}
const p=await browser.newPage();
await p.addInitScript(()=>Object.defineProperty(navigator,'globalPrivacyControl',{value:true}));
await p.goto(base+'/');await p.locator('#visitor-tracking-preferences').waitFor();
assert.equal(await p.locator('#visitor-tracking-prompt').count(),0);
assert.equal(await p.locator('[data-tracking=allow]').isDisabled(),true);
await p.close();await browser.close();
console.log(`${brand}: GPC override PASS`);
})().catch(e=>{console.error(e);process.exit(1)});
