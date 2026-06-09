import { describe, expect, it } from 'vitest';
import { deriveObjects } from '../model/derive';
import { DEFAULT_PARAMS, DEFAULT_SHAPE_PARAMS } from '../model/defaults';
import type { HolderObject, HolderParams } from '../model/types';
import { buildObjectGeometry, SINK_EPSILON } from './buildObjectGeometry';

function singleObject(overrides: Partial<HolderObject>): HolderParams {
  const obj: HolderObject = {
    id: 'o',
    shape: 'circle',
    shapeParams: { ...DEFAULT_SHAPE_PARAMS },
    solid: false,
    diameter: 48,
    height: 50,
    wallThickness: 4,
    ...overrides,
  };
  return { ...DEFAULT_PARAMS, objects: [obj] };
}

function bounds(overrides: Partial<HolderObject>) {
  const derived = deriveObjects(singleObject(overrides))[0];
  const geom = buildObjectGeometry(derived);
  geom.computeBoundingBox();
  const box = geom.boundingBox!;
  const count = geom.getAttribute('position').count;
  geom.dispose();
  return { box, count };
}

describe('buildObjectGeometry', () => {
  it('a solid extrudes from the sink offset to the full height', () => {
    const { box, count } = bounds({ solid: true });
    expect(count).toBeGreaterThan(0);
    expect(box.min.z).toBeCloseTo(-SINK_EPSILON, 5);
    expect(box.max.z).toBeCloseTo(50, 5);
    expect(box.max.x).toBeCloseTo(24, 5);
    expect(box.max.y).toBeCloseTo(24, 5);
  });

  it('a tube spans the same envelope and has more triangles than a solid', () => {
    const solid = bounds({ solid: true });
    const tube = bounds({ solid: false });
    expect(tube.box.max.z).toBeCloseTo(50, 5);
    expect(tube.box.min.z).toBeCloseTo(-SINK_EPSILON, 5);
    // The holed ring adds the inner wall, so a tube has more vertices.
    expect(tube.count).toBeGreaterThan(solid.count);
  });

  it('a degenerate (too-thick wall) tube falls back to a solid extrusion', () => {
    const { count, box } = bounds({ solid: false, wallThickness: 30 });
    expect(count).toBeGreaterThan(0);
    expect(box.max.z).toBeCloseTo(50, 5);
  });

  it('handles every shape without producing NaN bounds', () => {
    for (const shape of ['circle', 'ellipse', 'polygon', 'star'] as const) {
      const { box } = bounds({ shape, solid: false });
      expect(Number.isFinite(box.min.x)).toBe(true);
      expect(Number.isFinite(box.max.z)).toBe(true);
    }
  });
});
