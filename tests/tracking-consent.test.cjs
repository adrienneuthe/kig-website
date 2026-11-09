const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const file = fs.existsSync('public/visitor-tracking.js') ? 'public/visitor-tracking.js' : 'visitor-tracking.js';
const source = fs.readFileSync(file, 'utf8');
const isKC = file.startsWith('public');
const production = isKC ? 'www.kronuscommunications.com' : 'kronusintelligencegroup.com';
function fixture({host=production, preference=null, gpc=false, dnt=null, storageFails=false}={}) {
  let saved=preference, reloads=0, listener, scripts=[], events={}, elements={};
  const status={textContent:''}, allow={disabled:false};
  const document={
    readyState:'complete',
    getElementById:id=>elements[id],
    head:{appendChild:s=>scripts.push(s)},
    body:{appendChild:b=>elements[b.id]=b},
    querySelector:()=>null,
    addEventListener:(name,fn)=>events[name]=fn,
    createElement:tag=>tag==='script'?{}:{
      setAttribute(){}, remove(){delete elements[this.id];},
      querySelector:s=>s==='.visitor-tracking-status'?status:allow,
      addEventListener:(name,fn)=>listener=fn,
    },
  };
  const context={document,navigator:{globalPrivacyControl:gpc,doNotTrack:dnt},
    location:{hostname:host},localStorage:{
      getItem:()=>saved,
      setItem:(key,value)=>{if(storageFails)throw Error('blocked'); saved=value;},
    },Date};
  context.window=context;
  context.window.location={...context.location,reload:()=>reloads++};
  vm.runInNewContext(source, context);
  return {scripts,context,events,status,allow,
    click:action=>listener({target:{getAttribute:()=>action}}),
    saved:()=>saved,reloads:()=>reloads,elements};
}
test('default off, no network or identity before consent',()=>{
  const f=fixture();assert.equal(f.scripts.length,0);assert.equal(f.context.vgo,undefined);
  assert.match(f.status.textContent,/off/);
});
test('explicit allow loads public account once and stores only preference',()=>{
  const f=fixture();f.click('allow');f.click('allow');
  assert.equal(f.saved(),'granted');assert.equal(f.scripts.length,1);
  const calls=f.context.vgo.q.map(x=>Array.from(x));
  assert.equal(JSON.stringify(calls),JSON.stringify([['setAccount','227212863'],['setTrackByDefault',true],['process']]));
  assert.doesNotMatch(source,/setEmail|contactLists|formspree/);
});
test('decline does not track and revocation reloads without reinjection',()=>{
  const f=fixture();f.click('decline');assert.equal(f.saved(),'denied');assert.equal(f.scripts.length,0);
  const granted=fixture({preference:'granted'});granted.click('decline');
  assert.equal(granted.saved(),'denied');assert.equal(granted.reloads(),1);
  assert.equal(fixture({preference:granted.saved()}).scripts.length,0);
});
for(const opts of [
  {host:'repair-preview.vercel.app',preference:'granted'},
  {host:'localhost',preference:'granted'},
  {host:production+'.attacker.example',preference:'granted'},
  {gpc:true,preference:'granted'},{dnt:'1',preference:'granted'},
]) test(`host/privacy gate ${JSON.stringify(opts)}`,()=>{
  const f=fixture(opts);f.click('allow');assert.equal(f.scripts.length,0);
});
test('storage failure fails closed',()=>{
  const f=fixture({storageFails:true});f.click('allow');assert.equal(f.scripts.length,0);
  assert.match(f.status.textContent,/remains off/);
});
test('SPA pageview is processed only after opt-in and not on previews',()=>{
  const f=fixture();f.events['ac-page-view']();assert.equal(f.scripts.length,0);
  f.click('allow');f.events['ac-page-view']();
  assert.equal(f.context.vgo.q.filter(x=>x[0]==='process').length,2);
  const preview=fixture({host:'preview.vercel.app',preference:'granted'});
  preview.events['ac-page-view']();assert.equal(preview.scripts.length,0);
});

test('first visit has obvious equal-choice prompt, hidden after choosing',()=>{
 const f=fixture();assert.ok(f.elements['visitor-tracking-prompt']);
 f.click('decline');assert.equal(f.elements['visitor-tracking-prompt'],undefined);
 assert.equal(fixture({preference:'denied'}).elements['visitor-tracking-prompt'],undefined);
 assert.equal(fixture({gpc:true}).elements['visitor-tracking-prompt'],undefined);
});
