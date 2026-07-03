import { describe, expect, it } from 'vitest';
import { DEFAULT_PARAMS, DEFAULT_SHAPE_PARAMS } from './defaults';
import { deriveObjects, objectCenterX, spacing } from './derive';
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
    positionX: null,
    ...overrides,
  };
}

describe('spacing / objectCenterX', () => {
  it('matches v1 centers for n=4, baseLength=250', () => {
    expect(spacing(250, 4)).toBe(62.5);
    expect([0, 1, 2, 3].map((i) => objectCenterX(i, 250, 4))).toEqual([
      31.25, 93.75, 156.25, 218.75,
    ]);
  });
});

describe('deriveObjects', () => {
  it('resolves overrides against globals', () => {
    const d = deriveObjects(DEFAULT_PARAMS);
    expect(d).toHaveLength(4);
    expect(d.map((o) => o.objectDiameter)).toEqual([36, 30, 30, 36]);
    expect(d.map((o) => o.height)).toEqual([50, 25, 25, 25]);
    d.forEach((o) => expect(o.wallThickness).toBe(4));
    d.forEach((o) => expect(o.padding).toBe(4));
    d.forEach((o) => expect(o.centerY).toBe(DEFAULT_PARAMS.baseDepth / 2));
  });

  it('a tube is printed objectDiameter + padding + 2*wall wide', () => {
    // 36 + 4 + 2*4 = 48 and 30 + 4 + 2*4 = 42 (the v1 outer sizes).
    const d = deriveObjects(DEFAULT_PARAMS);
    expect(d.map((o) => o.outerDiameter)).toEqual([48, 42, 42, 48]);
  });

  it("a tube's bore is exactly objectDiameter + padding wide", () => {
    // Circle bore radius = outer R - wall = (36 + 4)/2 = 20.
    const d = deriveObjects(DEFAULT_PARAMS);
    const boreXs = d[0].inner!.map(([x]) => x);
    expect(Math.max(...boreXs)).toBeCloseTo(20, 10);
  });

  it("a solid object's outer diameter is the object diameter itself", () => {
    const params: HolderParams = {
      ...DEFAULT_PARAMS,
      objects: [obj({ solid: true, objectDiameter: 15 })],
    };
    expect(deriveObjects(params)[0].outerDiameter).toBe(15);
  });

  it('a positionX override moves the object; null keeps even spacing', () => {
    const params: HolderParams = {
      ...DEFAULT_PARAMS,
      objects: [obj({ id: 'a' }), obj({ id: 'b', positionX: 200 })],
    };
    const d = deriveObjects(params);
    expect(d[0].centerX).toBe(objectCenterX(0, params.baseLength, 2));
    expect(d[1].centerX).toBe(200);
  });

  it('computes outer and inner outlines for a circle tube', () => {
    const d = deriveObjects(DEFAULT_PARAMS);
    expect(d[0].outer).toHaveLength(DEFAULT_PARAMS.fn);
    expect(d[0].inner).not.toBeNull();
    expect(d[0].inner).toHaveLength(DEFAULT_PARAMS.fn);
  });

  it('a solid object has no inner outline', () => {
    const params: HolderParams = {
      ...DEFAULT_PARAMS,
      objects: [obj({ solid: true })],
    };
    expect(deriveObjects(params)[0].inner).toBeNull();
  });

  it('a wall too thick for the shape yields a null inner outline', () => {
    // A small star: inner radius R*pointDepth - wall goes negative even
    // though the wall wraps around the outside (circles can no longer
    // degenerate, but star/polygon bores still can).
    const params: HolderParams = {
      ...DEFAULT_PARAMS,
      objects: [
        obj({ shape: 'star', objectDiameter: 5, padding: 0, wallThickness: 4 }),
      ],
    };
    expect(deriveObjects(params)[0].inner).toBeNull();
  });
});
