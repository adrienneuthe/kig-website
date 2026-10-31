/* One mobile action bar; never overlays an active form or keyboard. */
(function () {
  if (!window.matchMedia('(max-width:700px)').matches) return;
  var bar = document.createElement('div'); bar.id = 'kig-sticky-bar';
  var context = window.KIGIntake;
  var href = context ? context.href('/request-proposal') : '/request-proposal';
  var contact = context ? context.href('/contact') : '/contact';
  bar.innerHTML = '<a class="kig-sb-primary" href="' + href + '">Request a Proposal</a><a class="kig-sb-secondary" href="' + contact + '">Message Us</a>';
  document.body.appendChild(bar);
  var pastHero = false;
  var visibleTargets = new Set();
  function sync() {
    var focused = document.activeElement;
    var typing = focused && /^(INPUT|TEXTAREA|SELECT)$/.test(focused.tagName);
    var keyboard = window.visualViewport && window.visualViewport.height < window.innerHeight * .75;
    bar.classList.toggle('show', pastHero && visibleTargets.size === 0 && !typing && !keyboard);
  }
  var hero = document.querySelector('.hero, .about-hero, .pillar-hero, .dashboard-hero, .kig-intake-heading, main > header, main > div:first-child');
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0; }); sync();
    }).observe(hero);
  } else {
    window.addEventListener('scroll', function () { pastHero = window.scrollY > window.innerHeight * .6; sync(); }, {passive: true});
  }
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) visibleTargets.add(entry.target); else visibleTargets.delete(entry.target); }); sync();
    }, {rootMargin: '0px 0px 100px 0px', threshold: 0});
    document.querySelectorAll('#kig-bottom-form, .cta-form, .kig-intake-form, footer.kig-footer').forEach(function (target) { observer.observe(target); });
  }
  document.addEventListener('focusin', sync);
  document.addEventListener('focusout', function () { requestAnimationFrame(sync); });
  if (window.visualViewport) window.visualViewport.addEventListener('resize', sync);
})();
