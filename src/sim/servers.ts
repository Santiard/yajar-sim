// src/sim/servers.ts
import { RNG, exp } from './rng';
import type { Job, ServerId } from './types';


export class FIFOQueue {
private data: Job[] = [];
push(j: Job) { this.data.push(j); }
shift(): Job | undefined { return this.data.shift(); }
length() { return this.data.length; }
}


export class Server {
readonly id: ServerId;
private mu: number; // prendas/hora
private rng: RNG;
busy = false;
current?: Job;
busyTimeAcc = 0; // para utilización
private lastUpdateT = 0;


constructor(id: ServerId, mu: number, rng: RNG) {
this.id = id; this.mu = mu; this.rng = rng;
}


setMu(mu: number) { this.mu = mu; }


maybeStart(t: number, q: FIFOQueue): number | null {
// si libre y hay en cola, iniciar servicio y devolver tiempo de terminación
if (!this.busy && q.length() > 0) {
const job = q.shift()!;
this.busy = true;
this.current = job;
this.lastUpdateT = t;
const svc = exp(this.rng, this.mu); // horas
// Registrar tiempos de servicio
job.serviceStartTime = t;
job.serviceTime = svc;
return t + svc;
}
return null;
}


finish(t: number) {
if (this.busy) {
this.busyTimeAcc += (t - this.lastUpdateT);
this.busy = false;
const done = this.current; this.current = undefined;
return done;
}
return undefined;
}


utilization(t: number): number {
const total = Math.max(t, 1e-9);
const extra = this.busy ? (t - this.lastUpdateT) : 0;
return Math.min(1, (this.busyTimeAcc + extra) / total);
}
}