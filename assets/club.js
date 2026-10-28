// Shared by every page: remembers the last page opened (for "continue where you left off")
// and, for students who joined the honor board, quietly sends their latest points.
(function(){
  try{
    var p = location.pathname;
    if(!/\/(index\.html)?$/.test(p) && !/\/(honor|teacher)\.html$/.test(p)){
      localStorage.setItem('club-last', JSON.stringify({p:p, t:Date.now()}));
    }
  }catch(e){}
  try{
    var me = document.currentScript && document.currentScript.src;
    if(me && localStorage.getItem('club-player') && !/\/(honor|teacher)\.html$/.test(location.pathname)){
      var go = function(){ import(new URL('honor.js?v=20261028i', me).href).then(function(m){ return m.sync(false); }).catch(function(){}); };
      if(document.readyState === 'complete') setTimeout(go, 800); else addEventListener('load', function(){ setTimeout(go, 800); });
      // Also send new points while the student keeps playing on the same page, and when they leave it.
      // sync(false) does nothing unless the points changed, so this costs nothing when idle.
      setInterval(function(){ if(document.visibilityState === 'visible') go(); }, 30000);
      addEventListener('visibilitychange', function(){ if(document.visibilityState === 'hidden') go(); });
      addEventListener('pagehide', go);
    }
  }catch(e){}
})();
