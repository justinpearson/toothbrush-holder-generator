import type { GlobalDefaults, HolderObject } from './types';

export interface ResolvedSizes {
  objectDiameter: number;
  height: number;
  wallThickness: number;
  padding: number;
}

/** Resolve an object's sizes: a per-object override wins, else the global default. */
export function effective(obj: HolderObject, globals: GlobalDefaults): ResolvedSizes {
  return {
    objectDiameter: obj.objectDiameter ?? globals.objectDiameter,
    height: obj.height ?? globals.height,
    wallThickness: obj.wallThickness ?? globals.wallThickness,
    padding: obj.padding ?? globals.padding,
  };
}

/**
 * Printed overall diameter. A tube wraps the held item: bore =
 * objectDiameter + padding, outer = bore + a wall on each side. A solid IS
 * the item, so its outer diameter is objectDiameter itself.
 */
export function outerDiameterOf(sizes: ResolvedSizes, solid: boolean): number {
  return solid
    ? sizes.objectDiameter
    : sizes.objectDiameter + sizes.padding + 2 * sizes.wallThickness;
}
