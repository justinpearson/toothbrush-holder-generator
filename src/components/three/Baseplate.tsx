import type { HolderParams } from '../../model/types';

// Coordinate convention: model (X length, Y depth, Z up) maps to three (X, Z up, Y).
// So a model height becomes the three Y axis. The scad cube origin is a corner;
// we offset the centered box to put that corner at the origin.
export function Baseplate({ params }: { params: HolderParams }) {
  return (
    <mesh
      position={[
        params.baseLength / 2,
        params.baseHeight / 2,
        params.baseDepth / 2,
      ]}
      castShadow
      receiveShadow
    >
      <boxGeometry
        args={[params.baseLength, params.baseHeight, params.baseDepth]}
      />
      <meshStandardMaterial color="#e6b422" />
    </mesh>
  );
}
