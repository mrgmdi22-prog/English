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
      var go = function(){ import(new URL('honor.js?v=20261101c', me).href).then(function(m){ return m.sync(false).catch(function(){}).then(function(){ m.showCodeOnce(); }); }).catch(function(){}); };
      if(document.readyState === 'complete') setTimeout(go, 800); else addEventListener('load', function(){ setTimeout(go, 800); });
      // Also send new points while the student keeps playing on the same page, and when they leave it.
      // sync(false) does nothing unless the points changed, so this costs nothing when idle.
      setInterval(function(){ if(document.visibilityState === 'visible') go(); }, 30000);
      addEventListener('visibilitychange', function(){ if(document.visibilityState === 'hidden') go(); });
      addEventListener('pagehide', go);
    }
  }catch(e){}
})();
// Mystery Box 📦: a small floating button (bottom-right) while today's box is still closed, and a one-time
// "well done, today's box is waiting" note after the student earns points on a page. Hidden once the box is opened.
(function(){
  try{
    var me = document.currentScript && document.currentScript.src, P = location.pathname;
    var home = new URL('../', me).pathname;
    if(!me || P === home || P === home + 'index.html' || /\/(honor|teacher|guide|install|offline|sounds|links)\.html$/.test(P) || /\/(mystery|level|kids)\//.test(P)) return;
    var day = Math.floor((Date.now() + 3 * 3600e3) / 864e5);
    var opened = function(){ try { return (JSON.parse(localStorage.getItem('mb-days') || '{}') || {})[day] !== undefined; } catch(e){ return true; } };
    if(opened()) return;
    var href = new URL('../mystery/index.html', me).href;
    var css = '#clubMB{position:fixed;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:998;display:inline-flex;align-items:center;gap:6px;' +
      'background:#fff;border:2px solid #E9DDFB;border-radius:999px;padding:6px 14px 6px 8px;text-decoration:none;color:#4B2DAA;font:800 16px/1.2 Lexend,Tajawal,system-ui,sans-serif;' +
      'box-shadow:0 10px 22px -12px rgba(90,60,170,.6);direction:ltr}#clubMB b{font-size:24px;line-height:1}#clubMB:focus-visible{outline:3px solid #6d4aff;outline-offset:3px}' +
      '@keyframes clubMBw{0%,100%{transform:rotate(0)}25%{transform:rotate(-7deg)}75%{transform:rotate(7deg)}}#clubMB.wob b{display:inline-block;animation:clubMBw .6s ease-in-out 3}' +
      '#clubMBtip{position:fixed;right:12px;left:12px;bottom:calc(66px + env(safe-area-inset-bottom,0px));z-index:998;max-width:380px;margin-inline-start:auto;background:#FBF7FF;border:2px solid #CDB8F7;' +
      'border-radius:18px;padding:10px 14px;font:700 17px/1.6 Tajawal,system-ui,sans-serif;color:#2B2250;box-shadow:0 14px 28px -16px rgba(90,60,170,.6);direction:rtl}' +
      '#clubMBtip a{display:inline-block;margin-top:6px;background:#7A4FE0;color:#fff;border-radius:999px;padding:5px 16px;text-decoration:none}#clubMBtip button{font:inherit;border:0;background:none;color:#5F5B7A;cursor:pointer;margin-inline-start:8px}' +
      'body.reading #clubMB,body.reading #clubMBtip{display:none}@media print{#clubMB,#clubMBtip{display:none}}';
    var sig = function(){ var t = ''; try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && /best|stars|known/.test(k)) t += k + '=' + (localStorage.getItem(k) || '').length + (localStorage.getItem(k) || '').slice(0, 6) + ';'; } } catch(e){} return t; };
    var start = null;
    var put = function(){
      if (!document.body || document.getElementById('clubMB')) return;
      var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
      var a = document.createElement('a'); a.id = 'clubMB'; a.href = href; a.setAttribute('aria-label', 'Mystery Box: صندوق اليوم لم يُفتح بعد');
      a.innerHTML = '<b>📦</b>Mystery Box'; document.body.appendChild(a);
      start = sig();
      setInterval(function(){
        if (opened()) { a.remove(); var t0 = document.getElementById('clubMBtip'); if (t0) t0.remove(); return; }
        var shown = false; try { shown = localStorage.getItem('mb-tip') == day; } catch(e){}
        if (shown || sig() === start) return;
        try { localStorage.setItem('mb-tip', String(day)); } catch(e){}
        a.classList.add('wob');
        var t = document.createElement('div'); t.id = 'clubMBtip'; t.setAttribute('role', 'status');
        t.innerHTML = 'أحسنت! 👏 صندوق اليوم 📦 ما زال مغلقاً: 8 أسئلة مفاجئة بنقاط مضاعفة.<br><a href="' + href + '">افتحه الآن ←</a><button type="button">لاحقاً</button>';
        t.querySelector('button').onclick = function(){ t.remove(); };
        document.body.appendChild(t);
      }, 5000);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', put); else put();
  }catch(e){}
})();
