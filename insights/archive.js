/* Progressive enhancement: all original article links remain available without JS.
   New .post-card entries are picked up automatically by the publishing workflow. */
(() => {
  const grid = document.querySelector('#posts-grid');
  const cards = [...grid.querySelectorAll('.post-card')];
  const size = 6;
  const tools = document.createElement('div');
  tools.className = 'archive-tools';
  tools.innerHTML = '<label>Search insights<input type="search" id="archive-search" placeholder="Search by topic or keyword"></label><label>Browse archive<select id="archive-month"><option value="">All months</option></select></label>';
  grid.before(tools);
  const search = tools.querySelector('input'), month = tools.querySelector('select');
  const data = cards.map(card => {
    const date = new Date(card.querySelector('.post-date').textContent);
    return {card, text:card.textContent.toLowerCase(), date,
      month:Number.isNaN(+date) ? '' : `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`};
  }).sort((a,b) => b.date-a.date);
  data.forEach(x => grid.append(x.card));
  [...new Set(data.map(x=>x.month).filter(Boolean))].sort().reverse().forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = new Date(`${key}-01T12:00:00`).toLocaleDateString('en-US',{month:'long',year:'numeric'});
    month.append(option);
  });
  const status = document.createElement('p');
  status.className='archive-status';status.setAttribute('role','status');
  grid.before(status);
  const nav = document.createElement('nav');
  nav.className='archive-pagination';nav.setAttribute('aria-label','Insights pages');
  grid.after(nav);
  function render(page=1, update=false) {
    const matches=data.filter(x=>(!month.value||x.month===month.value)&&x.text.includes(search.value.toLowerCase().trim()));
    const total=Math.max(1,Math.ceil(matches.length/size));
    page=Math.max(1,Math.min(total,Math.floor(Number(page)||1)));
    data.forEach(x=>x.card.hidden=true);
    matches.slice((page-1)*size,page*size).forEach(x=>x.card.hidden=false);
    status.textContent=matches.length?`Showing ${(page-1)*size+1}–${Math.min(page*size,matches.length)} of ${matches.length} articles · Page ${page} of ${total}`:'No matching articles. Try another keyword or month.';
    nav.replaceChildren();nav.hidden=total===1;
    const urlFor=n=>{const u=new URL(location.href);u.search='';if(n>1)u.searchParams.set('page',n);if(search.value)u.searchParams.set('q',search.value);if(month.value)u.searchParams.set('month',month.value);return u;};
    const link=(n,label)=>{const a=document.createElement('a');a.href=urlFor(n);a.textContent=label;if(n===page){a.setAttribute('aria-current','page');}a.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();render(n,true);status.tabIndex=-1;status.focus({preventScroll:true});tools.scrollIntoView({block:'start'});});nav.append(a);};
    if(page>1)link(page-1,'Previous');
    let prev=0;
    for(let n=1;n<=total;n++){
      if(n===1||n===total||Math.abs(n-page)<=2){
        if(prev&&n-prev>1){const s=document.createElement('span');s.className='archive-gap';s.textContent='…';nav.appendChild(s);}
        link(n,String(n));prev=n;
      }
    }
    if(page<total)link(page+1,'Next');
    if(update)history.pushState(null,'',urlFor(page));
  }
  function restore(){const p=new URLSearchParams(location.search);search.value=p.get('q')||'';month.value=p.get('month')||'';render(p.get('page'));}
  search.addEventListener('input',()=>render(1,true));
  month.addEventListener('change',()=>render(1,true));
  window.addEventListener('popstate',restore);
  restore();
})();
