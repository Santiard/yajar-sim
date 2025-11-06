// src/components/ConfigScreen.tsx
import { useState } from 'react'
import { useSim } from '../state/store'

interface ConfigScreenProps {
  onStart: () => void
}

export function ConfigScreen({ onStart }: ConfigScreenProps) {
  const { params, setParams } = useSim()
  const [localParams, setLocalParams] = useState(() => ({ ...params })) // Copiar para no mutar el original

  // Calcular si el sistema es estable
  const effectiveArrivalRate = localParams.lambda * localParams.B // prendas/hora
  const systemCapacity = Math.min(...localParams.mu) // capacidad del sistema (cuello de botella)
  const isStable = effectiveArrivalRate < systemCapacity
  const utilization = effectiveArrivalRate / systemCapacity // utilización del cuello de botella

  const handleChange = (key: keyof typeof localParams, value: any) => {
    if (key === 'mu') {
      // Para mu, value será un array o un valor individual con índice
      return
    }
    setLocalParams(prev => ({ ...prev, [key]: value }))
  }

  const handleMuChange = (index: number, value: number) => {
    setLocalParams(prev => ({
      ...prev,
      mu: prev.mu.map((v, i) => i === index ? parseFloat(value.toString()) : v)
    }))
  }

  const handleStart = () => {
    // Validar estabilidad antes de iniciar
    if (!isStable) {
      alert('⚠️ El sistema no es estable. La tasa de llegada efectiva no puede ser mayor o igual a la capacidad del sistema.')
      return
    }
    // Aplicar todos los parámetros antes de iniciar
    setParams(localParams)
    onStart()
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        fontFamily: 'system-ui, sans-serif',
        overflow: 'auto',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '30px',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          maxWidth: '700px',
          width: '100%',
          maxHeight: '95vh',
          overflowY: 'auto',
          margin: 'auto',
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: '20px', color: '#333', fontSize: '24px', textAlign: 'center' }}>
          Configuración de Simulación
        </h1>

        <div style={{ marginBottom: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333', fontSize: '16px' }}>
            Lambda (λ): {localParams.lambda} lotes/hora
          </label>
          <p style={{ marginTop: '4px', marginBottom: '12px', fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
            <strong>¿Qué es?</strong> Tasa de llegada de lotes al sistema. Representa cuántos lotes de prendas llegan por hora en promedio.
            <br />
            <strong>Ejemplo:</strong> Si λ = 0.022107, significa que en promedio llegan aproximadamente 0.022 lotes cada hora (1 lote cada ~45 horas).
          </p>
          <input
            type="range"
            min="0.001"
            max="0.1"
            step="0.0001"
            value={localParams.lambda}
            onChange={(e) => handleChange('lambda', parseFloat(e.target.value))}
            style={{ width: '100%', marginBottom: '4px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888' }}>
            <span>0.001</span>
            <span>0.1</span>
          </div>
        </div>

        {/* Indicador de estabilidad del sistema */}
        <div style={{ 
          marginBottom: '24px', 
          padding: '16px', 
          background: isStable ? '#e8f5e9' : '#ffebee', 
          borderRadius: '8px', 
          border: `2px solid ${isStable ? '#4caf50' : '#f44336'}` 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ 
              fontSize: '20px', 
              marginRight: '8px' 
            }}>
              {isStable ? '✅' : '⚠️'}
            </span>
            <label style={{ 
              fontWeight: 'bold', 
              color: isStable ? '#2e7d32' : '#c62828', 
              fontSize: '16px' 
            }}>
              {isStable ? 'Sistema Estable' : 'Sistema Inestable'}
            </label>
          </div>
          <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '4px' }}>
              <strong>Tasa de llegada efectiva:</strong> {effectiveArrivalRate.toFixed(4)} prendas/hora
              <br />
              <span style={{ fontSize: '12px', color: '#666' }}>
                (λ × B = {localParams.lambda.toFixed(6)} × {localParams.B.toFixed(2)})
              </span>
            </div>
            <div style={{ marginBottom: '4px' }}>
              <strong>Capacidad del sistema:</strong> {systemCapacity.toFixed(4)} prendas/hora
              <br />
              <span style={{ fontSize: '12px', color: '#666' }}>
                (Servidor más lento: μ = {systemCapacity.toFixed(4)})
              </span>
            </div>
            <div style={{ marginBottom: '4px' }}>
              <strong>Utilización del cuello de botella:</strong> {(utilization * 100).toFixed(2)}%
            </div>
            {!isStable && (
              <div style={{ 
                marginTop: '12px', 
                padding: '10px', 
                background: '#fff3cd', 
                borderRadius: '6px', 
                border: '1px solid #ffc107',
                fontSize: '13px',
                color: '#856404'
              }}>
                <strong>⚠️ Advertencia:</strong> La tasa de llegada efectiva ({effectiveArrivalRate.toFixed(4)} prendas/hora) 
                es mayor o igual a la capacidad del sistema ({systemCapacity.toFixed(4)} prendas/hora). 
                Esto causará que las colas crezcan indefinidamente. Por favor, ajuste los parámetros para que el sistema sea estable.
              </div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333', fontSize: '16px' }}>
            B (Tamaño promedio del lote): {localParams.B} prendas
          </label>
          <p style={{ marginTop: '4px', marginBottom: '12px', fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
            <strong>¿Qué es?</strong> Cantidad promedio de prendas que contiene cada lote que llega al sistema.
            <br />
            <strong>Ejemplo:</strong> Si B = 133.33, cada lote contiene en promedio 133 prendas. Con λ = 0.022107 lotes/hora, llegarían aproximadamente 2.95 prendas/hora (0.022107 × 133.33).
          </p>
          <input
            type="range"
            min="10"
            max="250"
            step="1"
            value={localParams.B}
            onChange={(e) => handleChange('B', parseInt(e.target.value))}
            style={{ width: '100%', marginBottom: '4px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888' }}>
            <span>10</span>
            <span>250</span>
          </div>
        </div>

        <div style={{ marginBottom: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333', fontSize: '16px' }}>
            Mu (μ) - Velocidad de procesamiento por servidor:
          </label>
          <p style={{ marginTop: '4px', marginBottom: '16px', fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
            <strong>¿Qué es?</strong> Tasa de servicio de cada estación de trabajo. Representa cuántas prendas puede procesar cada servidor por hora.
            <br />
            <strong>Flujo:</strong> S1 (Cama Plana) → S2 (Fileteadora) → S3 (Collarete) → S4 (Plancha) (salida)
          </p>
          {localParams.mu.map((mu, index) => {
            const serverNames = ['S1: Cama Plana', 'S2: Fileteadora', 'S3: Collarete', 'S4: Plancha']
            return (
              <div key={index} style={{ marginBottom: '16px', padding: '12px', background: 'white', borderRadius: '6px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#333', fontWeight: '600' }}>
                  {serverNames[index]} (μ{index + 1}): {mu.toFixed(4)} prendas/hora
                </label>
              <input
                type="range"
                min="10"
                max="150"
                step="0.1"
                value={mu}
                onChange={(e) => handleMuChange(index, parseFloat(e.target.value))}
                style={{ width: '100%', marginBottom: '4px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888' }}>
                <span>10</span>
                <span>150</span>
              </div>
            </div>
            )
          })}
        </div>

        <div style={{ marginBottom: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333', fontSize: '16px' }}>
            Velocidad de Simulación: {localParams.speed}x
          </label>
          <p style={{ marginTop: '4px', marginBottom: '12px', fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
            <strong>¿Qué es?</strong> Factor de aceleración de la simulación. Multiplica la velocidad del tiempo simulado.
            <br />
            <strong>Ejemplo:</strong> Con speed = 500x, cada segundo real equivale a 500 horas simuladas. Permite ver resultados más rápido.
          </p>
          <input
            type="range"
            min="1"
            max="1000"
            step="1"
            value={localParams.speed}
            onChange={(e) => handleChange('speed', parseInt(e.target.value))}
            style={{ width: '100%', marginBottom: '4px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888' }}>
            <span>1x (tiempo real)</span>
            <span>1000x (muy rápido)</span>
          </div>
        </div>

        <div style={{ marginBottom: '30px', padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333', fontSize: '16px' }}>
            Seed (Semilla): {localParams.seed}
          </label>
          <p style={{ marginTop: '4px', marginBottom: '12px', fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
            <strong>¿Qué es?</strong> Número que inicializa el generador de números aleatorios. Con la misma seed, la simulación produce los mismos resultados (reproducible).
            <br />
            <strong>Uso:</strong> Cambia la seed para obtener diferentes escenarios aleatorios, o mantén la misma para comparar resultados.
          </p>
          <input
            type="number"
            min="1"
            max="999999"
            value={localParams.seed}
            onChange={(e) => handleChange('seed', parseInt(e.target.value) || 1)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '2px solid #ddd',
              fontSize: '16px',
            }}
          />
        </div>

        <button
          onClick={handleStart}
          disabled={!isStable}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '18px',
            fontWeight: 'bold',
            color: 'white',
            background: isStable 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
              : 'linear-gradient(135deg, #9e9e9e 0%, #757575 100%)',
            border: 'none',
            borderRadius: '8px',
            cursor: isStable ? 'pointer' : 'not-allowed',
            boxShadow: isStable 
              ? '0 4px 15px rgba(102, 126, 234, 0.4)' 
              : '0 2px 5px rgba(0, 0, 0, 0.2)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            opacity: isStable ? 1 : 0.6,
          }}
          onMouseOver={(e) => {
            if (isStable) {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)'
            }
          }}
          onMouseOut={(e) => {
            if (isStable) {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)'
            }
          }}
        >
          {isStable ? 'Iniciar Simulación' : 'Sistema Inestable - Ajuste los Parámetros'}
        </button>
      </div>
    </div>
  )
}

