/* Shared behaviour: header, menus, cursor, magnetic buttons, reveals, service preview, hero parallax. */
(function () {
  var doc = document.documentElement;
  doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  /* ---------- header: solid after scroll, hides on scroll down ---------- */
  var hdr = document.querySelector('.hdr');
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    if (hdr) {
      hdr.classList.toggle('solid', y > 30);
      var menuOpen = document.body.classList.contains('menu-open') || (dropBtn && dropBtn.getAttribute('aria-expanded') === 'true');
      hdr.classList.toggle('hide', !menuOpen && y > 400 && y > lastY + 4);
      if (y < lastY - 4) hdr.classList.remove('hide');
    }
    lastY = y;
  }

  /* ---------- services dropdown ---------- */
  var dropBtn = document.querySelector('.drop-btn');
  var dropMenu = document.getElementById('dropMenu');
  if (dropBtn && dropMenu) {
    var setDrop = function (open) { dropBtn.setAttribute('aria-expanded', String(open)); dropMenu.hidden = !open; };
    dropBtn.addEventListener('click', function (e) { e.stopPropagation(); setDrop(dropMenu.hidden); });
    document.addEventListener('click', function (e) { if (!dropMenu.hidden && !e.target.closest('.drop')) setDrop(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !dropMenu.hidden) { setDrop(false); dropBtn.focus(); } });
  }

  /* ---------- phone menu ---------- */
  var burger = document.querySelector('.burger');
  var mnav = document.getElementById('mnav');
  if (burger && mnav) {
    var setMenu = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
      mnav.hidden = !open;
      document.body.classList.toggle('menu-open', open);
      if (open) hdr.classList.remove('hide');
    };
    burger.addEventListener('click', function () { setMenu(mnav.hidden); });
    mnav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !mnav.hidden) { setMenu(false); burger.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 1080 && !mnav.hidden) setMenu(false); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- split headings into words for the line reveal ---------- */
  document.querySelectorAll('[data-split]').forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim().replace(/\s+/g, ' '));
    el.innerHTML = words.map(function (w, i) {
      return '<span class="w" aria-hidden="true"><span class="wi" style="transition-delay:' + (i * 45) + 'ms">' + w + '</span></span>';
    }).join(' ');
  });

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('[data-split],[data-fade],[data-wipe]');
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
    revealEls.forEach(function (el) { if (!el.closest('.hero')) io.observe(el); });
    /* hero: one orchestrated load sequence */
    var heroEls = document.querySelectorAll('.hero [data-split], .hero [data-fade], .hero [data-wipe]');
    requestAnimationFrame(function () {
      heroEls.forEach(function (el) {
        var d = parseInt(el.getAttribute('data-delay') || '0', 10);
        setTimeout(function () { el.classList.add('in'); }, 120 + d);
      });
    });
  }

  if (!finePointer || reduce) return;

  /* ---------- custom cursor ----------
     A dot sits exactly on the pointer, a ring trails behind it, grows over links
     and turns into a label over project screenshots. Both re-check what is under
     the pointer after scrolls and clicks, and hide when the pointer leaves the window. */
  var dot = document.createElement('div'); dot.className = 'cur hide';
  var ring = document.createElement('div'); ring.className = 'cur-ring hide'; ring.innerHTML = '<span></span>';
  var ringLabel = ring.firstChild;
  document.body.appendChild(dot); document.body.appendChild(ring);
  var mx = -100, my = -100, rx = -100, ry = -100, seen = false, recheck = false, curLabel = '';
  var HOVER = 'a, button, summary, label, [data-cursor]';

  function setState(el) {
    var t = el && el.closest ? el.closest(HOVER) : null;
    var lab = el && el.closest ? el.closest('[data-cursor]') : null;
    var field = el && el.closest ? el.closest('input[type="text"], textarea, select') : null;
    var text = lab ? lab.getAttribute('data-cursor') : '';
    ring.classList.toggle('hover', !!t && !lab);
    ring.classList.toggle('label', !!lab);
    if (text !== curLabel) { ringLabel.textContent = text; curLabel = text; }
    ring.classList.toggle('hide', !seen || !!field);
    dot.classList.toggle('hide', !seen || !!field || !!lab);
  }
  document.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    if (!seen) { rx = mx; ry = my; }
    doc.classList.add('has-cursor');
    seen = true;
    setState(e.target);
  }, { passive: true });
  /* pointer left the window or the tab lost focus: hide until the mouse moves again */
  document.addEventListener('mouseout', function (e) { if (!e.relatedTarget) { seen = false; ring.classList.add('hide'); dot.classList.add('hide'); doc.classList.remove('has-cursor'); } });
  window.addEventListener('blur', function () { seen = false; ring.classList.add('hide'); dot.classList.add('hide'); doc.classList.remove('has-cursor'); });
  /* content moved under a still mouse (scroll, menus opening): look again on the next frame */
  window.addEventListener('scroll', function () { recheck = true; }, { passive: true });
  document.addEventListener('click', function () { recheck = true; });

  /* ---------- magnetic buttons ---------- */
  var mags = [];
  document.querySelectorAll('[data-magnetic]').forEach(function (el) {
    var m = { el: el, x: 0, y: 0, tx: 0, ty: 0, k: parseFloat(el.getAttribute('data-magnetic')) || 0.3 };
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      m.tx = (e.clientX - (r.left + r.width / 2)) * m.k;
      m.ty = (e.clientY - (r.top + r.height / 2)) * m.k;
    });
    el.addEventListener('mouseleave', function () { m.tx = 0; m.ty = 0; });
    mags.push(m);
  });

  /* ---------- service list: preview card follows the cursor ---------- */
  var preview = document.querySelector('.preview');
  var pv = { x: 0, y: 0, on: false, rot: 0 };
  if (preview) {
    var layers = preview.querySelectorAll('[data-key]');
    document.querySelectorAll('.svc-row').forEach(function (row) {
      row.addEventListener('mouseenter', function () {
        var key = row.getAttribute('data-key');
        layers.forEach(function (l) { l.classList.toggle('on', l.getAttribute('data-key') === key); });
        if (!pv.on) { pv.x = mx; pv.y = my; }
        pv.on = true; preview.classList.add('on');
      });
      row.addEventListener('mouseleave', function () { pv.on = false; preview.classList.remove('on'); });
    });
  }

  /* ---------- hero art parallax ---------- */
  var layersP = [].slice.call(document.querySelectorAll('[data-depth]')).map(function (el) {
    return { el: el, d: parseFloat(el.getAttribute('data-depth')), x: 0, y: 0 };
  });

  (function loop() {
    if (recheck && seen) { recheck = false; setState(document.elementFromPoint(mx, my)); }
    dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
    rx = lerp(rx, mx, reduce ? 1 : 0.2); ry = lerp(ry, my, reduce ? 1 : 0.2);
    ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';

    for (var i = 0; i < mags.length; i++) {
      var m = mags[i];
      m.x = lerp(m.x, m.tx, 0.18); m.y = lerp(m.y, m.ty, 0.18);
      m.el.style.transform = (Math.abs(m.x) + Math.abs(m.y) < 0.05) ? '' : 'translate3d(' + m.x.toFixed(2) + 'px,' + m.y.toFixed(2) + 'px,0)';
    }

    if (preview) {
      var px = pv.x, nx = lerp(pv.x, mx, 0.12);
      pv.x = nx; pv.y = lerp(pv.y, my, 0.12);
      pv.rot = lerp(pv.rot, Math.max(-12, Math.min(12, (mx - px) * 0.35)), 0.1);
      preview.style.transform = 'translate3d(' + (pv.x + 30) + 'px,' + (pv.y - 125) + 'px,0) scale(' + (pv.on ? 1 : 0.6) + ') rotate(' + pv.rot.toFixed(2) + 'deg)';
    }

    if (layersP.length && !reduce) {
      var cx = (mx / window.innerWidth) - 0.5, cy = (my / window.innerHeight) - 0.5;
      if (mx < 0) { cx = 0; cy = 0; }
      for (var j = 0; j < layersP.length; j++) {
        var L = layersP[j];
        L.x = lerp(L.x, cx * L.d, 0.06); L.y = lerp(L.y, cy * L.d, 0.06);
        L.el.style.transform = 'translate3d(' + L.x.toFixed(2) + 'px,' + L.y.toFixed(2) + 'px,0)';
      }
    }
    requestAnimationFrame(loop);
  })();
})();
