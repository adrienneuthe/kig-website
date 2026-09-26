(function () {
  function closeAll() {
    document.querySelectorAll('.kig-nav-drop.open').forEach(function (d) {
      d.classList.remove('open');
      var b = d.querySelector('.kig-nav-drop-btn');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  }
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.kig-nav-drop-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var drop = btn.closest('.kig-nav-drop');
        var isOpen = drop.classList.contains('open');
        closeAll();
        if (!isOpen) {
          drop.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
    var toggle = document.querySelector('.kig-menu-toggle');
    var nav = document.querySelector('nav.kig-site-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = nav.classList.toggle('kig-nav-open');
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      });
      // Close the mobile menu after a nav link is chosen.
      nav.querySelectorAll('.kig-site-links a').forEach(function (a) {
        a.addEventListener('click', function () {
          nav.classList.remove('kig-nav-open');
          toggle.setAttribute('aria-expanded', 'false');
          toggle.setAttribute('aria-label', 'Open menu');
        });
      });
    }
  });
  document.addEventListener('click', closeAll);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll();
  });
})();
