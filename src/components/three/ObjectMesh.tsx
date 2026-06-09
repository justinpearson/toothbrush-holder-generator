import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { buildObjectGeometry } from '../../geometry/buildObjectGeometry';
import type { DerivedObject } from '../../model/types';

interface ObjectMeshProps {
  object: DerivedObject;
  baseTop: number;
  color: string;
}

/**
 * One object in the Y-up preview. buildObjectGeometry returns a Z-up local
 * geometry; rotating -90° about X stands it up so +Z becomes +Y.
 */
export function ObjectMesh({ object, baseTop, color }: ObjectMeshProps) {
  const geometry = useMemo(
    () => buildObjectGeometry(object),
    // The outline arrays are rebuilt every render; depend on the scalars that
    // fully determine them instead of the array identities.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      object.shape,
      object.diameter,
      object.height,
      object.wallThickness,
      object.solid,
      object.shapeParams.eccentricity,
      object.shapeParams.sides,
      object.shapeParams.points,
      object.shapeParams.pointDepth,
    ],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh
      geometry={geometry}
      position={[object.centerX, baseTop, object.centerY]}
      rotation={[-Math.PI / 2, 0, 0]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color={color} side={THREE.DoubleSide} />
    </mesh>
  );
}
