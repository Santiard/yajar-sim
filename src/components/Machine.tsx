// src/components/Machine.tsx
import { useGLTF, Html } from '@react-three/drei';
import { Vector3 } from 'three';
import { useMemo } from 'react';

export function Machine({ position = [0,0,0] as unknown as Vector3, label, busy }:{
position?: any; label: string; busy: boolean;
}) {
const { scene } = useGLTF('/models/maquina.glb');
const clonedScene = useMemo(() => scene.clone(), [scene]);

return (
<group position={position}>
<primitive 
object={clonedScene} 
scale={[1, 1, 1]} 
rotation={[0, 0, 0]}
/>
{/* Indicador visual de estado (opcional, puedes quitar esto si prefieres) */}
{!busy && (
<mesh position={[0, 1.5, 0]}>
<sphereGeometry args={[0.15, 16, 16]} />
<meshStandardMaterial color="green" emissive="green" emissiveIntensity={0.5} />
</mesh>
)}
<Html position={[0, 1.8, 0]} center>
<div style={{
background: 'rgba(255,255,255,0.8)', padding: '4px 8px', borderRadius: 6,
fontFamily: 'system-ui, sans-serif', fontSize: 12
}}>{label}</div>
</Html>
</group>
);
}