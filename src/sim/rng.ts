// src/sim/rng.ts
export class RNG {
    private s: number;
    constructor(seed = 1) { this.s = seed >>> 0; }
    // xorshift32
    next() {
    let x = this.s;
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    this.s = x >>> 0;
    return this.s / 0xffffffff;
    }
    }
    
    
    export const exp = (rng: RNG, rate: number) => {
    // devuelve un tiempo ~ Expon(rate) en horas
    const u = Math.max(rng.next(), 1e-9);
    return -Math.log(u) / Math.max(rate, 1e-9);
    };
    
    
    export const geometricMean = (rng: RNG, mean: number) => {
    // Mx: tamaño de lote ~ Geom(p) con media "mean" => p = 1/mean
    const p = 1 / Math.max(mean, 1e-6);
    // devuelve soporte {1,2,...}
    const u = rng.next();
    return Math.max(1, Math.ceil(Math.log(1 - u) / Math.log(1 - p)));
    };