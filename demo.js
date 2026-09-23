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

 const monitor=document.querySelector('#monitor'),button=document.querySelector('#terminal-pause');
 function state(paused){monitor.dataset.paused=String(paused);monitor.classList.toggle('terminal-paused',paused);button.textContent=paused?'Play animation':'Pause animation';button.setAttribute('aria-pressed',String(paused));}
 state(matchMedia('(prefers-reduced-motion: reduce)').matches);
 button.addEventListener('click',()=>state(monitor.dataset.paused!=='true'));
})();
