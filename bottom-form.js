/* KIG bottom-of-page short contact form. Injected on every page except /contact
   (which has the full form already). Posts to the same Formspree endpoint. */
(function () {
  var ENDPOINT = 'https://formspree.io/f/mykbaegd';
  var mount = document.getElementById('kig-bottom-form');
  if (!mount) return;

  var preselect = mount.getAttribute('data-inquiry') || '';
  var pageName = mount.getAttribute('data-page') || document.title;

  var OPTIONS = [
    ['Principal & Executive Protective Intelligence', 'Principal & Executive Protective Intelligence'],
    ['Institutional & Infrastructure Threat Intelligence', 'Institutional & Infrastructure Threat Intelligence'],
    ['Counterparty & Deal-Level Intelligence', 'Counterparty & Deal-Level Intelligence'],
    ['Narrative & Reputational Threat Intelligence', 'Narrative & Reputational Threat Intelligence'],
    ['Electoral Integrity Intelligence', 'Electoral Integrity Intelligence'],
    ['Custom Dashboard', 'Custom Dashboard'],
    ['Executive Training', 'Executive Training'],
    ['Tactical / Field Support', 'Tactical / Field Support'],
    ['General Inquiry', 'General Inquiry']
  ];

  function optionsHtml() {
    var html = '<option value="" disabled' + (preselect ? '' : ' selected') + '>Type of inquiry</option>';
    OPTIONS.forEach(function (o) {
      var sel = (o[1] === preselect) ? ' selected' : '';
      html += '<option value="' + o[1] + '"' + sel + '>' + o[0] + '</option>';
    });
    return html;
  }

  mount.className = 'kig-bf';
  mount.innerHTML =
    '<h2>TELL US WHAT <em>YOU NEED.</em></h2>' +
    '<p class="kig-bf-sub">Active situation, upcoming deployment, counterparty concern, or a capability you need built. Someone on our team responds personally within 24 hours. Everything is confidential.</p>' +
    '<form class="kig-bf-form" id="kig-bf-form">' +
    '<input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">' +
    '<div class="kig-bf-row">' +
    '<input type="text" name="name" placeholder="Name (optional)" aria-label="Name">' +
    '<input type="email" name="email" placeholder="Email" aria-label="Email" required>' +
    '</div>' +
    '<div class="kig-bf-row">' +
    '<input type="text" name="organization" placeholder="Organization (optional)" aria-label="Organization">' +
    '<select name="inquiry_type" aria-label="Type of inquiry">' + optionsHtml() + '</select>' +
    '</div>' +
    '<textarea name="message" placeholder="What do you need?" aria-label="What do you need?" required></textarea>' +
    '<button type="submit">Send Message &rarr;</button>' +
    '<p class="kig-bf-privacy">Confidential. See our <a href="/privacy">Privacy Policy</a>.</p>' +
    '</form>' +
    '<p class="kig-bf-email">Prefer email? <a href="mailto:project@kronusintelligencegroup.com">project@kronusintelligencegroup.com</a></p>';

  var form = document.getElementById('kig-bf-form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = form.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    var resolvedInquiryType = form.inquiry_type.value || 'General Inquiry';
    var data = {
      _subject: 'KIG Website Inquiry — ' + pageName,
      name: form.name.value,
      email: form.email.value,
      _replyto: form.email.value,
      organization: form.organization.value,
      inquiry_type: resolvedInquiryType,
      message: form.message.value,
      _gotcha: form._gotcha.value,
      page: pageName,
      source: 'KIG website bottom form — ' + location.pathname
    };
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) {
      if (!r.ok) throw new Error('bad status');
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', { page: pageName, inquiry_type: data.inquiry_type });
      }
      var done = document.createElement('div');
      done.className = 'kig-bf-done';
      done.innerHTML = '<h3>Received.</h3><p>Someone on our team will respond personally within 24 hours.</p>';
      mount.innerHTML = '';
      mount.appendChild(done);
    }).catch(function () {
      btn.disabled = false;
      btn.textContent = 'Send Message →';
      var note = document.createElement('p');
      note.className = 'kig-bf-note';
      note.textContent = 'Could not send. Please email project@kronusintelligencegroup.com';
      form.appendChild(note);
    });
  });
})();
