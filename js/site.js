(function () {
  // ---- phone menu (☰) ----
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('mnav');
  if (burger && menu) {
    var setOpen = function (open) {
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
      menu.hidden = !open;
    };
    burger.addEventListener('click', function () { setOpen(menu.hidden); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { setOpen(false); burger.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 1180) setOpen(false); });
  }

  // ---- "Ещё" dropdown on desktop ----
  var moreBtn = document.querySelector('.more-btn');
  var moreMenu = document.getElementById('moreMenu');
  if (moreBtn && moreMenu) {
    var setMore = function (open) {
      moreBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      moreMenu.hidden = !open;
    };
    moreBtn.addEventListener('click', function (e) { e.stopPropagation(); setMore(moreMenu.hidden); });
    moreMenu.addEventListener('click', function (e) { if (e.target.closest('a')) setMore(false); });
    document.addEventListener('click', function (e) {
      if (!moreMenu.hidden && !e.target.closest('.more')) setMore(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !moreMenu.hidden) { setMore(false); moreBtn.focus(); }
    });
  }
})();
