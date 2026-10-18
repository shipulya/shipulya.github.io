(function () {
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
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setOpen(false); burger.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) setOpen(false); });
  }

  // Highlight the menu item of the section currently on screen (home page)
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav a[data-sec], .mnav a[data-sec]'));
  var sections = links.map(function (a) { return document.getElementById(a.dataset.sec); })
                      .filter(function (el, i, arr) { return el && arr.indexOf(el) === i; });
  if (!sections.length || !('IntersectionObserver' in window)) return;
  var visible = {};
  var mark = function () {
    var best = null;
    sections.forEach(function (s) { if (visible[s.id] && (!best || s.offsetTop > best.offsetTop)) best = s; });
    links.forEach(function (a) { a.classList.toggle('is-active', !!best && a.dataset.sec === best.id); });
  };
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
    mark();
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(function (s) { io.observe(s); });
})();
