/* Mobile sticky "Start a Project / Message Us" bar. Mobile only (<=700px, see sticky-cta.css).
   Appears after the visitor scrolls past the hero, hides while any form/footer is in view
   so it never covers form fields, honors prefers-reduced-motion (no animation used — show/hide
   only via display toggle). */
(function () {
  if (window.matchMedia && window.matchMedia('(min-width:701px)').matches) return;

  var bar = document.createElement('div');
  bar.id = 'kig-sticky-bar';
  var inquiryEl = document.getElementById('kig-bottom-form');
  var inquiry = inquiryEl ? inquiryEl.getAttribute('data-inquiry') : '';
  var startHref = '/contact' + (inquiry ? '?inquiry=' + encodeURIComponent(inquiry) : '');
  bar.innerHTML =
    '<a class="kig-sb-primary" href="' + startHref + '">Start a Project</a>' +
    '<a class="kig-sb-secondary" href="#kig-bottom-form">Message Us</a>';
  document.body.appendChild(bar);

  var pastHero = false;
  var nearForm = false;

  function sync() {
    if (pastHero && !nearForm) {
      bar.classList.add('show');
    } else {
      bar.classList.remove('show');
    }
  }

  var hero = document.querySelector('.hero, .about-hero, header + main, main > div:first-child');
  if (hero && 'IntersectionObserver' in window) {
    var heroObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        sync();
      });
    }, { threshold: 0 });
    heroObserver.observe(hero);
  } else {
    // Fallback: reveal after a scroll threshold.
    window.addEventListener('scroll', function () {
      pastHero = window.scrollY > window.innerHeight * 0.6;
      sync();
    }, { passive: true });
  }

  var formTargets = document.querySelectorAll('#kig-bottom-form, .cta-form, footer.kig-footer');
  if (formTargets.length && 'IntersectionObserver' in window) {
    var formObserver = new IntersectionObserver(function (entries) {
      nearForm = entries.some(function (e) { return e.isIntersecting; });
      sync();
    }, { threshold: 0.05 });
    formTargets.forEach(function (el) { formObserver.observe(el); });
  }
})();
