import { deriveTubes } from '../../model/derive';
import type { HolderParams } from '../../model/types';
import { Baseplate } from './Baseplate';
import { Tube } from './Tube';

/** The whole holder, centered at the world origin for orbit framing. */
export function HolderScene({
  params,
  color,
}: {
  params: HolderParams;
  color: string;
}) {
  const tubes = deriveTubes(params);
  // Recenter so the model sits around the origin (it is modeled in the +X/+Y/+Z octant).
  const center: [number, number, number] = [
    -params.baseLength / 2,
    0,
    -params.baseDepth / 2,
  ];

  return (
    <group position={center}>
      <Baseplate params={params} color={color} />
      {tubes.map((tube) => (
        <Tube
          key={tube.id}
          tube={tube}
          wallThickness={params.wallThickness}
          baseTop={params.baseHeight}
          fn={params.fn}
          color={color}
        />
      ))}
    </group>
  );
}
