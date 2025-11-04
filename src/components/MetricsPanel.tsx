// src/components/MetricsPanel.tsx
import { Html } from '@react-three/drei'
import { useSim } from '../state/store'

export function MetricsPanel() {
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

  return (
    <Html fullscreen>
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'rgba(0, 0, 0, 0.85)',
          color: 'white',
          padding: '16px 20px',
          borderRadius: '12px',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '13px',
          lineHeight: '1.6',
          maxWidth: '380px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          border: '2px solid rgba(255,255,255,0.2)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px', color: '#4CAF50', borderBottom: '2px solid rgba(255,255,255,0.3)', paddingBottom: '8px' }}>
          Métricas en Tiempo Real
        </div>

        {/* Métricas por Servidor */}
        {snap.serverMetrics.map((metrics, index) => (
          <div
            key={index}
            style={{
              marginBottom: '16px',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px', color: '#FFC107' }}>
              Servidor {index + 1}
            </div>
            <div style={{ marginLeft: '8px' }}>
              <div style={{ marginBottom: '4px' }}>
                <strong>Largo de Cola:</strong> {metrics.queueLength} prendas
              </div>
              <div style={{ marginBottom: '4px' }}>
                <strong>Tiempo en Cola (promedio):</strong> {formatTime(metrics.avgQueueTime)}
              </div>
              <div>
                <strong>Tiempo de Servicio (promedio):</strong> {formatTime(metrics.avgServiceTime)}
              </div>
            </div>
          </div>
        ))}

        {/* Métricas del Sistema */}
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            background: 'rgba(76, 175, 80, 0.2)',
            borderRadius: '8px',
            border: '2px solid rgba(76, 175, 80, 0.5)',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px', color: '#4CAF50' }}>
            Sistema Completo
          </div>
          <div style={{ marginLeft: '8px' }}>
            <div style={{ marginBottom: '4px' }}>
              <strong>Cola Total:</strong> {snap.systemMetrics.totalQueueLength} prendas
            </div>
            <div>
              <strong>Tiempo en el Sistema (promedio):</strong> {formatTime(snap.systemMetrics.avgSystemTime)}
            </div>
          </div>
        </div>
      </div>
    </Html>
  )
}

