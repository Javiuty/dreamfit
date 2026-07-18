import { useState, useEffect } from 'react';
import { occupancyData as DF } from '../api/occupancyData';
import { DIAS_LABEL } from '../utils/constants';

// Barras horizontales con la media de personas por día de la semana.
// (En el layout actual la tarjeta que la contiene está oculta por CSS,
//  pero se conserva como parte del diseño original.)
export default function DayBars({ accent, todayDia, speed }) {
  const max = Math.max(...DF.dayAvg.map((d) => d.avg));
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setOn(true), 100);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="daybars">
      {DF.dayAvg.map((d, i) => {
        const isToday = d.dia === todayDia;
        return (
          <div className="daybar-row" key={d.dia}>
            <div className={'daybar-label' + (isToday ? ' is-today' : '')}>{DIAS_LABEL[d.dia]}</div>
            <div className="daybar-track">
              <div
                className="daybar-fill"
                style={{
                  width: on ? `${(d.avg / max) * 100}%` : '0%',
                  background: isToday ? accent : 'rgba(255,255,255,0.16)',
                  transition: `width ${1300 / speed}ms cubic-bezier(.2,.7,.2,1) ${(i * 90) / speed}ms`,
                }}
              />
            </div>
            <div className={'daybar-val' + (isToday ? ' is-today' : '')}>{d.avg}</div>
          </div>
        );
      })}
      <div className="daybars-note">Media de personas · 9:00 – 21:30</div>
    </div>
  );
}
