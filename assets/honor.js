// لوحة الشرف — shared module: computes a student's points from what each tool saved on this device,
// and talks to Firebase (anonymous sign-in for students, Google sign-in for the teacher).
import CONFIG from './firebase-config.js';

const V = '10.12.2';
const BASE = `https://www.gstatic.com/firebasejs/${V}/`;

export const RULES = [
  { key: 'caps', label: 'نجمة في الكبسولات', icon: '🌟', per: 10, max: 411 },
  { key: 'wq',   label: 'إجابة صحيحة في Word Quest', icon: '🗺️', per: 5, max: 500 },
  { key: 'lab',  label: 'إجابة صحيحة في مختبر المحادثة', icon: '💬', per: 10, max: 100 },
  { key: 'mg',   label: 'كلمة أتقنتها في ميدان المفردات', icon: '🏟️', per: 3, max: 600 }
];
const CAPS = ['space', 'flavor', 'life', 'adventure', 'emotion', 'career', 'nature', 'health'];

function J(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
function N(k) { try { return +(localStorage.getItem(k) || 0) || 0; } catch (e) { return 0; } }

/** Points earned on this device, with the breakdown. */
export function computeScore() {
  let caps = 0;
  CAPS.forEach(c => { const s = J('cap2-' + c + '-stars') || {}; Object.keys(s).forEach(k => { caps += Math.max(0, Math.min(3, +s[k] || 0)); }); });
  let wq = 0; for (let n = 1; n <= 50; n++) wq += Math.max(0, Math.min(10, N('wq-best-' + n)));
  let lab = 0; for (let w = 1; w <= 20; w++) lab += Math.max(0, Math.min(5, N('cl-q-' + w)));
  const mg = Math.min(300, (J('mg1-known') || []).length) + Math.min(300, (J('mg2-known') || []).length);
  const parts = { caps, wq, lab, mg };
  const score = RULES.reduce((t, r) => t + Math.min(parts[r.key], r.max) * r.per, 0);
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
  const a = app.initializeApp(CONFIG);
  fb = { auth, fs, A: auth.getAuth(a), D: fs.getFirestore(a) };
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

/** Join (or change nickname). A new or changed nickname waits for the teacher's approval. */
export async function join(nick) {
  const { fs, D } = await load();
  const uid = await studentUid();
  const { score, parts } = computeScore();
  nick = cleanNick(nick);
  const ref = fs.doc(D, 'players', uid);
  const snap = await fs.getDoc(ref);
  if (snap.exists()) {
    const same = snap.data().nick === nick;
    await fs.updateDoc(ref, same ? { score, parts, updatedAt: fs.serverTimestamp() }
                                 : { nick, approved: false, score, parts, updatedAt: fs.serverTimestamp() });
  } else {
    await fs.setDoc(ref, { nick, approved: false, score, parts, updatedAt: fs.serverTimestamp() });
  }
  try { localStorage.setItem('club-player', '1'); localStorage.setItem('club-sync', JSON.stringify({ t: Date.now(), s: score })); } catch (e) {}
  return { id: uid, nick, score, parts };
}

/** Pushes my latest points if I have joined. Quiet; throttled unless forced. */
export async function sync(force) {
  if (!ready) return null;
  let joined = false; try { joined = !!localStorage.getItem('club-player'); } catch (e) {}
  if (!joined) return null;
  const { score, parts } = computeScore();
  const last = J('club-sync') || {};
  if (!force && last.s === score && Date.now() - (last.t || 0) < 6 * 3600e3) return null;
  const { fs, D } = await load();
  const uid = await studentUid();
  const ref = fs.doc(D, 'players', uid);
  const snap = await fs.getDoc(ref);
  if (!snap.exists()) { try { localStorage.removeItem('club-player'); } catch (e) {} return null; }
  if (snap.data().score !== score) await fs.updateDoc(ref, { score, parts, updatedAt: fs.serverTimestamp() });
  try { localStorage.setItem('club-sync', JSON.stringify({ t: Date.now(), s: score })); } catch (e) {}
  return score;
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

/* ---------- teacher ---------- */
export async function teacherSignIn() {
  const { auth, A } = await load();
  const r = await auth.signInWithPopup(A, new auth.GoogleAuthProvider());
  return r.user;
}
export async function teacherUser() {
  const { A } = await load();
  const u = await currentUser(A);
  return u && !u.isAnonymous ? u : null;
}
export async function teacherSignOut() { const { auth, A } = await load(); await auth.signOut(A); }
export async function allPlayers() {
  const { fs, D } = await load();
  const snap = await fs.getDocs(fs.collection(D, 'players'));
  const rows = []; snap.forEach(d => rows.push({ id: d.id, ...d.data() }));
  return rows;
}
export async function setApproved(id, v) { const { fs, D } = await load(); await fs.updateDoc(fs.doc(D, 'players', id), { approved: !!v }); }
export async function rename(id, nick) { const { fs, D } = await load(); await fs.updateDoc(fs.doc(D, 'players', id), { nick: cleanNick(nick) }); }
export async function remove(id) { const { fs, D } = await load(); await fs.deleteDoc(fs.doc(D, 'players', id)); }
