# English Club site (نادي اللغة الإنجليزية) — notes for new sessions

Owner: أ. أحمد آل سالم (Ahmed Al-Salim), English teacher, Prince Faisal Secondary School, Al-Aqiq.
Live: https://mrgmdi22-prog.github.io/English/ · repo mrgmdi22-prog/English (GitHub Pages, branch main, root).

## Working with Ahmed
- Reply in Arabic, short and clear. Sign materials «أ. أحمد آل سالم». Tanween on the alif (كثيراً).
- Large fonts, light colours. Never «ملائكة الرحمة».
- English content always left-to-right: Previous ← on the left, Next → on the right; letters A→Z from the left.
- Commit as `-c user.name="Ahmed Al-Salim" -c user.email="mr.gmdi22@gmail.com"`; `git fetch -q origin && git rebase -q FETCH_HEAD` before push. Changes go live ~10 min after push.
- Test locally: `python3 -m http.server 8765` + Playwright (Google fonts/gstatic are blocked in the sandbox; stub `assets/gate.js` to skip registration).

## Structure
- `index.html` home: hero (4 paths + capsules box), honor board banner, level-check banner, shelves (Foundations, Vocabulary, Grammar, Reading & Speaking, enrichment links, Arabic Harbours), Kids Club last.
- `assets/gate.js?v=9` registration gate (loads `sfx.js?v=9`); `assets/club.js?v=5` remembers last page + syncs points; `assets/sfx.js` site sounds (kalimba right, low "uh-oh" wrong) + 🔊 switch + service worker registration + Android "open in Chrome".
- `assets/honor.js?v=20261030a` Firebase (project `english-club-score`): students anonymous, teacher Google (mr.gmdi22@gmail.com). Collections: players (nick, score, parts incl. `parts.wqx` Word Quest stats), private (real name/grade/section), levels (pre/post test), config (nicks list, levels.postOpen). Rules in `firestore.rules` (Ahmed pastes them in Firebase console → Firestore → Rules → Publish).
- `teacher.html` pending names, newest registrations, level-check results (+ open post test, CSV), Word Quest follow-up, honor list CSV.
- `level/` before/after placement test (32 Q: vocab 10, grammar 10, reading 6, listening 6; CEFR estimate).
- `journey/word-quest.html` 50 units (4000 Essential English Words 1 lists + theme units): hero dashboard, journey map, daily spaced review (`wq-srs`), daily goal/streak, record-and-compare pronunciation (no automatic speech scoring — removed as unreliable).
- `kids/` Kids Club (primary school): letters/numbers/colours/shapes, letter writing (tracing), 16 picture topics, phrases, classroom phrases, page-turning storybook (16 stories in 3 levels; L2/L3 have a "New Words" page and 4 questions with word options), read/spell/memory games, stickers; own manifest + lion-cub icon. Mistakes: wrong answer → try again (right answer glows after 2 tries), question re-asked 2 rounds later, and stored in `kd-fix` (Leitner: 10 min, 1 day, 3 days) → home "🔁 حان وقت المراجعة" box and due items mixed into the next game.
- `letters/`, `words/` (NGSL/AWL decks), `vocab/` (Mega Goal 1.1–3.1), `capsules/` (10 sentence capsules), `grammar/` (tenses map with A4 print sheet, syntax tree), `idioms/`, `stories/`, `everyday/`.
- PWA: `manifest.webmanifest`, `sw.js` (club-v3: pages network-first with 3.5 s fallback to cache), `install.html`, `offline.html`.
- `sounds.html` sound preview page.

## Open ideas
- Commercial app from «رحلة التعليم الذاتي» (separate session; 4000 EEW content is copyrighted — needs original content).
- Arabic sister site «مرافئ العربية» lives in repo mrgmdi22-prog/Arabic.
