// App edition: no registration gate. Only loads the site sounds (sfx.js), which also registers the service worker.
(function(){
  try { var me = document.currentScript && document.currentScript.src;
    if (me) { var s = document.createElement('script'); s.src = new URL('sfx.js?v=9', me).href; document.head.appendChild(s); } } catch (e) {}
})();
