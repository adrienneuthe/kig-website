/* KIG quick brief widget — injects a 3-field project intake on every page.
   Posts to the same Formspree endpoint as the full contact form. */
(function () {
  var ENDPOINT = 'https://formspree.io/f/mykbaegd';

  function build() {
    var btn = document.createElement('button');
    btn.id = 'qb-btn';
    btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'qb-panel');
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16M12 4v16"></path></svg>Send a Message';

    var panel = document.createElement('div');
    panel.id = 'qb-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Send a message to Kronus Intelligence Group');
    panel.innerHTML =
      '<div id="qb-hdr"><span>KIG // Direct Inquiry</span>' +
      '<button id="qb-close" type="button" aria-label="Close">&#x2715;</button></div>' +
      '<div id="qb-body">' +
      '<p class="qb-lede">Only email and message required. A member of our team responds personally within 24 hours.</p>' +
      '<form id="qb-form">' +
      '<input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">' +
      '<label>Name (optional)<input type="text" name="name" autocomplete="name"></label>' +
      '<label>Email (required)<input type="email" name="email" autocomplete="email" required></label>' +
      '<label>What do you need? (required)<textarea name="need" placeholder="A few lines are enough. Keep sensitive details for a direct conversation." required></textarea></label>' +
      '<button type="submit">Send &rarr;</button>' +
      '<p id="qb-note">Prefer email? <a href="mailto:project@kronusintelligencegroup.com">project@kronusintelligencegroup.com</a></p>' +
      '<p id="qb-privacy">Confidential. See our <a href="/privacy">Privacy Policy</a>.</p>' +
      '</form></div>' +
      '<div id="qb-done"><h4>Received.</h4><p>Someone on our team will respond personally within 24 hours.</p></div>';

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    function toggle(force) {
      var open = typeof force === 'boolean' ? force : !panel.classList.contains('open');
      panel.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (open) {
        var first = panel.querySelector('input[name="email"]');
        if (first) first.focus();
      } else { btn.focus(); }
    }

    btn.addEventListener('click', function () { toggle(); });
    panel.querySelector('#qb-close').addEventListener('click', function () { toggle(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Tab' && panel.classList.contains('open')) {
        var fields = Array.prototype.filter.call(panel.querySelectorAll('button,input:not([name="_gotcha"]),textarea,a'), function (el) { return el.offsetParent !== null; });
        var first = fields[0], last = fields[fields.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
      if (e.key === 'Escape' && panel.classList.contains('open')) toggle(false);
    });

    panel.querySelector('#qb-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var form = e.target;
      if (form.dataset.busy || !form.reportValidity() || form.elements.namedItem('_gotcha').value) return;
      form.dataset.busy = 'true';
      var data = {
        _subject: 'KIG Direct Inquiry — ' + location.pathname,
        name: form.elements.namedItem('name').value,
        email: form.elements.namedItem('email').value,
        _replyto: form.elements.namedItem('email').value,
        inquiry_type: window.KIGIntake ? KIGIntake.context() : 'General Inquiry',
        message: form.elements.namedItem('need').value,
        _gotcha: form.elements.namedItem('_gotcha').value,
        page: window.KIGIntake ? KIGIntake.page() : location.pathname,
        source: 'KIG website quick brief — ' + location.pathname
      };
      var submitBtn = form.querySelector('button');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (!r.ok) throw new Error('bad status');
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'generate_lead', { page: data.page, inquiry_type: data.inquiry_type, form_type: 'quick_message' });
        }
        form.parentNode.style.display = 'none';
        panel.querySelector('#qb-done').classList.add('on');
        panel.querySelector('#qb-done').setAttribute('role', 'status');
        panel.querySelector('#qb-done').setAttribute('tabindex', '-1');
        panel.querySelector('#qb-done').focus();
      }).catch(function () {
        delete form.dataset.busy;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send →';
        var note = panel.querySelector('#qb-note');
        note.setAttribute('role', 'alert');
        note.textContent = 'Could not send. Your details are still here. Try again or email project@kronusintelligencegroup.com';
        note.style.color = '#CE5368';
      });
    });

    // Legacy CTA hooks across the site open this panel.
    window.toggleKIGChat = function () { toggle(); };
    window.openKIGQuickBrief = function () { toggle(true); };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
