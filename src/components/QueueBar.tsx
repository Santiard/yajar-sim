// src/components/QueueBar.tsx
import { Html } from '@react-three/drei';


export function QueueBar({ position=[0,0,0], length, color='orange' }:{
position?: any; length: number; color?: string;
}){
const h = Math.min(4, 0.1 * length); // altura proporcional al largo de cola
return (
<group position={position}>
<mesh position={[0, h/2, 0]}>
<boxGeometry args={[0.8, Math.max(0.05, h), 0.8]} />
<meshStandardMaterial color={color} />
</mesh>
<Html position={[0, Math.max(h,0.2)+0.4, 0]} center>
<div style={{ background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 6px', borderRadius: 6, fontSize: 12 }}>
{length} en cola
</div>
</Html>
</group>
);
}