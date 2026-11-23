#!/usr/bin/env python3
"""Builds app/ = the public Android-app edition of the English Club (Google Play, via a Trusted Web Activity).

The app edition is the same site with:
  * no registration, no honor board, no Firebase (each learner's progress stays on his own device),
  * no Kids Club (it will be its own app), no teacher page, no Core Quest,
  * no textbook / publisher names in the interface,
  * its own manifest, service worker and privacy page.

Run from the repo root after changing the site:   python3 tools/build_app.py
The students' site itself is never changed by this script.
"""
import os, re, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'app')

SKIP_DIRS = {'.git', '.github', 'app', 'tools', 'kids', 'mystery', '.claude', 'node_modules'}
SKIP_PATHS = {'teacher.html', 'honor.html', 'welcome.html', 'copy-rules.html', 'install.html', 'sounds.html', 'firestore.rules',
              'CLAUDE.md', 'words/core2000.html', 'elite/step', 'CNAME', 'README.md'}

# Every page links here instead of the pages the app does not have.
GONE = r'(honor\.html|teacher\.html|kids/|core2000\.html|install\.html|sounds\.html|copy-rules\.html|elite/step/)'


def skip(rel):
    parts = rel.split('/')
    if parts[0] in SKIP_DIRS:
        return True
    return any(rel == p or rel.startswith(p + '/') for p in SKIP_PATHS)


def copy_tree():
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    for dp, dns, fns in os.walk(ROOT):
        rel_dir = os.path.relpath(dp, ROOT).replace(os.sep, '/')
        rel_dir = '' if rel_dir == '.' else rel_dir
        dns[:] = [d for d in dns if not skip((rel_dir + '/' + d).lstrip('/'))]
        for fn in fns:
            rel = (rel_dir + '/' + fn).lstrip('/')
            if skip(rel):
                continue
            dst = os.path.join(OUT, rel)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(os.path.join(dp, fn), dst)


def rd(rel):
    with open(os.path.join(OUT, rel), encoding='utf-8') as f:
        return f.read()


def wr(rel, s):
    p = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(s)


def sub(rel, old, new, count=1, regex=False, need=True):
    s = rd(rel)
    if regex:
        s2, n = re.subn(old, new, s, count=0 if count == 0 else count, flags=re.S)
    else:
        n = s.count(old)
        s2 = s.replace(old, new) if count == 0 else s.replace(old, new, count)
    if need and n == 0:
        sys.exit(f'build_app: pattern not found in {rel}: {old[:80]!r}')
    wr(rel, s2)


# ---------------------------------------------------------------- shared assets
GATE = """// App edition: no registration gate. Only loads the site sounds (sfx.js), which also registers the service worker.
(function(){
  try { var me = document.currentScript && document.currentScript.src;
    if (me) { var s = document.createElement('script'); s.src = new URL('sfx.js?v=12', me).href; document.head.appendChild(s); } } catch (e) {}
})();
"""

FIREBASE = """// App edition: no database. Every learner's progress stays on his own device (localStorage).
export default {};
"""

APP_CSS = """/* App edition: things the public app does not have (honor boards, Kids Club, install card). */
.hline,#kids,.kidsban,#install,#installKids,.app-gone{display:none!important}
"""

APP_JS = """// App edition helper: hides links to pages the app does not have (honor board, Kids Club, teacher page, Core Quest),
// and the leaderboards that need the club database.
(function(){
  var GONE = /""" + GONE.replace('/', '\\/') + """/;
  function run(){
    var as = document.querySelectorAll('a[href]');
    for (var i = 0; i < as.length; i++) {
      var a = as[i];
      if (!GONE.test(a.getAttribute('href') || '')) continue;
      var box = a.closest('.lmodes') ? a : (a.closest('.card,.qt,.tile,.pcard') || a);
      box.classList.add('app-gone');
    }
    var b = document.getElementById('board');
    if (b) { var c = b.closest('.card') || b; c.classList.add('app-gone'); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  // pages that draw links later (journey maps, result screens)
  try { new MutationObserver(function(){ clearTimeout(run.t); run.t = setTimeout(run, 120); })
    .observe(document.documentElement, { childList: true, subtree: true }); } catch (e) {}
})();
"""

