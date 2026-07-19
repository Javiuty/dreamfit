import { useState, useEffect, useRef, Fragment } from 'react';
import { occupancyData as DF } from '../api/occupancyData';
import { heatColor } from '../utils/helpers';
import { DIAS_CORTO, DIAS_LABEL } from '../utils/constants';

// Mapa de calor semanal: filas = días, columnas = franjas de media hora.
// Cada celda es su propio hit-target: al pasar el puntero muestra un tooltip
// (día · hora · media) y se realza (ver :hover en el CSS).
export default function WeekHeatmap({ todayDia, speed }) {
  const S0 = 13; // 06:30
  const S1 = 47; // 23:30
  const maxAvg = Math.max(...DF.dias.flatMap((d) => DF.byDay[d].map((p) => p.avg)));
  const cols = S1 - S0 + 1;

  const [on, setOn] = useState(false);
  const [tip, setTip] = useState(null); // { dia, t, avg, color, x, y }
  const wrapRef = useRef(null);

  useEffect(() => {
    const id = setTimeout(() => setOn(true), 100);
    return () => clearTimeout(id);
  }, []);

  // Delegación: leemos los data-* de la celda bajo el puntero.
  const onMove = (e) => {
    const cell = e.target.closest?.('.heat-cell');
    const wrap = wrapRef.current;
    if (!cell || !wrap) {
      setTip(null);
      return;
    }
    const wr = wrap.getBoundingClientRect();
    setTip({
      dia: cell.dataset.dia,
      t: cell.dataset.t,
      avg: cell.dataset.avg,
      color: cell.dataset.color,
      x: e.clientX - wr.left,
      y: e.clientY - wr.top,
    });
  };

  return (
    <div className="heatmap" ref={wrapRef}>
      {/* Columna de etiqueta a escala fija + celdas fluidas que llenan el ancho.
          Alto, hueco y radio de celda los define el CSS (con --s). */}
      <div
        className="heat-grid"
        style={{ gridTemplateColumns: `calc(34 * var(--s)) repeat(${cols}, minmax(0, 1fr))` }}
        onPointerMove={onMove}
        onPointerLeave={() => setTip(null)}
      >
        {DF.dias.map((dia, r) => (
          <Fragment key={dia}>
            <div className={'heat-day' + (dia === todayDia ? ' is-today' : '')}>{DIAS_CORTO[dia]}</div>
            {Array.from({ length: cols }, (_, i) => {
              const s = S0 + i;
              const p = DF.byDay[dia].find((q) => q.s === s);
              const v = p ? p.avg / maxAvg : 0;
              const color = heatColor(v);
              return (
                <div
                  key={s}
                  className={'heat-cell' + (dia === todayDia ? ' is-today-row' : '')}
                  data-dia={DIAS_LABEL[dia]}
                  data-t={p ? p.t : ''}
                  data-avg={p ? p.avg : ''}
                  data-color={color}
                  style={{
                    background: color,
                    opacity: on ? 1 : 0,
                    transform: on ? 'scale(1)' : 'scale(0.4)',
                    transition: 'opacity .5s ease, transform .5s cubic-bezier(.2,.9,.3,1.3)',
                    transitionDelay: `${(i * 14 + r * 40) / speed}ms`,
                  }}
                />
              );
            })}
          </Fragment>
        ))}
        <div />
        <div className="heat-hours" style={{ gridColumn: `span ${cols}` }}>
          {[7, 9, 11, 13, 15, 17, 19, 21, 23].map((h) => (
            <span key={h} style={{ left: `${((h * 2 - S0 + 0.5) / cols) * 100}%` }}>
              {h}
            </span>
          ))}
        </div>
      </div>
      <div className="heat-legend">
        <span className="heat-legend-cap">Menos</span>
        <div className="heat-legend-bar" />
        <span className="heat-legend-cap">Más afluencia</span>
      </div>

      {tip && (
        <div className="chart-tip" style={{ left: tip.x, top: tip.y }}>
          <div className="chart-tip-time">
            {tip.dia} · {tip.t || '—'}
          </div>
          <div className="chart-tip-row">
            <span className="chart-tip-key" style={{ background: tip.color, height: 'calc(9 * var(--s))', borderRadius: '2px' }} />
            <span className="chart-tip-val">{tip.avg ? `≈${tip.avg}` : 'Cerrado'}</span>
            {tip.avg && <span className="chart-tip-lbl">personas</span>}
          </div>
        </div>
      )}
    </div>
  );
}
