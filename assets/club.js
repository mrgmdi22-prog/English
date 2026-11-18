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
      var go = function(){ import(new URL('honor.js?v=20261118', me).href).then(function(m){ return m.sync(false).catch(function(){}).then(function(){ m.showCodeOnce(); }); }).catch(function(){}); };
      if(document.readyState === 'complete') setTimeout(go, 800); else addEventListener('load', function(){ setTimeout(go, 800); });
      // Also send new points while the student keeps playing on the same page, and when they leave it.
      // sync(false) does nothing unless the points changed, so this costs nothing when idle.
      setInterval(function(){ if(document.visibilityState === 'visible') go(); }, 30000);
      addEventListener('visibilitychange', function(){ if(document.visibilityState === 'hidden') go(); });
      addEventListener('pagehide', go);
    }
  }catch(e){}
})();
// Surprise Me 🎁: a small floating button (bottom-right) while today's surprise box is still closed, and a one-time
// "well done, today's box is waiting" note after the student earns points on a page. Hidden once the box is opened.
(function(){
  try{
    var me = document.currentScript && document.currentScript.src, P = location.pathname;
    if(!me) return;
    var home = new URL('../', me).pathname;
    if(P === home || P === home + 'index.html' || /\/(honor|teacher|guide|install|offline|sounds|links)\.html$/.test(P) || /\/(surprise|mystery|level|kids)\//.test(P)) return;
    var day = Math.floor((Date.now() + 3 * 3600e3 - 6 * 3600e3) / 864e5);   // the box's day starts at 6 am Saudi time
    // how many of today's 3 counted boxes are still closed (box 1 → mb-days, boxes 2–3 → mb-x '<day>-2' / '<day>-3')
    var left = function(){ try { var d = JSON.parse(localStorage.getItem('mb-days') || '{}') || {}, x = JSON.parse(localStorage.getItem('mb-x') || '{}') || {};
      return 3 - (d[day] !== undefined) - (x[day + '-2'] !== undefined) - (x[day + '-3'] !== undefined); } catch(e){ return 0; } };
    var opened = function(){ return left() <= 0; };
    var closed = function(){ var t = (Date.now() + 3 * 3600e3) % 864e5; return t >= 22 * 3600e3 || t < 6 * 3600e3; };   // box closed 10 pm - 6 am
    if(opened() || closed()) return;
    var href = new URL('../surprise/index.html', me).href;
    var css = '#clubMB{position:fixed;right:14px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:998;width:60px;height:60px;border-radius:50%;display:grid;place-items:center;' +
      'background:linear-gradient(145deg,#ffb35c,#ff8a3d);border:3px solid #fff;text-decoration:none;box-shadow:0 12px 24px -10px rgba(220,110,30,.8)}' +
      '#clubMB b{font-size:30px;line-height:1;display:inline-block;animation:clubMBh 2.2s ease-in-out infinite}' +
      '#clubMB i{position:absolute;top:-6px;left:-6px;min-width:24px;height:24px;padding:0 6px;border-radius:999px;background:#3f7fe8;color:#fff;border:2px solid #fff;font:800 13px/20px Lexend,system-ui,sans-serif;font-style:normal;text-align:center}' +
      '#clubMB:focus-visible{outline:3px solid #1c2b4a;outline-offset:3px}' +
      '@keyframes clubMBh{0%,70%,100%{transform:translateY(0) rotate(0)}78%{transform:translateY(-6px) rotate(-12deg)}86%{transform:translateY(0) rotate(10deg)}}' +
      '#clubMBtip{position:fixed;right:12px;left:12px;bottom:calc(86px + env(safe-area-inset-bottom,0px));z-index:998;max-width:380px;margin-inline-start:auto;background:#fff6ec;border:2px solid #ffc999;' +
      'border-radius:18px;padding:10px 14px;font:700 17px/1.6 Tajawal,system-ui,sans-serif;color:#1c2b4a;box-shadow:0 14px 28px -16px rgba(220,110,30,.5);direction:rtl}' +
      '#clubMBtip a{display:inline-block;margin-top:6px;background:#ff9a4a;color:#fff;border-radius:999px;padding:5px 16px;text-decoration:none}#clubMBtip button{font:inherit;border:0;background:none;color:#5a6482;cursor:pointer;margin-inline-start:8px}' +
      '@media (prefers-reduced-motion:reduce){#clubMB b{animation:none}}body.reading #clubMB,body.reading #clubMBtip{display:none}@media print{#clubMB,#clubMBtip{display:none}}';
    var sig = function(){ var t = ''; try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && /best|stars|known/.test(k)) t += k + '=' + (localStorage.getItem(k) || '').length + (localStorage.getItem(k) || '').slice(0, 6) + ';'; } } catch(e){} return t; };
    var start = null;
    var put = function(){
      if (!document.body || document.getElementById('clubMB')) return;
      var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
      var a = document.createElement('a'); a.id = 'clubMB'; a.href = href; a.setAttribute('aria-label', 'Surprise Me: صندوق المفاجآت لم يُفتح اليوم');
      var paint = function(){ var n = left(); a.innerHTML = '<b aria-hidden="true">🎁</b><i>' + n + '</i>'; a.setAttribute('aria-label', 'Surprise Me: ' + n + ' من صناديق اليوم ما زالت مغلقة'); a.title = a.getAttribute('aria-label'); };
      paint(); document.body.appendChild(a);
      start = sig();
      setInterval(function(){
        paint();
        if (opened() || closed()) { a.remove(); var t0 = document.getElementById('clubMBtip'); if (t0) t0.remove(); return; }
        var shown = false; try { shown = localStorage.getItem('mb-tip') == day; } catch(e){}
        if (shown || sig() === start) return;
        try { localStorage.setItem('mb-tip', String(day)); } catch(e){}
        var t = document.createElement('div'); t.id = 'clubMBtip'; t.setAttribute('role', 'status');
        t.innerHTML = 'أحسنت! 👏 صناديق المفاجآت 🎁 ما زالت تنتظرك… قصة أم سرعة أم استماع؟ افتحها لتعرف، وحتى 150 نقطة للصندوق!<br><a href="' + href + '">افتح المفاجأة ←</a><button type="button">لاحقاً</button>';
        t.querySelector('button').onclick = function(){ t.remove(); };
        document.body.appendChild(t);
      }, 5000);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', put); else put();
  }catch(e){}
})();
// عوالم النادي 🌍: after the student leaves a world for one of its stations (worlds/index.html saves `wd-go`), every other
// page shows a small «ارجع إلى العالم» bar; it turns green with «أنجزت المحطة!» as soon as the station's goal is met here.
(function(){
  try{
    var me = document.currentScript && document.currentScript.src;
    if(!me || /\/worlds\//.test(location.pathname)) return;
    var g = JSON.parse(localStorage.getItem('wd-go') || 'null');
    if(!g || !g.k || !(g.until > Date.now())) return;
    var back = new URL('../worlds/index.html#w-' + g.k, me).href;
    var met = function(){
      try{
        var sp = g.spec || {}, keys = sp.keys || [], min = +sp.min || 1;
        if(sp.t === 'cap'){ var o = JSON.parse(localStorage.getItem(keys[0]) || '{}') || {}; return Object.keys(o).filter(function(k){ return (+o[k] || 0) >= 1; }).length >= min; }
        return keys.some(function(k){ return (+(localStorage.getItem(k) || 0) || 0) >= min; });
      }catch(e){ return false; }
    };
    var css = '#clubWd{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(70px + env(safe-area-inset-bottom,0px));z-index:996;display:flex;align-items:center;gap:8px;' +
      'max-width:calc(100% - 24px);background:#fff;border:2.5px solid ' + (g.c || '#4b62e0') + ';border-radius:999px;padding:6px 6px 6px 14px;box-shadow:0 12px 26px -14px rgba(30,40,90,.55);' +
      'font:700 16px/1.35 Tajawal,"Segoe UI",system-ui,sans-serif;color:#232c47;direction:rtl}' +
      '#clubWd a{flex:none;text-decoration:none;color:#fff;background:' + (g.c || '#4b62e0') + ';border-radius:999px;padding:7px 14px;font-weight:800;white-space:nowrap}' +
      '#clubWd span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
      '#clubWd button{flex:none;font:inherit;border:0;background:none;color:#8a93ad;cursor:pointer;padding:0 6px}' +
      '#clubWd.ok{border-color:#17855c;background:#effaf4;animation:clubWdP 1.4s ease-in-out 3}#clubWd.ok a{background:#17855c}' +
      '@keyframes clubWdP{50%{transform:translateX(-50%) scale(1.05)}}@media (prefers-reduced-motion:reduce){#clubWd.ok{animation:none}}' +
      'body.reading #clubWd{display:none}@media print{#clubWd{display:none}}';
    var put = function(){
      if(!document.body || document.getElementById('clubWd')) return;
      var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
      var d = document.createElement('div'); d.id = 'clubWd'; d.setAttribute('role', 'status');
      var draw = function(ok){
        d.className = ok ? 'ok' : '';
        d.innerHTML = '<button type="button" aria-label="إخفاء">✕</button><span>' + (ok ? '✅ أنجزت المحطة!' : (g.ic || '🌍') + ' ' + g.name) + '</span><a href="' + back + '">' + (ok ? 'الخطوة التالية ←' : 'ارجع إلى ' + g.ar) + '</a>';
        d.querySelector('button').onclick = function(){ d.remove(); clearInterval(t); };
      };
      var was = met(); draw(was); document.body.appendChild(d);
      var t = setInterval(function(){ var ok = met(); if(ok !== was){ was = ok; draw(ok); try{ if(ok && window.clubSfx) window.clubSfx('win'); }catch(e){} } }, 2500);
    };
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', put); else put();
  }catch(e){}
})();
// سلسلة الحماس 🔥 on the tab bar (18 Nov 2026): the «الحماس» tab shows the current streak from localStorage `fire`
// (same rules as fireState() in honor.js: a day counts at 30 points, a shield every 7 days in a row covers one missed day).
(function(){
  try{
    var el = document.getElementById('tbFireN'); if (!el) return;
    var go = function(){
      var F = JSON.parse(localStorage.getItem('fire') || '{}') || {}, d = F.d || {}, day = Math.floor((Date.now() + 3 * 3600e3 - 6 * 3600e3) / 864e5);
      var ks = Object.keys(d).map(Number).filter(function(k){ return k <= day && d[k] >= 30; }), run = 0, sh = 0;
      if (ks.length) for (var x = Math.min.apply(null, ks); x <= day; x++) {
        if (d[x] >= 30) { run++; if (run % 7 === 0 && sh < 2) sh++; } else if (x === day) {} else if (sh > 0 && run > 0) sh--; else run = 0; }
      el.textContent = run; el.hidden = !run;
      var a = el.parentNode; if (a) { a.classList.toggle('due', !!run && !(d[day] >= 30)); a.title = run ? 'سلسلة الحماس: ' + run + (d[day] >= 30 ? ' · يومك محسوب ✅' : ' · أكمل يومك') : 'سلسلة الحماس'; }
    };
    go(); setTimeout(go, 1500); setInterval(go, 8000);
  }catch(e){}
})();
