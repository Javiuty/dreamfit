# Dreamfit · Ocupación en directo

Panel de señalización que muestra la **ocupación en tiempo real** del gimnasio
Dreamfit Valdebernardo: cuánta gente hay ahora, la curva del día, el mapa de
calor semanal y datos curiosos. Pensado para una pantalla en el club, ocupa toda
la pantalla y se adapta a cualquier proporción.

Construido en **React 19 + Vite**. Los datos son históricos (medias y
percentiles por franja de media hora) y el valor "ahora" se interpola de esa
curva con un pequeño ruido para que respire.

## Stack

- [React 19](https://react.dev) con el [React Compiler](https://react.dev/learn/react-compiler) activado
- [Vite](https://vite.dev) como servidor de desarrollo y bundler
- [Oxlint](https://oxc.rs) para el linting
- CSS plano (sin framework) — tipografía [Archivo](https://fonts.google.com/specimen/Archivo) desde Google Fonts

## Requisitos

- Node.js 18+
- [pnpm](https://pnpm.io) (hay `pnpm-lock.yaml`; también funciona con `npm`)

## Puesta en marcha

```bash
pnpm install
pnpm dev        # servidor de desarrollo (http://localhost:5173)
```

## Scripts

| Comando        | Qué hace                                    |
| -------------- | ------------------------------------------- |
| `pnpm dev`     | Servidor de desarrollo con HMR              |
| `pnpm build`   | Build de producción en `dist/`              |
| `pnpm preview` | Sirve localmente el build de producción     |
| `pnpm lint`    | Linting con Oxlint                          |

## Estructura

```
src/
├─ Dreamfit.jsx              # componente raíz: carga estilos y monta <Stage>
├─ main.jsx                  # punto de entrada (createRoot)
├─ config.js                 # DEFAULT_SETTINGS (color, modo, velocidad…)
├─ api/
│  └─ occupancyData.js       # datos de ocupación (sustituible por una API real)
├─ assets/
│  └─ dreamfit-logo.svg      # logotipo
├─ components/
│  ├─ Stage.jsx              # contenedor a pantalla completa
│  ├─ OccupancyBoard.jsx     # tablero: estado, reloj y composición del grid
│  ├─ TopBar.jsx             # cabecera (logo + club + reloj)
│  ├─ NowGauge.jsx           # aro "ahora mismo" (personas y % de aforo)
│  ├─ DayCurve.jsx           # curva del día (media, banda p25–p75, marcador AHORA)
│  ├─ WeekHeatmap.jsx        # mapa de calor semanal
│  ├─ DayBars.jsx            # barras de media por día (oculto en el layout actual)
│  └─ FactRotator.jsx        # rotador de "datos curiosos"
├─ utils/
│  ├─ constants.js           # etiquetas de días y meses
│  ├─ helpers.js             # cálculo y color (curvas, heatmap, interpolación…)
│  └─ useTween.js            # hook de animación de valores
└─ styles/
   └─ dashboard.css          # estilos del panel
```

## Datos

Todos los datos viven en `src/api/occupancyData.js` como un objeto estático:
medias por franja de media hora (`byDay`), medias por día (`dayAvg`), aforo del
club (`capacity`) y récords (`records`). Es el **único fichero que hay que
cambiar** para conectar el panel a una fuente real: expón los mismos campos desde
tu endpoint y sustituye el import por una llamada a la API.

## Configuración

Los ajustes por defecto están en `src/config.js` (`DEFAULT_SETTINGS`) y se pueden
pasar como prop `settings` a `<Stage>` / `<OccupancyBoard>`:

| Ajuste      | Descripción                                                             |
| ----------- | ----------------------------------------------------------------------- |
| `accent`    | Color de marca (variable CSS `--accent`)                                |
| `modo`      | `'Reloj real'` usa la hora del sistema; cualquier otro valor la simula  |
| `horaSim`   | Hora fija (float, p. ej. `19.5`) en modo simulado                       |
| `diaSim`    | Día fijo en modo simulado                                               |
| `velocidad` | Multiplicador de la velocidad de las animaciones                        |

## Diseño responsive

El diseño original está calibrado a **1920×1080**. Para llenar cualquier pantalla
sin franjas negras, sin recortes y sin deformar, el CSS define una escala de
diseño:

```css
--s: min(100vw / 1920, 100vh / 1080);
```

Los elementos atómicos (tipografía, aro, celdas, paddings) se expresan en
`calc(N * var(--s))`, de modo que escalan **de forma uniforme** (no se deforman).
El layout —columna central `1fr`, fila superior `1fr`, mapa de calor con celdas
fluidas y SVGs a `width: 100%`— absorbe el espacio sobrante y reflúye a la
proporción de cada pantalla. A 1920×1080, `--s` vale 1px y se ve a tamaño nativo.

