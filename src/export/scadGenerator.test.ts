import { describe, expect, it } from 'vitest';
import { DEFAULT_PARAMS, DEFAULT_SHAPE_PARAMS } from '../model/defaults';
import { generateScad } from './scadGenerator';
import type { HolderObject, HolderParams } from '../model/types';

function obj(overrides: Partial<HolderObject>): HolderObject {
  return {
    id: 'o',
    shape: 'circle',
    shapeParams: { ...DEFAULT_SHAPE_PARAMS },
    solid: false,
    diameter: 48,
    height: 50,
    wallThickness: 4,
    ...overrides,
  };
}

describe('generateScad', () => {
  const scad = generateScad(DEFAULT_PARAMS);

  it('emits the parametric base block and rendering tokens', () => {
    expect(scad).toContain('base_length = 250;');
    expect(scad).toContain('base_depth  = 85;');
    expect(scad).toContain('base_height = 10;');
    expect(scad).toContain('$fn = 96;');
  });

  it('keeps the stable tokens tests and downloads rely on', () => {
    expect(scad).toContain('module toothbrush_holder()');
    expect(scad).toContain('toothbrush_holder();');
    expect(scad).toContain('drain_through_base = false;');
  });

  it('defines the generic extrude modules', () => {
    expect(scad).toContain('module extrude_solid(pts, h)');
    expect(scad).toContain('module extrude_tube(outer, inner, h, floor)');
  });

  // Calls are indented 8 spaces; the `module ...(` definitions are at column 0.
  const tubeCalls = (s: string) => s.match(/^ {8}extrude_tube\(/gm) ?? [];
  const solidCalls = (s: string) => s.match(/^ {8}extrude_solid\(/gm) ?? [];

  it('emits one extrude call per object (default = 4 tubes)', () => {
    expect(tubeCalls(scad)).toHaveLength(4);
    expect(solidCalls(scad)).toHaveLength(0);
  });

  it('emits a solid as extrude_solid and a tube as extrude_tube', () => {
    const params: HolderParams = {
      ...DEFAULT_PARAMS,
      objects: [obj({ solid: true }), obj({ solid: false })],
    };
    const out = generateScad(params);
    expect(solidCalls(out)).toHaveLength(1);
    expect(tubeCalls(out)).toHaveLength(1);
  });

  it('uses the same outline points as the geometry (parity)', () => {
    // A circle of diameter 48: first outer vertex is [24, 0] at +X.
    const out = generateScad({ ...DEFAULT_PARAMS, objects: [obj({})] });
    expect(out).toContain('[24, 0]');
  });

  it('places each object at its derived center', () => {
    // n=4, baseLength=250 -> first center x = 31.25.
    expect(scad).toContain('translate([31.25, 42.5, base_height])');
  });
});
