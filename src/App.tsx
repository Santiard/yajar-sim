// src/App.tsx
import { useEffect, useRef, useState } from 'react';
import { useControls } from 'leva';
import { useSim } from './state/store';
import Scene from './Scene';
import { ConfigScreen } from './components/ConfigScreen';


export default function App(){
const { setParams, tick, reset, params } = useSim();
const last = useRef<number>(performance.now());
const [isSimulating, setIsSimulating] = useState(false);


useEffect(() => {
if (!isSimulating) return; // No iniciar el loop hasta que se presione "Iniciar"
let raf = 0;
const loop = () => {
const now = performance.now();
const dt = (now - last.current) / 1000; // seg reales
last.current = now;
tick(dt);
raf = requestAnimationFrame(loop);
};
raf = requestAnimationFrame(loop);
return () => cancelAnimationFrame(raf);
}, [tick, isSimulating]);


// Controles de Leva - siempre creados pero ocultos durante configuración
// Los controles de Leva se pueden ocultar con CSS o simplemente no se usan
//@ts-ignore
const ctrl = useControls('Parámetros (Durante Simulación)', {
  lambda: { 
    value: params.lambda, 
    min: 0.1, 
    max: 20, 
    step: 0.1,
    onChange: (v) => setParams({ lambda: v }),
  },
  B: { 
    value: params.B, 
    min: 1, 
    max: 50, 
    step: 1,
    onChange: (v) => setParams({ B: v }),
  },
  mu1: { 
    value: params.mu[0], 
    min: 1, 
    max: 200, 
    step: 1,
    onChange: (v) => {
      const current = useSim.getState().params.mu;
      setParams({ mu: [v, current[1], current[2], current[3]] });
    },
  },
  mu2: { 
    value: params.mu[1], 
    min: 1, 
    max: 200, 
    step: 1,
    onChange: (v) => {
      const current = useSim.getState().params.mu;
      setParams({ mu: [current[0], v, current[2], current[3]] });
    },
  },
  mu3: { 
    value: params.mu[2], 
    min: 1, 
    max: 200, 
    step: 1,
    onChange: (v) => {
      const current = useSim.getState().params.mu;
      setParams({ mu: [current[0], current[1], v, current[3]] });
    },
  },
  mu4: { 
    value: params.mu[3], 
    min: 1, 
    max: 200, 
    step: 1,
    onChange: (v) => {
      const current = useSim.getState().params.mu;
      setParams({ mu: [current[0], current[1], current[2], v] });
    },
  },
  speed: { 
    value: params.speed, 
    min: 1, 
    max: 1000, 
    step: 1,
    onChange: (v) => setParams({ speed: v }),
  },
  seed: { 
    value: params.seed, 
    min: 1, 
    max: 999999, 
    step: 1,
    onChange: (v) => {
      setParams({ seed: v });
      setTimeout(() => reset(), 0);
    },
  },
  Reset: { 
    value: false, 
    onChange: (v:boolean)=>{ if(v){ reset(); } },
  },
}, { 
  collapsed: true, 
  order: -1,
  render: () => isSimulating // Solo renderizar controles si está simulando
});


return (
<div style={{ width: '100vw', height: '100vh' }}>
  {/* Ocultar controles de Leva durante configuración con CSS */}
  <style>
    {!isSimulating && `
      [data-leva-root] {
        display: none !important;
      }
    `}
  </style>
  
  {!isSimulating ? (
    <ConfigScreen onStart={() => setIsSimulating(true)} />
  ) : (
    <>
      <Scene />
      {/* Botón para volver a configuración */}
      <button
        onClick={() => {
          setIsSimulating(false);
          reset();
        }}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: 'bold',
          color: 'white',
          background: 'rgba(102, 126, 234, 0.9)',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          zIndex: 100,
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        }}
      >
        Volver a Configuración
      </button>
    </>
  )}
</div>
);
}