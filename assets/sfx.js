// Soft sound effects for the whole site (synthesised with Web Audio, no files):
// a light tap on every button or link, a bright chime for a right answer, a gentle low tone for a wrong one,
// and one 🔊 switch (bottom-left) that turns all page sounds on or off. Spoken words are never muted.
// Register the app's service worker (assets/../sw.js) so the site can be installed and opened offline.
(function(){
  try {
    var me = document.currentScript && document.currentScript.src;
    if (me && 'serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
      navigator.serviceWorker.register(new URL('../sw.js', me).href, { scope: new URL('../', me).pathname }).catch(function(){});
    }
  } catch (e) {}
})();
// On Android, voices and sounds work best in Google Chrome. In other Android browsers (Samsung Internet,
// in-app browsers, etc.) offer a one-tap "open in Chrome" link; it does nothing on iPhone or in Chrome itself.
(function(){
  try {
    var ua = navigator.userAgent;
    if (!/Android/i.test(ua)) return;
    var chrome = /Chrome\/\d+/.test(ua) && !/SamsungBrowser|; wv\)|EdgA|OPR|YaBrowser|MiuiBrowser|HuaweiBrowser|HeyTapBrowser|UCBrowser|FB_IAB|FBAN|FBAV|Instagram|Snapchat|Line\/|GSA\//.test(ua);
    if (chrome) return;
    try { if (sessionStorage.getItem('club-chrome-tip')) return; } catch (e) {}
    var app = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    var url = location.href.replace(/^https?:\/\//, '');
    var intent = 'intent://' + url + '#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=' + encodeURIComponent('https://play.google.com/store/apps/details?id=com.android.chrome') + ';end';
    var show = function(){
      if (!document.body || document.getElementById('chromeTip')) return;
      var d = document.createElement('div'); d.id = 'chromeTip'; d.setAttribute('role', 'note');
      d.style.cssText = 'position:fixed;left:10px;right:10px;bottom:calc(68px + env(safe-area-inset-bottom,0px));z-index:1001;max-width:520px;margin:0 auto;background:#fff;color:#1E1B3A;border:2px solid #5B2EFF;border-radius:18px;padding:12px 14px;box-shadow:0 14px 30px -14px rgba(30,27,58,.55);font:600 16px/1.6 Tajawal,"Segoe UI",Tahoma,sans-serif;direction:rtl;text-align:right';
      d.innerHTML = '<b style="display:block;font-size:17px">🔊 لتعمل الأصوات والنطق جيداً</b>' +
        (app ? 'احذف هذا التطبيق، ثم ثبّته من جديد من متصفح <b>Google Chrome</b>.' : 'افتح الموقع في متصفح <b>Google Chrome</b>.') +
        '<div style="display:flex;gap:8px;margin-top:8px"><a href="' + intent + '" style="flex:1;text-align:center;background:#5B2EFF;color:#fff;border-radius:999px;padding:8px 12px;font-weight:800;text-decoration:none">افتح في Chrome</a>' +
        '<button type="button" style="font:inherit;font-weight:700;border:0;background:#eee;border-radius:999px;padding:8px 14px;cursor:pointer">لاحقاً</button></div>';
      d.querySelector('button').onclick = function(){ d.remove(); try { sessionStorage.setItem('club-chrome-tip', '1'); } catch (e) {} };
      document.body.appendChild(d);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show); else show();
  } catch (e) {}
})();
(function(){
  if (window.clubSfx) return;
  var KEY = 'club-sfx', on = true;
  try { on = localStorage.getItem(KEY) !== 'off'; } catch (e) {}
  // Word Quest pages have their own sound system and switch: leave them alone.
  function own(){ return !!document.getElementById('sfxBtn'); }
  if (/\/teacher\.html$/.test(location.pathname)) { window.clubSfx = function(){}; return; }

  // While switched off, sounds that a page makes with Web Audio are not connected to the speakers.
  try {
    var AD = window.AudioDestinationNode, conn = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function(t){
      if (!on && AD && t instanceof AD && !own()) return t;
      return conn.apply(this, arguments);
    };
  } catch (e) {}

  var ctx = null, armed = false;
  function ac(){
    if (!ctx) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return null; try { ctx = new C(); } catch (e) { return null; } }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(f, t0, d, type, v, f2){
    var c = ac(); if (!c) return;
    var T = c.currentTime + t0, o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, T); if (f2) o.frequency.exponentialRampToValueAtTime(f2, T + d);
    g.gain.setValueAtTime(0.0001, T); g.gain.exponentialRampToValueAtTime(v, T + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, T + d);
    o.connect(g); g.connect(c.destination); o.start(T); o.stop(T + d + 0.03);
  }
  var S = {
    tap:  function(){ tone(1046, 0, 0.06, 'sine', 0.05, 784); },
    good: function(){ tone(784, 0, 0.13, 'sine', 0.12); tone(1175, 0.09, 0.28, 'sine', 0.11); tone(2349, 0.09, 0.2, 'sine', 0.02); },
    bad:  function(){ tone(349, 0, 0.16, 'triangle', 0.09, 330); tone(262, 0.12, 0.26, 'triangle', 0.08, 247); },
    win:  function(){ [523, 659, 784, 1047].forEach(function(f, i){ tone(f, i * 0.1, 0.26, 'sine', 0.11); }); },
    on:   function(){ tone(660, 0, 0.1, 'sine', 0.09); tone(990, 0.08, 0.16, 'sine', 0.08); }
  };
  // Several sounds in the same moment (a tap that is also a right answer) play only the most important one.
  var RANK = ['tap', 'on', 'good', 'bad', 'win'], pend = null;
  function play(n){
    if (!on || !armed || !S[n]) return;
    if (!pend) { pend = n; setTimeout(function(){ var p = pend; pend = null; try { S[p](); } catch (e) {} }, 0); }
    else if (RANK.indexOf(n) > RANK.indexOf(pend)) pend = n;
  }
  window.clubSfx = play;

  ['pointerdown', 'keydown'].forEach(function(ev){ document.addEventListener(ev, function(){ armed = true; }, true); });
  document.addEventListener('click', function(e){
    if (own()) return;
    var el = e.target.closest && e.target.closest('button,a[href],[role=button],[role=tab],select,summary,label,input[type=checkbox],input[type=radio],.chip');
    if (el && el.id !== 'clubSfxBtn' && !el.disabled) play('tap');
  }, true);

  // Right / wrong answers on pages that had no sounds of their own, recognised by the class each page adds.
  var P = location.pathname, MARK = null;
  if (/\/stories\//.test(P)) MARK = { good: ['ok'], bad: ['no'] };
  else if (/\/(breakfast|conversation-lab|dictionary|syntax-tree-lab|tenses|basics)\.html$/.test(P) || /\/idioms\//.test(P) || /\/kids\//.test(P)) MARK = { good: ['right', 'correct'], bad: ['wrong', 'incorrect'] };
  function watch(){
    if (!MARK || !document.body) return;
    new MutationObserver(function(ms){
      ms.forEach(function(m){
        var c = m.target.classList; if (!c) return;
        var old = ' ' + (m.oldValue || '') + ' ', add = function(k){ return c.contains(k) && old.indexOf(' ' + k + ' ') < 0; };
        if (MARK.bad.some(add)) play('bad'); else if (MARK.good.some(add)) play('good');
      });
    }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true });
  }

  // The switch.
  function button(){
    if (own() || document.getElementById('clubSfxBtn') || !document.body) return;
    var st = document.createElement('style');
    st.textContent = '#clubSfxBtn{position:fixed;left:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:998;width:46px;height:46px;border-radius:50%;' +
      'border:1.5px solid #dfe5f1;background:rgba(255,255,255,.94);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);font-size:21px;line-height:1;cursor:pointer;' +
      'box-shadow:0 8px 20px -12px rgba(40,50,90,.5);display:grid;place-items:center;padding:0;transition:transform .15s}' +
      '#clubSfxBtn:hover{transform:translateY(-2px)}#clubSfxBtn:focus-visible{outline:3px solid #6d4aff;outline-offset:3px}' +
      'body.reading #clubSfxBtn{display:none}@media print{#clubSfxBtn{display:none}}';
    document.head.appendChild(st);
    var b = document.createElement('button');
    b.id = 'clubSfxBtn'; b.type = 'button';
    var set = function(){ b.textContent = on ? '🔊' : '🔇'; b.setAttribute('aria-pressed', on); b.setAttribute('aria-label', on ? 'الأصوات تعمل — اضغط لإيقافها' : 'الأصوات متوقفة — اضغط لتشغيلها'); b.title = on ? 'إيقاف الأصوات' : 'تشغيل الأصوات'; };
    b.onclick = function(){ on = !on; try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) {} set(); if (on) { armed = true; play('on'); } };
    set(); document.body.appendChild(b);
  }
  function ready(){ watch(); button(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
