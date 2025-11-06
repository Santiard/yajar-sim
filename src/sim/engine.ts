// src/sim/engine.ts
//@ts-ignore
import { RNG, exp, geometricMean } from './rng';
import { isWorking } from './schedule';
import { FIFOQueue, Server } from './servers';
import type { Params, Event, Batch, Job, SystemSnapshot } from './types';

export class Engine {
  params: Params;
  rng: RNG;
  t = 0; // horas simuladas
  nextBatchId = 1;
  nextJobId = 1;
  
  // Secuencia fija de tamaños de lote: [200, 150, 50, 200, 150, 50, ...]
  private batchSizes = [200, 150, 50];
  private batchSizeIndex = 0;

  // colas por servidor (en prendas)
  q1 = new FIFOQueue();
  q2 = new FIFOQueue();
  q3 = new FIFOQueue();
  q4 = new FIFOQueue();

  s1: Server; s2: Server; s3: Server; s4: Server;

  // calendario de próximos eventos
  events: Event[] = [];

  // métricas
  departures = 0;
  
  // Métricas acumulativas por servidor
  private queueTimeSum: [number, number, number, number] = [0, 0, 0, 0]; // suma de tiempos en cola
  private serviceTimeSum: [number, number, number, number] = [0, 0, 0, 0]; // suma de tiempos de servicio
  private completedJobs: [number, number, number, number] = [0, 0, 0, 0]; // número de jobs completados
  private systemTimeSum = 0; // suma de tiempos totales en el sistema
  private completedSystemJobs = 0; // número de jobs que salieron del sistema

  constructor(params: Params) {
    this.params = params;
    this.rng = new RNG(params.seed);
    this.s1 = new Server(1, params.mu[0], this.rng);
    this.s2 = new Server(2, params.mu[1], this.rng);
    this.s3 = new Server(3, params.mu[2], this.rng);
    this.s4 = new Server(4, params.mu[3], this.rng);

    // programar primera llegada de lote inmediatamente (t=0)
    this.scheduleFirstArrival();
  }

  setParams(p: Partial<Params>) {
    this.params = { ...this.params, ...p } as Params;
    this.s1.setMu(this.params.mu[0]);
    this.s2.setMu(this.params.mu[1]);
    this.s3.setMu(this.params.mu[2]);
    this.s4.setMu(this.params.mu[3]);
    // speed se actualiza automáticamente porque se lee de this.params en step()
  }

  private getNextBatchSize(): number {
    // Obtener el siguiente tamaño de lote de la secuencia fija
    const size = this.batchSizes[this.batchSizeIndex];
    this.batchSizeIndex = (this.batchSizeIndex + 1) % this.batchSizes.length; // Ciclar la secuencia
    return size;
  }

  private scheduleFirstArrival() {
    // Primera llegada inmediatamente al inicio (t=0)
    const size = this.getNextBatchSize();
    const batch: Batch = { id: this.nextBatchId++, size, arrivalTime: 0 };
    this.events.push({ t: 0, type: 'ARRIVAL', batch });
    this.sortEvents();
    // DEBUG: Log para verificar que se programan llegadas
    console.log(`[Engine] Primera llegada programada: Batch ${batch.id} con ${size} prendas en t=0 (inmediata)`);
    
    // Programar la siguiente llegada con la distribución normal
    this.scheduleNextArrival();
  }

  private scheduleNextArrival() {
    const ia = exp(this.rng, this.params.lambda); // horas entre lotes
    const tA = this.t + ia;
    const size = this.getNextBatchSize();
    const batch: Batch = { id: this.nextBatchId++, size, arrivalTime: tA };
    this.events.push({ t: tA, type: 'ARRIVAL', batch });
    this.sortEvents();
    // DEBUG: Log para verificar que se programan llegadas
    console.log(`[Engine] Llegada programada: Batch ${batch.id} con ${size} prendas en t=${tA.toFixed(2)}h (en ${ia.toFixed(2)}h desde ahora)`);
  }

  private sortEvents() {
    this.events.sort((a, b) => a.t - b.t);
  }

