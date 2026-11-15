// Builds surprise/bank.js (the question bank of Surprise Me) from the data already inside the site's sections.
// Run from the repo root after changing any section's content:   node surprise/build-bank.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import { READING, GRAMMAR } from './content.mjs';

const root = new URL('../', import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), 'utf8');

/** Finds `NAME = [ ... ]` (or { ... }) in a page and evaluates just that literal. */
function grab(file, name) {
  const s = read(file);
  const m = new RegExp('(?:const|let|var)\\s+' + name + '\\s*=\\s*').exec(s);
  if (!m) throw new Error(name + ' not found in ' + file);
  let i = m.index + m[0].length, depth = 0, q = null, start = i;
  for (; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '\\') { i++; continue; } if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === '[' || c === '{') depth++;
    else if (c === ']' || c === '}') { depth--; if (depth === 0) { i++; break; } }
  }
  return vm.runInNewContext('(' + s.slice(start, i) + ')');
}

const strip = t => String(t).replace(/\*\*/g, '');
const uniq = a => Array.from(new Set(a));
const bank = [];
// each item: [section, question (English or Arabic prompt), options[], answer index (always 0 here; the page shuffles), hint/explanation]
const add = (sec, q, opts, why, extra) => {
  opts = uniq(opts.map(o => String(o).trim())).filter(Boolean);
  if (opts.length < 3) return;
  bank.push(Object.assign({ s: sec, q, o: opts.slice(0, 4), w: why || '' }, extra || {}));
};
function rnd(pool, n, not, seed) { const p = uniq(pool.filter(x => !not.includes(x))); for (let i = p.length - 1; i > 0; i--) { seed = (seed * 1103515245 + 12345) >>> 0; const j = seed % (i + 1); [p[i], p[j]] = [p[j], p[i]]; } return p.slice(0, n); }

/* ---------- Tenses ---------- */
const T = grab('grammar/tenses.html', 'T');
const tnames = T.map(t => t.ar);
T.forEach((t, i) => t.uses.forEach((u, j) => {
  add('tn', strip(u[1]), [t.ar, ...rnd(tnames, 3, [t.ar], i * 10 + j + 3)], u[0], { qa: 'في أي زمن هذه الجملة؟' });
}));

/* ---------- Passive voice ---------- */
const S = grab('grammar/passive.html', 'S');
S.forEach((x, i) => {
  const cap = w => w[0].toUpperCase() + w.slice(1);
  const act = x.ag + ' ' + (x.agp ? x.v[0] : x.v[1]) + ' ' + x.ob + '.';
  const be = x.obp ? 'are' : 'is', wrongBe = x.obp ? 'is' : 'are';
  const O = cap(x.ob);
  add('pv', act, [
    `${O} ${be} ${x.v[4]} by ${x.by}.`,
    `${O} ${be} ${x.v[0]} by ${x.by}.`,
    `${O} ${wrongBe} ${x.v[4]} by ${x.by}.`,
    `${O} ${x.v[4]} by ${x.by}.`
  ], 'Present simple passive: am / is / are + past participle (V3).', { qa: 'اختر الجملة بالمبني للمجهول' });
});

/* ---------- Everyday English ---------- */
const U = grab('everyday/basics.html', 'U');
const replies = []; U.forEach(u => u.ph.forEach(p => p[3] && replies.push(p[3])));
U.forEach((u, i) => u.ph.forEach((p, j) => {
  if (p[3] && p[3] !== p[0]) add('ev', '“' + p[0] + '”', [p[3], ...rnd(replies, 2, [p[3], p[0]], i * 17 + j + 5)], p[1], { qa: 'ما الرد المناسب؟' });
}));
const PRO = grab('everyday/basics.html', 'PRO');
const proAr = []; Object.values(PRO).forEach(l => l.forEach(x => proAr.push(x[1])));
Object.values(PRO).forEach((l, i) => l.forEach((x, j) => add('ev', '“' + x[0] + '”', [x[1], ...rnd(proAr, 2, [x[1]], i * 13 + j + 7)], '', { qa: 'ما معنى هذه العبارة؟' })));

