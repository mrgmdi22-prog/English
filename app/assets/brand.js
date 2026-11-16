/* English Club brand kit (16 Nov 2026): watercolour "challenge" identity for teenagers — brush-stroke washes, ink-outlined
   drawn icons, the summit scene. Pages opt in with <link assets/brand.css> + this script, then mark elements:
   data-bi="name" (icon on a brush chip; data-bs = box px, data-bc = colour key), data-bicon="name" (bare icon; data-bs = px),
   data-bscene (the summit painting), data-bunder="coral|sun|…" (brush underline after the element's text),
   data-bcorner="sky|…" (soft brush stroke in the card's corner). Brand.apply(root) re-runs it on new markup. */
(function(){
'use strict';
var INK = '#14233f';
var C = { sky:'#2f8bff', turq:'#12b5a6', sun:'#ffc21a', coral:'#ff6b35', leaf:'#3ecf6e', white:'#ffffff' };
var IC = {"home": "<path d=\"M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z\"/>", "grid": "<rect x=\"4\" y=\"4\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"13\" y=\"4\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"4\" y=\"13\" width=\"7\" height=\"7\" rx=\"1.5\"/><rect x=\"13\" y=\"13\" width=\"7\" height=\"7\" rx=\"1.5\"/>", "gift": "<rect x=\"3\" y=\"8\" width=\"18\" height=\"4\" rx=\"1\"/><path d=\"M5 12v9h14v-9M12 8v13M12 8c-2-5-7-3-4 0M12 8c2-5 7-3 4 0\"/>", "trophy": "<path d=\"M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4\"/>", "path": "<path d=\"M4 4v16h16zM8 13v3h3\"/>", "clip": "<rect x=\"5\" y=\"4\" width=\"14\" height=\"17\" rx=\"2\"/><path d=\"M9 3h6v3H9zM9 11h6M9 15h4\"/>", "book": "<path d=\"M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM19 19v2H6\"/>", "gram": "<path d=\"M8 4H5v16h3M16 4h3v16h-3M9 12h6\"/>", "chat": "<path d=\"M4 5h16v11H10l-5 4v-4H4z\"/>", "ear": "<path d=\"M4 14v-2a8 8 0 0 1 16 0v2M4 14h3v6H5a1 1 0 0 1-1-1zM20 14h-3v6h2a1 1 0 0 0 1-1z\"/>", "globe": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18\"/>", "chart": "<path d=\"M4 20h16M7 16v-4M12 16V8M17 16V5\"/>", "guide": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M15 9l-2 4-4 2 2-4z\"/>", "star": "<path d=\"M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z\"/>", "flame": "<path d=\"M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z\"/>", "check": "<path d=\"M5 12l5 5 9-10\"/>", "back": "<path d=\"M19 12H5M11 6l-6 6 6 6\"/>", "gem": "<path d=\"M6 4h12l3 5-9 11L3 9zM3 9h18M9 4l-1 5 4 11 4-11-1-5\"/>", "pen": "<path d=\"M4 20l1-4L16 5l3 3L8 19z\"/>", "sound": "<path d=\"M4 10v4h3l5 4V6L7 10zM16 9a4 4 0 0 1 0 6\"/>"};
var COL = { home:'sky', grid:'turq', gift:'coral', trophy:'sun', path:'turq', clip:'sky', book:'leaf', gram:'coral', chat:'turq', ear:'coral', globe:'leaf',
  chart:'sky', guide:'sun', star:'sun', flame:'coral', check:'leaf', back:'sky', gem:'turq', pen:'leaf', sound:'sky' };
var NOFILL = { check:1, back:1, gram:1, chart:1 };
var n = 0;
function uid(){ return 'bw' + (++n); }
function wf(id, scale, freq, seed){
  return '<filter id="' + id + '" x="-25%" y="-25%" width="150%" height="150%"><feTurbulence type="fractalNoise" baseFrequency="' + freq + '" numOctaves="3" seed="' + seed + '" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="' + scale + '"/><feGaussianBlur stdDeviation="0.5"/></filter>';
}
function col(k){ return C[k] || k || C.sky; }
function icon(name, size, colour){
  var c = col(colour || COL[name]);
  return '<svg class="b-ic" width="' + (size || 28) + '" height="' + (size || 28) + '" viewBox="0 0 24 24" fill="' + (NOFILL[name] ? 'none' : c) + '" stroke="' + INK + '" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IC[name] || IC.star) + '</svg>';
}
function blob(colour, size, seed, op){
  var i = uid(); op = op || .55;
  return '<svg class="b-blob" width="' + size + '" height="' + size + '" viewBox="0 0 60 60" aria-hidden="true"><defs>' + wf(i, 5, .07, seed || 3) + '</defs><g filter="url(#' + i + ')" transform="rotate(-20 30 30)">'
    + '<rect x="3" y="12" width="50" height="14" rx="6" fill="' + colour + '" fill-opacity="' + Math.min(1, op + .25) + '"/><rect x="8" y="24" width="50" height="14" rx="6" fill="' + colour + '" fill-opacity="' + op + '"/><rect x="2" y="36" width="40" height="11" rx="5" fill="' + colour + '" fill-opacity="' + op * .6 + '"/></g></svg>';
}
function chip(name, box, colour){
  box = box || 58; var c = col(colour || COL[name]);
  return '<span class="b-chip" style="width:' + box + 'px;height:' + box + 'px">' + blob(c, box, (name.length * 7 + name.charCodeAt(0)) % 19 + 1) + icon(name, Math.round(box * .52), c) + '</span>';
}
function under(colour, w){
  var i = uid();
  return '<svg class="b-under" width="' + (w || 150) + '" height="12" viewBox="0 0 150 12" preserveAspectRatio="none" aria-hidden="true"><defs>' + wf(i, 3, .09, 8) + '</defs><path filter="url(#' + i + ')" d="M4 7C40 2 100 3 146 6" fill="none" stroke="' + col(colour || 'sun') + '" stroke-width="6" stroke-linecap="round" stroke-opacity=".85"/></svg>';
}
function corner(colour, seed){
  var i = uid(), c = col(colour);
  return '<svg class="b-corner" width="120" height="90" viewBox="0 0 120 90" aria-hidden="true"><defs>' + wf(i, 9, .04, seed || 3) + '</defs><g filter="url(#' + i + ')" transform="rotate(-18 60 45)"><rect x="0" y="18" width="110" height="20" rx="9" fill="' + c + '" fill-opacity=".32"/><rect x="14" y="42" width="90" height="14" rx="7" fill="' + c + '" fill-opacity=".2"/></g></svg>';
}
function ring(txt, frac, colour){
  var L = 2 * Math.PI * 23;
  return '<span class="b-ring"><svg width="62" height="62" viewBox="0 0 62 62" aria-hidden="true"><circle cx="31" cy="31" r="23" fill="#fff" stroke="#d5e2f3" stroke-width="7"/><circle cx="31" cy="31" r="23" fill="none" stroke="' + col(colour || 'turq') + '" stroke-width="7" stroke-linecap="round" stroke-dasharray="' + (L * Math.max(0, Math.min(1, frac))).toFixed(1) + ' ' + L.toFixed(1) + '"/></svg><b>' + txt + '</b></span>';
}
function spark(x, y, r, c){
  var q = r * .28;
  return '<path d="M' + x + ' ' + (y - r) + 'L' + (x + q) + ' ' + (y - q) + 'L' + (x + r) + ' ' + y + 'L' + (x + q) + ' ' + (y + q) + 'L' + x + ' ' + (y + r) + 'L' + (x - q) + ' ' + (y + q) + 'L' + (x - r) + ' ' + y + 'L' + (x - q) + ' ' + (y - q) + 'Z" fill="' + c + '" stroke="' + INK + '" stroke-width="1.2" stroke-linejoin="round"/>';
}
function scene(){
  var a = uid(), b = uid(), c = uid(), d = uid();
  return '<svg class="b-scene" viewBox="0 0 390 220" preserveAspectRatio="xMidYMax slice" role="img" aria-label="رسم مائي: قمة جبل عليها راية، ومسار يصعد إليها، وبرق وضربات فرشاة ملوّنة">'
    + '<defs>' + wf(a, 16, .02, 4) + wf(b, 8, .035, 9) + wf(c, 5, .05, 2) + wf(d, 2.5, .08, 5) + '</defs>'
    + '<g filter="url(#' + a + ')" transform="rotate(-14 195 110)"><rect x="-30" y="26" width="330" height="40" rx="18" fill="' + C.sky + '" fill-opacity=".55"/><rect x="60" y="74" width="380" height="46" rx="20" fill="' + C.turq + '" fill-opacity=".5"/><rect x="-20" y="128" width="300" height="34" rx="16" fill="' + C.sun + '" fill-opacity=".7"/><rect x="170" y="150" width="260" height="30" rx="14" fill="' + C.coral + '" fill-opacity=".55"/></g>'
    + '<g filter="url(#' + c + ')"><circle cx="250" cy="84" r="62" fill="' + C.sun + '" fill-opacity=".28"/><circle cx="250" cy="84" r="40" fill="' + C.sun + '" fill-opacity=".45"/><circle cx="250" cy="84" r="24" fill="#fff3c4" fill-opacity=".9"/></g>'
    + '<g filter="url(#' + b + ')"><path d="M0 220L40 150L84 176L130 120L176 170L214 140L250 186L300 150L340 176L390 132V220Z" fill="' + C.sky + '" fill-opacity=".28"/></g>'
    + '<g filter="url(#' + c + ')" fill="#fff" fill-opacity=".9"><ellipse cx="326" cy="64" rx="34" ry="11"/><ellipse cx="346" cy="56" rx="20" ry="10"/><ellipse cx="150" cy="56" rx="26" ry="9"/></g>'
    + '<g filter="url(#' + b + ')"><path d="M150 220L262 62L330 150L358 118L390 160V220Z" fill="' + C.sky + '" fill-opacity=".85"/><path d="M262 62L236 100L256 112L270 96L290 116L298 108Z" fill="#fff" fill-opacity=".95"/><path d="M0 220L70 132L120 186L150 160L200 220Z" fill="' + C.turq + '" fill-opacity=".8"/></g>'
    + '<path d="M150 220L262 62L330 150L358 118L390 160M0 220L70 132L120 186L150 160" fill="none" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>'
    + '<path d="M262 62V26" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/>'
    + '<g filter="url(#' + d + ')"><path d="M262 26L300 36L262 48Z" fill="' + C.coral + '" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/></g>'
    + '<path d="M36 206C80 190 120 196 150 178C184 158 196 138 222 118" fill="none" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="2 9"/>'
    + '<g filter="url(#' + d + ')"><path d="M96 28L62 92H88L74 138L124 70H96L112 28Z" fill="' + C.sun + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/></g>'
    + '<path d="M20 60h34M8 76h28M330 30h40M346 46h30" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>'
    + '<g fill-opacity=".75"><circle cx="24" cy="110" r="3" fill="' + C.coral + '"/><circle cx="34" cy="120" r="1.6" fill="' + C.coral + '"/><circle cx="366" cy="196" r="3" fill="' + C.sun + '"/><circle cx="210" cy="28" r="2.4" fill="' + C.turq + '"/><circle cx="118" cy="150" r="2" fill="' + C.sky + '"/></g>'
    + spark(182, 44, 11, C.sun) + spark(338, 82, 8, '#fff') + spark(140, 112, 7, C.coral) + spark(40, 150, 8, C.turq) + '</svg>';
}
function apply(root){
  root = root || document;
  [].forEach.call(root.querySelectorAll('[data-bi]'), function(el){ if (el.dataset.bd) return; el.dataset.bd = 1; el.innerHTML = chip(el.dataset.bi, +el.dataset.bs || 58, el.dataset.bc); el.classList.add('b-host'); });
  [].forEach.call(root.querySelectorAll('[data-bicon]'), function(el){ if (el.dataset.bd) return; el.dataset.bd = 1; el.innerHTML = icon(el.dataset.bicon, +el.dataset.bs || 26, el.dataset.bc); el.classList.add('b-host'); });
  [].forEach.call(root.querySelectorAll('[data-bscene]'), function(el){ if (el.dataset.bd) return; el.dataset.bd = 1; el.innerHTML = scene(); });
  [].forEach.call(root.querySelectorAll('[data-bunder]'), function(el){ if (el.dataset.bd) return; el.dataset.bd = 1; el.insertAdjacentHTML('beforeend', under(el.dataset.bunder, +el.dataset.bw || 150)); });
  [].forEach.call(root.querySelectorAll('[data-bcorner]'), function(el){ if (el.dataset.bd) return; el.dataset.bd = 1; el.classList.add('b-cornered'); el.insertAdjacentHTML('afterbegin', corner(el.dataset.bcorner, el.dataset.bcorner.length + 2)); });
}
window.Brand = { icon: icon, chip: chip, under: under, corner: corner, ring: ring, scene: scene, apply: apply, C: C };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ apply(); }); else apply();
})();
