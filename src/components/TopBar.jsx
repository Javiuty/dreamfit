import logoUrl from '../assets/dreamfit-logo.svg';

// Cabecera: marca del club + reloj/fecha (con etiqueta SIM en modo simulado).
export default function TopBar({ horaStr, fechaStr, simulado }) {
  return (
    <header className="topbar">
      <div className="topbar-brand">
        <img src={logoUrl} alt="Dreamfit" className="logo" />
        <div className="club">
          <span className="club-name">VALDEBERNARDO</span>
          <span className="club-sub">OCUPACIÓN EN DIRECTO</span>
        </div>
      </div>
      <div className="topbar-clock">
        <div className="clock-time">
          {horaStr}
          {simulado ? <span className="sim-tag">SIM</span> : null}
        </div>
        <div className="clock-date">{fechaStr}</div>
      </div>
    </header>
  );
}
