import { describe, expect, it } from 'vitest';
import { validate } from './constraints';
import { DEFAULT_PARAMS, DEFAULT_SHAPE_PARAMS } from './defaults';
import type { HolderObject, HolderParams } from './types';

function obj(overrides: Partial<HolderObject>): HolderObject {
  return {
    id: 'o',
    shape: 'circle',
    shapeParams: { ...DEFAULT_SHAPE_PARAMS },
    solid: false,
    objectDiameter: null,
    height: null,
    wallThickness: null,
    padding: null,
    ...overrides,
  };
}

function params(overrides: Partial<HolderParams>): HolderParams {
  return { ...DEFAULT_PARAMS, ...overrides };
}

describe('validate', () => {
  it('reports no errors for the default model', () => {
    expect(validate(DEFAULT_PARAMS).filter((i) => i.level === 'error')).toHaveLength(0);
  });

  it('flags WALL_TOO_THICK when the bore vanishes', () => {
    // The wall wraps around the held object, so a circle bore can never
    // vanish — but a star's inner radius (R*pointDepth - wall) still can.
    const issues = validate(
      params({
        objects: [
          obj({ shape: 'star', objectDiameter: 5, padding: 0, wallThickness: 4 }),
        ],
      }),
    );
    expect(issues.some((i) => i.code === 'WALL_TOO_THICK')).toBe(true);
  });

  it('does not flag WALL_TOO_THICK for a solid object', () => {
    const issues = validate(
      params({
        objects: [
          obj({
            shape: 'star',
            solid: true,
            objectDiameter: 5,
            padding: 0,
            wallThickness: 4,
          }),
        ],
      }),
    );
    expect(issues.some((i) => i.code === 'WALL_TOO_THICK')).toBe(false);
  });

  it('flags HEIGHT_TOO_SHORT when a tube is no taller than the wall', () => {
    const issues = validate(
      params({ objects: [obj({ height: 3, wallThickness: 4 })] }),
    );
    expect(issues.some((i) => i.code === 'HEIGHT_TOO_SHORT')).toBe(true);
  });

  it('warns OBJECT_EXCEEDS_DEPTH when an object is wider than the plate', () => {
    // objectDiameter 36 + padding 4 + 2*4 wall = 48 printed, deeper than 40.
    const issues = validate(
      params({ baseDepth: 40, objects: [obj({ objectDiameter: 36 })] }),
    );
    expect(issues.some((i) => i.code === 'OBJECT_EXCEEDS_DEPTH')).toBe(true);
  });

  it('warns OBJECTS_OVERLAP when neighbors are too close', () => {
    const issues = validate(
      params({
        baseLength: 80,
        objects: [obj({ objectDiameter: 36 }), obj({ objectDiameter: 36 })],
      }),
    );
    expect(issues.some((i) => i.code === 'OBJECTS_OVERLAP')).toBe(true);
  });

  it('errors NO_OBJECTS for an empty holder', () => {
    expect(validate(params({ objects: [] })).some((i) => i.code === 'NO_OBJECTS')).toBe(true);
  });
});
