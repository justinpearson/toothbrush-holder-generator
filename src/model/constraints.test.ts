import { describe, expect, it } from 'vitest';
import { DEFAULT_PARAMS } from './defaults';
import { validate } from './constraints';
import type { HolderParams } from './types';

function params(overrides: Partial<HolderParams>): HolderParams {
  return { ...DEFAULT_PARAMS, ...overrides };
}

describe('validate', () => {
  it('reports no errors for the default model', () => {
    const issues = validate(DEFAULT_PARAMS);
    expect(issues.filter((i) => i.level === 'error')).toHaveLength(0);
  });

  it('flags WALL_TOO_THICK when the bore would vanish', () => {
    const issues = validate(params({ wallThickness: 24 }));
    expect(issues.some((i) => i.code === 'WALL_TOO_THICK')).toBe(true);
  });

  it('flags HEIGHT_TOO_SHORT when a tube is no taller than the wall', () => {
    const issues = validate(
      params({
        wallThickness: 4,
        tubes: [{ id: 't1', outerDiameter: 42, height: 3 }],
      }),
    );
    expect(issues.some((i) => i.code === 'HEIGHT_TOO_SHORT')).toBe(true);
  });

  it('warns TUBE_EXCEEDS_DEPTH when a tube is wider than the plate', () => {
    const issues = validate(params({ baseDepth: 40 }));
    expect(issues.some((i) => i.code === 'TUBE_EXCEEDS_DEPTH')).toBe(true);
  });

  it('warns TUBES_OVERLAP when neighbors are too close', () => {
    const issues = validate(
      params({
        baseLength: 80,
        tubes: [
          { id: 'a', outerDiameter: 48, height: 25 },
          { id: 'b', outerDiameter: 48, height: 25 },
        ],
      }),
    );
    expect(issues.some((i) => i.code === 'TUBES_OVERLAP')).toBe(true);
  });

  it('errors NO_TUBES for an empty holder', () => {
    const issues = validate(params({ tubes: [] }));
    expect(issues.some((i) => i.code === 'NO_TUBES')).toBe(true);
  });
});
