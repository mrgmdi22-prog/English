/* Cartoon scenes for the Idioms Corner — each one draws the idiom's LITERAL picture (that is the joke).
   All scenes are original flat drawings on a 240×170 canvas. ART[id]() returns an SVG string. */
(function(){
const O = '#2B2D42', SK = '#F6C9A0', W = 3;
const svg = (bg, body) => `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" role="img" direction="ltr" style="direction:ltr"><rect width="240" height="170" rx="18" fill="${bg}"/>${body}</svg>`;
const g = (s, t) => `<g ${t ? `transform="${t}"` : ''}>${s}</g>`;

function face(x, y, mood, skin, r) {
  r = r || 16; skin = skin || SK;
  let m = '';
  const ey = y - 2;
  let eyes = `<circle cx="${x-6}" cy="${ey}" r="2.3" fill="${O}"/><circle cx="${x+6}" cy="${ey}" r="2.3" fill="${O}"/>`;
  if (mood === 'happy') m = `<path d="M${x-6} ${y+5} Q${x} ${y+11} ${x+6} ${y+5}" fill="none" stroke="${O}" stroke-width="2.4" stroke-linecap="round"/>`;
  else if (mood === 'big') m = `<path d="M${x-7} ${y+4} Q${x} ${y+15} ${x+7} ${y+4} Z" fill="#fff" stroke="${O}" stroke-width="2.2" stroke-linejoin="round"/>`;
  else if (mood === 'sad') m = `<path d="M${x-6} ${y+9} Q${x} ${y+3} ${x+6} ${y+9}" fill="none" stroke="${O}" stroke-width="2.4" stroke-linecap="round"/>`;
  else if (mood === 'worry') m = `<path d="M${x-6} ${y+7} q3 -3 6 0 t6 0" fill="none" stroke="${O}" stroke-width="2.2" stroke-linecap="round"/>`;
  else if (mood === 'wow') m = `<ellipse cx="${x}" cy="${y+7}" rx="3.2" ry="4" fill="${O}"/>`;
  else if (mood === 'full') m = `<circle cx="${x-9}" cy="${y+5}" r="5" fill="#F4A3A3"/><circle cx="${x+9}" cy="${y+5}" r="5" fill="#F4A3A3"/><path d="M${x-4} ${y+7} h8" stroke="${O}" stroke-width="2.4" stroke-linecap="round"/>`;
  else if (mood === 'sick') { m = `<path d="M${x-5} ${y+8} h10" stroke="${O}" stroke-width="2.2" stroke-linecap="round"/>`; eyes = `<path d="M${x-9} ${ey} h6 M${x+3} ${ey} h6" stroke="${O}" stroke-width="2.3" stroke-linecap="round"/>`; }
  else m = `<path d="M${x-5} ${y+6} Q${x} ${y+9} ${x+5} ${y+6}" fill="none" stroke="${O}" stroke-width="2.2" stroke-linecap="round"/>`;
  const cheeks = mood === 'full' ? '' : `<circle cx="${x-10}" cy="${y+4}" r="2.6" fill="#F4A3A3" opacity=".8"/><circle cx="${x+10}" cy="${y+4}" r="2.6" fill="#F4A3A3" opacity=".8"/>`;
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${skin}" stroke="${O}" stroke-width="${W}"/>` +
    `<path d="M${x-r+1} ${y-4} Q${x-r+2} ${y-r-3} ${x} ${y-r} Q${x+r-2} ${y-r-3} ${x+r-1} ${y-4} Q${x+4} ${y-12} ${x-r+1} ${y-4} Z" fill="${O}"/>` + eyes + cheeks + m;
}
/* A standing kid: (x,y) is the head centre. arms: down | up | out | thumb | hold */
function kid(x, y, o) {
  o = o || {};
  const sh = o.shirt || '#5B8DEF', sk = o.skin || SK, legs = o.legs || '#3B4A6B';
  const a = o.arms || 'down';
  const arm = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${sk}" stroke-width="7" stroke-linecap="round"/><path d="M${x1} ${y1} L${x2} ${y2}" stroke="${O}" stroke-width="${W}" stroke-linecap="round" fill="none" opacity="0"/>`;
  const hand = (hx, hy) => `<circle cx="${hx}" cy="${hy}" r="4.5" fill="${sk}" stroke="${O}" stroke-width="2.4"/>`;
  let arms = '';
  const L = [x - 13, y + 22], R = [x + 13, y + 22];
  const pose = { down: [[-20, 40], [20, 40]], up: [[-22, 2], [22, 2]], out: [[-30, 26], [30, 26]], thumb: [[-20, 40], [26, 14]], hold: [[-16, 32], [16, 32]] }[a];
  arms = `<path d="M${L[0]} ${L[1]} L${x + pose[0][0]} ${y + pose[0][1]} M${R[0]} ${R[1]} L${x + pose[1][0]} ${y + pose[1][1]}" stroke="${O}" stroke-width="9" stroke-linecap="round"/>` +
         `<path d="M${L[0]} ${L[1]} L${x + pose[0][0]} ${y + pose[0][1]} M${R[0]} ${R[1]} L${x + pose[1][0]} ${y + pose[1][1]}" stroke="${sh}" stroke-width="4.5" stroke-linecap="round"/>` +
         hand(x + pose[0][0], y + pose[0][1]) + hand(x + pose[1][0], y + pose[1][1]);
  if (a === 'thumb') arms += `<path d="M${x+26} ${y+9} v-6" stroke="${O}" stroke-width="5" stroke-linecap="round"/><path d="M${x+26} ${y+9} v-6" stroke="${sk}" stroke-width="2.4" stroke-linecap="round"/>`;
  const legsS = o.noLegs ? '' : `<path d="M${x-6} ${y+44} L${x-7} ${y+60} M${x+6} ${y+44} L${x+7} ${y+60}" stroke="${O}" stroke-width="9" stroke-linecap="round"/><path d="M${x-6} ${y+44} L${x-7} ${y+60} M${x+6} ${y+44} L${x+7} ${y+60}" stroke="${legs}" stroke-width="4.5" stroke-linecap="round"/>` +
    `<ellipse cx="${x-9}" cy="${y+62}" rx="7" ry="4" fill="${o.shoes || O}"/><ellipse cx="${x+9}" cy="${y+62}" rx="7" ry="4" fill="${o.shoes || O}"/>`;
  return legsS + arms + `<rect x="${x-14}" y="${y+14}" width="28" height="32" rx="10" fill="${sh}" stroke="${O}" stroke-width="${W}"/>` + face(x, y, o.mood || 'happy', sk);
}
const cloud = (x, y, s, c) => { s = s || 1; c = c || '#fff'; return `<path transform="translate(${x} ${y}) scale(${s})" d="M-34 10 Q-46 10 -44 -2 Q-42 -14 -28 -12 Q-24 -28 -6 -26 Q8 -36 20 -22 Q36 -24 38 -8 Q50 -6 46 6 Q44 12 34 12 Z" fill="${c}" stroke="${O}" stroke-width="${W / s}" stroke-linejoin="round"/>`; };
const ground = (c, y) => `<path d="M0 ${y || 146} H240 V152 Q240 170 222 170 H18 Q0 170 0 152 Z" fill="${c || '#BFE3A6'}"/>`;
const bubble = (x, y, w, txt, fs, tail) => `<g><rect x="${x}" y="${y}" width="${w}" height="30" rx="14" fill="#fff" stroke="${O}" stroke-width="2.5"/><path d="M${x + (tail || 18)} ${y + 29} l-4 10 l12 -10" fill="#fff" stroke="${O}" stroke-width="2.5" stroke-linejoin="round"/><path d="M${x + (tail || 18) - 3} ${y + 28} h14" stroke="#fff" stroke-width="3"/><text x="${x + w / 2}" y="${y + 20}" text-anchor="middle" font-family="Lexend,Baloo 2,system-ui,sans-serif" font-weight="700" font-size="${fs || 14}" fill="${O}">${txt}</text></g>`;
const star = (x, y, r, c) => { let d = ''; for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * .45 : r, a = -Math.PI / 2 + i * Math.PI / 5; d += (i ? 'L' : 'M') + (x + rr * Math.cos(a)).toFixed(1) + ' ' + (y + rr * Math.sin(a)).toFixed(1); } return `<path d="${d}Z" fill="${c || '#FFD23F'}" stroke="${O}" stroke-width="2" stroke-linejoin="round"/>`; };
const catHead = (x, y, c, r) => { r = r || 10; return `<path d="M${x-r} ${y-2} L${x-r+1} ${y-r-6} L${x-3} ${y-r+1} Z M${x+r} ${y-2} L${x+r-1} ${y-r-6} L${x+3} ${y-r+1} Z" fill="${c}" stroke="${O}" stroke-width="2.2" stroke-linejoin="round"/><circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${O}" stroke-width="2.4"/><circle cx="${x-4}" cy="${y-1}" r="1.6" fill="${O}"/><circle cx="${x+4}" cy="${y-1}" r="1.6" fill="${O}"/><path d="M${x-2} ${y+4} q2 2 4 0" stroke="${O}" stroke-width="1.6" fill="none"/>`; };
const dogHead = (x, y, c, r) => { r = r || 10; return `<ellipse cx="${x-r+1}" cy="${y+1}" rx="4" ry="8" fill="#8B5E3C" stroke="${O}" stroke-width="2"/><ellipse cx="${x+r-1}" cy="${y+1}" rx="4" ry="8" fill="#8B5E3C" stroke="${O}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${O}" stroke-width="2.4"/><circle cx="${x-4}" cy="${y-2}" r="1.6" fill="${O}"/><circle cx="${x+4}" cy="${y-2}" r="1.6" fill="${O}"/><ellipse cx="${x}" cy="${y+4}" rx="3" ry="2.2" fill="${O}"/>`; };
const book = (x, y, w, c) => `<rect x="${x}" y="${y}" width="${w}" height="14" rx="3" fill="${c}" stroke="${O}" stroke-width="2.5"/><path d="M${x + 5} ${y + 4} h${w - 14} M${x + 5} ${y + 9} h${w - 22}" stroke="#fff" stroke-width="2" opacity=".7"/>`;
const wing = (x, y, s, flip) => `<path transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})" d="M0 0 Q-10 -22 -34 -20 Q-26 -12 -30 -6 Q-20 -6 -22 0 Q-12 2 0 0 Z" fill="#fff" stroke="${O}" stroke-width="${2.4 / s}" stroke-linejoin="round"/>`;
const heart = (x, y, s, c) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 6 C-10 -2 -8 -10 -3 -10 C-1 -10 0 -8 0 -6 C0 -8 1 -10 3 -10 C8 -10 10 -2 0 6 Z" fill="${c || '#FF6B8B'}" stroke="${O}" stroke-width="${1.6 / s}"/>`;
const drop = (x, y, c) => `<path d="M${x} ${y} q-5 8 0 11 q5 -3 0 -11 Z" fill="${c || '#7FC8F8'}" stroke="${O}" stroke-width="1.6"/>`;

const ART = {
rain: () => svg('#DDE7F3',
  cloud(80, 34, 1.2, '#B9C3D6') + cloud(170, 30, 1.05, '#C9D2E3') +
  catHead(150, 62, '#F6A54C', 13) + dogHead(112, 80, '#F2E6D0', 13) + catHead(200, 92, '#BDBDBD', 12) + dogHead(176, 128, '#E2C291', 12) + catHead(140, 112, '#FFFFFF', 11) + dogHead(214, 54, '#F2E6D0', 11) +
  drop(30, 70) + drop(92, 96) + drop(160, 56) + drop(196, 120) +
  g(`<path d="M74 150 V108" stroke="${O}" stroke-width="3"/><path d="M40 112 Q74 70 108 112 Q99 104 91 112 Q83 104 74 112 Q65 104 57 112 Q49 104 40 112 Z" fill="#FF6B6B" stroke="${O}" stroke-width="${W}" stroke-linejoin="round"/>`) +
  kid(74, 118, { shirt: '#FFD23F', mood: 'wow', arms: 'hold', noLegs: true }).replace(/<ellipse[^>]*>/g, '')),
cake: () => svg('#FFF1DC',
  ground('#F7D9B5') +
  `<path d="M120 116 L196 92 L196 132 L120 150 Z" fill="#FFE3EC" stroke="${O}" stroke-width="${W}" stroke-linejoin="round"/><path d="M120 116 L120 150 L52 132 L52 96 Z" fill="#F7B6C8" stroke="${O}" stroke-width="${W}" stroke-linejoin="round"/>` +
  `<path d="M52 96 L120 116 L196 92 L128 76 Z" fill="#FFF7FA" stroke="${O}" stroke-width="${W}" stroke-linejoin="round"/><path d="M52 114 L120 133 L196 112" stroke="#C2567A" stroke-width="5" fill="none"/>` +
  `<path d="M124 76 q0 -14 8 -18" stroke="${O}" stroke-width="2.5" fill="none"/><circle cx="124" cy="78" r="9" fill="#E63950" stroke="${O}" stroke-width="2.5"/>` +
  `<path d="M70 98 q4 8 0 14 M96 104 q4 8 0 12 M160 96 q-4 8 0 14" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/>` +
  `<text x="120" y="38" text-anchor="middle" font-family="Lexend,system-ui" font-weight="800" font-size="22" fill="${O}">So easy!</text>` + star(42, 40, 10) + star(198, 34, 8)),
ice: () => svg('#E3F4FB',
  ground('#CFE8F2') +
  `<path d="M90 70 L150 70 L158 140 L82 140 Z" fill="#BDE8F8" stroke="${O}" stroke-width="${W}" stroke-linejoin="round"/><path d="M98 80 L112 96 M140 84 L130 102" stroke="#fff" stroke-width="4" stroke-linecap="round"/>` +
  `<path d="M120 70 L114 92 L124 104 L116 122 L122 140" fill="none" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>` +
  kid(48, 76, { shirt: '#FF8A5B', mood: 'happy', arms: 'out' }) + kid(192, 76, { shirt: '#7AC74F', mood: 'happy', arms: 'out' }) +
  `<path d="M78 102 L96 86" stroke="#8B5E3C" stroke-width="5" stroke-linecap="round"/><rect x="90" y="78" width="16" height="10" rx="2" fill="#9AA5B1" stroke="${O}" stroke-width="2.4" transform="rotate(-40 98 83)"/>` +
  bubble(18, 18, 58, 'Hi!', 15) + bubble(162, 18, 64, 'Hello!', 14, 40)),
books: () => svg('#EEF0FF',
  ground('#D9DDF7') +
  book(118, 132, 86, '#5B8DEF') + book(124, 118, 76, '#FF6B6B') + book(114, 104, 84, '#FFD23F') + book(126, 90, 70, '#7AC74F') +
  `<path d="M150 82 l6 -10 M168 86 l12 -8 M134 84 l-8 -10" stroke="${O}" stroke-width="3" stroke-linecap="round"/>` +
  kid(70, 70, { shirt: '#9B6BFF', mood: 'big', arms: 'out' }) +
  `<circle cx="104" cy="96" r="11" fill="#E63950" stroke="${O}" stroke-width="${W}"/><circle cx="40" cy="96" r="11" fill="#E63950" stroke="${O}" stroke-width="${W}"/>` +
  star(120, 80, 9)),
weather: () => svg('#EAF2F5',
  cloud(120, 30, .95, '#9AA8BA') + drop(100, 52) + drop(120, 58) + drop(140, 52) +
  `<rect x="54" y="96" width="132" height="54" rx="20" fill="#7FB3E8" stroke="${O}" stroke-width="${W}"/><path d="M70 110 h100 M70 124 h100" stroke="#fff" stroke-width="3" opacity=".6"/>` +
  face(120, 92, 'sick', '#DDEFD9', 18) +
  `<path d="M127 99 L150 92" stroke="${O}" stroke-width="5" stroke-linecap="round"/><path d="M127 99 L150 92" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="151" cy="92" r="3.5" fill="#E63950" stroke="${O}" stroke-width="1.6"/>` +
  `<path d="M104 78 q-6 6 0 10" stroke="#7FC8F8" stroke-width="3" fill="none"/>`),
beans: () => svg('#FFF6E0',
  ground('#F3DDB0') +
  `<g transform="rotate(-35 80 96)"><rect x="56" y="70" width="48" height="56" rx="10" fill="#E6F4FF" stroke="${O}" stroke-width="${W}" opacity=".95"/><rect x="58" y="62" width="44" height="12" rx="4" fill="#E63950" stroke="${O}" stroke-width="${W}"/></g>` +
  [[104,118],[118,128],[132,122],[146,134],[124,140],[160,128],[110,138],[140,144]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="4" fill="#B5542C" stroke="${O}" stroke-width="1.8" transform="rotate(25 ${x} ${y})"/>`).join('') +
  kid(48, 60, { shirt: '#5B8DEF', mood: 'wow', arms: 'hold' }) +
  kid(196, 64, { shirt: '#FF8A5B', mood: 'big', arms: 'out' }) +
  `<text x="176" y="28" font-family="Lexend,system-ui" font-weight="800" font-size="13" fill="${O}">SECRET!</text>`),
moon: () => svg('#1F2E5A',
  `<circle cx="160" cy="62" r="40" fill="#5AA9FF" stroke="#fff" stroke-width="3"/><circle cx="146" cy="52" r="7" fill="#3E8EE8"/><circle cx="172" cy="78" r="9" fill="#3E8EE8"/><circle cx="176" cy="46" r="4" fill="#3E8EE8"/>` +
  star(40, 30, 6, '#FFF3B0') + star(90, 20, 4, '#FFF3B0') + star(214, 128, 5, '#FFF3B0') + star(28, 92, 4, '#FFF3B0') + star(110, 60, 3.5, '#FFF3B0') +
  `<path d="M0 140 Q60 124 120 138 T240 132 V152 Q240 170 222 170 H18 Q0 170 0 152 Z" fill="#2E4479"/>` +
  `<g transform="rotate(-24 78 118)"><rect x="52" y="110" width="56" height="14" rx="5" fill="#C9D2E3" stroke="#fff" stroke-width="2.5"/><rect x="104" y="106" width="10" height="22" rx="3" fill="#9AA8BA" stroke="#fff" stroke-width="2.5"/></g><path d="M74 124 L64 150 M80 124 L92 150" stroke="#C9D2E3" stroke-width="3"/>` +
  face(48, 124, 'wow', SK, 14)),
pricey: () => svg('#F1F7EC',
  ground('#D7EAC8') +
  `<rect x="40" y="58" width="58" height="92" rx="10" fill="#2B2D42"/><rect x="45" y="65" width="48" height="74" rx="5" fill="#7FD1FF"/><circle cx="69" cy="144" r="3" fill="#fff"/>` +
  `<path d="M98 76 L118 70" stroke="${O}" stroke-width="2.4"/><path d="M118 50 L212 50 L224 80 L212 110 L118 110 Z" fill="#FFD23F" stroke="${O}" stroke-width="${W}" stroke-linejoin="round"/><circle cx="208" cy="80" r="5" fill="#fff" stroke="${O}" stroke-width="2.2"/>` +
  `<path d="M128 90 Q134 66 150 66 Q158 66 158 74" stroke="${SK}" stroke-width="11" stroke-linecap="round" fill="none"/><path d="M128 90 Q134 66 150 66 Q158 66 158 74" stroke="${O}" stroke-width="2.2" stroke-linecap="round" fill="none" opacity=".35"/>` +
  `<text x="166" y="88" font-family="Lexend,system-ui" font-weight="800" font-size="20" fill="${O}">+</text>` +
  `<path d="M186 62 L186 92 L198 96" stroke="${SK}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M186 62 L186 92 L198 96" stroke="${O}" stroke-width="2.2" stroke-linecap="round" fill="none" opacity=".35"/>` +
  `<text x="170" y="38" text-anchor="middle" font-family="Lexend,system-ui" font-weight="800" font-size="15" fill="${O}">PRICE</text>`),
court: () => svg('#E6F5EC',
  `<rect x="14" y="54" width="212" height="96" rx="8" fill="#5FB57A" stroke="${O}" stroke-width="${W}"/><path d="M120 54 V150 M14 102 H226 M60 54 V150 M180 54 V150" stroke="#fff" stroke-width="3"/>` +
  `<rect x="116" y="42" width="8" height="112" fill="#fff" stroke="${O}" stroke-width="2"/>` +
  `<circle cx="172" cy="118" r="9" fill="#E8F65A" stroke="${O}" stroke-width="2.4"/><path d="M165 112 q7 6 14 12" stroke="#fff" stroke-width="2" fill="none"/>` +
  `<path d="M150 108 q-8 -10 2 -16" stroke="${O}" stroke-width="2.5" fill="none" stroke-dasharray="4 4"/>` +
  kid(196, 46, { shirt: '#FF8A5B', mood: 'wow', arms: 'out' }) + kid(54, 46, { shirt: '#5B8DEF', mood: 'happy', arms: 'thumb' }) +
  bubble(18, 6, 92, 'Your turn!', 13)),
bite: () => svg('#FFF4E6',
  ground('#F6DDBB') +
  `<path d="M96 92 Q100 52 160 52 Q220 52 222 92 Z" fill="#E8A15C" stroke="${O}" stroke-width="${W}"/><path d="M98 92 h124" stroke="#7AC74F" stroke-width="10" stroke-linecap="round"/><path d="M98 102 h124" stroke="#E63950" stroke-width="9"/><path d="M98 112 h124" stroke="#FFD23F" stroke-width="8"/><path d="M96 112 Q100 132 160 132 Q220 132 222 112 Z" fill="#E8A15C" stroke="${O}" stroke-width="${W}"/>` +
  `<circle cx="120" cy="66" r="2" fill="#fff"/><circle cx="150" cy="60" r="2" fill="#fff"/><circle cx="180" cy="64" r="2" fill="#fff"/>` +
  `<path d="M96 76 q-8 6 0 12 q-8 6 0 12 q-8 6 0 12" fill="#FFF4E6" stroke="none"/>` +
  kid(56, 74, { shirt: '#5B8DEF', mood: 'full', arms: 'out' }) +
  `<path d="M28 36 q6 -6 12 0 M70 30 q6 -6 12 0" stroke="${O}" stroke-width="2.4" fill="none"/>`),
nail: () => svg('#F3EEFF',
  `<rect x="20" y="118" width="200" height="34" rx="6" fill="#C98F5C" stroke="${O}" stroke-width="${W}"/><path d="M40 130 h40 M110 138 h60 M180 128 h24" stroke="#9C6A3C" stroke-width="3"/>` +
  `<rect x="114" y="90" width="12" height="30" fill="#B8C0CC" stroke="${O}" stroke-width="2.4"/><rect x="104" y="84" width="32" height="8" rx="2" fill="#B8C0CC" stroke="${O}" stroke-width="2.4"/>` +
  `<g transform="rotate(-28 150 54)"><rect x="140" y="30" width="16" height="74" rx="5" fill="#8B5E3C" stroke="${O}" stroke-width="${W}"/><rect x="118" y="18" width="62" height="22" rx="5" fill="#9AA5B1" stroke="${O}" stroke-width="${W}"/></g>` +
  star(120, 74, 16) + `<path d="M84 70 l-12 -6 M86 54 l-12 -12 M156 74 l14 -2" stroke="${O}" stroke-width="3" stroke-linecap="round"/>` +
  `<text x="26" y="104" font-family="Lexend,system-ui" font-weight="800" font-size="18" fill="#7A4DE0">Exactly!</text>`),
blue: () => svg('#E7F0FF',
  ground('#CFDDF5') + cloud(150, 30, .7, '#9AA8BA') + drop(140, 46) + drop(156, 50) +
  kid(150, 76, { shirt: '#3E6BD6', skin: '#8DB8F5', mood: 'sad', arms: 'down' }) + drop(140, 78, '#BFE2FF') +
  `<text x="22" y="88" font-family="Lexend,system-ui" font-weight="800" font-size="30" fill="#3E6BD6">sigh…</text>`),
coldfeet: () => svg('#E2F2FB',
  `<rect x="0" y="118" width="240" height="52" rx="0" fill="#5AB8E8"/><path d="M0 118 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0" fill="none" stroke="#fff" stroke-width="3"/><path d="M0 152 V170 H240 V152" fill="#5AB8E8"/>` +
  `<rect x="0" y="104" width="130" height="10" rx="3" fill="#F2F2F2" stroke="${O}" stroke-width="${W}"/><rect x="20" y="114" width="12" height="40" fill="#C9D2E3" stroke="${O}" stroke-width="2.5"/>` +
  kid(112, 38, { shirt: '#FF6B6B', mood: 'worry', arms: 'hold', legs: '#F6C9A0', shoes: '#8DD3F7' }) +
  `<rect x="96" y="96" width="14" height="12" rx="3" fill="#D8F3FF" stroke="${O}" stroke-width="2"/><rect x="114" y="96" width="14" height="12" rx="3" fill="#D8F3FF" stroke="${O}" stroke-width="2"/>` +
  `<path d="M88 26 l-8 -4 M136 26 l8 -4 M86 44 l-8 2 M138 44 l8 2" stroke="${O}" stroke-width="2.4" stroke-linecap="round"/>` +
  `<text x="150" y="30" font-family="Lexend,system-ui" font-weight="800" font-size="16" fill="${O}">brrr…</text>`),
gift: () => svg('#FFF0F5',
  ground('#F9D4E1') +
  `<rect x="72" y="70" width="96" height="74" rx="8" fill="#9B6BFF" stroke="${O}" stroke-width="${W}"/><rect x="112" y="70" width="16" height="74" fill="#FFD23F" stroke="${O}" stroke-width="2.5"/>` +
  `<rect x="64" y="56" width="112" height="20" rx="6" fill="#B794FF" stroke="${O}" stroke-width="${W}"/><rect x="112" y="56" width="16" height="20" fill="#FFD23F" stroke="${O}" stroke-width="2.5"/>` +
  `<path d="M120 56 Q96 30 92 46 Q90 58 120 56 Q144 30 148 46 Q150 58 120 56 Z" fill="#FFD23F" stroke="${O}" stroke-width="2.5"/>` +
  `<circle cx="100" cy="96" r="11" fill="#fff" stroke="${O}" stroke-width="${W}"/><circle cx="140" cy="96" r="11" fill="#fff" stroke="${O}" stroke-width="${W}"/><path d="M111 96 h18" stroke="${O}" stroke-width="${W}"/><circle cx="100" cy="97" r="3" fill="${O}"/><circle cx="140" cy="97" r="3" fill="${O}"/>` +
  `<path d="M98 118 Q110 108 120 116 Q130 108 142 118 Q130 122 120 118 Q110 122 98 118 Z" fill="${O}"/>` +
  `<text x="196" y="40" text-anchor="middle" font-family="Lexend,system-ui" font-weight="800" font-size="26" fill="#E2457A">?!</text>`),
actions: () => svg('#EFF8F1',
  ground('#CFE9D6') +
  kid(52, 64, { shirt: '#FF8A5B', mood: 'big', arms: 'hold' }) +
  `<path d="M66 92 L94 80 L94 106 Z" fill="#FFD23F" stroke="${O}" stroke-width="2.5" stroke-linejoin="round"/>` +
  `<text x="104" y="76" font-family="Lexend,system-ui" font-weight="800" font-size="13" fill="#9AA5B1">bla bla</text>` +
  kid(176, 64, { shirt: '#7AC74F', mood: 'happy', arms: 'up' }) +
  `<rect x="146" y="38" width="60" height="32" rx="4" fill="#E2B57C" stroke="${O}" stroke-width="${W}" transform="translate(0 -6)"/><path d="M146 48 h60" stroke="${O}" stroke-width="2"/>` +
  star(214, 20, 9) + `<text x="176" y="24" text-anchor="middle" font-family="Lexend,system-ui" font-weight="800" font-size="14" fill="#2F8F4E">DONE!</text>`),
tree: () => svg('#EDF7E6',
  ground('#CBE6B6') +
  `<rect x="40" y="76" width="18" height="72" fill="#8B5E3C" stroke="${O}" stroke-width="${W}"/><circle cx="49" cy="62" r="34" fill="#7AC74F" stroke="${O}" stroke-width="${W}"/>` +
  `<rect x="186" y="76" width="18" height="72" fill="#8B5E3C" stroke="${O}" stroke-width="${W}"/><circle cx="195" cy="62" r="34" fill="#5FB57A" stroke="${O}" stroke-width="${W}"/>` +
  catHead(196, 42, '#F6A54C', 10) +
  `<ellipse cx="108" cy="132" rx="26" ry="14" fill="#F2E6D0" stroke="${O}" stroke-width="${W}"/><path d="M130 128 q12 -8 8 -18" stroke="${O}" stroke-width="3" fill="none"/>` + dogHead(86, 112, '#F2E6D0', 13) +
  `<path d="M72 104 l-8 -6 M70 112 l-10 0 M72 120 l-8 6" stroke="${O}" stroke-width="2.4" stroke-linecap="round"/>` +
  `<text x="40" y="20" font-family="Lexend,system-ui" font-weight="800" font-size="16" fill="${O}">WOOF!</text><text x="160" y="16" font-family="Lexend,system-ui" font-weight="800" font-size="12" fill="${O}">I'm here…</text>`),
couch: () => svg('#FDF3E7',
  `<rect x="150" y="34" width="70" height="50" rx="6" fill="#2B2D42"/><rect x="155" y="39" width="60" height="40" rx="3" fill="#7FD1FF"/><path d="M175 84 l-6 10 M195 84 l6 10" stroke="${O}" stroke-width="3"/>` +
  `<rect x="20" y="86" width="136" height="44" rx="16" fill="#E86F5C" stroke="${O}" stroke-width="${W}"/><rect x="14" y="76" width="22" height="58" rx="10" fill="#D4584A" stroke="${O}" stroke-width="${W}"/><rect x="140" y="76" width="22" height="58" rx="10" fill="#D4584A" stroke="${O}" stroke-width="${W}"/>` +
  `<path d="M30 136 v14 M146 136 v14" stroke="${O}" stroke-width="5" stroke-linecap="round"/>` +
  `<ellipse cx="88" cy="80" rx="46" ry="22" fill="#C9A06A" stroke="${O}" stroke-width="${W}" transform="rotate(-8 88 80)"/><circle cx="64" cy="78" r="2" fill="#8B6A3F"/><circle cx="112" cy="72" r="2" fill="#8B6A3F"/>` +
  `<circle cx="80" cy="74" r="2.6" fill="${O}"/><circle cx="96" cy="72" r="2.6" fill="${O}"/><path d="M82 84 q7 4 14 -2" stroke="${O}" stroke-width="2.4" fill="none" stroke-linecap="round"/>` +
  `<rect x="118" y="80" width="8" height="18" rx="3" fill="${O}" transform="rotate(30 122 89)"/>`),
butterflies: () => svg('#FFF7E8',
  `<rect x="0" y="130" width="240" height="40" fill="#C98F5C"/><path d="M0 152 V170 H240 V152" fill="#C98F5C"/><path d="M0 130 H240" stroke="${O}" stroke-width="3"/>` +
  `<path d="M150 24 L196 24 L182 130 L164 130 Z" fill="#FFF3B0" opacity=".7"/>` +
  `<rect x="106" y="84" width="4" height="46" fill="${O}"/><rect x="100" y="76" width="16" height="12" rx="6" fill="#555"/>` +
  kid(172, 62, { shirt: '#FFFFFF', mood: 'worry', arms: 'hold' }) +
  `<circle cx="172" cy="92" r="12" fill="#FFF3B0" stroke="${O}" stroke-width="2" stroke-dasharray="3 3"/>` +
  [[166, 88, '#FF6B8B'], [178, 96, '#5B8DEF'], [174, 86, '#7AC74F']].map(([x, y, c]) => `<path d="M${x} ${y} l-5 -4 l0 8 Z M${x} ${y} l5 -4 l0 8 Z" fill="${c}" stroke="${O}" stroke-width="1"/>`).join('') +
  [[60, 50, '#FF6B8B'], [36, 80, '#9B6BFF'], [80, 96, '#5B8DEF']].map(([x, y, c]) => `<path d="M${x} ${y} q-14 -14 -16 0 q2 10 16 0 Z M${x} ${y} q14 -14 16 0 q-2 10 -16 0 Z" fill="${c}" stroke="${O}" stroke-width="2"/><path d="M${x} ${y-6} v12" stroke="${O}" stroke-width="2.4"/>`).join('')),
hotwater: () => svg('#FFF0EA',
  `<path d="M70 150 q10 -24 20 0 q10 -30 20 0 q10 -26 20 0 q10 -30 20 0 q10 -24 20 0 Z" fill="#FF8A3D" stroke="${O}" stroke-width="2.5"/>` +
  `<path d="M52 92 H188 L178 140 Q176 148 166 148 H74 Q64 148 62 140 Z" fill="#8F9BB3" stroke="${O}" stroke-width="${W}"/><rect x="44" y="84" width="152" height="12" rx="5" fill="#A9B4C8" stroke="${O}" stroke-width="${W}"/>` +
  `<path d="M40 92 h-12 M200 92 h12" stroke="${O}" stroke-width="6" stroke-linecap="round"/>` +
  `<path d="M58 88 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0" fill="#7FC8F8" stroke="${O}" stroke-width="2"/>` +
  face(120, 66, 'worry', SK, 18) + drop(98, 48, '#BFE2FF') + drop(144, 52, '#BFE2FF') +
  `<path d="M70 40 q-6 -10 0 -18 q6 -8 0 -16 M168 40 q-6 -10 0 -18 q6 -8 0 -16" stroke="#C9D2E3" stroke-width="4" fill="none" stroke-linecap="round"/>`),
eye: () => svg('#EEF6FF',
  ground('#D3E4F7') +
  `<rect x="146" y="98" width="52" height="48" rx="12" fill="#FF8A5B" stroke="${O}" stroke-width="${W}"/><path d="M158 98 q14 -20 28 0" stroke="${O}" stroke-width="${W}" fill="none"/><rect x="160" y="112" width="24" height="16" rx="4" fill="#FFB38A" stroke="${O}" stroke-width="2.4"/>` +
  `<path d="M62 120 L56 146 M86 120 L92 146" stroke="${O}" stroke-width="5" stroke-linecap="round"/><ellipse cx="54" cy="148" rx="8" ry="4" fill="${O}"/><ellipse cx="94" cy="148" rx="8" ry="4" fill="${O}"/>` +
  `<ellipse cx="74" cy="80" rx="46" ry="38" fill="#fff" stroke="${O}" stroke-width="${W}"/><circle cx="86" cy="84" r="20" fill="#3E8EE8" stroke="${O}" stroke-width="2.4"/><circle cx="90" cy="86" r="10" fill="${O}"/><circle cx="84" cy="78" r="4" fill="#fff"/>` +
  `<path d="M40 44 q10 -10 24 -6 M88 38 q14 -6 26 4" stroke="${O}" stroke-width="3" fill="none" stroke-linecap="round"/>` +
  `<path d="M122 84 l18 8" stroke="${O}" stroke-width="2.4" stroke-dasharray="4 4"/>`),
pig: () => svg('#E9F4FF',
  cloud(60, 128, 1, '#fff') + cloud(190, 138, .8, '#fff') +
  `<ellipse cx="130" cy="74" rx="44" ry="30" fill="#FFB4C6" stroke="${O}" stroke-width="${W}"/>` +
  wing(124, 54, 1.1) + wing(138, 54, 1.1, true) +
  `<circle cx="168" cy="62" r="22" fill="#FFB4C6" stroke="${O}" stroke-width="${W}"/><path d="M156 44 l-4 -12 l12 6 Z M178 44 l6 -12 l4 14 Z" fill="#FF9AB3" stroke="${O}" stroke-width="2.2" stroke-linejoin="round"/>` +
  `<ellipse cx="180" cy="68" rx="9" ry="7" fill="#FF9AB3" stroke="${O}" stroke-width="2.2"/><circle cx="177" cy="68" r="1.6" fill="${O}"/><circle cx="183" cy="68" r="1.6" fill="${O}"/><circle cx="164" cy="56" r="2.4" fill="${O}"/><circle cx="174" cy="54" r="2.4" fill="${O}"/>` +
  `<path d="M86 70 q-10 -6 -6 4 q4 8 -6 6" stroke="${O}" stroke-width="2.4" fill="none"/><path d="M106 100 v10 M122 102 v10 M142 102 v10 M156 98 v10" stroke="${O}" stroke-width="5" stroke-linecap="round"/>` +
  `<path d="M40 40 l14 4 M34 60 l16 0 M40 80 l14 -4" stroke="#9AA8BA" stroke-width="3" stroke-linecap="round"/>`),
clock: () => svg('#EEF1FF',
  cloud(52, 140, .9, '#fff') + cloud(200, 130, .7, '#fff') +
  wing(98, 70, 1.4) + wing(142, 70, 1.4, true) +
  `<circle cx="120" cy="76" r="36" fill="#FFD23F" stroke="${O}" stroke-width="${W}"/><circle cx="120" cy="76" r="28" fill="#fff" stroke="${O}" stroke-width="2.4"/>` +
  `<path d="M120 76 V56 M120 76 L134 84" stroke="${O}" stroke-width="3.5" stroke-linecap="round"/><circle cx="120" cy="76" r="3" fill="${O}"/>` +
  [0, 90, 180, 270].map(a => { const r = 24, x = 120 + r * Math.sin(a * Math.PI / 180), y = 76 - r * Math.cos(a * Math.PI / 180); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2" fill="${O}"/>`; }).join('') +
  `<rect x="112" y="34" width="16" height="8" rx="3" fill="#E63950" stroke="${O}" stroke-width="2.2"/>` +
  `<path d="M30 60 h22 M24 76 h26 M30 92 h22" stroke="#9AA8BA" stroke-width="3" stroke-linecap="round"/>`),
overmoon: () => svg('#22305E',
  star(30, 30, 5, '#FFF3B0') + star(210, 24, 6, '#FFF3B0') + star(196, 140, 4, '#FFF3B0') + star(70, 140, 4, '#FFF3B0') +
  `<path d="M90 150 A46 46 0 1 1 168 108 A36 36 0 1 0 90 150 Z" fill="#FFE57A" stroke="#fff" stroke-width="2.5"/>` +
  `<path d="M40 120 Q100 10 200 60" stroke="#FFF3B0" stroke-width="2.4" fill="none" stroke-dasharray="5 6"/>` +
  kid(132, 30, { shirt: '#FF6B8B', mood: 'big', arms: 'up' }) + heart(80, 52, 1.2) + heart(186, 42, 1)),
breakleg: () => svg('#FFF2E6',
  `<rect x="0" y="0" width="240" height="18" fill="#B23A48"/><path d="M0 0 H40 Q30 80 44 150 H0 Z M240 0 H200 Q210 80 196 150 H240 Z" fill="#C8414F" stroke="${O}" stroke-width="2.5"/>` +
  `<rect x="0" y="134" width="240" height="36" fill="#C98F5C"/><path d="M0 152 V170 H240 V152" fill="#C98F5C"/><path d="M0 134 H240" stroke="${O}" stroke-width="3"/>` +
  `<path d="M76 18 L124 18 L150 134 L50 134 Z" fill="#FFF3B0" opacity=".6"/>` +
  kid(100, 66, { shirt: '#9B6BFF', mood: 'worry', arms: 'hold' }) +
  kid(184, 104, { shirt: '#7AC74F', mood: 'big', arms: 'thumb', noLegs: true }) +
  bubble(126, 54, 92, 'Break a leg!', 12, 60)),
clouds: () => svg('#E7F3FF',
  ground('#CBE6B6') +
  kid(120, 76, { shirt: '#5B8DEF', mood: 'happy', arms: 'down' }) +
  cloud(120, 62, 1.05, '#fff') +
  star(86, 34, 6) + heart(152, 32, 1) + star(160, 60, 4) + `<circle cx="70" cy="58" r="5" fill="#FFB4C6" stroke="${O}" stroke-width="1.6"/>` +
  `<text x="196" y="40" font-family="Lexend,system-ui" font-weight="800" font-size="14" fill="#7A8BA6">la la</text>`),
said: () => svg('#EAF6FF',
  `<path d="M80 150 L170 20 L240 150 Z" fill="#9AA8BA" stroke="${O}" stroke-width="${W}" stroke-linejoin="round"/><path d="M148 52 L170 20 L192 56 Q182 50 172 58 Q162 48 148 52 Z" fill="#fff" stroke="${O}" stroke-width="2.5" stroke-linejoin="round"/><path d="M170 20 l0 -14 l14 6 l-14 6" fill="#E63950" stroke="${O}" stroke-width="2"/>` +
  ground('#CBE6B6', 148) +
  kid(46, 84, { shirt: '#FF8A5B', mood: 'big', arms: 'up' }) +
  bubble(10, 16, 100, "Easy! I'll go!", 12))
};
window.IDIOM_ART = ART;
})();
