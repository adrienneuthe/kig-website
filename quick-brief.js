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
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16M12 4v16"></path></svg>Start a Project';

    var panel = document.createElement('div');
    panel.id = 'qb-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Start a project with Kronus Intelligence Group');
    panel.innerHTML =
      '<div id="qb-hdr"><span>KIG // Project Intake</span>' +
      '<button id="qb-close" type="button" aria-label="Close">&#x2715;</button></div>' +
      '<div id="qb-body">' +
      '<p class="qb-lede">Three fields. A member of our team responds personally within 24 hours.</p>' +
      '<form id="qb-form">' +
      '<input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">' +
      '<input type="text" name="name" placeholder="Name (optional)" aria-label="Name">' +
      '<input type="email" name="email" placeholder="Work email" aria-label="Work email" required>' +
      '<textarea name="need" placeholder="What do you need? (one or two lines is enough)" aria-label="What do you need?" required></textarea>' +
      '<button type="submit">Send &rarr;</button>' +
      '<p id="qb-note">Confidential &middot; No sales sequence &middot; Or email project@kronusintelligencegroup.com</p>' +
      '</form></div>' +
      '<div id="qb-done"><h4>Received.</h4><p>Someone on our team will respond personally within 24 hours.</p></div>';

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    function toggle(force) {
      var open = typeof force === 'boolean' ? force : !panel.classList.contains('open');
      panel.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (open) {
        var first = panel.querySelector('input');
        if (first) setTimeout(function () { first.focus(); }, 80);
      }
    }

    btn.addEventListener('click', function () { toggle(); });
    panel.querySelector('#qb-close').addEventListener('click', function () { toggle(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('open')) toggle(false);
    });

    panel.querySelector('#qb-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var form = e.target;
      var data = {
        _subject: 'KIG Quick Project Brief',
        name: form.name.value,
        email: form.email.value,
        _replyto: form.email.value,
        need: form.need.value,
        _gotcha: form._gotcha.value,
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
          window.gtag('event', 'generate_lead', { page: location.pathname, inquiry_type: 'Quick Brief' });
        }
        form.parentNode.style.display = 'none';
        panel.querySelector('#qb-done').classList.add('on');
      }).catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send →';
        var note = panel.querySelector('#qb-note');
        note.textContent = 'Could not send. Please email project@kronusintelligencegroup.com';
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
