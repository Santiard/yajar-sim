// src/sim/types.ts
export type ServerId = 1 | 2 | 3 | 4;


export interface Params {
lambda: number; // tasa de llegadas (lotes/hora)
B: number; // tamaño medio de lote (Mx)
mu: [number, number, number, number]; // tasas de servicio por servidor (prendas/hora)
speed: number; // factor de aceleración del tiempo simulado
seed: number; // semilla RNG
}


export interface Job {
id: number;
batchId: number;
enterTime: number; // tiempo simulado (horas) - cuando entra al sistema (S1)
queueStartTime?: number; // tiempo cuando entra a la cola de un servidor específico
serviceStartTime?: number; // tiempo cuando inicia servicio en un servidor
serviceTime?: number; // duración del servicio en un servidor (horas)
}


export interface Batch {
id: number;
size: number; // número de prendas en el lote
arrivalTime: number;
}


export interface Event {
t: number; // tiempo simulado (horas)
type: 'ARRIVAL' | 'DEPARTURE';
server?: ServerId;
batch?: Batch;
job?: Job;
}


export interface QueueState {
q1: number; q2: number; q3: number; q4: number; // largos de cola (prendas)
}


export interface ServerState {
busy: boolean;
job?: Job;
}


export interface ServerMetrics {
queueLength: number; // largo de cola actual
avgQueueTime: number; // tiempo promedio en cola (horas)
avgServiceTime: number; // tiempo promedio de servicio (horas)
}

export interface SystemMetrics {
totalQueueLength: number; // suma de todas las colas
avgSystemTime: number; // tiempo promedio en el sistema (horas)
}

export interface SystemSnapshot {
t: number;
queues: QueueState;
servers: [ServerState, ServerState, ServerState, ServerState];
throughput: number; // prendas/hora instantáneo (suavizado)
utiliz: [number, number, number, number]; // utilización estimada
serverMetrics: [ServerMetrics, ServerMetrics, ServerMetrics, ServerMetrics];
systemMetrics: SystemMetrics;
nextArrivalTime?: number; // tiempo de la próxima llegada programada (horas)
}