// لوحة الشرف — shared module: computes a student's points from what each tool saved on this device,
// and talks to Firebase (anonymous sign-in for students, Google sign-in for the teacher).
import CONFIG from './firebase-config.js';

const V = '10.12.2';
const BASE = `https://www.gstatic.com/firebasejs/${V}/`;

export const RULES = [
  { key: 'caps', label: 'نجمة في الكبسولات', icon: '🌟', per: 7, max: 507 },
  { key: 'wq',   label: 'إجابة صحيحة في Word Quest', icon: '🗺️', per: 5, max: 500 },
  { key: 'lab',  label: 'إجابة صحيحة في مختبر المحادثة', icon: '💬', per: 7, max: 100 },
  { key: 'mg',   label: 'كلمة أتقنتها في ميدان المفردات', icon: '🏟️', per: 4, max: 900 },
  { key: 'ng',   label: 'إجابة صحيحة في الكلمات العامة', icon: '🌍', per: 5, max: 500 },
  { key: 'aw',   label: 'إجابة صحيحة في الكلمات الأكاديمية', icon: '🎓', per: 5, max: 290 },
  { key: 'st',   label: 'إجابة صحيحة في ركن القصص', icon: '📖', per: 7, max: 54 },
  { key: 'bf',   label: 'إجابة صحيحة في Breakfast Challenge', icon: '🍳', per: 7, max: 10 },
  { key: 'tn',   label: 'إجابة صحيحة في خارطة الأزمنة', icon: '⏳', per: 7, max: 10 },
  { key: 'pv',   label: 'إجابة صحيحة في المبني للمجهول', icon: '🔄', per: 7, max: 10 },
  { key: 'im',   label: 'إجابة صحيحة في ركن التعبيرات', icon: '🎨', per: 7, max: 10 },
  { key: 'tb',   label: 'إجابة صحيحة في محادثات التأسيس', icon: '🗣️', per: 5, max: 40 },
  { key: 'mb',   label: 'درجة في Surprise Me (الصندوق = 100)', icon: '🎁', per: 1, max: 8000 }
];
const CAPS = ['space', 'flavor', 'life', 'adventure', 'emotion', 'career', 'nature', 'health', 'sports', 'tech'];

function J(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
function N(k) { try { return +(localStorage.getItem(k) || 0) || 0; } catch (e) { return 0; } }

/** Word Quest progress the teacher sees: units with a badge, units tried, streak, words mastered and learnt, last active day. */
function wqStats() {
  const d = new Date(), today = Math.floor((d - d.getTimezoneOffset() * 60000) / 864e5);
  let u = 0, t = 0; for (let n = 1; n <= 50; n++) { const b = N('wq-best-' + n); if (b >= 8) u++; if (b > 0) t++; }
  const srs = J('wq-srs') || {}, ws = Object.keys(srs), m = ws.filter(w => (srs[w] || [])[0] >= 4).length;
  const sk = J('wq-streak') || {}, s = sk.last >= today - 1 ? (sk.n || 0) : 0;
  const day = J('wq-day') || {}, la = Math.max(+day.d || 0, +sk.last || 0);
  return { d: la, g: day.d === today ? (day.n || 0) : 0, k: ws.length, m, s, t, u };
}
/** Points earned on this device, with the breakdown. */
export function computeScore() {
  let caps = 0;
  CAPS.forEach(c => { const s = J('cap2-' + c + '-stars') || {}; Object.keys(s).forEach(k => { caps += Math.max(0, Math.min(3, +s[k] || 0)); }); });
  let wq = 0; for (let n = 1; n <= 50; n++) wq += Math.max(0, Math.min(10, N('wq-best-' + n)));
  let lab = 0; for (let w = 1; w <= 20; w++) lab += Math.max(0, Math.min(5, N('cl-q-' + w)));
  const mg = Math.min(300, (J('mg1-known') || []).length) + Math.min(300, (J('mg2-known') || []).length) + Math.min(300, (J('mg3-known') || []).length);
  const bf = Math.max(0, Math.min(10, N('bf-best')));
  let ng = 0; for (let n = 1; n <= 50; n++) ng += Math.max(0, Math.min(10, N('ng-best-' + n)));
  let aw = 0; for (let n = 1; n <= 29; n++) aw += Math.max(0, Math.min(10, N('aw-best-' + n)));
  let st = 0; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf('st-best-') === 0) st += Math.max(0, Math.min(3, N(k))); } } catch (e) {}
  const tn = Math.max(0, Math.min(10, N('tn-best')));
  const pv = Math.max(0, Math.min(10, N('pv-best')));
  const im = Math.max(0, Math.min(10, N('im-best')));
  let tb = 0; ['greet','bye','ask','yesno','sorry','thanks','invite','meet'].forEach(u => { tb += Math.max(0, Math.min(5, N('tb-best-' + u))); });
  // Surprise Me: marks of the first box of each day (mb-pts = {day: marks out of 100});
  // days saved before mb-pts existed (mb-days = {day: right answers}) count 5 per right answer.
  let mb = 0; const mbd = J('mb-days') || {}, mbp = J('mb-pts') || {};
  Object.keys(mbd).forEach(k => { mb += mbp[k] !== undefined ? Math.max(0, Math.min(100, +mbp[k] || 0)) : Math.max(0, Math.min(12, +mbd[k] || 0)) * 5; });
  const parts = { caps, wq, lab, mg, bf, ng, aw, st, tn, pv, im, tb, mb, wqx: wqStats() };
  // The board's database accepts at most 10,000 points per student.
  const score = Math.min(10000, RULES.reduce((t, r) => t + Math.min(parts[r.key], r.max) * r.per, 0));
  return { score, parts };
}

