// Ajustes del panel de ocupación.
//   accent    → color de marca (variable CSS --accent)
//   modo      → 'Reloj real' usa la hora del sistema; cualquier otro valor simula
//   horaSim   → hora fija (float, p. ej. 19.5) en modo simulado
//   diaSim    → día fijo en modo simulado
//   velocidad → multiplicador de la velocidad de las animaciones
export const DEFAULT_SETTINGS = {
  accent: '#69CF01',
  modo: 'Reloj real',
  horaSim: 19,
  diaSim: 'martes',
  velocidad: 1,
};
