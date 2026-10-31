/* Short message form. Existing service definitions and delivery endpoint are retained. */
(function () {
  var mount = document.getElementById('kig-bottom-form');
  if (!mount) return;
  var context = window.KIGIntake;
  var inquiry = context ? context.context() : (mount.getAttribute('data-inquiry') || 'General Inquiry');
  var page = context ? context.page() : (mount.getAttribute('data-page') || location.pathname);
  var options = ['Principal & Executive Protective Intelligence', 'Institutional & Infrastructure Threat Intelligence', 'Counterparty & Deal-Level Intelligence', 'Narrative & Reputational Threat Intelligence', 'Electoral Integrity Intelligence', 'Custom Dashboard', 'Executive Training', 'Tactical / Field Support', 'Sample Briefing Request', '15-Minute Confidential Call', 'General Inquiry'];
  function escape(text) { return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
  mount.className = 'kig-bf kig-conversion';
  mount.innerHTML = '<h2>TELL US WHAT <em>YOU NEED.</em></h2>' +
    '<p class="kig-bf-sub">A question, an active concern, or a project to scope. Start with a few lines. Only your email and message are required.</p>' +
    '<form class="kig-bf-form" id="kig-bf-form" action="https://formspree.io/f/mykbaegd" method="POST">' +
    '<input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">' +
    '<label>Email (required)<input type="email" name="email" autocomplete="email" required></label>' +
    '<label>What do you need? (required)<textarea name="message" placeholder="A few lines are enough. Keep sensitive details for a direct conversation." required></textarea></label>' +
    '<div class="kig-bf-row"><label>Name (optional)<input name="name" autocomplete="name"></label><label>Organization (optional)<input name="organization" autocomplete="organization"></label></div>' +
    '<label>Type of inquiry (optional)<select name="inquiry_type">' + options.map(function (item) { return '<option value="' + escape(item) + '"' + (inquiry === item ? ' selected' : '') + '>' + escape(item === 'General Inquiry' ? 'Not sure yet / General Inquiry' : item) + '</option>'; }).join('') + '</select></label>' +
    '<button type="submit">Send Message &rarr;</button><p class="kig-bf-note" role="status"></p>' +
    '<p class="kig-bf-privacy">Confidential. See our <a href="/privacy">Privacy Policy</a>.</p></form>' +
    '<a class="kig-bf-proposal" href="' + escape(context ? context.href('/request-proposal', inquiry) : '/request-proposal') + '">Have a scope in mind? Request a Proposal →</a>' +
    '<p class="kig-bf-email">Prefer email? <a href="mailto:project@kronusintelligencegroup.com">project@kronusintelligencegroup.com</a></p>';
  var form = mount.querySelector('form');
  var busy = false;
  function value(name) { return form.elements.namedItem(name).value; }
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (busy || !form.reportValidity() || value('_gotcha')) return;
    busy = true;
    var button = form.querySelector('button[type="submit"]');
    var note = form.querySelector('.kig-bf-note');
    var data = {_subject: 'KIG Website Inquiry — ' + page, name: value('name'), email: value('email'), _replyto: value('email'), organization: value('organization'), inquiry_type: value('inquiry_type') || 'General Inquiry', message: value('message'), _gotcha: value('_gotcha'), page: page, source: 'KIG website bottom form — ' + location.pathname};
    button.disabled = true; button.textContent = 'Sending…'; form.setAttribute('aria-busy', 'true');
    note.setAttribute('role', 'status'); note.textContent = 'Sending your message…';
    fetch(form.action, {method: 'POST', headers: {'Content-Type': 'application/json', Accept: 'application/json'}, body: JSON.stringify(data)})
      .then(function (response) {
        if (!response.ok) throw new Error('Submission failed');
        if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', {page: page, inquiry_type: data.inquiry_type, form_type: 'short_message'});
        var done = document.createElement('div'); done.className = 'kig-bf-done'; done.setAttribute('role', 'status'); done.setAttribute('tabindex', '-1');
        done.innerHTML = '<h3>Received.</h3><p>Someone on our team will respond personally within 24 hours.</p>';
        form.replaceWith(done); done.focus();
      }).catch(function () {
        busy = false; button.disabled = false; button.textContent = 'Send Message →'; form.removeAttribute('aria-busy');
        note.setAttribute('role', 'alert'); note.textContent = 'Your message could not be sent. Your details are still here. Try again, or email project@kronusintelligencegroup.com.';
      });
  });
})();