  private enqueueBatchAtS1(batch: Batch) {
    for (let k = 0; k < batch.size; k++) {
      const job: Job = { 
        id: this.nextJobId++, 
        batchId: batch.id, 
        enterTime: this.t,
        queueStartTime: this.t // cuando entra a la cola de S1
      };
      this.q1.push(job);
    }
  }

  private tryStartAll(t: number) {
    if (isWorking(t)) {
      const t1 = this.s1.maybeStart(t, this.q1); if (t1) this.events.push({ t: t1, type: 'DEPARTURE', server: 1 });
      const t2 = this.s2.maybeStart(t, this.q2); if (t2) this.events.push({ t: t2, type: 'DEPARTURE', server: 2 });
      const t3 = this.s3.maybeStart(t, this.q3); if (t3) this.events.push({ t: t3, type: 'DEPARTURE', server: 3 });
      const t4 = this.s4.maybeStart(t, this.q4); if (t4) this.events.push({ t: t4, type: 'DEPARTURE', server: 4 });
      this.sortEvents();
    }
  }

  /**
   * Avanza la simulación un paso de tiempo real (segundos),
   * escalado por params.speed a horas simuladas.
   */
  step(dtRealSeconds: number) {
    const dt = (dtRealSeconds / 3600) * this.params.speed; // horas simuladas
    const target = this.t + dt;
    
    // Detectar si estamos entrando en horario laboral
    //@ts-ignore
    const wasWorking = isWorking(this.t);

    while (true) {
      const ev = this.events[0];
      // si no hay evento o cae después del target, avanzar y salir
      if (!ev || ev.t > target) { 
        const prevT = this.t;
        this.t = target; 
        
        // Verificar si cruzamos el umbral de horario laboral durante el avance continuo
        // Esto es necesario porque podemos pasar de t=7.99 a t=8.01 sin eventos intermedios
        const prevWorking = isWorking(prevT);
        const nowWorking = isWorking(this.t);
        
        // Si cruzamos el umbral de horario laboral (de no-trabajando a trabajando)
        if (!prevWorking && nowWorking) {
          // Entramos en horario laboral - procesar colas pendientes
          this.tryStartAll(this.t);
        }
        
        break; 
      }

      // saltar al tiempo del evento
      const prevT = this.t;
this.t = ev.t;
      
      // Verificar si cruzamos el umbral de horario laboral
      const prevWorking = isWorking(prevT);
      const currWorking = isWorking(this.t);
      if (!prevWorking && currWorking) {
        // Entramos en horario laboral - procesar colas pendientes
        this.tryStartAll(this.t);
      }
      
this.events.shift();

switch (ev.type) {
        case 'ARRIVAL': {
          // llegada de lote a S1
          const batch = ev.batch!;
          console.log(`[Engine] ⚡ LLEGADA de Batch ${batch.id}: ${batch.size} prendas en t=${this.t.toFixed(2)}h`);
          this.enqueueBatchAtS1(batch);
          this.scheduleNextArrival();
          this.tryStartAll(this.t);
          break;
        }
case 'DEPARTURE': {
// terminación en servidor i -> encola en i+1 o salida
const s = ev.server!;
let done: Job | undefined;
          if (s === 1) { 
            done = this.s1.finish(this.t); 
            if (done) {
              // Calcular tiempo en cola y servicio de S1
              if (done.queueStartTime !== undefined && done.serviceStartTime !== undefined) {
                const queueTime = done.serviceStartTime - done.queueStartTime;
                this.queueTimeSum[0] += queueTime;
              }
              if (done.serviceTime !== undefined) {
                this.serviceTimeSum[0] += done.serviceTime;
                this.completedJobs[0]++;
              }
              // Resetear para el siguiente servidor
              done.queueStartTime = this.t; // entra a cola de S2
              this.q2.push(done);
            }
          }
          if (s === 2) { 
            done = this.s2.finish(this.t); 
            if (done) {
              if (done.queueStartTime !== undefined && done.serviceStartTime !== undefined) {
                const queueTime = done.serviceStartTime - done.queueStartTime;
                this.queueTimeSum[1] += queueTime;
              }
              if (done.serviceTime !== undefined) {
                this.serviceTimeSum[1] += done.serviceTime;
                this.completedJobs[1]++;
              }
              done.queueStartTime = this.t; // entra a cola de S3
              this.q3.push(done);
            }
          }
          if (s === 3) { 
            done = this.s3.finish(this.t); 
            if (done) {
              if (done.queueStartTime !== undefined && done.serviceStartTime !== undefined) {
                const queueTime = done.serviceStartTime - done.queueStartTime;
                this.queueTimeSum[2] += queueTime;
              }
              if (done.serviceTime !== undefined) {
                this.serviceTimeSum[2] += done.serviceTime;
                this.completedJobs[2]++;
              }
              done.queueStartTime = this.t; // entra a cola de S4
              this.q4.push(done);
            }
          }
          if (s === 4) { 
            done = this.s4.finish(this.t); 
            if (done) {
              // Calcular métricas de S4
              if (done.queueStartTime !== undefined && done.serviceStartTime !== undefined) {
                const queueTime = done.serviceStartTime - done.queueStartTime;
                this.queueTimeSum[3] += queueTime;
              }
              if (done.serviceTime !== undefined) {
                this.serviceTimeSum[3] += done.serviceTime;
                this.completedJobs[3]++;
              }
              // Calcular tiempo total en el sistema
              const systemTime = this.t - done.enterTime;
              this.systemTimeSum += systemTime;
              this.completedSystemJobs++;
              this.departures++;
            }
          }
this.tryStartAll(this.t);
break;
}
}
}
}

snapshot(): SystemSnapshot {
const utiliz: [number, number, number, number] = [
this.s1.utilization(this.t),
this.s2.utilization(this.t),
this.s3.utilization(this.t),
this.s4.utilization(this.t),
];

const throughput = this.departures / Math.max(this.t, 1e-9); // prendas/hora promedio

    // Calcular métricas por servidor
    //@ts-ignore
    const serverMetrics: [ServerMetrics, ServerMetrics, ServerMetrics, ServerMetrics] = [
      {
        queueLength: this.q1.length(),
        avgQueueTime: this.completedJobs[0] > 0 ? this.queueTimeSum[0] / this.completedJobs[0] : 0,
        avgServiceTime: this.completedJobs[0] > 0 ? this.serviceTimeSum[0] / this.completedJobs[0] : 0,
      },
      {
        queueLength: this.q2.length(),
        avgQueueTime: this.completedJobs[1] > 0 ? this.queueTimeSum[1] / this.completedJobs[1] : 0,
        avgServiceTime: this.completedJobs[1] > 0 ? this.serviceTimeSum[1] / this.completedJobs[1] : 0,
      },
      {
        queueLength: this.q3.length(),
        avgQueueTime: this.completedJobs[2] > 0 ? this.queueTimeSum[2] / this.completedJobs[2] : 0,
        avgServiceTime: this.completedJobs[2] > 0 ? this.serviceTimeSum[2] / this.completedJobs[2] : 0,
      },
      {
        queueLength: this.q4.length(),
        avgQueueTime: this.completedJobs[3] > 0 ? this.queueTimeSum[3] / this.completedJobs[3] : 0,
        avgServiceTime: this.completedJobs[3] > 0 ? this.serviceTimeSum[3] / this.completedJobs[3] : 0,
      },
    ];

    // Métricas del sistema
    const totalQueueLength = this.q1.length() + this.q2.length() + this.q3.length() + this.q4.length();
    const avgSystemTime = this.completedSystemJobs > 0 ? this.systemTimeSum / this.completedSystemJobs : 0;

    // Encontrar próxima llegada programada
    const nextArrival = this.events.find(e => e.type === 'ARRIVAL');
    const nextArrivalTime = nextArrival ? nextArrival.t : undefined;

return {
t: this.t,
queues: { q1: this.q1.length(), q2: this.q2.length(), q3: this.q3.length(), q4: this.q4.length() },
servers: [
{ busy: this.s1.busy, job: this.s1.current },
{ busy: this.s2.busy, job: this.s2.current },
{ busy: this.s3.busy, job: this.s3.current },
{ busy: this.s4.busy, job: this.s4.current },
],
throughput,
utiliz,
      serverMetrics,
      systemMetrics: {
        totalQueueLength,
        avgSystemTime,
      },
      nextArrivalTime,
};
}
}
