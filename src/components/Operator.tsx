import { useGLTF } from '@react-three/drei'
import { useMemo, useEffect, useRef } from 'react'
import { useSim } from '../state/store'
import { isWorking } from '../sim/schedule'

// Preload modelos (debe estar al nivel del módulo)
useGLTF.preload('/models/trabajador1.glb')
useGLTF.preload('/models/trabajador2.glb')
useGLTF.preload('/models/trabajador3.glb')
useGLTF.preload('/models/trabajador4.glb')

// Contador global para IDs únicos
let instanceCounter = 0

interface Props {
  position?: [number, number, number]
  modelPath?: string // Ruta del modelo a usar
  modelRotation?: [number, number, number] // Rotación adicional específica del modelo (para ajustar la pose)
  modelScale?: number // Escala específica del modelo (por si algunos modelos son más grandes/pequeños)
  modelOffset?: [number, number, number] // Offset adicional para ajustar la posición del modelo
}

/**
 * Operaria estática - sin animaciones, solo modelo 3D
 * Similar a SewingMachine para asegurar múltiples instancias
 */
export function Operator({ 
  position = [0, 0, 0], 
  modelPath = '/models/trabajadira_trabajando.glb',
  modelRotation = [0, 0, 0], // Rotación adicional del modelo mismo
  modelScale = 1, // Escala adicional del modelo mismo
  modelOffset = [0, 0, 0] // Offset adicional del modelo mismo
}: Props) {
  const snap = useSim((s) => s.snap)
  const t = snap.t
  const working = isWorking(t)

  // Crear un ID único persistente para esta instancia usando useRef
  // Usar el modelPath como parte del ID para asegurar que cada modelo tenga su propio ID
  const instanceIdRef = useRef<string | null>(null)
  if (!instanceIdRef.current) {
    const pathKey = modelPath.replace(/[^a-zA-Z0-9]/g, '_')
    instanceIdRef.current = `operator-${instanceCounter++}-${pathKey}-${position[0].toFixed(2)}-${position[2].toFixed(2)}`
  }
  const instanceId = instanceIdRef.current

  // DEBUG: Log solo cuando cambia el estado de trabajo
  useEffect(() => {
    // Log solo cuando cambia working, no en cada frame
    console.log(`[Operator ${instanceId}] Componente montado/actualizado - working:`, working, 'modelPath:', modelPath)
  }, [working, instanceId, modelPath])

  // Usar el modelo especificado (o el default)
  const { scene } = useGLTF(modelPath)
  
  // Usar useRef para almacenar el clon fuera del ciclo de renderizado de React
  // Esto evita que React Three Fiber optimice/una las instancias
  const clonedSceneRef = useRef<any>(null)
  const modelPathRef = useRef<string>(modelPath)
  
  // Si el modelo cambia, recrear el clon
  if (!clonedSceneRef.current || modelPathRef.current !== modelPath) {
    modelPathRef.current = modelPath
    
    // INSPECCIÓN: Analizar la estructura y escalas del modelo original
    const modelInfo: any = {
      path: modelPath,
      rootScale: { x: scene.scale.x, y: scene.scale.y, z: scene.scale.z },
      rootPosition: { x: scene.position.x, y: scene.position.y, z: scene.position.z },
      rootRotation: { x: scene.rotation.x, y: scene.rotation.y, z: scene.rotation.z },
      children: [] as any[]
    }
    
    scene.traverse((child: any) => {
      if (child.isMesh || child.type === 'Group' || child.type === 'Object3D') {
        modelInfo.children.push({
          name: child.name,
          type: child.type,
          isMesh: child.isMesh,
          scale: { x: child.scale.x, y: child.scale.y, z: child.scale.z },
          position: { x: child.position.x, y: child.position.y, z: child.position.z },
          geometry: child.geometry ? { 
            type: child.geometry.type,
            boundingBox: child.geometry.boundingBox 
          } : null
        })
      }
    })
    
    // Log de inspección del modelo
    console.log(`[Operator ${instanceId}] INSPECCIÓN DEL MODELO:`, JSON.stringify(modelInfo, null, 2))
    
    // Calcular maxModelScale del modelo original para el log
    let maxScaleOriginal = 1
    scene.traverse((child: any) => {
      if (child.scale) {
        const maxChildScale = Math.max(Math.abs(child.scale.x), Math.abs(child.scale.y), Math.abs(child.scale.z))
        maxScaleOriginal = Math.max(maxScaleOriginal, maxChildScale)
      }
    })
    console.log(`[Operator ${instanceId}] Escala máxima interna detectada:`, maxScaleOriginal)
    
    // Clonar profundamente toda la jerarquía
    const clone = scene.clone(true)
    
    // NO resetear escalas internas - los modelos pueden tener escalas diferentes que son parte de su diseño
    // Solo clonar materiales y geometrías para evitar compartir referencias
    clone.traverse((child: any) => {
      if (child.isMesh) {
        // Clonar geometría si existe
        if (child.geometry) {
          child.geometry = child.geometry.clone()
          child.geometry.uuid = `${child.geometry.uuid}-${instanceId}`
        }
        
        // Clonar materiales si existen
        if (Array.isArray(child.material)) {
          child.material = child.material.map((mat: any) => {
            const clonedMat = mat.clone()
            clonedMat.uuid = `${clonedMat.uuid}-${instanceId}`
            return clonedMat
          })
        } else if (child.material) {
          child.material = child.material.clone()
          child.material.uuid = `${child.material.uuid}-${instanceId}`
        }
        
        // Asignar UUID único al mesh
        child.uuid = `${child.uuid}-${instanceId}`
      } else {
        // Asignar UUID único a otros objetos
        child.uuid = `${child.uuid}-${instanceId}`
      }
    })
    
    // UUID único para la escena raíz
    clone.uuid = `${clone.uuid}-${instanceId}`
    clone.name = `OperatorScene-${instanceId}`
    
    clonedSceneRef.current = clone
  }
  
  const clonedScene = clonedSceneRef.current

  // Rotar hacia el servidor
  // Los trabajadores están al lado de los servidores, así que deben mirar hacia el centro (hacia el servidor)
  // Trabajadores en la izquierda (X negativo) miran hacia la derecha (+X)
  // Trabajadores en la derecha (X positivo) miran hacia la izquierda (-X)
  const rotation: [number, number, number] = useMemo(() => {
    if (position[0] < 0) {
      // Trabajadores del lado izquierdo: mirar hacia la derecha (hacia el servidor)
      return [0, Math.PI / 2, 0] // Rotar 90 grados para mirar hacia +X
    } else {
      // Trabajadores del lado derecho: mirar hacia la izquierda (hacia el servidor)
      return [0, -Math.PI / 2, 0] // Rotar -90 grados para mirar hacia -X
    }
  }, [position])

  // Calcular escala final - TODOS los trabajadores usan la misma escala: 0.006
  // Esto unifica el tamaño de todos los modelos independientemente de sus escalas internas
  const finalScale = 0.006

  // Solo mostrar trabajadores en horario laboral
  if (!working) {
    return null
  }

  return (
    <group 
      position={position as [number, number, number]} 
      rotation={rotation} 
      scale={finalScale}
      name={instanceId}
      matrixAutoUpdate={true}
    >
      {/* Grupo interno para aplicar ajustes específicos del modelo (pose, rotación, offset) */}
      <group 
        rotation={modelRotation as [number, number, number]}
        position={modelOffset as [number, number, number]}
      >
        <primitive object={clonedScene} dispose={null} />
      </group>
    </group>
  )
}
