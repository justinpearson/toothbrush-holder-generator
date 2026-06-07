import { describe, expect, it } from 'vitest';
import { DEFAULT_PARAMS } from './defaults';
import { deriveTubes, innerDiameter, spacing, tubeCenterX } from './derive';

describe('innerDiameter', () => {
  it('subtracts a wall on each side (reference numbers)', () => {
    expect(innerDiameter(48, 4)).toBe(40);
    expect(innerDiameter(42, 4)).toBe(34);
  });
});

describe('spacing / tubeCenterX', () => {
  it('matches the reference scad centers for n=4, baseLength=250', () => {
    expect(spacing(250, 4)).toBe(62.5);
    const centers = [0, 1, 2, 3].map((i) => tubeCenterX(i, 250, 4));
    expect(centers).toEqual([31.25, 93.75, 156.25, 218.75]);
  });
});

describe('deriveTubes', () => {
  it('enriches each tube with inner diameter and centers', () => {
    const derived = deriveTubes(DEFAULT_PARAMS);
    expect(derived).toHaveLength(4);
    expect(derived[0].innerDiameter).toBe(40);
    expect(derived[0].centerX).toBe(31.25);
    // centerY is always baseDepth / 2.
    derived.forEach((t) => expect(t.centerY).toBe(DEFAULT_PARAMS.baseDepth / 2));
    derived.forEach((t, i) => expect(t.index).toBe(i));
  });
});
