/* Nyummy landing (ko/ and jp/): store action order by OS, Airbridge events.
   Everything here is guarded: the page reads correctly in Korean with this file missing or failing. */
(function () {
  'use strict';
  var html = document.documentElement;

  /* ---------- Airbridge events (the SDK may be blocked or still loading: never let it break a click) */
  function track(name) {
    try { if (window.airbridge && window.airbridge.events && typeof window.airbridge.events.send === 'function') window.airbridge.events.send(name); } catch (e) {}
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    if (a.hasAttribute('data-play')) track('landing_play_click');
  });
  /* ---------- OS: iPhone and iPad bring the App Store badge forward with a line that the iPhone app is in preparation; Android and desktop keep Google Play first */
  var ua = navigator.userAgent || '';
  var isIOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  if (isIOS) {
    var badge = document.querySelector('[data-store-soon]'), note = document.querySelector('[data-ios-note]');
    if (badge) { badge.classList.add('is-prominent'); badge.parentNode.insertBefore(badge, badge.parentNode.firstChild); }
    if (note) note.hidden = false;
  }
})();
