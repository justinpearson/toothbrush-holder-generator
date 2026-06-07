import { describe, expect, it } from 'vitest';
import { DEFAULT_PARAMS } from '../model/defaults';
import { generateScad } from './scadGenerator';
import type { HolderParams } from '../model/types';

describe('generateScad', () => {
  const scad = generateScad(DEFAULT_PARAMS);

  it('emits the parametric assignment block', () => {
    expect(scad).toContain('base_length = 250;');
    expect(scad).toContain('base_depth  = 85;');
    expect(scad).toContain('base_height = 10;');
    expect(scad).toContain('$fn = 96;');
  });

  it('always keeps holes blind for v1', () => {
    expect(scad).toContain('drain_through_base = false;');
  });

  it('includes the verbatim model module', () => {
    expect(scad).toContain('module toothbrush_holder()');
    expect(scad).toContain('toothbrush_holder();');
  });

  it('computes inner diameters as OD - 2*wall', () => {
    expect(scad).toContain('[48, 40, 50],   // tube 1');
    expect(scad).toContain('[42, 34, 25],   // tube 2');
    expect(scad).toContain('[48, 40, 25],   // tube 4');
  });

  it('reflects a different wall thickness in the inner diameters', () => {
    const params: HolderParams = { ...DEFAULT_PARAMS, wallThickness: 3 };
    const out = generateScad(params);
    expect(out).toContain('[48, 42, 50],   // tube 1'); // 48 - 6
  });

  it('emits one tube row per tube', () => {
    const params: HolderParams = {
      ...DEFAULT_PARAMS,
      tubes: [{ id: 'x', outerDiameter: 40, height: 30 }],
    };
    const out = generateScad(params);
    const rows = out
      .split('\n')
      .filter((l) => l.trim().startsWith('[') && l.includes('// tube'));
    expect(rows).toHaveLength(1);
  });
});
