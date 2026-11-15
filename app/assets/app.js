// App edition helper: hides links to pages the app does not have (honor board, Kids Club, teacher page, Core Quest),
// and the leaderboards that need the club database.
(function(){
  var GONE = /(honor\.html|teacher\.html|kids\/|core2000\.html|install\.html|sounds\.html|copy-rules\.html|elite\/step\/)/;
  function run(){
    var as = document.querySelectorAll('a[href]');
    for (var i = 0; i < as.length; i++) {
      var a = as[i];
      if (!GONE.test(a.getAttribute('href') || '')) continue;
      var box = a.closest('.lmodes') ? a : (a.closest('.card,.qt,.tile,.pcard') || a);
      box.classList.add('app-gone');
    }
    var b = document.getElementById('board');
    if (b) { var c = b.closest('.card') || b; c.classList.add('app-gone'); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  // pages that draw links later (journey maps, result screens)
  try { new MutationObserver(function(){ clearTimeout(run.t); run.t = setTimeout(run, 120); })
    .observe(document.documentElement, { childList: true, subtree: true }); } catch (e) {}
})();
