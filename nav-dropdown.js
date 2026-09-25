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
  });
  document.addEventListener('click', closeAll);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll();
  });
})();
