import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import { QueueBar } from './components/QueueBar'
import { SewingMachine } from './components/SewingMachine'
import { Operator } from './components/Operator'
import { Room } from './components/Room'
import { MetricsPanel } from './components/MetricsPanel'
import { NextArrivalPanel } from './components/NextArrivalPanel'
import { useSim } from './state/store'
import { formatDateTime, getWorkStatus } from './sim/schedule'

export default function Scene() {
  const snap = useSim((s) => s.snap)
  
  // Configuración del cuarto y disposición 2x2
  const roomSize = 12
  const height = 4
  const spacing = 3.5 // espacio entre servidores
  const startX = -spacing * 0.5 // centrar horizontalmente
  const startZ = -spacing * 0.5 // centrar verticalmente

  return (
    <Canvas camera={{ position: [8, 8, 8], fov: 50 }}>
      {/* Iluminación mejorada para el cuarto */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={0.8} castShadow />
      <directionalLight position={[-5, 8, -5]} intensity={0.4} />

      {/* Cuarto */}
      <Room size={roomSize} height={height} />

      {/* Servidores en disposición 2x2 */}
      {/* DEBUG: Log de posiciones */}
      {(() => {
        const pos1 = [startX, 0, startZ - 1] as [number, number, number]
        const pos2 = [startX + spacing, 0, startZ - 1] as [number, number, number]
        const pos3 = [startX, 0, startZ + spacing - 1] as [number, number, number]
        const pos4 = [startX + spacing, 0, startZ + spacing - 1] as [number, number, number]
        console.log('[Scene] Renderizando 4 Operator components con posiciones:', { 
          pos1, 
          pos2, 
          pos3, 
          pos4,
          startX,
          startZ,
          spacing,
          'startX calculado': -spacing * 0.5,
          'startZ calculado': -spacing * 0.5
        })
        return null
      })()}
      
      {/* Fila superior: S1 (izq) y S2 (der) */}
      {/* S1 - Esquina superior izquierda - Trabajador 1 al lado izquierdo del Servidor 1 */}
      <QueueBar position={[startX - 1.5, 0, startZ - 1.5]} length={snap.queues.q1} color="orange" />
      <SewingMachine position={[startX, 0, startZ]} busy={snap.servers[0].busy} />
      <Operator 
        key="operator-s1" 
        position={[startX - 0.3, 0, startZ]} 
        modelPath="/models/trabajador4.glb"
      />

      {/* S2 - Esquina superior derecha - Trabajador 2 al lado derecho del Servidor 2 */}
      <QueueBar position={[startX + spacing - 1.5, 0, startZ - 1.5]} length={snap.queues.q2} color="yellow" />
      <SewingMachine position={[startX + spacing, 0, startZ]} busy={snap.servers[1].busy} />
      <Operator 
        key="operator-s2" 
        position={[startX + spacing + 0.3, 0, startZ]} 
        modelPath="/models/trabajador4.glb"
      />

      {/* Fila inferior: S3 (izq) y S4 (der) */}
      {/* S3 - Esquina inferior izquierda - Trabajador 3 al lado izquierdo del Servidor 3 */}
      <QueueBar position={[startX - 1.5, 0, startZ + spacing - 1.5]} length={snap.queues.q3} color="skyblue" />
      <SewingMachine position={[startX, 0, startZ + spacing]} busy={snap.servers[2].busy} />
      <Operator 
        key="operator-s3" 
        position={[startX - 0.3, 0, startZ + spacing]} 
        modelPath="/models/trabajador4.glb"
      />

      {/* S4 - Esquina inferior derecha - Trabajador 4 al lado derecho del Servidor 4 */}
      <QueueBar position={[startX + spacing - 1.5, 0, startZ + spacing - 1.5]} length={snap.queues.q4} color="lightgreen" />
      <SewingMachine position={[startX + spacing, 0, startZ + spacing]} busy={snap.servers[3].busy} />
      <Operator 
        key="operator-s4" 
        position={[startX + spacing + 0.3, 0, startZ + spacing]} 
        modelPath="/models/trabajador4.glb"
      />

      <OrbitControls makeDefault />
      
      {/* Leyenda grande con día y hora en la pared trasera (del lado de los servidores) */}
      <Html 
        position={[0, height / 2, -roomSize / 2 + 0.1]} 
        transform
        center
      >
        <div
          style={{
            background: 'rgba(0,0,0,0.85)',
            color: 'white',
            padding: '20px 30px',
            borderRadius: 8,
            fontFamily: 'system-ui, sans-serif',
            fontSize: 28,
            fontWeight: 'bold',
            textAlign: 'center',
            border: '3px solid rgba(255,255,255,0.4)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
            minWidth: '400px',
          }}
        >
          <div style={{ marginBottom: '8px' }}>
            {formatDateTime(snap.t)}
          </div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: 'normal',
              marginTop: '8px',
              padding: '8px 16px',
              borderRadius: '4px',
              background: 'rgba(255,255,255,0.1)',
            }}
          >
            {getWorkStatus(snap.t)}
          </div>
        </div>
      </Html>

      {/* Panel de métricas detalladas en esquina superior izquierda */}
      <MetricsPanel />

      {/* Panel de próxima llegada en esquina superior derecha */}
      <NextArrivalPanel />

      {/* Leyenda compacta de métricas básicas en esquina inferior derecha */}
      <Html fullscreen>
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: 8,
            fontFamily: 'system-ui, sans-serif',
            fontSize: 12,
            lineHeight: 1.6,
            minWidth: '200px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: 4, fontSize: 13 }}>
            Resumen
          </div>
          <div>t = {snap.t.toFixed(2)} h</div>
          <div>Throughput ≈ {snap.throughput.toFixed(2)} prendas/h</div>
          <div style={{ marginTop: 8 }}>
            <strong>Colas:</strong> q1={snap.queues.q1} q2={snap.queues.q2} q3={snap.queues.q3} q4={snap.queues.q4}
          </div>
          <div>
            <strong>Servidores:</strong> {snap.servers.map((s, i) => s.busy ? `S${i+1}✓` : `S${i+1}○`).join(' ')}
          </div>
        </div>
      </Html>
    </Canvas>
  )
}
