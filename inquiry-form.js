/* Inline inquiry/proposal submission through the existing intake endpoint. */
(function () {
  var form = document.getElementById('kig-contact-form');
  if (!form) return;
  var select = form.elements.namedItem('inquiry_type');
  var requested = window.KIGIntake && KIGIntake.resolve(new URLSearchParams(location.search).get('inquiry'));
  if (requested && select) select.value = requested;
  if (select && !select.value) select.value = 'General Inquiry';
  var busy = false;
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (busy || !form.reportValidity()) return;
    if (form.elements.namedItem('_gotcha').value) return;
    busy = true;
    var button = form.querySelector('button[type="submit"]');
    var original = button.textContent;
    var note = document.getElementById('kig-form-note');
    var inquiry = (select && select.value) || 'General Inquiry';
    var page = window.KIGIntake ? KIGIntake.page() : location.pathname;
    var kind = form.getAttribute('data-request-type') || 'Message';
    var data = new FormData(form);
    data.set('inquiry_type', inquiry);
    data.set('_referral', ['Executive Training', 'Tactical / Field Support'].indexOf(inquiry) > -1 ? 'true' : 'false');
    data.set('page', page);
    data.set('request_type', kind);
    data.set('_replyto', data.get('email'));
    data.set('_subject', 'KIG ' + kind + ' — ' + page + ' — ' + inquiry);
    data.set('source', 'KIG website — ' + location.pathname);
    // The form's message remains intact while optional scope context is appended.
    var context = [];
    ['region', 'timing'].forEach(function (name) {
      var field = form.elements.namedItem(name);
      if (field && field.value.trim()) context.push(name + ': ' + field.value.trim());
    });
    if (context.length) data.set('message', data.get('message') + '\n\n' + context.join('\n'));
    data.delete('region'); data.delete('timing');
    button.disabled = true; button.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    if (note) { note.textContent = 'Sending your ' + (kind === 'Proposal Request' ? 'brief' : 'message') + '…'; note.setAttribute('role', 'status'); }
    fetch(form.action, {method: 'POST', body: data, headers: {Accept: 'application/json'}})
      .then(function (response) {
        if (!response.ok) throw new Error('Submission failed');
        if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', {page: page, inquiry_type: inquiry, form_type: kind === 'Proposal Request' ? 'proposal' : 'contact'});
        var done = document.createElement('div');
        done.className = 'form-done'; done.setAttribute('role', 'status'); done.setAttribute('tabindex', '-1');
        done.innerHTML = kind === 'Proposal Request'
          ? '<h3>Brief received.</h3><p>Our team will review your requirement and reply by email to clarify the scope for your proposal. No account or booking needed.</p>'
          : '<h3>Received.</h3><p>Someone on our team will respond personally within 24 hours.</p>';
        form.replaceWith(done); done.focus();
      }).catch(function () {
        busy = false; button.disabled = false; button.textContent = original; form.removeAttribute('aria-busy');
        if (note) { note.setAttribute('role', 'alert'); note.textContent = 'Your message could not be sent. Your details are still here. Please try again, or email project@kronusintelligencegroup.com.'; }
      });
  });
})();
