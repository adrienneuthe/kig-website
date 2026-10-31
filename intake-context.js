/* Shared, non-sensitive context for inquiry and proposal routes. */
(function () {
  var map = {
    principal: 'Principal & Executive Protective Intelligence',
    institutional: 'Institutional & Infrastructure Threat Intelligence',
    counterparty: 'Counterparty & Deal-Level Intelligence',
    narrative: 'Narrative & Reputational Threat Intelligence',
    dashboard: 'Custom Dashboard', electoral: 'Electoral Integrity Intelligence',
    general: 'General Inquiry'
  };
  function resolve(value) {
    if (!value) return '';
    if (map[value.toLowerCase()]) return map[value.toLowerCase()];
    return Object.keys(map).some(function (key) { return map[key] === value; }) ? value : '';
  }
  function context() {
    var selected = resolve(new URLSearchParams(location.search).get('inquiry'));
    if (selected) return selected;
    var mount = document.getElementById('kig-bottom-form');
    selected = resolve(mount && mount.getAttribute('data-inquiry'));
    if (selected) return selected;
    var path = location.pathname;
    if (/principal-protective/.test(path)) return map.principal;
    if (/institutional-threat/.test(path)) return map.institutional;
    if (/counterparty-deal/.test(path)) return map.counterparty;
    if (/narrative-threat/.test(path)) return map.narrative;
    if (/dashboards/.test(path)) return map.dashboard;
    return map.general;
  }
  function href(path, inquiry) { return path + '?inquiry=' + encodeURIComponent(resolve(inquiry) || context()); }
  window.KIGIntake = {resolve: resolve, context: context, href: href,
    page: function () { return location.pathname.replace(/\.html$/, '').replace(/^\/+|\/+$/g, '') || 'home'; }};
  function build() {
    document.querySelectorAll('[data-proposal-link]').forEach(function (link) {
      link.href = href('/request-proposal', link.getAttribute('data-inquiry'));
    });
    document.querySelectorAll('[data-contact-link]').forEach(function (link) {
      link.href = href('/contact', link.getAttribute('data-inquiry'));
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
