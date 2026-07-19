// Fila de tiles con las cifras clave del día. Números-hero, no gráficos.
// El delta "ahora vs media" se colorea con el acento (informativo, no semáforo).
export default function KpiStrip({ kpis, accent, closed }) {
  if (!kpis) {
    return (
      <div className="kpi-strip">
        <div className="kpi-tile">
          <div className="kpi-label">SIN DATOS DE HOY</div>
          <div className="kpi-value">—</div>
        </div>
      </div>
    );
  }

  const up = kpis.deltaPct > 0;
  const flat = kpis.deltaPct === 0;
  const deltaTxt = `${up ? '+' : ''}${kpis.deltaPct}%`;

  const tiles = [
    { label: 'PICO DE HOY', value: kpis.peak.avg, sub: `a las ${kpis.peak.t}` },
    { label: 'MEDIA DE HOY', value: kpis.mean, sub: 'personas' },
    { label: 'FRANJA VALLE', value: kpis.valley.t, sub: `≈${kpis.valley.avg} personas` },
  ];

  return (
    <div className="kpi-strip">
      {tiles.map((t) => (
        <div className="kpi-tile" key={t.label}>
          <div className="kpi-label">{t.label}</div>
          <div className="kpi-value">{t.value}</div>
          <div className="kpi-sub">{t.sub}</div>
        </div>
      ))}
      <div className="kpi-tile">
        <div className="kpi-label">AHORA VS MEDIA</div>
        <div className="kpi-value" style={{ color: closed ? 'var(--faint)' : accent }}>
          {closed ? '—' : (
            <>
              <span className="kpi-arrow">{flat ? '→' : up ? '↑' : '↓'}</span>
              {deltaTxt}
            </>
          )}
        </div>
        <div className="kpi-sub">{closed ? 'fuera de horario' : 'respecto a la media'}</div>
      </div>
    </div>
  );
}
