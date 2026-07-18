import { useState, useEffect } from 'react';
import { smoothPath } from '../utils/helpers';

// Curva de ocupación del día: media histórica (línea), banda p25–p75,
// franja recomendada y marcador de la hora actual.
export default function DayCurve({ slots, nowH, nowVal, best, accent, speed, isToday }) {
  const W = 1170;
  const H = 380;
  const PAD_L = 56;
  const PAD_R = 24;
  const PAD_T = 30;
  const PAD_B = 44;

  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setDrawn(true), 60);
    return () => clearTimeout(id);
  }, []);

  if (!slots.length) return null;

  const s0 = slots[0].s;
  const s1 = slots[slots.length - 1].s;
  const maxY = Math.max(...slots.map((p) => p.p75 || p.avg)) * 1.12;
  const X = (s) => PAD_L + ((s - s0) / (s1 - s0)) * (W - PAD_L - PAD_R);
  const Y = (v) => PAD_T + (1 - v / maxY) * (H - PAD_T - PAD_B);

  const line = smoothPath(slots.map((p) => [X(p.s), Y(p.avg)]));
  const area = line + ` L ${X(s1)} ${Y(0)} L ${X(s0)} ${Y(0)} Z`;
  const bandTop = slots.map((p) => [X(p.s), Y(p.p75)]);
  const bandBot = [...slots].reverse().map((p) => [X(p.s), Y(p.p25)]);
  const band = smoothPath(bandTop) + ' L ' + bandBot.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L ') + ' Z';

  const hourTicks = [];
  for (let s = Math.ceil(s0 / 4) * 4; s <= s1; s += 4) hourTicks.push(s);
  const yTicks = [100, 200, 300].filter((v) => v < maxY);

  const nowX = nowH != null && nowH * 2 >= s0 && nowH * 2 <= s1 ? X(nowH * 2) : null;
  const nowY = nowVal != null ? Y(nowVal) : null;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="curve-svg">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.38" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.02" />
        </linearGradient>
        <clipPath id="drawClip">
          <rect
            x="0"
            y="0"
            height={H}
            width={drawn ? W : 0}
            style={{ transition: `width ${2000 / speed}ms cubic-bezier(.2,.7,.3,1)` }}
          />
        </clipPath>
      </defs>

      {yTicks.map((v) => (
        <g key={v}>
          <line x1={PAD_L} x2={W - PAD_R} y1={Y(v)} y2={Y(v)} stroke="rgba(255,255,255,0.06)" strokeDasharray="2 6" />
          <text x={PAD_L - 10} y={Y(v) + 4} textAnchor="end" className="axis-label">
            {v}
          </text>
        </g>
      ))}

      {hourTicks.map((s) => (
        <text key={s} x={X(s)} y={H - 14} textAnchor="middle" className="axis-label">
          {Math.floor(s / 2)}h
        </text>
      ))}

      {best ? (
        <g>
          <rect
            x={X(best.s0)}
            y={PAD_T - 6}
            width={X(best.s1) - X(best.s0)}
            height={H - PAD_T - PAD_B + 6}
            fill="#69CF01"
            opacity="0.10"
            rx="8"
          />
          <text
            x={Math.max(PAD_L + 60, Math.min(W - PAD_R - 60, (X(best.s0) + X(best.s1)) / 2))}
            y={PAD_T + 14}
            textAnchor="middle"
            className="best-label"
          >
            MEJOR FRANJA
          </text>
        </g>
      ) : null}

      <g clipPath="url(#drawClip)">
        <path d={band} fill="rgba(255,255,255,0.06)" />
        <path d={area} fill="url(#areaGrad)" />
        <path d={line} fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round" />
      </g>

      {nowX != null ? (
        <g>
          <line
            x1={nowX}
            x2={nowX}
            y1={PAD_T - 6}
            y2={H - PAD_B}
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1.5"
            strokeDasharray="3 5"
          />
          {nowY != null ? (
            <g>
              <circle cx={nowX} cy={nowY} r="9" fill={accent} className="now-dot" />
              <circle cx={nowX} cy={nowY} r="9" fill="none" stroke={accent} className="now-pulse" />
            </g>
          ) : null}
          <text x={nowX} y={PAD_T - 12} textAnchor="middle" className="now-label">
            {isToday ? 'AHORA' : 'HORA SIMULADA'}
          </text>
        </g>
      ) : null}
    </svg>
  );
}
