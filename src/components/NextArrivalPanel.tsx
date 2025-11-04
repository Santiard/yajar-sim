// src/components/NextArrivalPanel.tsx
import { Html } from '@react-three/drei'
import { useSim } from '../state/store'

export function NextArrivalPanel() {
  const snap = useSim((s) => s.snap)

  // Convertir horas a formato legible (horas, minutos, segundos)
  const formatTime = (hours: number): string => {
    if (hours === 0) return '0.00 h'
    const totalSeconds = hours * 3600
    const h = Math.floor(hours)
    const m = Math.floor((hours - h) * 60)
    const s = Math.floor((totalSeconds - h * 3600 - m * 60))
    
    if (h > 0) {
      return `${h}h ${m}m ${s}s`
    } else if (m > 0) {
      return `${m}m ${s}s`
    } else {
      return `${hours.toFixed(3)} h`
    }
  }

  if (snap.nextArrivalTime === undefined) {
    return null
  }

  const timeUntilArrival = snap.nextArrivalTime - snap.t

  return (
    <Html fullscreen>
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(0, 0, 0, 0.85)',
          color: 'white',
          padding: '16px 20px',
          borderRadius: '12px',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '14px',
          lineHeight: '1.6',
          minWidth: '280px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          border: '2px solid rgba(255,255,255,0.2)',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px', color: '#FFC107', borderBottom: '2px solid rgba(255,255,255,0.3)', paddingBottom: '8px' }}>
          Próxima Llegada
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>Tiempo Simulado:</strong> t = {snap.nextArrivalTime.toFixed(2)} h
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>Tiempo Actual:</strong> t = {snap.t.toFixed(2)} h
        </div>
        <div style={{ 
          padding: '10px', 
          background: 'rgba(255, 193, 7, 0.2)', 
          borderRadius: '6px', 
          border: '2px solid rgba(255, 193, 7, 0.5)',
          marginTop: '8px'
        }}>
          <div style={{ fontSize: '15px', color: '#FFC107', fontWeight: 'bold' }}>
            Tiempo Restante: {formatTime(timeUntilArrival)}
          </div>
        </div>
      </div>
    </Html>
  )
}

