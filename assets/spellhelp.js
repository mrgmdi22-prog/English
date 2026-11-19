/* 💡 ساعدني بحرف + ⏭️ تخطَّ — for every "type the word" question (19 Nov 2026).
   SpellHelp.attach(afterEl, input, answer, onSkip) → {off()}
   Hint: fills the right letters the student already typed + one more (at most half the word).
   Skip: shows nothing itself; the page's onSkip grades it as a miss and shows the answer. */
(function(){
  if (window.SpellHelp) return;
  var css = '.sh-bar{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin:12px auto 0;max-width:460px}'
    + '.sh-bar button{all:unset;cursor:pointer;font:700 1.08rem "Cairo","Tajawal",system-ui,sans-serif;padding:10px 16px;border-radius:14px;border:2px solid #c9d8ee;background:#fff;color:#1c2b4a;box-shadow:0 3px 0 #dbe5f2;text-align:center;flex:1 1 0;min-width:0;box-sizing:border-box;white-space:nowrap}'
    + '.sh-bar .sh-h{background:#fff7dc;border-color:#ffcf4d}.sh-bar .sh-s{background:#f2f6fc}'
    + '.sh-bar button:disabled{opacity:.45;cursor:default}.sh-bar button:focus-visible{outline:3px solid #9cc7f0}'
    + '.sh-n{font-size:.9rem;opacity:.75}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  function low(t){ return String(t).toLowerCase().replace(/’/g, "'"); }
  window.SpellHelp = { attach: function(afterEl, input, answer, onSkip){
    var ans = String(answer), max = Math.max(1, Math.ceil(ans.length / 2)), used = 0, off = false;
    var bar = document.createElement('div'); bar.className = 'sh-bar'; bar.dir = 'rtl';
    bar.innerHTML = '<button type="button" class="sh-h">💡 ساعدني بحرف <span class="sh-n"></span></button><button type="button" class="sh-s">⏭️ تخطَّ</button>';
    afterEl.after(bar);
    var bh = bar.children[0], bs = bar.children[1], n = bh.querySelector('.sh-n');
    function left(){ n.textContent = '(' + (max - used) + ')'; if (used >= max) bh.disabled = true; }
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
    var ctl = { off: function(){ off = true; bh.disabled = true; bs.disabled = true; }, used: function(){ return used; }, el: bar };
    return ctl;
  } };
})();
