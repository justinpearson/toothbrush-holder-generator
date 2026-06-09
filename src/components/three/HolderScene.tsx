import { deriveObjects } from '../../model/derive';
import type { HolderParams } from '../../model/types';
import { Baseplate } from './Baseplate';
import { ObjectMesh } from './ObjectMesh';

/** The whole holder, centered at the world origin for orbit framing. */
export function HolderScene({
  params,
  color,
}: {
  params: HolderParams;
  color: string;
}) {
  const objects = deriveObjects(params);
  // Recenter so the model sits around the origin (it is modeled in +X/+Y/+Z).
  const center: [number, number, number] = [
    -params.baseLength / 2,
    0,
    -params.baseDepth / 2,
  ];

  return (
    <group position={center}>
      <Baseplate params={params} color={color} />
      {objects.map((object) => (
        <ObjectMesh
          key={object.id}
          object={object}
          baseTop={params.baseHeight}
          color={color}
        />
      ))}
    </group>
  );
}
