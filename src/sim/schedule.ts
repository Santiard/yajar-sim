// src/sim/schedule.ts
// Representamos el tiempo en horas continuas desde t=0.
// Dos turnos de 4h por día laboral (lun–sáb) con descansos de 10min cada 2h.
// t=0 corresponde a Lunes 00:00

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export function isDayTime(tHours: number): boolean {
  const hoursPerDay = 24
  const h = tHours % hoursPerDay
  // Consideramos día de 6:00 AM a 8:00 PM (18:00)
  return h >= 6 && h < 20
}

export function formatDateTime(tHours: number): string {
  const hoursPerDay = 24
  const day = Math.floor(tHours / hoursPerDay) % 7
  const h = tHours % hoursPerDay
  const hours = Math.floor(h)
  const minutes = Math.floor((h - hours) * 60)
  
  const dayName = DAY_NAMES[day]
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  const displayMinutes = minutes.toString().padStart(2, '0')
  const timeOfDay = isDayTime(tHours) ? 'Día' : 'Noche'
  
  return `${dayName} ${displayHours}:${displayMinutes} ${ampm} - ${timeOfDay}`
}

export function isWorking(tHours: number): boolean {
    // t=0 es Lunes 00:00, entonces:
    // day 0 = Lunes (0-23h)
    // day 1 = Martes (24-47h)
    // ...
    // day 5 = Sábado (120-143h)
    // day 6 = Domingo (144-167h) - no laboral
    const hoursPerDay = 24;
    const day = Math.floor(tHours / hoursPerDay) % 7; // 0..6
    if (day === 6) return false; // domingo (día 6)
    
    
    // Turnos: 08:00–12:00 y 14:00–18:00 (8h efectivas)
    const h = tHours % hoursPerDay;
    const inShift = (h >= 8 && h < 12) || (h >= 14 && h < 18);
    if (!inShift) return false;
    
    
    // Descansos de 10 min (~0.1667h) cada 2h dentro de cada bloque
    // Bloque 1: [8,12) -> break en [10,10.1667)
    // Bloque 2: [14,18) -> break en [16,16.1667)
    const inBreak = (h >= 10 && h < 10 + 10/60) || (h >= 16 && h < 16 + 10/60);
    return !inBreak;
}

export function getWorkStatus(tHours: number): string {
    const hoursPerDay = 24;
    const day = Math.floor(tHours / hoursPerDay) % 7;
    
    // Domingo - fuera de horario
    if (day === 6) return 'FUERA DE HORARIO LABORAL';
    
    const h = tHours % hoursPerDay;
    const inShift = (h >= 8 && h < 12) || (h >= 14 && h < 18);
    
    // Si no está en turno - fuera de horario
    if (!inShift) return 'FUERA DE HORARIO LABORAL';
    
    // Si está en turno, verificar si está en descanso
    const inBreak = (h >= 10 && h < 10 + 10/60) || (h >= 16 && h < 16 + 10/60);
    if (inBreak) return 'DESCANSO DE ALMUERZO';
    
    // Si está en turno y no en descanso - trabajando
    return 'TRABAJANDO';
}