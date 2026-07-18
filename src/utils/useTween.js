import { useState, useRef, useEffect } from 'react';
import { easeOutCubic } from './helpers';

// Anima un valor numérico hacia `target` con easing en `dur` ms, partiendo
// del último valor mostrado (arranca desde 0 en el primer render).
export function useTween(target, dur) {
  const [v, setV] = useState(0);
  const ref = useRef(0);
  useEffect(() => {
    const from = ref.current;
    const to = target;
    const t0 = performance.now();
    let raf;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const val = from + (to - from) * easeOutCubic(k);
      ref.current = val;
      setV(val);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return v;
}
