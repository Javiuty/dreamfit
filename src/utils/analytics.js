// Analítica derivada de la curva del día (no usa datos nuevos, solo los slots
// de media hora ya presentes en occupancyData).

import { interpAt, statusOf } from './helpers';

// KPIs del día: pico, valle, media y desviación de "ahora" respecto a la media.
export function buildKpis(slots, nowVal) {
  if (!slots.length) return null;
  const peak = slots.reduce((a, b) => (b.avg > a.avg ? b : a), slots[0]);
  const valley = slots.reduce((a, b) => (b.avg < a.avg ? b : a), slots[0]);
  const mean = Math.round(slots.reduce((a, b) => a + b.avg, 0) / slots.length);
  const deltaPct = mean ? Math.round(((nowVal - mean) / mean) * 100) : 0;
  return { peak, valley, mean, deltaPct };
}

// Reparto de la afluencia del día en cuatro tramos. Colores: rampa verde
// secuencial de marca (distinguibles por luminosidad → colorblind-safe).
const PART_DEFS = [
  { key: 'Mañana', desc: '06–12 h', from: 0, to: 23, color: '#23400f' },
  { key: 'Mediodía', desc: '12–16 h', from: 24, to: 31, color: '#477f0a' },
  { key: 'Tarde', desc: '16–20 h', from: 32, to: 39, color: '#69cf01' },
  { key: 'Noche', desc: '20–24 h', from: 40, to: 99, color: '#aee94e' },
];

export function dayParts(slots) {
  const parts = PART_DEFS.map((d) => ({
    ...d,
    sum: slots.filter((p) => p.s >= d.from && p.s <= d.to).reduce((a, b) => a + b.avg, 0),
  }));
  const total = parts.reduce((a, b) => a + b.sum, 0) || 1;
  const withPct = parts.map((p) => ({ ...p, pct: Math.round((p.sum / total) * 100) }));
  const top = withPct.reduce((a, b) => (b.sum > a.sum ? b : a), withPct[0]);
  return { parts: withPct, total, top };
}

// Previsión de las próximas horas a partir de la media histórica interpolada.
// Marca la franja con menor afluencia como la mejor para venir.
export function forecast(slots, fromH, capacity, steps = 4) {
  if (!slots.length) return [];
  const out = [];
  for (let k = 1; k <= steps; k++) {
    const h = Math.floor(fromH) + k;
    if (h > 24) break;
    const raw = interpAt(slots, h);
    const val = raw == null ? null : Math.round(raw);
    const pct = val == null ? null : Math.round((val / capacity) * 100);
    out.push({
      h,
      label: `${String(h % 24).padStart(2, '0')}:00`,
      val,
      pct,
      status: val == null ? null : statusOf(pct),
    });
  }
  // "mejor franja" = la de menor afluencia entre las abiertas
  const open = out.filter((o) => o.val != null);
  if (open.length) {
    const best = open.reduce((a, b) => (b.val < a.val ? b : a), open[0]);
    best.best = true;
  }
  return out;
}
