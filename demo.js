(() => {
 const services=document.querySelector('.services');
 const panels=[...services.querySelectorAll('[id^="pillar-"]')];
 const names=['Principal & Executive','Institutional & Infrastructure','Counterparty & Deals','Narrative & Reputation'];
 const tabs=document.createElement('div');tabs.className='service-switcher';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Explore intelligence services');
 panels[0].before(tabs);services.classList.add('enhanced');
 function select(i,focus=false){panels.forEach((p,n)=>{p.hidden=n!==i;const b=tabs.children[n];b.setAttribute('aria-selected',n===i);b.tabIndex=n===i?0:-1;});if(focus)tabs.children[i].focus();}
 panels.forEach((p,i)=>{const b=document.createElement('button');b.id=`service-tab-${i}`;b.textContent=`0${i+1} / ${names[i]}`;b.setAttribute('role','tab');b.setAttribute('aria-controls',p.id);p.setAttribute('role','tabpanel');p.setAttribute('aria-labelledby',b.id);b.addEventListener('click',()=>select(i));b.addEventListener('keydown',e=>{let n=i;if(e.key==='ArrowRight')n=(i+1)%4;else if(e.key==='ArrowLeft')n=(i+3)%4;else if(e.key==='Home')n=0;else if(e.key==='End')n=3;else return;e.preventDefault();select(n,true);});tabs.append(b);});
 function hash(){const i=panels.findIndex(p=>`#${p.id}`===location.hash);select(i<0?0:i);}
 hash();window.addEventListener('hashchange',hash);
 document.querySelectorAll('a[href^="#pillar-"]').forEach(a=>a.addEventListener('click',()=>{const i=panels.findIndex(p=>`#${p.id}`===a.getAttribute('href'));if(i>=0)select(i);}));
 const demo=document.querySelector('.demo'),pause=document.querySelector('#demo-pause');
 let paused=matchMedia('(prefers-reduced-motion: reduce)').matches,visible=false,tick=0;
 function state(){demo.classList.toggle('paused',paused||!visible);pause.textContent=paused?'Play animation':'Pause animation';pause.setAttribute('aria-pressed',String(paused));}
 pause.addEventListener('click',()=>{paused=!paused;state();});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;state();},{threshold:.1}).observe(demo);
 document.querySelectorAll('[data-layer]').forEach(b=>b.addEventListener('click',()=>{const on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on);document.getElementById(b.dataset.layer).style.display=on?'':'none';}));
 const scenarios=[
 ['Narrative signals linked for analyst review','Illustrative scenario / information environment'],
 ['Shipping-route disruption flagged','Illustrative scenario / supply-chain exposure'],
 ['Facility perimeter event queued for review','Illustrative scenario / protective intelligence'],
 ['Entity relationship added to case view','Illustrative scenario / counterparty analysis'],
 ['Cross-source corroboration ready','Illustrative scenario / analyst workflow']
 ];
 setInterval(()=>{if(paused||!visible||document.hidden)return;tick++;const feed=document.querySelector('.demo-feed');const li=document.createElement('li');const [text,meta]=scenarios[tick%scenarios.length];li.textContent=text;const small=document.createElement('small');small.textContent=meta;li.prepend(small);feed.prepend(li);while(feed.children.length>4)feed.lastChild.remove();document.querySelector('#demo-cycle').textContent=`SCENARIO CYCLE ${String(tick+1).padStart(2,'0')}`;document.querySelectorAll('.demo-bars i').forEach((bar,i)=>bar.style.width=`${35+(tick*7+i*19)%55}%`);},4000);
 state();
})();
