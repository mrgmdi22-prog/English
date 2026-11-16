/* Shared core of «هندسة مساري»: the stations table and today's work order.
   Used by path/index.html (the full map) and by the home page (today's card). Hrefs are relative to path/. */
(function(){
'use strict';
// Club sections as stations. key = honor points part (progress measured since the map was drawn); t = target in that part's
// units; no key = the student ticks it. lv = [min,max] level band (0 beginner, 1 middle, 2 advanced); el = needs B1 by the test.
var T = {
  lvl:  {n:'قياس المستوى', ic:'📈', h:'../level/index.html', c:[], lv:[0,2], how:'اختياري: اختبار يحدد مستواك بدقة، فيتحدّث مخططك تلقائياً'},
  dict: {n:'قاموس الألف كلمة', ic:'📖', h:'../journey/dictionary.html', c:['voc'], lv:[0,0], how:'تصفّح 20 كلمة وانطقها بصوتك'},
  wq:   {n:'English Word Quest', en:1, ic:'🗺️', h:'../journey/word-quest.html', key:'wq', t:30, c:['voc'], lv:[0,1], how:'أكمل 3 وحدات بدرجة 8 من 10 فأكثر'},
  mg:   {n:'ميدان المفردات (كتابك المدرسي)', ic:'🏟️', h:'../vocab/mega-goal-1.html', key:'mg', t:40, c:['voc'], lv:[0,2], how:'اختر كتاب صفّك وأتقن 40 كلمة'},
  ng:   {n:'الكلمات العامة', ic:'🌍', h:'../words/ngsl.html', key:'ng', t:30, c:['voc'], lv:[1,1], how:'أكمل 3 وحدات وراجع كلمات اليوم'},
  aw:   {n:'الكلمات الأكاديمية', ic:'🎓', h:'../words/awl.html', key:'aw', t:30, c:['voc','rea'], lv:[2,2], how:'أكمل 3 وحدات من القوائم الأكاديمية'},
  im:   {n:'ركن التعبيرات', ic:'🎨', h:'../idioms/index.html', key:'im', t:15, c:['voc','spe'], lv:[1,2], how:'تعلّم التعبيرات وأجب عن 15 سؤالاً صحيحاً'},
  caps: {n:'الكبسولات', ic:'🌟', h:'../capsules/index.html', key:'caps', t:25, c:['gra','lis','wri'], lv:[0,1], how:'استمع ورتّب الجمل: 5 مراحل بنجمة فأكثر'},
  tn:   {n:'خارطة الأزمنة', ic:'⏳', h:'../grammar/tenses.html', key:'tn', t:15, c:['gra'], lv:[1,2], how:'افهم الأزمنة وأجب عن 15 سؤالاً صحيحاً'},
  pv:   {n:'المبني للمجهول', ic:'🔄', h:'../grammar/passive.html', key:'pv', t:15, c:['gra','wri'], lv:[1,2], how:'تعلّم القاعدة وحوّل الجمل، ثم 15 إجابة صحيحة'},
  syn:  {n:'Syntax Tree Lab', en:1, ic:'🌳', h:'../grammar/syntax-tree-lab.html', c:['gra','wri'], lv:[1,2], how:'حلّل 5 جمل وافهم أجزاءها'},
  let:  {n:'ميدان الحروف والأصوات', ic:'🔤', h:'../letters/letters-sounds.html', c:['lis','rea','wri'], lv:[0,0], how:'تدرّب على الحروف وأصواتها حتى تقرأ الكلمات بسهولة'},
  tb:   {n:'محادثات التأسيس', ic:'🗣️', h:'../everyday/basics.html', key:'tb', t:20, c:['spe','lis'], lv:[0,0], how:'استمع للحوارات وردّدها، وأجب عن 20 سؤالاً'},
  st:   {n:'ركن القصص', ic:'📚', h:'../stories/index.html', key:'st', t:9, c:['rea','lis'], lv:[0,1], how:'اقرأ 3 قصص واستمع لها، وأجب عن أسئلتها'},
  lab:  {n:'مختبر المحادثة', ic:'💬', h:'../journey/conversation-lab.html', key:'lab', t:15, c:['spe','lis'], lv:[1,2], how:'3 محادثات: استمع، وسجّل صوتك، وصحّح نطقك'},
  bf:   {n:'Breakfast Challenge', en:1, ic:'🍳', h:'../everyday/breakfast.html', key:'bf', t:8, c:['rea','voc'], lv:[0,1], how:'اقرأ وأجب: 8 إجابات صحيحة'},
  cal:  {n:'ورشة الخط الإنجليزي', ic:'✒️', h:'../calligraphy/index.html', c:['wri'], lv:[0,1], how:'اكتب 10 كلمات بخط واضح على السطور'},
  note: {n:'دفتري الصغير', ic:'📓', c:['wri','voc'], lv:[0,2], how:'اكتب في دفترك 3 جمل من تأليفك بكلمات تعلّمتها، ثم اقرأها بصوتك'},
  talk: {n:'تحدّث مع نفسك', ic:'🎙️', c:['spe'], lv:[0,2], how:'سجّل بجوالك دقيقة تتحدث فيها عن يومك بالإنجليزية، ثم استمع لها'},
  town: {n:'في المدينة', ic:'🏙️', h:'../elite/town/index.html', key:'et', t:15, c:['spe','lis'], lv:[2,2], el:1, how:'3 محطات: استمع، وأدِّ الدور بصوتك، وأجب'},
  elite:{n:'مسار النخبة', ic:'💎', h:'../elite/index.html', key:'ek', t:30, c:['voc','gra','rea'], lv:[2,2], el:1, how:'3 وحدات بنجمة فأكثر'},
  cls:  {n:'مكتبة النخبة', ic:'📜', h:'../elite/classics/index.html', c:['rea'], lv:[2,2], el:1, how:'اقرأ فصلاً من قصة أمريكية كلاسيكية'},
  links:{n:'المكتبة الإثرائية', ic:'🌐', h:'../links.html', c:['lis','rea'], lv:[2,2], how:'اختر موقعاً واحداً واستمع أو اقرأ فيه 15 دقيقة'},
  step: {n:'مِران ستيب', ic:'📝', h:'https://step.ahmedchoices.com/drill/', c:['rea','gra','lis','voc'], lv:[0,2], goal:'step', how:'حلّ 20 سؤالاً بأسلوب الاختبار'},
  wd:   {n:'عوالم النادي', ic:'🌍', h:'../worlds/index.html', key:'ws', t:1, c:['voc','rea','lis','spe'], lv:[0,2], goal:'fun', how:'أنجز محطات عالم واحد واحصل على ختمه'},
  mb:   {n:'Surprise Me', en:1, ic:'🎁', h:'../surprise/index.html', c:[], lv:[0,2], how:'صندوق اليوم: مراجعة سريعة من كل الأقسام'}
};
Object.keys(T).forEach(function(id){ T[id].id = id; });
// Station preference per part (first = most fitting); goal favourites move to the front.
var ORDER = {
  voc:['wq','mg','ng','dict','aw','im','elite','bf','note'],
  gra:['caps','tn','pv','syn','elite','step','note'],
  lis:['let','caps','tb','st','lab','town','links','step'],
  rea:['let','st','bf','aw','cls','elite','links','step'],
  spe:['tb','lab','town','im','talk'],
  wri:['cal','caps','pv','syn','note','let']
};
var FAV = {school:['mg','tn','st'], step:['step','tn','aw'], talk:['tb','lab','town','talk'], fun:['wd','st','im','cls']};
var J = function(k, d){ try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
var S = function(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
var dayNo = function(t){ return Math.floor(((t || Date.now()) + 3 * 3600e3 - 6 * 3600e3) / 864e5); };
var PARTS = null;
var LVN = ['Pre-A1','A1','A2','B1','B2'], LV_NEW = 1793547780000;
function testLevel(){
  var lr = J('lv-results', {}) || {};
  var all = [lr.pre].concat(lr.post || [], Array.isArray(lr.prev) ? lr.prev : []).filter(function(r){ return r && LVN.indexOf(r.level) >= 0; });
  if (!all.length) return null;
  var best = all.reduce(function(m, r){ return LVN.indexOf(r.level) > LVN.indexOf(m.level) ? r : m; });
  var i = LVN.indexOf(best.level), cur = all.filter(function(r){ return +r.at >= LV_NEW; });
  return { name: best.level, band: i <= 1 ? 0 : i === 2 ? 1 : 2, b1: cur.some(function(r){ return LVN.indexOf(r.level) >= 3; }), at: Math.max.apply(null, all.map(function(r){ return +r.at || 0; })) };
}function snap(){ var o = {}; Object.keys(T).forEach(function(id){ var k = T[id].key; if (k && PARTS) o[k] = PARTS[k] || 0; }); return o; }
function prog(plan, id){
  var t = T[id];
  if (plan.done[id]) return 1;
  if (id === 'lvl') return testLevel() ? 1 : 0;
  if (!t.key || !PARTS) return 0;
  var got = (PARTS[t.key] || 0) - (plan.base[t.key] || 0);
  return Math.max(0, Math.min(1, got / t.t));
}
// The level test is optional: it is offered as the first task until taken or skipped (plan.skipTest), and never blocks a stage.
function stageIds(plan, i){ var s = plan.stages[i].s.slice(); if (i === 0 && plan.needTest && !plan.skipTest && !testLevel()) s.unshift('lvl'); return s; }
function stageDone(plan, i){ return stageIds(plan, i).every(function(id){ return id === 'lvl' || prog(plan, id) >= 1; }); }

// Today's missions: stage stations not finished yet, rotating day by day; plus Surprise Me as daily review (20+ min).
function todayTasks(plan){
  var d = dayNo(), st = Math.min(plan.stage, plan.stages.length - 1);
  var open = stageIds(plan, st).filter(function(id){ return prog(plan, id) < 1; });
  if (!open.length) open = stageIds(plan, st);
  var n = plan.time >= 30 ? 2 : 1, out = [];
  // the optional level test is offered on top of the day's real tasks, never instead of them
  if (open.indexOf('lvl') >= 0) { out.push('lvl'); open = open.filter(function(x){ return x !== 'lvl'; }); n++; }
  if (!open.length) open = stageIds(plan, st).filter(function(x){ return x !== 'lvl'; });
  for (var i = 0; out.length < n && i < open.length; i++) out.push(open[(d + i) % open.length]);
  if (plan.time >= 20) out.push('mb');
  return out.filter(function(x, i, a){ return a.indexOf(x) === i; });
}
function dayState(){
  var d = dayNo(), s = J('mp-day', null);
  if (!s || s.d !== d) { s = { d: d, b: PARTS ? snap() : null, ok: {} }; S('mp-day', s); }
  else if (!s.b && PARTS) { s.b = snap(); S('mp-day', s); }
  return s;
}
function taskDone(id, ds){
  if (ds.ok[id]) return true;
  if (id === 'mb') { var md = J('mb-days', {}) || {}; return md[dayNo()] !== undefined; }
  if (id === 'lvl') return !!testLevel();
  var k = T[id].key; return !!(k && PARTS && ds.b && (PARTS[k] || 0) > (ds.b[k] || 0));
}
window.PathCore = { T: T, ORDER: ORDER, FAV: FAV, J: J, S: S, dayNo: dayNo, testLevel: testLevel, snap: snap, prog: prog,
  stageIds: stageIds, stageDone: stageDone, todayTasks: todayTasks, dayState: dayState, taskDone: taskDone,
  setParts: function(p){ PARTS = p; }, parts: function(){ return PARTS; } };
})();