export const ready = !!(CONFIG && CONFIG.apiKey);
export const TEACHERS = (CONFIG && CONFIG.teachers) || [];

let fb = null;
async function load() {
  if (fb) return fb;
  if (!ready) throw new Error('not-configured');
  const [app, auth, fs] = await Promise.all([
    import(BASE + 'firebase-app.js'), import(BASE + 'firebase-auth.js'), import(BASE + 'firebase-firestore.js')
  ]);
  // Two separate sign-ins in the same browser: the student's anonymous account and the teacher's Google account.
  // Keeping them apart means the teacher signing in on a phone never replaces (and loses) a student's account there.
  const a = app.initializeApp(CONFIG);
  const t = app.initializeApp(CONFIG, 'teacher');
  fb = { auth, fs, A: auth.getAuth(a), D: fs.getFirestore(a), TA: auth.getAuth(t), TD: fs.getFirestore(t) };
  return fb;
}

function currentUser(A) {
  if (A.currentUser) return Promise.resolve(A.currentUser);
  return new Promise(res => { const stop = fb.auth.onAuthStateChanged(A, x => { stop(); res(x); }); });
}

/** Signs the student in anonymously (once per device) and returns the uid. */
export async function studentUid() {
  const { auth, A } = await load();
  let u = await currentUser(A);
  // Older versions signed the teacher in here too; a Google account is never used as a student.
  // (A student whose account has a recovery code is no longer anonymous: their provider is 'password'.)
  if (u && (u.providerData || []).some(p => p.providerId === 'google.com')) { await auth.signOut(A); u = null; }
  if (!u) u = (await auth.signInAnonymously(A)).user;
  return u.uid;
}

export function cleanNick(s) { return String(s || '').replace(/\s+/g, ' ').trim().slice(0, 20); }

/** My entry in the board, or null if I have not joined. */
export async function myEntry() {
  const { fs, D } = await load();
  const uid = await studentUid();
  const snap = await fs.getDoc(fs.doc(D, 'players', uid));
  return snap.exists() ? { id: uid, ...snap.data() } : null;
}


/* ---------- private identity (real name, grade, section): readable only by the student and the teacher ---------- */
export const GRADES = ['أول ثانوي', 'ثاني ثانوي', 'ثالث ثانوي'];
export const EXTERNAL = 'من خارج المدرسة';
export const HOME_REGION = 'العقيق';
export const REGIONS = ['العقيق', 'الباحة', 'بلجرشي', 'المخواة', 'المندق', 'القرى', 'مكة المكرمة', 'جدة', 'الطائف', 'أبها', 'النماص', 'عسير', 'الرياض', 'المدينة المنورة', 'القصيم', 'المنطقة الشرقية', 'تبوك', 'حائل', 'الحدود الشمالية', 'جازان', 'نجران', 'الجوف', 'خارج المملكة'];
/** Ready-made nicknames. One of these is shown on the board at once, without the teacher's approval
 *  (the teacher page copies this list to config/nicks, where firestore.rules reads it). */
