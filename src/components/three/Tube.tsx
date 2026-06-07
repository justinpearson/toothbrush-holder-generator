import { useMemo } from 'react';
import * as THREE from 'three';
import { buildTubeProfile } from '../../geometry/tubeProfile';
import type { DerivedTube } from '../../model/types';

interface TubeProps {
  tube: DerivedTube;
  wallThickness: number;
  baseTop: number;
  fn: number;
}

/** One hollow blind tube, built as a revolved (lathe) solid. */
export function Tube({ tube, wallThickness, baseTop, fn }: TubeProps) {
  const geometry = useMemo(() => {
    const profile = buildTubeProfile({
      outerDiameter: tube.outerDiameter,
      height: tube.height,
      wallThickness,
    });
    return new THREE.LatheGeometry(profile, fn);
  }, [tube.outerDiameter, tube.height, wallThickness, fn]);

  return (
    <mesh
      position={[tube.centerX, baseTop, tube.centerY]}
      geometry={geometry}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color="#e6b422" side={THREE.DoubleSide} />
    </mesh>
  );
}
