// مضاعف التسلسل 🔥 — the streak multiplier shared by every quiz on the site.
// Right answers in a row raise the value of each answer: the 1st and 2nd ×1, the 3rd and 4th ×1.5, the 5th and on ×2.
// A wrong answer resets the run. The extra points (the bonus) are kept FAIRLY, so replaying never farms points:
//  • unit mode  — clubCombo.start(sec, unit): the best attempt's bonus of each unit counts (like the best score);
//    at most 14 half-answers per unit (= a perfect run of ten).
//  • item mode  — clubCombo.start(sec, '*'): the bonus counts only for answers that are new for the student (fresh).
// Saved in localStorage 'xb' = {sec: {unit: half-answers}}; honor.js turns it into points with each section's rate.
(function(){
  if (window.clubCombo) return;
  // Points of one right answer in each section (same as RULES in honor.js). Used here only to show the bonus.
  var PER = { wq:5, ng:5, mg:5, tb:5, bf:5, caps:5, cq:5, aw:7, st:7, lab:7, tn:7, pv:7, im:7, sp:7, ek:10, ed:10 };
  var UNIT_MAX = 14;
  // Sections with NO streak bonus (very easy levels): sentence capsules, the Foundations talk and the breakfast quiz (since 6 Nov 2026).
  var NOBONUS = { caps: 1, tb: 1, bf: 1 };
  var cur = null, chip = null, hideT = 0;
  function J(k){ try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } }
  function mult(run){ return run >= 5 ? 2 : run >= 3 ? 1.5 : 1; }
  function half(run){ return run >= 5 ? 2 : run >= 3 ? 1 : 0; }   // extra half-answers earned by the answer that makes this run
  function get(sec, unit){ var x = J('xb'); return +((x[sec] || {})[unit] || 0) || 0; }
  function put(sec, unit, v){ try { var x = J('xb'); x[sec] = x[sec] || {}; x[sec][unit] = v; localStorage.setItem('xb', JSON.stringify(x)); } catch (e) {} }
  // Answer counts for the teacher's report (accuracy per section): ans = {sec: [right, total]} all time,
  // ansd = {day: {sec: [right, total]}} for the last 14 days (the day starts at 6 am Saudi time).
  function count(sec, ok){
    try {
      var day = Math.floor((Date.now() + 3 * 3600e3 - 6 * 3600e3) / 864e5);
      var a = J('ans'); a[sec] = a[sec] || [0, 0]; if (ok) a[sec][0]++; a[sec][1]++; localStorage.setItem('ans', JSON.stringify(a));
      var d = J('ansd'); d[day] = d[day] || {}; var x = d[day][sec] = d[day][sec] || [0, 0]; if (ok) x[0]++; x[1]++;
      Object.keys(d).forEach(function(k){ if (+k < day - 13) delete d[k]; }); localStorage.setItem('ansd', JSON.stringify(d));
    } catch (e) {}
  }
  function pts(sec, h){ return Math.round(h * (PER[sec] || 5) / 2); }

  function css(){
    if (document.getElementById('comboCss')) return;
    var s = document.createElement('style'); s.id = 'comboCss';
    s.textContent = '#comboChip{position:fixed;left:50%;top:calc(10px + env(safe-area-inset-top,0px));transform:translateX(-50%) scale(.6);opacity:0;z-index:1002;pointer-events:none;' +
      'background:#FFF6E2;color:#8A4300;border:2px solid #FFB547;border-radius:999px;padding:6px 18px;font:800 21px/1.3 Lexend,Tajawal,system-ui,sans-serif;direction:rtl;white-space:nowrap;' +
      'box-shadow:0 10px 24px -12px rgba(200,110,0,.6);transition:transform .25s cubic-bezier(.3,1.6,.5,1),opacity .2s}' +
      '#comboChip.on{opacity:1;transform:translateX(-50%) scale(1)}#comboChip.x2{background:#FFEDE0;border-color:#FF8A3D;color:#9A2F00}#comboChip.pop{animation:comboPop .45s}' +
      '#comboChip small{font-size:15px;font-weight:700;margin-inline-start:6px}' +
      '@keyframes comboPop{40%{transform:translateX(-50%) scale(1.18)}}@media (prefers-reduced-motion:reduce){#comboChip{transition:none}#comboChip.pop{animation:none}}' +
      '.comboRes{margin:12px auto 0;max-width:520px;background:#FFF6E2;border:2px solid #FFD08A;border-radius:16px;padding:10px 14px;color:#6A3A00;font:700 18px/1.7 Tajawal,system-ui,sans-serif;direction:rtl;text-align:center}' +
      '.comboRes b{color:#B44E00}';
    document.head.appendChild(s);
  }
  function show(run, m){
    if (!document.body) return; css();
    if (!chip) { chip = document.createElement('div'); chip.id = 'comboChip'; chip.setAttribute('role', 'status'); document.body.appendChild(chip); }
    if (m <= 1) { chip.classList.remove('on'); return; }
    chip.innerHTML = (m >= 2 ? '🔥🔥 ×2 مضاعفة!' : '🔥 ×1.5') + '<small>' + run + ' متتالية</small>';
    chip.classList.toggle('x2', m >= 2); chip.classList.add('on');
    chip.classList.remove('pop'); void chip.offsetWidth; chip.classList.add('pop');
    clearTimeout(hideT); hideT = setTimeout(function(){ if (chip) chip.classList.remove('on'); }, 2600);
  }
  function hide(){ if (chip) chip.classList.remove('on'); }

  window.clubCombo = {
    /** A new attempt (a unit test, a stage, a round). unit '*' = item mode. opts.quiet: no floating chip. */
    start: function(sec, unit, opts){ cur = { s: sec, u: String(unit == null ? '*' : unit), run: 0, best: 0, h: 0, quiet: !!(opts && opts.quiet), base: 0, off: !!NOBONUS[sec] }; cur.base = get(cur.s, cur.u); hide(); },
    /** One answer. fresh = false for an item the student already had (item mode only). Returns the multiplier of this answer. */
    hit: function(ok, fresh){
      if (!cur) return 1;
      if (!cur.noCount) count(cur.s, !!ok);
      if (!ok) { cur.run = 0; hide(); return 1; }
      if (cur.off) { cur.run++; cur.best = Math.max(cur.best, cur.run); return 1; }   // no bonus, no chip
      cur.run++; cur.best = Math.max(cur.best, cur.run);
      var m = mult(cur.run), h = half(cur.run);
      if (cur.u === '*') { if (fresh !== false && h) { cur.h += h; put(cur.s, '*', get(cur.s, '*') + h); } }
      else if (h) { cur.h = Math.min(UNIT_MAX, cur.h + h); if (cur.h > get(cur.s, cur.u)) put(cur.s, cur.u, cur.h); }
      if (!cur.quiet) show(cur.run, m);
      return m;
    },
    /** Pages that show the answers only at the end: the whole attempt at once (array of true/false in order). */
    run: function(sec, unit, list){ this.start(sec, unit, { quiet: true }); var self = this; (list || []).forEach(function(ok){ self.hit(!!ok); }); return this.result(); },
    /** What this attempt earned: longest run, bonus points of the attempt, and the points newly added to the student's total. */
    result: function(){
      if (!cur) return { best: 0, pts: 0, gain: 0 };
      var gain = cur.u === '*' ? cur.h : Math.max(0, cur.h - cur.base);
      return { best: cur.best, pts: pts(cur.s, cur.h), gain: pts(cur.s, gain) };
    },
    /** A short HTML line for a result screen ('' when there was no run of three). */
    line: function(r){
      if (cur && cur.off) return '';
      r = r || this.result(); if (r.best < 3) return '';
      return '<div class="comboRes">🔥 أطول تسلسل: <b>' + r.best + '</b> إجابات صحيحة متتالية — ' +
        (r.gain > 0 ? 'مكافأة التسلسل: <b>+' + r.gain + '</b> نقطة 🎉' : (cur && cur.u !== '*' ? 'مكافأتك السابقة في هذه الوحدة أعلى أو مساوية.' : 'الإجابات المكررة لا تضيف مكافأة.')) + '</div>';
    },
    /** Item lists (tn-known, pv-known, im-known): adds an item answered right; true when it is new for the student. */
    learn: function(key, id, max){
      try { var a = JSON.parse(localStorage.getItem(key) || '[]'); if (!Array.isArray(a)) a = []; id = String(id).slice(0, 120);
        if (a.indexOf(id) >= 0 || (max && a.length >= max)) return false; a.push(id); localStorage.setItem(key, JSON.stringify(a)); return true; } catch (e) { return false; }
    },
    css: css, PER: PER
  };
})();