export const SUGGESTED = ["نسر العقيق", "صقر الباحة", "ذئب الجبال", "فهد الصحراء", "شبح الليل", "برق الشمال", "إعصار الجنوب", "ملك الكلمات", "سيد المفردات", "قناص النقاط", "صياد النجوم", "محارب الحروف", "فارس اللغة", "عاصفة رملية", "نجم الثانوية", "الرقم الصعب", "بطل التحدي", "الأسطورة", "الظل الصامت", "الذئب الأبيض", "النمر الأسود", "الصقر الذهبي", "الشهاب", "المذنّب", "الكوكب الأزرق", "نيزك", "بركان", "زلزال", "إعصار", "الرعد", "سهم النار", "درع الفولاذ", "القائد", "الجنرال", "الكابتن", "المحترف", "الخبير", "العبقري", "المخطط", "الداهية", "المستكشف", "الرحّالة", "البحّار", "الطيار", "رائد الفضاء", "حارس المجرة", "سيد الوقت", "صانع الأرقام", "الماسة", "الياقوتة السوداء", "الورقة الرابحة", "اللاعب رقم 1", "الهداف", "صانع الألعاب", "حارس المرمى", "الجناح الطائر", "المهاجم", "الفريق الأخضر", "السرعة القصوى", "التوربو", "النيترو", "محرك V8", "صقر الشفا", "سيد الطريق", "المستوى الأخير", "الزعيم الأخير", "ضربة قاضية", "كومبو", "الفوز الكبير", "أبو النقاط", "جبل السودة", "غيمة الباحة", "ضباب الجبال", "شلال العقيق", "نخلة الوادي", "ورد الطائف", "سدر الوادي", "عرعر الجبل", "قمة الشفا", "ريح الشمال", "ليل البادية", "سهيل", "الثريا", "الجوزاء", "نجم القطب", "القمر المكتمل", "شمس الظهيرة", "موج البحر", "المرجان", "اللؤلؤ", "العنقاء", "التنين", "الغريفين", "الأسد الجبلي", "الوشق", "الصقر الحر", "الشاهين", "العقاب", "الحصان الأصيل", "الخيل العربية", "Sky Hunter", "Night Falcon", "Desert Wolf", "Storm Rider", "Ghost Ninja", "Shadow Fox", "Iron Eagle", "Thunder Bolt", "Fire Hawk", "Ice Tiger", "Star Chaser", "Word Master", "Vocab King", "Grammar Boss", "Brain Storm", "Smart Shark", "Speedy Falcon", "Turbo Ace", "Nitro Boost", "Pixel Hero", "Code Breaker", "Level Up", "Final Boss", "Combo King", "Pro Player", "Top Scorer", "MVP Player", "Rocket Boy", "Space Ranger", "Galaxy Rider", "Moon Walker", "Comet Blaze", "Meteor Strike", "Solar Flare", "Night Rider", "Silver Arrow", "Red Dragon", "Blue Phoenix", "Black Jaguar", "White Wolf", "Alpha Leader", "Captain Alpha", "The Legend", "The Champion", "Victory Ace", "Quiz Ninja", "Lucky Star", "Quick Mind", "Sharp Eye", "Iron Will", "Steel Heart", "Brave Lion", "Wild Falcon", "Mountain Eagle", "Baha Falcon", "Aqiq Eagle", "Desert Storm", "Sand Tiger", "Palm Warrior", "Oasis King", "Falcon Pro", "Hawk Eye", "Eagle One", "Wolf Pack", "Lion Heart", "Early Bird", "Sun Rise", "Star Light", "Snow Storm", "Rain Maker", "Wind Runner", "Wave Rider", "Fast Track", "High Score", "Max Power", "Super Nova", "Mega Mind", "Ultra Brain", "Light Speed", "صقر السروات", "نجم العقيق", "فارس الباحة", "سفير الإنجليزية", "فارس المعرفة", "رحّال المعرفة", "صانع الأمجاد", "حامل الراية", "فخر الثانوية", "بطل الكلمات", "ملك القواعد", "سيد الأزمنة", "مهندس الجمل", "ربّان السفينة", "شعلة الأمل", "نجم الصباح", "ضوء الفجر", "سهم المعرفة", "صقر نجد", "نسر الحجاز", "رعد الجبال", "برق العقيق", "ليث الوادي", "القلم الذهبي", "العقل المبدع", "رائد التحدي", "الطموح", "المثابر", "الواثق", "قمة الطموح", "Word Wizard", "Grammar Guru", "Brave Falcon", "Golden Falcon", "Royal Falcon", "Star Pilot", "Sky Captain", "Mountain Lion", "Bright Mind", "Fast Learner", "Top Speaker", "Quiz Master", "Spelling Star", "Story Hero", "Peak Climber", "Future Leader", "True Champion", "Silver Hawk", "Swift Arrow", "Brave Heart", "Noble Knight", "Ocean Explorer", "Space Pilot", "Thunder Hawk", "Blue Falcon", "Victory Star", "Gold Medal", "Bright Star", "Desert Falcon", "Fluent Hero", "Zero Gravity", "Big Brain", "Mr Genius", "Shark Bite", "القرش", "الأخطبوط"];
const isSuggested = n => SUGGESTED.includes(n);
export function cleanText(s, max) { return String(s || '').replace(/\s+/g, ' ').trim().slice(0, max); }

