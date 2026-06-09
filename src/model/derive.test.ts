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
    diameter: null,
    height: null,
    wallThickness: null,
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
    expect(d.map((o) => o.diameter)).toEqual([48, 42, 42, 48]);
    expect(d.map((o) => o.height)).toEqual([50, 25, 25, 25]);
    d.forEach((o) => expect(o.wallThickness).toBe(4));
    d.forEach((o) => expect(o.centerY).toBe(DEFAULT_PARAMS.baseDepth / 2));
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

  it('a too-thick wall yields a null inner outline', () => {
    const params: HolderParams = {
      ...DEFAULT_PARAMS,
      globals: { ...DEFAULT_PARAMS.globals, wallThickness: 30 },
      objects: [obj({ diameter: 48 })],
    };
    expect(deriveObjects(params)[0].inner).toBeNull();
  });
});
