/* 💡 ساعدني بحرف + ⏭️ تخطَّ — for every "type the word" question (19 Nov 2026).
   SpellHelp.attach(afterEl, input, answer, onSkip) → {off()}
   Hint: fills the right letters the student already typed + one more (at most half the word).
   Skip: shows nothing itself; the page's onSkip grades it as a miss and shows the answer. */
(function(){
  if (window.SpellHelp) return;
  var css = '.sh-bar{display:flex;gap:12px;justify-content:center;margin:14px auto 0;max-width:460px;direction:rtl}'
    + '.sh-bar[hidden]{display:none!important}'
    + '.sh-bar button{all:unset;box-sizing:border-box;cursor:pointer;flex:1 1 0;min-width:0;display:flex;align-items:center;justify-content:center;gap:6px;min-height:52px;padding:8px 6px;border-radius:16px;border:2px solid #c9d8ee;background:#fff;color:#1c2b4a;box-shadow:0 3px 0 #dbe5f2;font:800 1rem "Cairo","Tajawal",system-ui,sans-serif;line-height:1.2;white-space:nowrap;transition:transform .12s}'
    + '.sh-bar button:active{transform:translateY(2px);box-shadow:0 1px 0 #dbe5f2}'
    + '.sh-bar .sh-h{flex-grow:1.45;background:#fff8e0;border-color:#ffcf4d;box-shadow:0 3px 0 #f2d27a}'
    + '.sh-bar .sh-s{background:#eef4ff;border-color:#b9d0f2;color:#2c5fb8}'
    + '.sh-ic{font-size:1.25rem;line-height:1;flex:none}.sh-ic svg{display:block;width:22px;height:22px}'
    + '.sh-n{flex:none;min-width:24px;height:24px;padding:0 6px;box-sizing:border-box;border-radius:12px;background:#ffcf4d;color:#1c2b4a;font:800 .9rem/24px system-ui,sans-serif;text-align:center}'
    + '.sh-bar button:disabled{opacity:.4;cursor:default;transform:none}.sh-bar button:focus-visible{outline:3px solid #9cc7f0;outline-offset:2px}';
  /* skip icon pointing LEFT (forward in an Arabic page) */
  var SKIP = '<span class="sh-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 5.5v13L3.5 12z"/><path d="M21 5.5v13L11.5 12z" opacity=".55"/></svg></span>';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  function low(t){ return String(t).toLowerCase().replace(/’/g, "'"); }
  window.SpellHelp = { skipIcon: SKIP, attach: function(afterEl, input, answer, onSkip){
    var ans = String(answer), max = Math.max(1, Math.ceil(ans.length / 2)), used = 0, off = false;
    var bar = document.createElement('div'); bar.className = 'sh-bar'; bar.dir = 'rtl';
    bar.innerHTML = '<button type="button" class="sh-h"><span class="sh-ic" aria-hidden="true">💡</span><span>ساعدني بحرف</span><span class="sh-n"></span></button><button type="button" class="sh-s"><span>تخطَّ</span>' + SKIP + '</button>';
    afterEl.after(bar);
    var bh = bar.children[0], bs = bar.children[1], n = bh.querySelector('.sh-n');
    function left(){ n.textContent = max - used; if (used >= max) bh.disabled = true; }
    left();
    bh.onclick = function(){
      if (off || used >= max) return;
      var v = low(input.value), a = low(ans), k = 0;
      while (k < v.length && k < a.length && v[k] === a[k]) k++;
      var to = Math.min(a.length, Math.max(k + 1, 2));
      input.value = ans.slice(0, to); used++; left();
      try { input.focus(); input.setSelectionRange(to, to); } catch(e){}
      try { window.clubSfx && window.clubSfx('tap'); } catch(e){}
    };
    bs.onclick = function(){ if (off) return; ctl.off(); onSkip && onSkip(); };
    var ctl = { off: function(){ off = true; bh.disabled = true; bs.disabled = true; bar.hidden = true; }, used: function(){ return used; }, el: bar };
    return ctl;
  } };
})();
