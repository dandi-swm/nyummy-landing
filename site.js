/* Nyummy landing (ko/ and jp/): falling snow, store order by device, Airbridge click event, gentle reveal.
   Every part is guarded: the page reads fully with this file missing or failing. */
(function () {
  'use strict';
  var doc = document, html = doc.documentElement;

  /* ---------- Airbridge: never let the SDK break a click */
  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-play], a[data-appstore]');
    if (!a) return;
    var name = a.hasAttribute('data-appstore') ? 'landing_appstore_click' : 'landing_play_click';
    try { if (window.airbridge && window.airbridge.events && typeof window.airbridge.events.send === 'function') window.airbridge.events.send(name); } catch (err) {}
  });

  /* ---------- iPhone / iPad: App Store pill first (no redirect; Android keeps Play first) */
  var ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) {
    doc.querySelectorAll('[data-appstore]').forEach(function (s) { s.parentNode.insertBefore(s, s.parentNode.firstChild); });
  }

  /* ---------- gentle reveal (content is visible without JS; .js is only added here) */
  if ('IntersectionObserver' in window) {
    html.classList.add('js');
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); ro.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    doc.querySelectorAll('.reveal').forEach(function (el) { ro.observe(el); });
    setTimeout(function () { doc.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); }); }, 4000);
  }

  /* ---------- snow: one canvas, count by viewport, DPR capped at 1.5, paused off-screen or hidden */
  var canvas = doc.querySelector('.snow');
  if (!canvas || !canvas.getContext) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { canvas.remove(); return; }
  var ctx = canvas.getContext('2d'), flakes = [], w = 0, h = 0, dpr = 1, raf = 0, visible = true, last = 0;

  function size() {
    var r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var target = Math.round(Math.min(100, Math.max(40, w / 14)));
    while (flakes.length < target) flakes.push(make(true));
    flakes.length = target;
  }
  function make(anyY) {
    var r = Math.random() * 2.4 + 0.8;
    return { x: Math.random() * w, y: anyY ? Math.random() * h : -6, r: r, vy: 14 + r * 12 + Math.random() * 10, sway: Math.random() * 6.28, sw: 0.4 + Math.random() * 0.8, a: 0.45 + Math.random() * 0.45 };
  }
  function frame(t) {
    raf = 0;
    if (!visible || doc.hidden) return;
    var dt = last ? Math.min((t - last) / 1000, 0.05) : 0.016; last = t;
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < flakes.length; i++) {
      var f = flakes[i];
      f.y += f.vy * dt; f.sway += f.sw * dt; f.x += Math.sin(f.sway) * 12 * dt;
      if (f.y > h + 6) { flakes[i] = make(false); continue; }
      ctx.globalAlpha = f.a;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.2832); ctx.fillStyle = '#fff'; ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!raf && visible && !doc.hidden) { last = 0; raf = requestAnimationFrame(frame); } }
  size();
  window.addEventListener('resize', function () { size(); });
  doc.addEventListener('visibilitychange', start);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; start(); }).observe(canvas.parentNode);
  }
  start();
})();