/** My private record, or null. */
export async function myPrivate() {
  const { fs, D } = await load();
  const uid = await studentUid();
  const snap = await fs.getDoc(fs.doc(D, 'private', uid));
  return snap.exists() ? snap.data() : null;
}

/** Saves my real name, grade and section (allowed until the teacher approves me). */
export async function savePrivate(p) {
  const { fs, D } = await load();
  const uid = await studentUid();
  await fs.setDoc(fs.doc(D, 'private', uid), {
    name: cleanText(p.name, 60), grade: cleanText(p.grade, 20), section: cleanText(p.section, 10),
    ...(p.school ? { school: cleanText(p.school, 60) } : {}), updatedAt: fs.serverTimestamp()
  });
}

/** Teacher: every private record, keyed by uid. */
export async function allPrivate() {
  const { fs, TD: D } = await load();
  const snap = await fs.getDocs(fs.collection(D, 'private'));
  const out = {}; snap.forEach(d => { out[d.id] = d.data(); });
  return out;
}

/** Join (or change nickname). A new or changed nickname waits for the teacher's approval. */
export async function join(nick, region) {
  const { fs, D } = await load();
  const uid = await studentUid();
  const local = computeScore(), parts = local.parts;
  nick = cleanNick(nick);
  const reg = region ? { region: cleanText(region, 30) } : {};
  const ref = fs.doc(D, 'players', uid);
  const snap = await fs.getDoc(ref);
  const base = snap.exists() ? (snap.data().base | 0) : 0;
  const score = Math.min(10000, local.score + base);
  const write = async ok => {
    if (snap.exists()) {
      const same = snap.data().nick === nick;
      await fs.updateDoc(ref, same ? { score, parts, ...reg, updatedAt: fs.serverTimestamp() }
                                   : { nick, approved: ok, score, parts, ...reg, updatedAt: fs.serverTimestamp() });
    } else {
      await fs.setDoc(ref, { nick, approved: ok, score, parts, ...reg, updatedAt: fs.serverTimestamp() });
    }
  };
  let auto = isSuggested(nick);
  // If the board's rules do not allow instant approval yet, fall back to waiting for the teacher.
  try { await write(auto); } catch (e) { if (!auto || !/permission/i.test(e && (e.code || e.message) || '')) throw e; auto = false; await write(false); }
  try { localStorage.setItem('club-player', '1'); localStorage.setItem('club-sync', JSON.stringify({ t: Date.now(), s: score })); } catch (e) {}
  const approved = snap.exists() && snap.data().nick === nick ? snap.data().approved : auto;
  // Back up this device's progress and give the student a recovery code (quietly; never blocks joining).
  pushProgress(uid, true).catch(() => {});
  ensureAccount().catch(() => {});
  return { id: uid, nick, score, parts, approved, base };
}

/** Sets my region shown on the board. */
export async function setRegion(region) {
  const { fs, D } = await load();
  const uid = await studentUid();
  await fs.updateDoc(fs.doc(D, 'players', uid), { region: cleanText(region, 30) });
}

/** Pushes my latest points if I have joined. Quiet; throttled unless forced.
 *  It also keeps this device and the cloud backup of the student's progress in step:
 *  the cloud copy is merged in first (so a second device or a restored account never loses anything),
 *  then the merged progress is backed up again. */
export async function sync(force) {
  if (!ready) return null;
  pushLevels().catch(() => {});
  let joined = false; try { joined = !!localStorage.getItem('club-player'); } catch (e) {}
  if (!joined) return null;
  let { score, parts } = computeScore();
  const last = J('club-sync') || {};
  const sig = JSON.stringify(parts.wqx);
  const pullDue = Date.now() - N('club-pull') > 15 * 60e3;
  if (!force && !pullDue && last.s === score && last.w === sig && last.p === progressSig() && Date.now() - (last.t || 0) < 6 * 3600e3) return null;
  const { fs, D } = await load();
  const uid = await studentUid();
  const ref = fs.doc(D, 'players', uid);
  const snap = await fs.getDoc(ref);
  if (!snap.exists()) { try { localStorage.removeItem('club-player'); } catch (e) {} return null; }
  if (force || pullDue) { await pullProgress(uid).catch(e => console.warn('progress pull', e)); ({ score, parts } = computeScore()); }
  const was = snap.data();
  const total = Math.min(10000, score + (was.base | 0));
  const wsig = JSON.stringify(parts.wqx);
  if (was.score !== total || JSON.stringify((was.parts || {}).wqx || null) !== wsig) await fs.updateDoc(ref, { score: total, parts, updatedAt: fs.serverTimestamp() });
  await pushProgress(uid, force).catch(e => console.warn('progress backup', e));
  try { localStorage.setItem('club-sync', JSON.stringify({ t: Date.now(), s: score, w: wsig, p: progressSig() })); } catch (e) {}
  ensureAccount().catch(e => console.warn('recovery code', e));
  return total;
}

