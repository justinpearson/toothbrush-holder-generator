import { describe, expect, it } from 'vitest';
import {
  bbox,
  ellipseSemiMinor,
  innerIsDegenerate,
  innerMargin,
  innerOutlinePoints,
  outlinePoints,
  polygonApothem,
  type OutlineParams,
} from './crossSection';

function params(overrides: Partial<OutlineParams>): OutlineParams {
  return {
    shape: 'circle',
    diameter: 48,
    eccentricity: 0,
    sides: 6,
    points: 5,
    pointDepth: 0.5,
    fn: 96,
    ...overrides,
  };
}

describe('outlinePoints', () => {
  it('circle: fn points on the radius, first at +X', () => {
    const pts = outlinePoints(params({ shape: 'circle', diameter: 48, fn: 96 }));
    expect(pts).toHaveLength(96);
    expect(pts[0][0]).toBeCloseTo(24, 9);
    expect(pts[0][1]).toBeCloseTo(0, 9);
    // every point sits on radius 24
    for (const [x, y] of pts) expect(Math.hypot(x, y)).toBeCloseTo(24, 6);
  });

  it('ellipse: depth (Y) shrinks by sqrt(1 - e^2); width (X) keeps diameter', () => {
    const p = params({ shape: 'ellipse', diameter: 48, eccentricity: 0.6, fn: 96 });
    const box = bbox(outlinePoints(p));
    expect(box.maxX).toBeCloseTo(24, 6); // a = d/2
    expect(box.maxY).toBeCloseTo(ellipseSemiMinor(48, 0.6), 6);
    expect(box.maxY).toBeLessThan(box.maxX);
  });

  it('ellipse with eccentricity 0 equals a circle', () => {
    const c = outlinePoints(params({ shape: 'circle', fn: 24 }));
    const e = outlinePoints(params({ shape: 'ellipse', eccentricity: 0, fn: 24 }));
    for (let i = 0; i < c.length; i++) {
      expect(e[i][0]).toBeCloseTo(c[i][0], 9);
      expect(e[i][1]).toBeCloseTo(c[i][1], 9);
    }
  });

  it('polygon: `sides` vertices on the circumradius', () => {
    const pts = outlinePoints(params({ shape: 'polygon', sides: 6, diameter: 40 }));
    expect(pts).toHaveLength(6);
    for (const [x, y] of pts) expect(Math.hypot(x, y)).toBeCloseTo(20, 6);
    expect(pts[0]).toEqual([20, 0]); // first vertex at +X
  });

  it('star: 2*points vertices alternating outer/inner radius', () => {
    const pts = outlinePoints(
      params({ shape: 'star', points: 5, diameter: 40, pointDepth: 0.5 }),
    );
    expect(pts).toHaveLength(10);
    expect(Math.hypot(...pts[0])).toBeCloseTo(20, 6); // outer
    expect(Math.hypot(...pts[1])).toBeCloseTo(10, 6); // inner = 20 * 0.5
  });
});

describe('innerOutlinePoints / margins', () => {
  it('circle bore = diameter - 2*wall', () => {
    const p = params({ shape: 'circle', diameter: 48, fn: 96 });
    const inner = innerOutlinePoints(p, 4);
    for (const [x, y] of inner) expect(Math.hypot(x, y)).toBeCloseTo(20, 6);
    expect(innerMargin(p, 4)).toBeCloseTo(20, 9);
  });

  it('polygon inner reduces the apothem by exactly the wall', () => {
    const p = params({ shape: 'polygon', sides: 6, diameter: 40 });
    const outerApothem = polygonApothem(20, 6);
    const inner = innerOutlinePoints(p, 3);
    // inner apothem = inner circumradius * cos(pi/sides)
    const innerR = Math.hypot(...inner[0]);
    const innerApothem = innerR * Math.cos(Math.PI / 6);
    expect(outerApothem - innerApothem).toBeCloseTo(3, 6);
  });

  it('flags a degenerate bore when the wall is too thick', () => {
    expect(innerIsDegenerate(params({ shape: 'circle', diameter: 48 }), 24)).toBe(true);
    expect(innerIsDegenerate(params({ shape: 'circle', diameter: 48 }), 4)).toBe(false);
    // polygon: apothem of d=20 hexagon is 10*cos(30deg) ~= 8.66
    expect(innerIsDegenerate(params({ shape: 'polygon', sides: 6, diameter: 20 }), 9)).toBe(true);
  });

  it('produces no NaN coordinates', () => {
    for (const shape of ['circle', 'ellipse', 'polygon', 'star'] as const) {
      for (const [x, y] of outlinePoints(params({ shape }))) {
        expect(Number.isFinite(x)).toBe(true);
        expect(Number.isFinite(y)).toBe(true);
      }
    }
  });
});
