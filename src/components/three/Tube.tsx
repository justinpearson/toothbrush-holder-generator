import { useMemo } from 'react';
import * as THREE from 'three';
import { buildTubeProfile } from '../../geometry/tubeProfile';
import type { DerivedTube } from '../../model/types';

interface TubeProps {
  tube: DerivedTube;
  wallThickness: number;
  baseTop: number;
  fn: number;
  color: string;
}

/** One hollow blind tube, built as a revolved (lathe) solid. */
export function Tube({ tube, wallThickness, baseTop, fn, color }: TubeProps) {
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
      <meshStandardMaterial color={color} side={THREE.DoubleSide} />
    </mesh>
  );
}