/* ---------- progress backup & recovery code: the same account (and the same points) on any device ---------- */
// Everything the tools save in this browser is backed up, except the site's own bookkeeping
// and the Kids Club (which has no registration).
const SKIP = /^(club-(sync|player|reg|code|code-seen|code-off|pull|last)|lv-synced|firebase|kd-)/;
function collectProgress() {
  const out = {}; let size = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i); if (!k || SKIP.test(k)) continue;
      const v = localStorage.getItem(k); if (v == null || v.length > 100000) continue;
      size += k.length + v.length; if (size > 300000) break;
      out[k] = v;
    }
  } catch (e) {}
  return out;
}
function hash(str) { let h = 5381; for (let i = 0; i < str.length; i++) h = (h * 33 + str.charCodeAt(i)) | 0; return (h >>> 0).toString(36) + ':' + str.length; }
function progressSig() { const o = collectProgress(); return hash(JSON.stringify(Object.keys(o).sort().map(k => [k, o[k]]))); }

/** Merges two saved values so that nothing learnt is ever lost: highest score, union of word lists, per-item best. */
function mergeVal(a, b) {
  if (a === undefined || a === null) return b;
  if (b === undefined || b === null) return a;
  if (typeof a === 'number' && typeof b === 'number') return Math.max(a, b);
  if (Array.isArray(a) && Array.isArray(b)) {
    const prim = x => x.every(v => v === null || typeof v !== 'object');
    if (prim(a) && prim(b) && (a.some(v => typeof v === 'string') || b.some(v => typeof v === 'string'))) return Array.from(new Set(a.concat(b)));
    for (let i = 0; i < Math.max(a.length, b.length); i++) { // e.g. [box, due day]: keep the further one
      const x = a[i], y = b[i];
      if (typeof x === 'number' && typeof y === 'number') { if (x !== y) return x > y ? a : b; continue; }
      if (x === undefined) return b; if (y === undefined) return a;
      break;
    }
    return a.length >= b.length ? a : b;
  }
  if (typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    const o = { ...b }; Object.keys(a).forEach(k => { o[k] = mergeVal(a[k], b[k]); }); return o;
  }
  return a; // text settings: this device's choice wins
}
function mergeRaw(local, cloud) {
  if (local == null) return cloud;
  if (cloud == null || local === cloud) return local;
  let a, b;
  try { a = JSON.parse(local); b = JSON.parse(cloud); } catch (e) { return local; }
  const m = mergeVal(a, b);
  return m === a ? local : m === b ? cloud : JSON.stringify(m);
}

/** Brings the cloud copy of my progress into this browser (merging, never replacing). */
async function pullProgress(uid) {
  const { fs, D } = await load();
  const snap = await fs.getDoc(fs.doc(D, 'progress', uid));
  try { localStorage.setItem('club-pull', String(Date.now())); } catch (e) {}
  if (!snap.exists()) return false;
  let cloud = {}; try { cloud = JSON.parse(snap.data().d || '{}') || {}; } catch (e) { return false; }
  Object.keys(cloud).forEach(k => {
    if (SKIP.test(k)) return;
    try { const cur = localStorage.getItem(k), m = mergeRaw(cur, cloud[k]); if (m !== cur && m != null) localStorage.setItem(k, m); } catch (e) {}
  });
  return true;
}
/** Saves this browser's progress to the cloud (only when it changed). */
async function pushProgress(uid, force) {
  const sig = progressSig(), last = J('club-sync') || {};
  if (!force && last.p === sig) return false;
  const { fs, D } = await load();
  await fs.setDoc(fs.doc(D, 'progress', uid), { d: JSON.stringify(collectProgress()), updatedAt: fs.serverTimestamp() });
  return true;
}