MANIFEST = """{
  "name": "English Club · نادي اللغة الإنجليزية",
  "short_name": "English Club",
  "description": "تعلّم الإنجليزية ذاتياً: الحروف والأصوات، والمفردات، والقواعد، والكبسولات، والقصص والمحادثة، ومسار النخبة. تقدّمك محفوظ على جهازك.",
  "id": "./",
  "start_url": "./index.html?source=twa",
  "scope": "./",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#34B77E",
  "theme_color": "#3F7FE8",
  "lang": "ar",
  "dir": "rtl",
  "categories": ["education"],
  "icons": [
    {"src": "assets/icons/icon-192.png?v=5", "sizes": "192x192", "type": "image/png", "purpose": "any"},
    {"src": "assets/icons/icon-512.png?v=5", "sizes": "512x512", "type": "image/png", "purpose": "any"},
    {"src": "assets/icons/maskable-512.png?v=5", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}
  ],
  "shortcuts": [
    {"name": "صندوق المفاجآت", "url": "./surprise/index.html", "icons": [{"src": "assets/icons/icon-192.png?v=5", "sizes": "192x192"}]},
    {"name": "هندسة مساري", "url": "./path/index.html", "icons": [{"src": "assets/icons/icon-192.png?v=5", "sizes": "192x192"}]},
    {"name": "الكبسولات", "url": "./capsules/index.html", "icons": [{"src": "assets/icons/icon-192.png?v=5", "sizes": "192x192"}]}
  ]
}
"""

PRIVACY = """<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>سياسة الخصوصية · English Club</title>
<meta name="theme-color" content="#F6F3FF">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&family=Lexend:wght@400;600&display=swap">
<style>
body{margin:0;background:linear-gradient(180deg,#F6F3FF,#FFFBF0) fixed;color:#231f3a;font:20px/1.8 Tajawal,system-ui,sans-serif}
.wrap{max-width:760px;margin:0 auto;padding:22px 18px 60px}
a{color:#5B47D6;font-weight:700}
h1{color:#5B47D6;font-size:2rem;line-height:1.3;margin:10px 0 4px}
h2{color:#5B47D6;font-size:1.3rem;margin:26px 0 6px}
.card{background:#fff;border:1px solid #e6e1f5;border-radius:20px;padding:18px 22px;margin-top:18px}
.en{direction:ltr;text-align:left;font-family:Lexend,system-ui,sans-serif;font-size:18px;line-height:1.75}
.en h2{font-size:1.2rem}
small{color:#625d7d}
</style>
</head>
<body>
<div class="wrap">
  <a href="index.html">→ الرئيسية</a>
  <h1>سياسة الخصوصية</h1>
  <small>تطبيق English Club · نادي اللغة الإنجليزية — آخر تحديث: 15 نوفمبر 2026</small>

  <div class="card">
    <h2>باختصار</h2>
    <p><b>التطبيق لا يجمع أي بيانات شخصية، ولا يرسلها إلى أي جهة.</b> لا يوجد تسجيل ولا حسابات ولا إعلانات ولا أدوات تتبّع.</p>
    <h2>أين يُحفظ تقدّمك؟</h2>
    <p>نقاطك ونجومك ونتائج تمارينك تُحفظ على جهازك فقط (في ذاكرة التطبيق المحلية). لا نراها ولا نستطيع الوصول إليها. إذا مسحت بيانات التطبيق أو غيّرت جهازك يبدأ تقدّمك من جديد.</p>
    <h2>الميكروفون</h2>
    <p>في تمارين النطق والمحادثة يمكنك تسجيل صوتك لتسمعه وتقارنه بالنطق الصحيح. يبقى التسجيل في ذاكرة الصفحة أثناء التمرين فقط، ولا يُحفظ ولا يُرفع إلى أي مكان. ويُطلب إذن الميكروفون فقط عند ضغطك زر التسجيل.</p>
    <h2>الروابط الخارجية والخطوط</h2>
    <p>تُحمَّل الخطوط من خدمة Google Fonts، وقد يفتح التطبيق مواقع خارجية عند ضغطك روابطها (مثل القواميس). لهذه المواقع سياسات خصوصية خاصة بها.</p>
    <h2>الأطفال</h2>
    <p>التطبيق موجّه للمتعلمين من سن 13 فما فوق، ولا يجمع بيانات من أي مستخدم.</p>
    <h2>التواصل</h2>
    <p>إعداد: <b>أ. أحمد بن سالم</b> — معلم اللغة الإنجليزية. للاستفسار: <a href="mailto:mr.gmdi22@gmail.com" dir="ltr">mr.gmdi22@gmail.com</a></p>
  </div>

  <div class="card en" dir="ltr">
    <h1 style="font-size:1.6rem">Privacy Policy</h1>
    <small>English Club app — last updated 15 November 2026</small>
    <h2>In short</h2>
    <p><b>The app does not collect, store or share any personal data.</b> There is no sign-up, no account, no ads and no tracking.</p>
    <h2>Your progress</h2>
    <p>Points, stars and exercise results are saved only on your device (the app's local storage). We cannot see or access them. Clearing the app's data or changing your device resets your progress.</p>
    <h2>Microphone</h2>
    <p>Pronunciation and conversation exercises let you record your voice to compare it with a model. Recordings stay in the page's memory during the exercise only; they are never saved or uploaded. Microphone permission is requested only when you tap a record button.</p>
    <h2>External links and fonts</h2>
    <p>Fonts are loaded from Google Fonts, and links you tap (for example dictionaries) open external websites, which have their own privacy policies.</p>
    <h2>Children</h2>
    <p>The app is intended for learners aged 13 and over and collects no data from any user.</p>
    <h2>Contact</h2>
    <p>Ahmed Ben Salim, English teacher — <a href="mailto:mr.gmdi22@gmail.com">mr.gmdi22@gmail.com</a></p>
  </div>
</div>
</body>
</html>
"""


