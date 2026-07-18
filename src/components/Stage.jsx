import OccupancyBoard from './OccupancyBoard';

// Contenedor a pantalla completa. La escala de diseño (--s) y el reflujo
// responsive los resuelve el CSS (ver styles/dashboard.css): el tablero
// llena el viewport y se adapta a cualquier proporción sin deformar.
export default function Stage({ settings }) {
  return (
    <div className="stage">
      <div className="canvas">
        <OccupancyBoard settings={settings} />
      </div>
    </div>
  );
}
