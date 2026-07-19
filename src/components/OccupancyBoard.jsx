import { useState, useEffect } from 'react';
import { occupancyData as DF } from '../api/occupancyData';
import { interpAt, statusOf, bestWindow, wobble } from '../utils/helpers';
import { buildKpis, forecast } from '../utils/analytics';
import { DIAS_JS, DIAS_LABEL, MESES } from '../utils/constants';
import { DEFAULT_SETTINGS } from '../config';
import TopBar from './TopBar';
import KpiStrip from './KpiStrip';
import NowGauge from './NowGauge';
import Forecast from './Forecast';
import DayCurve from './DayCurve';
import WeekHeatmap from './WeekHeatmap';
import DayParts from './DayParts';
import DayBars from './DayBars';
import FactRotator from './FactRotator';

export default function OccupancyBoard({ settings = DEFAULT_SETTINGS }) {
  const { accent, modo, horaSim, diaSim, velocidad: speed } = settings;

  // reloj real, tic cada segundo
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // entrada de tarjetas (una sola vez, inmune a re-render del reloj)
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(id);
  }, []);

  const simulado = modo !== 'Reloj real';
  const dia = simulado ? diaSim : DIAS_JS[now.getDay()];
  const horaF = simulado ? horaSim : now.getHours() + now.getMinutes() / 60;
  const slots = DF.byDay[dia] || [];

  // valor "ahora": media histórica interpolada + ruido por minuto
  const minuteSeed = simulado ? Math.round(horaF * 60) : Math.floor(now.getTime() / 60000);
  const base = interpAt(slots, horaF);
  const closed = base == null;
  const nowVal = closed ? 0 : Math.max(0, Math.round(base * (1 + wobble(minuteSeed) * 0.05)));
  const nowPct = Math.round((nowVal / DF.capacity) * 100);
  const st = statusOf(nowPct);
  const best = bestWindow(slots, horaF);

  // analítica derivada
  const kpis = buildKpis(slots, nowVal);
  const fcItems = forecast(slots, horaF, DF.capacity);
  const hasForecast = fcItems.some((i) => i.val != null);

  const fechaStr = `${DIAS_LABEL[dia]}, ${now.getDate()} de ${MESES[now.getMonth()]}`;
  const horaStr = simulado
    ? `${String(Math.floor(horaF)).padStart(2, '0')}:${horaF % 1 ? '30' : '00'}`
    : `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <div className={'board' + (mounted ? ' mounted' : '')} style={{ '--accent': accent }} data-screen-label="Dashboard ocupación">
      <TopBar horaStr={horaStr} fechaStr={fechaStr} simulado={simulado} />

      <KpiStrip kpis={kpis} accent={accent} closed={closed} />

      <main className="grid">
        <section className="card card-now">
          <div className="now-live">
            <div className="card-title">
              <span className="live-dot" style={{ background: closed ? '#666' : st.color }} />
              AHORA MISMO
            </div>
            <div className="now-live-body">
              <NowGauge value={nowVal} pct={nowPct} accent={accent} speed={speed} closed={closed} />
              <div className="now-status">
                <div className="status-chip" style={{ color: closed ? '#999' : st.color, borderColor: closed ? '#444' : st.color }}>
                  {closed ? 'Fuera de horario' : st.label}
                </div>
                <div className="status-msg">{closed ? 'Vuelve mañana con energía.' : st.msg}</div>
              </div>
            </div>
          </div>

          {best || hasForecast ? (
            <div className="now-next">
              {best ? (
                <div className="best-row">
                  <div className="best-icon">→</div>
                  <div>
                    <div className="best-title">MEJOR FRANJA PARA VENIR</div>
                    <div className="best-time">
                      {best.label} <span className="best-avg">≈{best.avg} personas</span>
                    </div>
                  </div>
                </div>
              ) : null}
              <Forecast items={fcItems} />
            </div>
          ) : null}
        </section>

        <section className="card card-curve">
          <div className="card-head">
            <div className="card-title">CURVA DE HOY · {DIAS_LABEL[dia].toUpperCase()}</div>
            <div className="legend">
              <span className="legend-item">
                <span className="legend-line" />
                Media histórica
              </span>
              <span className="legend-item">
                <span className="legend-band" />
                Franja habitual
              </span>
            </div>
          </div>
          <DayCurve
            slots={slots}
            nowH={horaF}
            nowVal={closed ? null : nowVal}
            best={best}
            accent={accent}
            speed={speed}
            isToday={!simulado}
          />
        </section>

        <section className="card card-heat">
          <div className="card-title">AFLUENCIA SEMANAL</div>
          <WeekHeatmap todayDia={dia} speed={speed} />
        </section>

        <div className="side">
          <section className="card card-parts">
            <div className="card-title">REPARTO DEL DÍA</div>
            <DayParts slots={slots} />
          </section>

          <section className="card card-days">
            <div className="card-title">MEDIA POR DÍA</div>
            <DayBars accent={accent} todayDia={dia} speed={speed} />
          </section>

          <section className="card card-facts">
            <div className="card-title">¿SABÍAS QUE…?</div>
            <FactRotator accent={accent} speed={speed} />
          </section>
        </div>
      </main>

      <footer className="footbar">
        <span>
          Datos reales de ocupación · {DF.records.desde.slice(3)} – {DF.records.hasta.slice(3)}
        </span>
        <span>Aforo del club: {DF.capacity} personas · actualizado cada 30 min</span>
      </footer>
    </div>
  );
}
