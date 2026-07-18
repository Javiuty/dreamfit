// Funciones puras de cálculo y color para las visualizaciones.
// Todas las horas se manejan en "slots" de media hora: s = hora * 2.

export function easeOutCubic(k) {
  return 1 - Math.pow(1 - k, 3);
}

// Construye un path SVG suavizado (Catmull-Rom → Bézier) a partir de puntos [x, y].
export function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

export function lerp(a, b, k) {
  return a + (b - a) * k;
}

function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mixHex(h1, h2, k) {
  const a = hexToRgb(h1);
  const b = hexToRgb(h2);
  return `rgb(${Math.round(lerp(a[0], b[0], k))},${Math.round(lerp(a[1], b[1], k))},${Math.round(lerp(a[2], b[2], k))})`;
}

// Rampa de calor multi-parada (oscuro → ámbar → dorado claro): fuerte contraste
// de luminosidad para que cada nivel se distinga.
const HEAT_STOPS = [
  [0.0, '#181c16'],
  [0.18, '#23400f'],
  [0.4, '#477f0a'],
  [0.62, '#69CF01'],
  [0.82, '#aee94e'],
  [1.0, '#e9f7a3'],
];

export function heatColor(v) {
  if (v <= 0) return 'rgba(255,255,255,0.04)';
  const g = Math.pow(Math.min(1, v), 0.78); // expande los valores medios
  for (let i = 0; i < HEAT_STOPS.length - 1; i++) {
    const [a, ca] = HEAT_STOPS[i];
    const [b, cb] = HEAT_STOPS[i + 1];
    if (g >= a && g <= b) return mixHex(ca, cb, (g - a) / (b - a));
  }
  return HEAT_STOPS[HEAT_STOPS.length - 1][1];
}

// Interpola la media de ocupación a una hora dada (horas en float).
export function interpAt(slots, timeH) {
  if (!slots.length) return null;
  const x = timeH * 2;
  if (x <= slots[0].s) return x < slots[0].s - 1 ? null : slots[0].avg;
  const last = slots[slots.length - 1];
  if (x >= last.s) return x > last.s + 1 ? null : last.avg;
  for (let i = 0; i < slots.length - 1; i++) {
    const a = slots[i];
    const b = slots[i + 1];
    if (x >= a.s && x <= b.s) return lerp(a.avg, b.avg, (x - a.s) / (b.s - a.s));
  }
  return null;
}

// Estado según % de aforo. Los colores son fijos (semáforo), no dependen del acento.
export function statusOf(pct) {
  if (pct < 30) return { label: 'Tranquilo', color: '#69CF01', msg: 'Sin esperas. Entrena a tu ritmo.' };
  if (pct < 55) return { label: 'Moderado', color: '#FFC53D', msg: 'Buen ambiente, máquinas disponibles.' };
  if (pct < 80) return { label: 'Animado', color: '#FF8A3D', msg: 'Hora punta. Algo de espera en zonas top.' };
  return { label: 'A tope', color: '#F2304A', msg: 'Máxima afluencia. Mejor en otra franja.' };
}

function slotEnd(s) {
  const e = s + 1;
  const h = Math.floor(e / 2);
  const m = e % 2 ? '30' : '00';
  return `${String(h).padStart(2, '0')}:${m}`;
}

// Mejor franja (ventana de 4 medias horas con menor media) a partir de una hora.
export function bestWindow(slots, fromH) {
  const usable = slots.filter((p) => p.s >= fromH * 2);
  const pool = usable.length >= 6 ? usable : slots;
  let best = null;
  for (let i = 0; i + 3 < pool.length; i++) {
    const w = pool.slice(i, i + 4);
    if (w[3].s - w[0].s !== 3) continue;
    const avg = w.reduce((a, b) => a + b.avg, 0) / 4;
    if (!best || avg < best.avg) best = { avg, from: w[0], to: w[3] };
  }
  if (!best) return null;
  const endLabel = slotEnd(best.to.s);
  return { label: `${best.from.t} – ${endLabel}`, avg: Math.round(best.avg), s0: best.from.s, s1: best.to.s + 1 };
}

// Ruido determinista por minuto para que el dato "vivo" respire (-1..1).
export function wobble(seedMin) {
  const x = Math.sin(seedMin * 127.1) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}
