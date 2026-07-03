import type { HolderObject, HolderParams, ShapeKind, ShapeParams } from './types';

// Default shape-specific params, used when an object switches shape.
export const DEFAULT_SHAPE_PARAMS: ShapeParams = {
  eccentricity: 0.6,
  sides: 6,
  points: 5,
  pointDepth: 0.5,
};

export const DEFAULT_GLOBALS = {
  objectDiameter: 36,
  height: 25,
  wallThickness: 4,
  padding: 4,
};

let objectSeq = 0;
function makeObject(overrides: Partial<HolderObject> = {}): HolderObject {
  objectSeq += 1;
  return {
    id: `object-${objectSeq}`,
    shape: 'circle',
    shapeParams: { ...DEFAULT_SHAPE_PARAMS },
    solid: false,
    objectDiameter: null,
    height: null,
    wallThickness: null,
    padding: null,
    positionX: null,
    ...overrides,
  };
}

// Mirrors the v1 model (250 x 85 x 10 base, wall 4, four circular tubes; the
// first is taller). Printed outer sizes stay 48/42/42/48: object + padding +
// 2*wall = 36+4+8 = 48 and 30+4+8 = 42. Sizes that match a global are left
// null so they inherit.
export const DEFAULT_PARAMS: HolderParams = {
  baseLength: 250,
  baseDepth: 85,
  baseHeight: 10,
  fn: 96,
  globals: { ...DEFAULT_GLOBALS },
  objects: [
    makeObject({ height: 50 }), // tall, outer 48 (inherited)
    makeObject({ objectDiameter: 30 }),
    makeObject({ objectDiameter: 30 }),
    makeObject({}), // outer 48 x 25, all inherited
  ],
};

/** A fresh object with a unique id, for the "add object" action. */
export function newObject(shape: ShapeKind = 'circle'): HolderObject {
  return makeObject({ shape });
}
