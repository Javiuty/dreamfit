import { dayParts } from '../utils/analytics';

// Coordenada polar sobre el aro (0° arriba, sentido horario).
function polar(cx, cy, r, deg) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}
function arc(cx, cy, r, a0, a1) {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

// Donut "Reparto del día": part-to-whole en cuatro tramos, con leyenda
// (identidad por etiqueta, no solo por color). Rampa verde secuencial.
export default function DayParts({ slots }) {
  const { parts, top } = slots.length ? dayParts(slots) : { parts: [], top: null };
  const cx = 100;
  const cy = 100;
  const r = 74;
  const sw = 24;
  const GAP = 5; // hueco angular entre segmentos (grados)

  let acc = 0;
  const segs = parts.map((p) => {
    const sweep = (p.pct / 100) * 360;
    const a0 = acc + GAP / 2;
    const a1 = acc + sweep - GAP / 2;
    acc += sweep;
    return { p, d: a1 > a0 ? arc(cx, cy, r, a0, a1) : null };
  });

  return (
    <div className="parts">
      <div className="parts-donut">
        <svg viewBox="0 0 200 200">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw} />
          {segs.map(
            (s) =>
              s.d && (
                <path
                  key={s.p.key}
                  d={s.d}
                  fill="none"
                  stroke={s.p.color}
                  strokeWidth={sw}
                  strokeLinecap="round"
                />
              )
          )}
        </svg>
        {top && (
          <div className="parts-center">
            <div className="parts-center-kicker">MÁS FLUJO</div>
            <div className="parts-center-val">{top.key}</div>
            <div className="parts-center-pct">{top.pct}%</div>
          </div>
        )}
      </div>
      <ul className="parts-legend">
        {parts.map((p) => (
          <li key={p.key}>
            <span className="parts-dot" style={{ background: p.color }} />
            <span className="parts-name">{p.key}</span>
            <span className="parts-desc">{p.desc}</span>
            <span className="parts-pct">{p.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
