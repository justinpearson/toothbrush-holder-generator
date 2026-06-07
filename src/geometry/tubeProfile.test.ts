import { describe, expect, it } from 'vitest';
import { buildTubeProfile } from './tubeProfile';

describe('buildTubeProfile', () => {
  const profile = buildTubeProfile({
    outerDiameter: 48,
    height: 50,
    wallThickness: 4,
  });

  it('produces the closed six-point cross-section', () => {
    expect(profile).toHaveLength(6);
    const pts = profile.map((p) => [p.x, p.y]);
    expect(pts).toEqual([
      [0, 0], // axis at baseplate top
      [24, 0], // outer radius bottom
      [24, 50], // outer radius top
      [20, 50], // inner radius top (ro - wall)
      [20, 4], // inner radius down to floor
      [0, 4], // floor across to axis
    ]);
  });

  it('starts and ends on the axis so the lathe caps cleanly', () => {
    expect(profile[0].x).toBe(0);
    expect(profile[profile.length - 1].x).toBe(0);
  });

  it('has no NaN/Infinity coordinates', () => {
    for (const p of profile) {
      expect(Number.isFinite(p.x)).toBe(true);
      expect(Number.isFinite(p.y)).toBe(true);
    }
  });
});
