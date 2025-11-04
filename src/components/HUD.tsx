// src/components/HUD.tsx
import { Html } from '@react-three/drei';
import { useSim } from '../state/store';


export function HUD(){
const snap = useSim(s => s.snap);
return (
<Html fullscreen>
<div style={{ position:'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.55)', color:'#fff', padding:12, borderRadius:12, fontFamily:'system-ui' }}>
<div>ρ = [{snap.utiliz.map(u=>u.toFixed(2)).join(', ')}]</div>
</div>
</Html>
);
}