/* ---------- Sentence structure: the right word order vs. sentences with two words swapped ---------- */
const FREE = /^(yesterday|today|tomorrow|now|always|usually|often|sometimes|never|also|really|very|too|here|there|then|again|soon|later|together|every|and|or|but|so|not)$/i;
const AUX = /^(am|is|are|was|were|do|does|did|can|could|will|would|shall|should|may|might|must|has|have|had|lets|dont|doesnt|didnt|cant|couldnt|wont|wouldnt|isnt|arent|wasnt|werent|shouldnt|hasnt|havent|hadnt|im|youre|hes|shes|its|were|theyre)$/i;
function order(en, seed) {
  const m = /^(.*?)([.!?])?$/.exec(en.trim()); const w = m[1].split(/\s+/), end = m[2] || '.';
  if (w.length < 5 || w.length > 10 || /["“”]/.test(en)) return null;
  const low = w.map((x, k) => k === 0 && x !== 'I' && !/^[A-Z][a-z]+[A-Z]/.test(x) && !(x.length > 1 && x === x.toUpperCase()) ? x[0].toLowerCase() + x.slice(1) : x);
  const fmt = a => { const t = a.join(' '); return t[0].toUpperCase() + t.slice(1) + end; };
  const right = fmt(low), out = [right], tried = new Set();
  for (let n = 0; n < 40 && out.length < 4; n++) {
    seed = (seed * 1103515245 + 12345) >>> 0; const k = seed % (low.length - 1);
    if (tried.has(k)) continue; tried.add(k);
    const a = low[k], b = low[k + 1];
    const ca = a.replace(/\W/g, ''), cb = b.replace(/\W/g, '');
    if (/,/.test(a + b) || FREE.test(ca) || FREE.test(cb) || /ly$/i.test(ca) || /ly$/i.test(cb)) continue;   // adverbs can move: both orders may be right
    if (AUX.test(ca) || AUX.test(cb)) { if (k === 0 || /,$/.test(low[k - 1] || '')) continue; }               // "She is" → "Is she" is a real question
    const c = low.slice(); c[k] = b; c[k + 1] = a; const t = fmt(c);
    if (!out.includes(t)) out.push(t);
  }
  return out.length === 4 ? out : null;
}

/* ---------- Capsules (10 themes) ---------- */
const CAPS = { space: 'الفضاء', flavor: 'النكهات', life: 'الحياة', adventure: 'المغامرة', emotion: 'المشاعر', career: 'المهن', nature: 'الطبيعة', health: 'الصحة', sports: 'الرياضة', tech: 'التقنية' };
Object.keys(CAPS).forEach((c, ci) => {
  const sc = grab('capsules/' + c + '.html', 'SCENES');
  const ars = sc.map(x => x.ar);
  sc.forEach((x, i) => {
    add('caps', x.en, [x.ar, ...rnd(ars, 3, [x.ar], ci * 1000 + i + 11)], x.tag || '', { qa: 'ما معنى هذه الجملة؟', c });
    const o = order(x.en, ci * 1000 + i + 29);
    if (o) add('sx', '«' + x.ar + '»', o, x.tag ? 'التركيب: ' + x.tag : '', { qa: 'اختر الجملة المرتّبة ترتيباً صحيحاً', c });
  });
});

/* ---------- Word lists: gap-fill from the example sentence ---------- */
function gapWords(file, sec, key) {
  const units = grab(file, 'UNITS');
  units.forEach(u => {
    u.words.forEach((w, i) => {
      // distractors of the same part of speech from this unit (falls back to any word of the unit)
      let ws = u.words.filter(x => x[1] === w[1]).map(x => x[0]); if (ws.length < 4) ws = u.words.map(x => x[0]);
      const ex = w[4] || ''; const re = new RegExp('\\b' + w[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
      if (!re.test(ex)) return;
      add(sec, ex.replace(re, '_____'), [w[0], ...rnd(ws, 3, [w[0]], u.n * 100 + i + 13)], w[3], { qa: 'أكمل الفراغ بالكلمة المناسبة', u: u.n });
    });
  });
}
gapWords('words/ngsl.html', 'ng');
gapWords('words/awl.html', 'aw');

/* ---------- Reading and grammar (hand-written, surprise/content.mjs) ---------- */
READING.forEach(r => add('rd', r[0] + '\n\n❓ ' + r[1], [r[2], r[3], r[4], r[5]], r[6], { qa: 'اقرأ ثم أجب — الجواب موجود في النص' }));
GRAMMAR.forEach(g => add('gr', g[0], [g[1], g[2], g[3], g[4]], g[5], { qa: 'اختر الإجابة الصحيحة' }));

// Keep the file light for phones on weak school Wi-Fi: big sections are sampled evenly.
const CAP = 220, by = {};
bank.forEach(x => (by[x.s] = by[x.s] || []).push(x));
const kept = [];
Object.keys(by).forEach(k => { const a = by[k], step = Math.max(1, a.length / CAP); for (let i = 0; i < a.length && kept.filter(x => x.s === k).length < CAP; i += step) kept.push(a[Math.floor(i)]); });
bank.length = 0; kept.forEach(x => bank.push(x));
const count = {}; bank.forEach(x => { count[x.s] = (count[x.s] || 0) + 1; });
fs.writeFileSync(new URL('surprise/bank.js', root),
  '// Generated by surprise/build-bank.mjs from the site sections. Do not edit by hand.\n' +
  '// item = [section, question, options (first is right), explanation, Arabic prompt, extra]\n' +
  'window.SURPRISE_BANK=' + JSON.stringify(bank.map(x => [x.s, x.q, x.o, x.w, x.qa || '', x.c || x.u || x.b || 0])) + ';\n');
console.log(bank.length, 'questions', count);
