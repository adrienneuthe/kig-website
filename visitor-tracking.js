/* Optional visitor analytics. No contact emails, form values or newsletter actions. */
(function () {
  'use strict';
  var hosts = ["kronusintelligencegroup.com", "www.kronusintelligencegroup.com"];
  var key = 'visitor-tracking-consent-v1';
  var loaded = false;
  function blocked() {
    return navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' ||
      window.doNotTrack === '1' || navigator.msDoNotTrack === '1';
  }
  function preference() {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  function start() {
    if (blocked() || preference() !== 'granted' || hosts.indexOf(location.hostname) < 0 || loaded) return;
    loaded = true;
    window.visitorGlobalObjectAlias = 'vgo';
    window.vgo = window.vgo || function () { (window.vgo.q = window.vgo.q || []).push(arguments); };
    window.vgo.l = +new Date();
    window.vgo('setAccount', '227212863');
    // This becomes true ONLY after this visitor explicitly allows tracking.
    window.vgo('setTrackByDefault', true);
    window.vgo('process');
    var script = document.createElement('script');
    script.id = 'ac-visitor-tracker';
    script.async = true;
    script.src = 'https://diffuser-cdn.app-us1.com/diffuser/diffuser.js';
    document.head.appendChild(script);
  }
  function mount() {
    if (document.getElementById('visitor-tracking-preferences')) return;
    var box = document.createElement('details');
    box.id = 'visitor-tracking-preferences';
    box.className = 'visitor-tracking-preferences';
    box.open = !preference() && !blocked();
    box.innerHTML = '<summary>Visitor tracking preferences</summary>' +
      '<p>Allow ActiveCampaign to measure your visits and recognize returning contacts? This is optional and does not subscribe you to email. <a href="/privacy">Privacy policy</a>.</p>' +
      '<p class="visitor-tracking-status" aria-live="polite"></p>' +
      '<div><button type="button" data-tracking="allow">Allow visitor tracking</button>' +
      '<button type="button" data-tracking="decline">Decline / turn off</button></div>';
    var footer = document.querySelector('footer');
    (footer || document.body).appendChild(box);
    var status = box.querySelector('.visitor-tracking-status');
    var allow = box.querySelector('[data-tracking=allow]');
    function render() {
      allow.disabled = blocked();
      status.textContent = blocked() ? 'Visitor tracking is off because your browser requests privacy.' :
        preference() === 'granted' ? 'Visitor tracking is allowed. You can turn it off here at any time.' : 'Visitor tracking is off.';
    }
    function choose(event) {
      var action = event.target.getAttribute('data-tracking');
      if (!action) return;
      var value = action === 'allow' && !blocked() ? 'granted' : 'denied';
      try { localStorage.setItem(key, value); } catch {
        status.textContent = 'Your browser could not save this preference. Visitor tracking remains off.';
        return;
      }
      if (value === 'granted') start();
      // Reload removes the already-loaded tracker; the denied preference prevents reinjection.
      else if (loaded) { window.location.reload(); return; }
      var prompt = document.getElementById('visitor-tracking-prompt');
      if (prompt) prompt.remove();
      box.open = false;
      render();
    }
    box.addEventListener('click', choose);
    if (!preference() && !blocked()) {
      var prompt = document.createElement('aside');
      prompt.id = 'visitor-tracking-prompt';
      prompt.className = 'visitor-tracking-prompt';
      prompt.setAttribute('aria-label', 'Optional visitor tracking');
      prompt.innerHTML = '<strong>Optional visitor tracking</strong>' +
        '<p>Allow ActiveCampaign to measure visits and recognize returning contacts? Tracking stays off unless you allow it. This does not subscribe you to email. <a href="/privacy">Privacy policy</a>.</p>' +
        '<div><button type="button" data-tracking="allow">Allow</button><button type="button" data-tracking="decline">Decline</button></div>';
      prompt.addEventListener('click', choose);
      document.body.appendChild(prompt);
    }
    render();
    start();
  }
  document.addEventListener('ac-page-view', function () {
    mount();
    if (loaded && !blocked() && preference() === 'granted') window.vgo('process');
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
