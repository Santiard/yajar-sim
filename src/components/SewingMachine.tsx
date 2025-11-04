import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'

// Preload modelo (debe estar al nivel del módulo)
useGLTF.preload('/models/maquina.glb')

interface Props {
  position?: [number, number, number]
  busy?: boolean
}

/**
 * Componente de la máquina de coser.
 * - Usa el modelo 3D real (maquina.glb)
 * - Cambia el color de la base si está ocupada
 */
export function SewingMachine({
  position = [0, 0, 0],
  busy = false,
}: Props) {
  const { scene } = useGLTF('/models/maquina.glb')
  // Clonar la escena para evitar problemas con múltiples instancias
  const clonedScene = useMemo(() => scene.clone(), [scene])

  return (
    <group position={position as [number, number, number]} scale={0.6}>
      <primitive object={clonedScene} />
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.2, 0.05, 0.8]} />
        <meshStandardMaterial color={busy ? 'tomato' : '#4caf50'} />
      </mesh>
    </group>
  )
}
