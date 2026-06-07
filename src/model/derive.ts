import type { DerivedTube, HolderParams } from './types';

/** Inner bore diameter of a tube: outer minus a wall on each side. */
export function innerDiameter(outerDiameter: number, wallThickness: number): number {
  return outerDiameter - 2 * wallThickness;
}

/** Center-to-center spacing of evenly distributed tubes along X. */
export function spacing(baseLength: number, n: number): number {
  return baseLength / n;
}

/**
 * X center of tube i, matching the reference scad `tube_x(i) = spacing*(i+0.5)`.
 * For n=4, baseLength=250 this yields 31.25, 93.75, 156.25, 218.75.
 */
export function tubeCenterX(i: number, baseLength: number, n: number): number {
  return spacing(baseLength, n) * (i + 0.5);
}

/** Enrich every tube with its derived geometry. */
export function deriveTubes(params: HolderParams): DerivedTube[] {
  const n = params.tubes.length;
  const centerY = params.baseDepth / 2;
  return params.tubes.map((tube, index) => ({
    ...tube,
    index,
    innerDiameter: innerDiameter(tube.outerDiameter, params.wallThickness),
    centerX: tubeCenterX(index, params.baseLength, n),
    centerY,
  }));
}
