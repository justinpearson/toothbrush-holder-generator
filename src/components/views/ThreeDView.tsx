import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { HolderParams } from '../../model/types';
import { HolderScene } from '../three/HolderScene';

/** Interactive 3D preview. Camera distance scales with the model size. */
export function ThreeDView({ params }: { params: HolderParams }) {
  const reach = Math.max(params.baseLength, params.baseDepth, 100);

  return (
    <div className="view-3d" data-testid="three-view">
      <Canvas
        shadows
        camera={{ position: [reach * 0.8, reach * 0.7, reach * 0.9], fov: 45 }}
      >
        <color attach="background" args={['#fbf8e8']} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[1, 2, 1.5]} intensity={1.1} castShadow />
        <directionalLight position={[-1, 0.5, -1]} intensity={0.3} />
        <HolderScene params={params} />
        <OrbitControls makeDefault enablePan target={[0, params.baseHeight, 0]} />
      </Canvas>
    </div>
  );
}