// Recovery code: 8 characters without look-alikes (no 0/O, 1/I/L), shown as ABCD-2345.
const ABC = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export function cleanCode(s) { const c = String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1'); return c.length === 8 ? c.slice(0, 4) + '-' + c.slice(4) : ''; }
const codeEmail = c => c.replace('-', '').toLowerCase() + '@students.english-club-score.firebaseapp.com';
const codePass = c => 'EH!' + c + '#club';
function newCode() { const r = crypto.getRandomValues(new Uint32Array(8)); let c = ''; for (let i = 0; i < 8; i++) c += ABC[r[i] % ABC.length]; return c.slice(0, 4) + '-' + c.slice(4); }

/** My recovery code, if this browser knows it. */
export function myCode() { try { return localStorage.getItem('club-code') || ''; } catch (e) { return ''; } }

/** Gives a registered student a recovery code: the anonymous account is linked to it, so the uid
 *  (and with it the name, points and everything else) stays exactly the same. Quiet and safe to repeat. */
export async function ensureAccount() {
  let joined = false; try { joined = !!localStorage.getItem('club-player'); } catch (e) {}
  if (!ready || !joined) return '';
  if (Date.now() - N('club-code-off') < 24 * 3600e3) return myCode();
  const { auth, fs, A, D } = await load();
  const u = await currentUser(A);
  if (!u) return '';
  let code = myCode();
  if (u.isAnonymous) {
    code = newCode();
    try { await auth.linkWithCredential(u, auth.EmailAuthProvider.credential(codeEmail(code), codePass(code))); }
    catch (e) {
      // 'operation-not-allowed': the teacher has not switched on Email/Password sign-in in Firebase yet.
      if (/operation-not-allowed|admin-restricted/i.test(e && e.code || '')) { try { localStorage.setItem('club-code-off', String(Date.now())); } catch (x) {} }
      throw e;
    }
    try { localStorage.setItem('club-code', code); localStorage.removeItem('club-code-seen'); localStorage.removeItem('club-code-off'); } catch (e) {}
  }
  if (!code) return '';
  // The teacher keeps a copy of every code, to help a student who forgets it.
  let saved = ''; try { saved = localStorage.getItem('club-code-saved') || ''; } catch (e) {}
  if (saved !== u.uid) {
    try { await fs.setDoc(fs.doc(D, 'recovery', u.uid), { code, at: fs.serverTimestamp() }); localStorage.setItem('club-code-saved', u.uid); } catch (e) { console.warn('recovery copy', e); }
  }
  return code;
}

/** Opens my account on this device with my recovery code. Progress already on this device is kept and merged in;
 *  if this device had made a new (temporary) account, it is removed so it does not appear twice on the board. */
export async function restore(raw) {
  const code = cleanCode(raw);
  if (!code) { const e = new Error('bad-format'); e.code = 'bad-format'; throw e; }
  const { auth, fs, A, D } = await load();
  // 1) Check the code on a separate sign-in first, so a wrong code changes nothing here.
  const appMod = await import(BASE + 'firebase-app.js');
  const probeApp = appMod.getApps().find(x => x.name === 'probe') || appMod.initializeApp(CONFIG, 'probe');
  const PA = auth.getAuth(probeApp);
  let target;
  try { target = (await auth.signInWithEmailAndPassword(PA, codeEmail(code), codePass(code))).user.uid; }
  catch (e) { const er = new Error('bad-code'); er.code = /network/i.test(e && e.code || '') ? 'network' : 'bad-code'; throw er; }
  finally { auth.signOut(PA).catch(() => {}); }
  // 2) Remove this device's temporary account (only if it is a different, code-less one).
  const cur = await currentUser(A);
  if (cur && cur.uid !== target && cur.isAnonymous) {
    for (const c of ['players', 'private']) { try { await fs.deleteDoc(fs.doc(D, c, cur.uid)); } catch (e) {} }
  }
  // 3) Sign in to the real account and bring its progress here.
  await auth.signInWithEmailAndPassword(A, codeEmail(code), codePass(code));
  try {
    ['club-sync', 'club-pull', 'club-code-saved', 'lv-synced'].forEach(k => localStorage.removeItem(k));
    localStorage.setItem('club-code', code); localStorage.setItem('club-code-seen', '1');
    localStorage.setItem('club-player', '1'); localStorage.setItem('club-reg', '1');
  } catch (e) {}
  await pullProgress(target);
  await sync(true);
  return myEntry();
}

/** Shows the recovery code once, on any page, right after it is created. */
export function showCodeOnce() {
  const code = myCode();
  let seen = true; try { seen = !!localStorage.getItem('club-code-seen'); } catch (e) {}
  if (!code || seen || document.getElementById('codeCard') || /\/(honor|teacher)\.html$/.test(location.pathname)) return;
  const d = document.createElement('div');
  d.id = 'codeCard'; d.dir = 'rtl'; d.setAttribute('role', 'dialog');
  d.style.cssText = 'position:fixed;inset:0;z-index:99999;display:grid;place-items:center;background:rgba(255,252,244,.82);padding:16px;font-family:Tajawal,"Segoe UI",Tahoma,sans-serif';
  d.innerHTML = `<div style="max-width:440px;width:100%;background:#fff;border:2px solid #f0d58a;border-radius:24px;padding:22px 20px;box-shadow:0 18px 50px rgba(120,90,0,.18);text-align:center;color:#2a2a3d;font-size:19px;line-height:1.7">
    <div style="font-size:2.4rem">🔑</div>
    <b style="font-size:1.3rem;display:block">هذا رمز حسابك</b>
    <p style="margin:8px 0">به تفتح حسابك ونقاطك من أي جهاز أو متصفح آخر.</p>
    <div dir="ltr" style="font-family:Lexend,monospace;font-size:2.1rem;font-weight:700;letter-spacing:3px;background:#fff6dc;border:2px dashed #e0b84a;border-radius:16px;padding:10px;margin:10px 0">${code}</div>
    <p style="margin:6px 0;color:#a35a00;font-weight:700">📸 صوّر هذه الشاشة أو اكتب الرمز في دفترك الآن.</p>
    <button type="button" style="font:inherit;font-weight:800;font-size:1.1rem;border:0;border-radius:999px;background:#16825d;color:#fff;padding:10px 26px;margin-top:8px;cursor:pointer">حفظته ✓</button></div>`;
  d.querySelector('button').onclick = () => { try { localStorage.setItem('club-code-seen', '1'); } catch (e) {} d.remove(); };
  document.body.appendChild(d);
}

/** Approved players, highest first. */
export async function board(limit) {
  const { fs, D } = await load();
  const q = fs.query(fs.collection(D, 'players'), fs.where('approved', '==', true));
  const snap = await fs.getDocs(q);
  const rows = []; snap.forEach(d => rows.push({ id: d.id, ...d.data() }));
  rows.sort((a, b) => (b.score || 0) - (a.score || 0));
  return limit ? rows.slice(0, limit) : rows;
}

/** Live board: calls cb(rows) now and again whenever any approved player's points change. Returns a stop function. */
export async function watchBoard(cb, limit) {
  const { fs, D } = await load();
  const q = fs.query(fs.collection(D, 'players'), fs.where('approved', '==', true));
  return fs.onSnapshot(q, snap => {
    const rows = []; snap.forEach(d => rows.push({ id: d.id, ...d.data() }));
    rows.sort((a, b) => (b.score || 0) - (a.score || 0));
    cb(limit ? rows.slice(0, limit) : rows);
  }, err => console.warn(err));
}

/* ---------- teacher ---------- */
export async function teacherSignIn() {
  const { auth, TA: A } = await load();
  const r = await auth.signInWithPopup(A, new auth.GoogleAuthProvider());
  return r.user;
}
export async function teacherUser() {
  const { TA: A } = await load();
  const u = await currentUser(A);
  return u && !u.isAnonymous ? u : null;
}
export async function teacherSignOut() { const { auth, TA: A } = await load(); await auth.signOut(A); }
export async function allPlayers() {
  const { fs, TD: D } = await load();
  const snap = await fs.getDocs(fs.collection(D, 'players'));
  const rows = []; snap.forEach(d => rows.push({ id: d.id, ...d.data() }));
  return rows;
}
/** Teacher: makes sure the database holds the current suggested-nickname list (the rules read it from there). */
export async function syncSuggested() {
  const { fs, TD: D } = await load();
  const ref = fs.doc(D, 'config', 'nicks'), snap = await fs.getDoc(ref);
  const cur = snap.exists() ? snap.data().list || [] : [];
  if (cur.length === SUGGESTED.length && cur.every((x, i) => x === SUGGESTED[i])) return false;
  await fs.setDoc(ref, { list: SUGGESTED });
  return true;
}
/** Teacher: every student's recovery code, keyed by uid. */
export async function allCodes() {
  const { fs, TD: D } = await load();
  const snap = await fs.getDocs(fs.collection(D, 'recovery'));
  const out = {}; snap.forEach(d => { out[d.id] = d.data().code; });
  return out;
}
/** Teacher: moves the points of an old account (made on a lost device) into the student's current account, then removes the old one. */
export async function mergeInto(targetId, fromId) {
  const { fs, TD: D } = await load();
  const [t, f] = await Promise.all([fs.getDoc(fs.doc(D, 'players', targetId)), fs.getDoc(fs.doc(D, 'players', fromId))]);
  if (!t.exists() || !f.exists()) throw new Error('not-found');
  const add = f.data().score | 0, base = (t.data().base | 0) + add;
  await fs.updateDoc(fs.doc(D, 'players', targetId), { base, score: Math.min(10000, (t.data().score | 0) + add) });
  await remove(fromId);
  return add;
}
export async function setApproved(id, v) { const { fs, TD: D } = await load(); await fs.updateDoc(fs.doc(D, 'players', id), { approved: !!v }); }
export async function setRegionFor(id, region) { const { fs, TD: D } = await load(); await fs.updateDoc(fs.doc(D, 'players', id), { region: cleanText(region, 30) }); }
export async function rename(id, nick) { const { fs, TD: D } = await load(); await fs.updateDoc(fs.doc(D, 'players', id), { nick: cleanNick(nick) }); }
export async function remove(id) { const { fs, TD: D } = await load(); await fs.deleteDoc(fs.doc(D, 'players', id)); try { await fs.deleteDoc(fs.doc(D, 'private', id)); } catch (e) {} }

/* ---------- level check (a before test and an after test): readable only by the student and the teacher ---------- */
const cleanResult = r => ({ score: r.score | 0, max: r.max | 0, level: cleanText(r.level, 10), v: r.v | 0, g: r.g | 0, r: r.r | 0, l: r.l | 0, at: Math.round(+r.at || Date.now()) });
export async function myLevels() {
  const { fs, D } = await load();
  const uid = await studentUid();
  const snap = await fs.getDoc(fs.doc(D, 'levels', uid));
  return snap.exists() ? snap.data() : {};
}
/** Saves the before ('pre') or after ('post') result. Each can be saved once; the teacher can reset it. */
export async function saveLevel(kind, r) {
  const { fs, D } = await load();
  const uid = await studentUid();
  await fs.setDoc(fs.doc(D, 'levels', uid), { [kind]: cleanResult(r), updatedAt: fs.serverTimestamp() }, { merge: true });
}
/** Whether the teacher has opened the after test. */
export async function levelsConfig() {
  const { fs, D } = await load();
  const snap = await fs.getDoc(fs.doc(D, 'config', 'levels'));
  return snap.exists() ? snap.data() : {};
}
export async function teacherLevelsConfig() {
  const { fs, TD: D } = await load();
  const snap = await fs.getDoc(fs.doc(D, 'config', 'levels'));
  return snap.exists() ? snap.data() : {};
}
export async function setPostOpen(v) { const { fs, TD: D } = await load(); await fs.setDoc(fs.doc(D, 'config', 'levels'), { postOpen: !!v }, { merge: true }); }
/** Teacher: every student's results, keyed by uid. */
export async function allLevels() {
  const { fs, TD: D } = await load();
  const snap = await fs.getDocs(fs.collection(D, 'levels'));
  const out = {}; snap.forEach(d => { out[d.id] = d.data(); });
  return out;
}
/** Teacher: lets a student take a test again ('pre', 'post' or 'all'). */
export async function resetLevel(id, kind) {
  const { fs, TD: D } = await load();
  const ref = fs.doc(D, 'levels', id);
  if (kind === 'all') return fs.deleteDoc(ref);
  await fs.updateDoc(ref, kind === 'pre' ? { pre: fs.deleteField(), post: fs.deleteField() } : { post: fs.deleteField() });
}

/** Sends level-check results kept only on this device (taken while the database did not accept them yet). */
let pushing = false;
export async function pushLevels() {
  if (!ready || pushing) return;
  let res = {}, done = {};
  try { res = JSON.parse(localStorage.getItem('lv-results') || '{}') || {}; done = JSON.parse(localStorage.getItem('lv-synced') || '{}') || {}; } catch (e) { return; }
  const todo = ['pre', 'post'].filter(k => res[k] && !done[k]);
  if (!todo.length) return;
  pushing = true;
  try {
    const cloud = await myLevels();
    for (const k of ['pre', 'post']) {
      if (!res[k] || done[k]) continue;
      if (!cloud[k]) { if (k === 'post' && !cloud.pre) break; await saveLevel(k, res[k]); cloud[k] = res[k]; }
      done[k] = true;
    }
  } finally {
    pushing = false;
    try { localStorage.setItem('lv-synced', JSON.stringify(done)); } catch (e) {}
  }
}
