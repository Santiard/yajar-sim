// src/state/store.ts
import { create } from 'zustand';
import { Engine } from '../sim/engine';
import type { Params, SystemSnapshot } from '../sim/types';


const defaultParams: Params = {
  lambda: 0.022107, // lotes/hora (tasa de llegada observada)
  B: 133.3333, // prendas por lote (media observada)
  mu: [41.5420, 56.8200, 56.8200, 72.0000], // prendas/hora por servidor (valores reales: S1 cama plana, S2 fileteadora, S3 collarete, S4 plancha)
  speed: 500, // 500x: 500 horas sim por 1 hora real → velocidad más rápida
  seed: 1234,
};


export type SimState = {
params: Params;
engine: Engine;
snap: SystemSnapshot;
setParams: (p: Partial<Params>) => void;
tick: (dt: number) => void; // dt en segundos reales
reset: () => void;
};


export const useSim = create<SimState>((set, get) => {
const engine = new Engine(defaultParams);
return {
params: defaultParams,
engine,
snap: engine.snapshot(),
setParams: (p) => {
const { engine, params } = get();
const merged = { ...params, ...p } as Params;
engine.setParams(merged);
set({ params: merged });
},
tick: (dt) => {
const { engine } = get();
engine.step(dt);
set({ snap: engine.snapshot() });
},
reset: () => {
const { params } = get();
const e = new Engine(params);
set({ engine: e, snap: e.snapshot() });
},
};
});