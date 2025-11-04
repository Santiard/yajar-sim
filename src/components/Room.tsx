// src/components/Room.tsx

interface RoomProps {
  size?: number // tamaño del cuarto (default: 12 unidades)
  height?: number // altura del cuarto (default: 4 unidades)
}

export function Room({ size = 12, height = 4 }: RoomProps) {
  const wallMaterial = { color: '#e8e8e8', roughness: 0.8 }
  const floorMaterial = { color: '#d4d4d4', roughness: 0.9 }
  const ceilingMaterial = { color: '#f0f0f0', roughness: 0.7 }

  const halfSize = size / 2
  const wallThickness = 0.1
  const lowWallHeight = 0.5 // altura de las paredes bajas

  return (
    <group>
      {/* Piso */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial {...floorMaterial} />
      </mesh>

      {/* Techo */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial {...ceilingMaterial} />
      </mesh>

      {/* Pared trasera (Z negativo) - ALTA - donde va la leyenda */}
      <mesh position={[0, height / 2, -halfSize]} rotation={[0, 0, 0]}>
        <boxGeometry args={[size, height, wallThickness]} />
        <meshStandardMaterial {...wallMaterial} />
      </mesh>

      {/* Pared frontal (Z positivo) - BAJA */}
      <mesh position={[0, lowWallHeight / 2, halfSize]} rotation={[0, 0, 0]}>
        <boxGeometry args={[size, lowWallHeight, wallThickness]} />
        <meshStandardMaterial {...wallMaterial} />
      </mesh>

      {/* Pared izquierda (X negativo) - BAJA */}
      <mesh position={[-halfSize, lowWallHeight / 2, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[wallThickness, lowWallHeight, size]} />
        <meshStandardMaterial {...wallMaterial} />
      </mesh>

      {/* Pared derecha (X positivo) - BAJA */}
      <mesh position={[halfSize, lowWallHeight / 2, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[wallThickness, lowWallHeight, size]} />
        <meshStandardMaterial {...wallMaterial} />
      </mesh>
    </group>
  )
}

