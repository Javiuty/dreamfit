// Previsión de las próximas horas (barras de magnitud). El color de cada barra
// es el estado semáforo (reservado) y siempre va acompañado de su etiqueta.
export default function Forecast({ items }) {
  const open = items.filter((i) => i.val != null);
  if (!open.length) return null;
  const max = Math.max(...open.map((i) => i.val)) || 1;

  return (
    <div className="forecast">
      <div className="forecast-title">PRÓXIMAS HORAS</div>
      <div className="forecast-bars">
        {items.map((i) => {
          const h = i.val == null ? 0 : Math.max(6, (i.val / max) * 100);
          const color = i.status ? i.status.color : 'var(--faint)';
          return (
            <div className={'fc-col' + (i.best ? ' is-best' : '')} key={i.h}>
              <div className="fc-val">{i.val == null ? '—' : `≈${i.val}`}</div>
              <div className="fc-track">
                <div className="fc-bar" style={{ height: `${h}%`, background: color }} />
              </div>
              <div className="fc-time">{i.label}</div>
              <div className="fc-status" style={{ color }}>
                {i.status ? i.status.label : 'Cerrado'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
