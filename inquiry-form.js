/* Inline AJAX submit for the main inquiry form (no redirect away from the site). */
(function(){
  var form=document.getElementById('kig-contact-form');
  if(!form) return;
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var btn=form.querySelector('button[type=submit]');
    var note=document.getElementById('kig-form-note');
    var sel=document.getElementById('kig-inquiry-type');
    if(sel&&!sel.value){sel.value='General Inquiry';}
    var finalInquiryType=(sel||{}).value||'General Inquiry';
    btn.disabled=true;btn.textContent='Sending…';
    fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}})
      .then(function(r){if(!r.ok)throw new Error('bad');
        if(typeof window.gtag==='function'){window.gtag('event','generate_lead',{page:'contact',inquiry_type:finalInquiryType});}
        var done=document.createElement('div');
        done.className='form-done';
        done.innerHTML='<h3>Received.</h3><p>Someone on our team will respond personally within 24 hours.</p>';
        form.parentNode.replaceChild(done,form);})
      .catch(function(){btn.disabled=false;btn.textContent='Start a Project →';
        if(note){note.textContent='Could not send. Please email project@kronusintelligencegroup.com';note.style.color='#CE5368';}});
  },true);
})();
