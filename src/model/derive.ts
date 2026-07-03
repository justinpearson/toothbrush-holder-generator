import {
  innerIsDegenerate,
  innerOutlinePoints,
  outlinePoints,
  type OutlineParams,
} from '../geometry/crossSection';
import { effective, outerDiameterOf } from './resolve';
import type { DerivedObject, HolderObject, HolderParams } from './types';

/** Center-to-center spacing of evenly distributed objects along X. */
export function spacing(baseLength: number, n: number): number {
  return baseLength / n;
}

/** X center of object i: spacing*(i+0.5) — evenly spaced, matching v1. */
export function objectCenterX(i: number, baseLength: number, n: number): number {
  return spacing(baseLength, n) * (i + 0.5);
}

/** Build the OutlineParams for an object given its printed outer diameter and $fn. */
export function toOutlineParams(
  obj: Pick<HolderObject, 'shape' | 'shapeParams'>,
  outerDiameter: number,
  fn: number,
): OutlineParams {
  return {
    shape: obj.shape,
    diameter: outerDiameter,
    eccentricity: obj.shapeParams.eccentricity,
    sides: obj.shapeParams.sides,
    points: obj.shapeParams.points,
    pointDepth: obj.shapeParams.pointDepth,
    fn,
  };
}

/** Resolve sizes, positions and 2D outlines for every object. */
export function deriveObjects(params: HolderParams): DerivedObject[] {
  const n = params.objects.length;
  const centerY = params.baseDepth / 2;
  return params.objects.map((obj, index) => {
    const sizes = effective(obj, params.globals);
    const outerDiameter = outerDiameterOf(sizes, obj.solid);
    const op = toOutlineParams(obj, outerDiameter, params.fn);
    const outer = outlinePoints(op);
    const degenerate = innerIsDegenerate(op, sizes.wallThickness);
    const inner =
      obj.solid || degenerate ? null : innerOutlinePoints(op, sizes.wallThickness);
    return {
      id: obj.id,
      index,
      shape: obj.shape,
      shapeParams: obj.shapeParams,
      solid: obj.solid,
      objectDiameter: sizes.objectDiameter,
      height: sizes.height,
      wallThickness: sizes.wallThickness,
      padding: sizes.padding,
      outerDiameter,
      centerX: objectCenterX(index, params.baseLength, n),
      centerY,
      outer,
      inner,
    };
  });
}
