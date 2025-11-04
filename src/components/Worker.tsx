// src/components/Worker.tsx
import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';

export type WorkerState = 'idle' | 'walking' | 'working';

export function Worker({ 
  position = [0, 0, 0], 
  state = 'idle' 
}: {
  position?: [number, number, number];
  state?: WorkerState;
}) {
  const modelPath = useMemo(() => {
    switch (state) {
      case 'walking':
        return '/models/trabajadira_caminando.glb';
      case 'working':
        return '/models/trabajadira_trabajando.glb';
      default:
        return '/models/trabajadira_parada.glb';
    }
  }, [state]);

  const { scene } = useGLTF(modelPath);
  const clonedScene = useMemo(() => scene.clone(), [scene, state]);

  return (
    <primitive 
      object={clonedScene} 
      position={position}
      scale={[1, 1, 1]} 
      rotation={[0, 0, 0]}
    />
  );
}

