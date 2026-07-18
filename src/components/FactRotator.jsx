import { useState, useEffect, useMemo } from 'react';
import { occupancyData as DF } from '../api/occupancyData';
import { DIAS_LABEL } from '../utils/constants';

// Deriva los "datos curiosos" a partir de las medias y récords del club.
function buildFacts() {
  const r = DF.records;
  const lun = DF.byDay['lunes'].filter((p) => p.s >= 36 && p.s <= 42);
  const vie = DF.byDay['viernes'].filter((p) => p.s >= 36 && p.s <= 42);
  const lunAvg = lun.reduce((a, b) => a + b.avg, 0) / lun.length;
  const vieAvg = vie.reduce((a, b) => a + b.avg, 0) / vie.length;
  const drop = Math.round((1 - vieAvg / lunAvg) * 100);
  const dom = DF.byDay['domingo'];
  const domPeak = dom.reduce((a, b) => (b.avg > a.avg ? b : a), dom[0]);
  return [
    { kicker: 'RÉCORD HISTÓRICO', value: String(r.max.ocup), unit: 'personas', caption: `${DIAS_LABEL[r.max.dia]} ${r.max.fecha} a las ${r.max.hora} · ${r.max.pct}% del aforo` },
    { kicker: 'LA FRANJA MÁS TRANQUILA', value: r.quiet.hora, unit: '', caption: `Los ${r.quiet.dia} a esta hora: solo ≈${r.quiet.avg} personas de media` },
    { kicker: 'HORA PUNTA DE LA SEMANA', value: r.busy.hora, unit: '', caption: `${DIAS_LABEL[r.busy.dia]} · ≈${r.busy.avg} personas de media` },
    { kicker: 'VIERNES TARDE', value: `−${drop}%`, unit: '', caption: `de gente que un lunes a la misma hora. Aprovéchalo.` },
    { kicker: 'EL FINDE CAMBIA EL RITMO', value: domPeak.t, unit: '', caption: `El pico del domingo es a mediodía: ≈${domPeak.avg} personas` },
    { kicker: 'DATOS REALES', value: r.nRegistros.toLocaleString('es-ES'), unit: 'mediciones', caption: `Registradas en este club desde el ${r.desde}` },
  ];
}

// Rota los datos curiosos con un fundido, cambiando cada ~9s.
export default function FactRotator({ accent, speed }) {
  const facts = useMemo(buildFacts, []);
  const [idx, setIdx] = useState(0);
  const [vis, setVis] = useState(true);

  useEffect(() => {
    const period = 9000 / speed;
    const id = setInterval(() => {
      setVis(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % facts.length);
        setVis(true);
      }, 450);
    }, period);
    return () => clearInterval(id);
  }, [speed, facts.length]);

  const f = facts[idx];

  return (
    <div className="facts">
      <div className={'fact' + (vis ? ' is-in' : '')}>
        <div className="fact-kicker" style={{ color: accent }}>{f.kicker}</div>
        <div className="fact-value">
          {f.value}
          {f.unit ? <span className="fact-unit"> {f.unit}</span> : null}
        </div>
        <div className="fact-caption">{f.caption}</div>
      </div>
      <div className="fact-dots">
        {facts.map((_, i) => (
          <div key={i} className="fact-dot" style={{ background: i === idx ? accent : 'rgba(255,255,255,0.18)' }} />
        ))}
      </div>
    </div>
  );
}
