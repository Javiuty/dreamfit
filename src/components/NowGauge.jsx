import { useTween } from '../utils/useTween';
import { statusOf } from '../utils/helpers';

// Aro circular con el número de personas "ahora" y el % de aforo.
export default function NowGauge({ value, pct, accent, speed, closed }) {
  const animV = useTween(closed ? 0 : value, 1400 / speed);
  const animP = useTween(closed ? 0 : pct, 1400 / speed);
  const R = 168;
  const C = 2 * Math.PI * R;
  const frac = Math.min(1, animP / 100);
  const st = statusOf(pct);

  return (
    <div className="gauge-wrap">
      <svg width="420" height="420" viewBox="0 0 420 420">
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
            <stop offset="100%" stopColor={accent} />
          </linearGradient>
        </defs>
        <circle cx="210" cy="210" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="26" />
        <circle
          cx="210"
          cy="210"
          r={R}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="26"
          strokeLinecap="round"
          strokeDasharray={`${C * frac} ${C}`}
          transform="rotate(-90 210 210)"
        />
      </svg>
      <div className="gauge-center">
        {closed ? (
          <div className="gauge-closed">CERRADO</div>
        ) : (
          <>
            <div className="gauge-num">{Math.round(animV)}</div>
            <div className="gauge-sub">
              personas · <span style={{ color: st.color, fontWeight: 700 }}>{Math.round(animP)}%</span> aforo
            </div>
          </>
        )}
      </div>
    </div>
  );
}
