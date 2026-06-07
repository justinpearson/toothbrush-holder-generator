import type { HolderParams, TubeParams } from './types';

// Mirrors the reference model in toothbrush-holder-3d-model/toothbrush-holder.scad:
//   base 250 x 85 x 10, wall 4 (48-40)/2, $fn 96, four tubes.
let tubeSeq = 0;
function makeTube(outerDiameter: number, height: number): TubeParams {
  tubeSeq += 1;
  return { id: `tube-${tubeSeq}`, outerDiameter, height };
}

export const DEFAULT_PARAMS: HolderParams = {
  baseLength: 250,
  baseDepth: 85,
  baseHeight: 10,
  wallThickness: 4,
  fn: 96,
  tubes: [
    makeTube(48, 50),
    makeTube(42, 25),
    makeTube(42, 25),
    makeTube(48, 25),
  ],
};

/** A fresh tube with a unique id, for the "add tube" action. */
export function newTube(outerDiameter = 42, height = 25): TubeParams {
  return makeTube(outerDiameter, height);
}