def shared_assets():
    wr('assets/gate.js', GATE)
    wr('assets/firebase-config.js', FIREBASE)
    wr('assets/app.css', APP_CSS)
    wr('assets/app.js', APP_JS)
    wr('manifest.webmanifest', MANIFEST)
    wr('privacy.html', PRIVACY)
    # club.js: never sync to the honor board, never show a recovery code (the app shares storage with the site in Chrome)
    sub('assets/club.js', "if(me && localStorage.getItem('club-player') &&", "if(false && me &&")
    # its own service-worker cache, so the app and the site never mix caches
    sub('sw.js', "const CACHE = 'club-v6';", "const CACHE = 'club-app-v3';")


def inject_every_page():
    for dp, _, fns in os.walk(OUT):
        for fn in fns:
            if not fn.endswith('.html'):
                continue
            rel = os.path.relpath(os.path.join(dp, fn), OUT).replace(os.sep, '/')
            up = '../' * rel.count('/')
            s = rd(rel)
            tag = f'<link rel="stylesheet" href="{up}assets/app.css?v=1"><script src="{up}assets/app.js?v=1"></script>\n'
            if 'assets/app.js' not in s and '</head>' in s:
                s = s.replace('</head>', tag + '</head>', 1)
            # textbook / publisher names out of the interface
            s = s.replace('megagoal mega goal', 'منهج').replace(' 4000 مراجعة', ' مراجعة')
            s = s.replace('واصعد في لوحة الشرف', 'واجمع النجوم').replace(' في لوحة الشرف', '')
            wr(rel, s)


