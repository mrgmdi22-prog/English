// Registration gate: every page except the honor board and the teacher page asks a new visitor
// to register once (honor.html), then sends them back to the page they wanted.
(function(){
  // Load the site-wide sound effects on every page (assets/sfx.js).
  try { var me0 = document.currentScript && document.currentScript.src;
    if (me0) { var sx = document.createElement('script'); sx.src = new URL('sfx.js?v=9', me0).href; document.head.appendChild(sx); } } catch (e) {}
  var ok = true;
  try { ok = !!(localStorage.getItem('club-reg') || localStorage.getItem('club-player')); } catch (e) { ok = true; }
  if (ok || /[?&]demo\b/.test(location.search)) return;
  var me = document.currentScript && document.currentScript.src;
  if (!me) return;
  document.documentElement.style.visibility = 'hidden';
  var next = location.pathname + location.search + location.hash;
  location.replace(new URL('../honor.html?join=1&next=' + encodeURIComponent(next), me).href);
})();