def page_edits():
    # ---- home
    # app: no honor board, so its tab becomes the learner's guide (مساري already has its own tab)
    for pg in ('index.html', 'sections.html'):
        sub(pg, '<a href="honor.html"><span data-bicon="trophy" data-bc="white" data-bs="26"></span>نقاطي</a>',
            '<a href="guide.html"><span data-bicon="guide" data-bc="white" data-bs="26"></span>الدليل</a>')
    sub('guide.html', '🏆 نقاطي · 📐 مساري (أمر عمل اليوم)', '🧭 الدليل · 📐 مساري (أمر عمل اليوم)', need=False)
    sub('sections.html', '<a href="vocab/mega-goal-1.html">🏟️ Mega Goal 1.1</a><a href="vocab/mega-goal-2.html">🏆 Mega Goal 2.1</a><a href="vocab/mega-goal-3.html" style="grid-column:1/-1">🥇 Mega Goal 3.1</a>',
        '<a href="vocab/mega-goal-1.html">🏟️ المستوى 1</a><a href="vocab/mega-goal-2.html">🏆 المستوى 2</a><a href="vocab/mega-goal-3.html" style="grid-column:1/-1">🥇 المستوى 3</a>')
    sub('sections.html', r'Mega Goal', 'ميدان المفردات', count=0, need=False)
    sub('index.html', '<footer>إعداد: <b>أ. أحمد بن سالم</b> — معلم اللغة الإنجليزية</footer>',
        '<footer>إعداد: <b>أ. أحمد بن سالم</b> — معلم اللغة الإنجليزية<br><small>تقدّمك محفوظ على جهازك فقط · <a href="privacy.html">سياسة الخصوصية</a></small></footer>')
    sub('index.html', 'نقطة هذا الأسبوع', 'نقطة', need=False)
    # ---- vocab pages
    for n in (1, 2, 3):
        sub(f'vocab/mega-goal-{n}.html', f"'Mega Goal {n}.1 · قاموس الفصل الأول'", f"'ميدان المفردات {n} · القاموس'")
        sub(f'vocab/mega-goal-{n}.html', 'Mega Goal', 'ميدان المفردات', count=0, need=False)
    # ---- Word Quest + its dictionary: no book name
    sub('journey/word-quest.html', r'Target words follow the word lists of <i>4000 Essential English Words, Book 1</i> \(Units 1–30\)\.',
        'Units 1–30 cover high-frequency everyday words.', regex=True)
    sub('journey/dictionary.html', r'الكلمات <bdi dir="ltr">1–600</bdi> من قوائم كتاب <span class="en">4000 Essential English Words, Book 1</span>،',
        'الكلمات <bdi dir="ltr">1–600</bdi> من أكثر الكلمات شيوعاً،', regex=True)
    # ---- guide: no registration / honor board / install / Kids Club
    g = 'guide.html'
    sub(g, r'<li><span class="n">1</span><div><b>سجّل واختر اسماً مستعاراً</b>.*?</li>',
        '<li><span class="n">1</span><div><b>تقدّمك محفوظ على جهازك</b><p>لا تحتاج إلى تسجيل ولا حساب: نقاطك ونجومك ونتائجك تُحفظ على جهازك تلقائياً. إذا مسحت بيانات التطبيق يبدأ تقدّمك من جديد.</p></div></li>', regex=True)
    sub(g, r'\s*<li><span class="n">5</span><div><b>أخيراً: ثبّت أيقونة النادي.*?</li>', '', regex=True)
    sub(g, 'ابدأ من هنا: 5 خطوات', 'ابدأ من هنا: 4 خطوات')
    sub(g, r'<details class="part" style="--c:#c99300;--t:#fff6d8">.*?</details>\s*', '', regex=True)
    sub(g, 'النقاط ولوحة الشرف', 'النقاط', count=0)
    sub(g, r'\s*<div class="pt"><div class="big">🌟</div>.*?</div>', '', regex=True)
    sub(g, 'Core Quest · NGSL · AWL · Mega Goal', 'NGSL · AWL · ميدان المفردات')
    sub(g, ' (Mega Goal)', '')
    sub(g, r'Mega Goal (\d)\.1', r'ميدان المفردات \1', count=0, regex=True)
    sub(g, 'Mega Goal', 'ميدان المفردات', count=0, need=False)
    # ---- worlds passport + my road map: no Core Quest station
    sub('worlds/index.html', "['cq','🧭','Core Quest','../words/core2000.html'], ", '')
    sub('assets/path-core.js', r"\n\s*core: \{n:'Core Quest'[^\n]*\},?", '', regex=True)
    sub('assets/path-core.js', "voc:['core',", "voc:[")


def check():
    bad = []
    for dp, _, fns in os.walk(OUT):
        for fn in fns:
            if fn.endswith(('.html', '.js')):
                rel = os.path.relpath(os.path.join(dp, fn), OUT).replace(os.sep, '/')
                s = rd(rel)
                for w in ('Mega Goal', '4000 Essential', 'EnglishClass101'):
                    if w in s and rel != 'surprise/bank.js':
                        bad.append(f'{rel}: {w}')
    if bad:
        print('build_app: still mentions a book name:\n  ' + '\n  '.join(bad))


if __name__ == '__main__':
    copy_tree()
    shared_assets()
    inject_every_page()
    page_edits()
    check()
    n = sum(len(f) for _, _, f in os.walk(OUT))
    print(f'app/ built: {n} files')
