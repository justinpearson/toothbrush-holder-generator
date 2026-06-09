// Cross-section outlines — the single source of truth shared by the 3D mesh
// (buildObjectGeometry), the SVG views, and the .scad generator. Returns plain
// [x, y] tuples (no three.js) so the model and scad layers stay dependency-free.
//
// Vertex convention (must match OpenSCAD so the cross-check passes): for curved
// shapes, vertex k sits at angle 2*pi*k/fn, starting at +X and going CCW — the
// same order OpenSCAD's circle()/polygon() use.

export type Vec2 = [number, number];

export type ShapeKind = 'circle' | 'ellipse' | 'polygon' | 'star';

export interface OutlineParams {
  shape: ShapeKind;
  /** Outer overall diameter (vertex-to-vertex for polygon/star). */
  diameter: number;
  /** Ellipse eccentricity, 0 = circle. depth(Y) = diameter*sqrt(1-e^2). */
  eccentricity: number;
  /** Regular-polygon side count. */
  sides: number;
  /** Star point count. */
  points: number;
  /** Star inner/outer radius ratio. */
  pointDepth: number;
  /** Facets for curved shapes (circle/ellipse). */
  fn: number;
}

export interface BBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

const TAU = Math.PI * 2;

/** Points of a circle of the given radius, fn segments, OpenSCAD vertex order. */
function circlePoints(radius: number, fn: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let k = 0; k < fn; k++) {
    const a = (TAU * k) / fn;
    pts.push([radius * Math.cos(a), radius * Math.sin(a)]);
  }
  return pts;
}

/** Ellipse with semi-axes (a, b), fn segments. */
function ellipsePoints(a: number, b: number, fn: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let k = 0; k < fn; k++) {
    const t = (TAU * k) / fn;
    pts.push([a * Math.cos(t), b * Math.sin(t)]);
  }
  return pts;
}

/** Regular polygon, `sides` vertices on circumradius R, first vertex at +X. */
function polygonPoints(R: number, sides: number): Vec2[] {
  const pts: Vec2[] = [];
  for (let k = 0; k < sides; k++) {
    const a = (TAU * k) / sides;
    pts.push([R * Math.cos(a), R * Math.sin(a)]);
  }
  return pts;
}

/** Star with `points` points alternating outer radius R and inner radius r. */
function starPoints(R: number, r: number, points: number): Vec2[] {
  const pts: Vec2[] = [];
  const n = points * 2;
  for (let k = 0; k < n; k++) {
    const a = (TAU * k) / n;
    const radius = k % 2 === 0 ? R : r;
    pts.push([radius * Math.cos(a), radius * Math.sin(a)]);
  }
  return pts;
}

/** Ellipse semi-minor (Y) axis from a diameter and eccentricity. */
export function ellipseSemiMinor(diameter: number, eccentricity: number): number {
  return (diameter / 2) * Math.sqrt(1 - eccentricity * eccentricity);
}

/** Regular-polygon apothem (inradius) for circumradius R and side count. */
export function polygonApothem(R: number, sides: number): number {
  return R * Math.cos(Math.PI / sides);
}

/** Outer outline of a cross-section, centered at the origin. */
export function outlinePoints(p: OutlineParams): Vec2[] {
  const R = p.diameter / 2;
  switch (p.shape) {
    case 'circle':
      return circlePoints(R, p.fn);
    case 'ellipse':
      return ellipsePoints(R, ellipseSemiMinor(p.diameter, p.eccentricity), p.fn);
    case 'polygon':
      return polygonPoints(R, p.sides);
    case 'star':
      return starPoints(R, R * p.pointDepth, p.points);
  }
}

/**
 * Inner (bore) outline, inset from the outer outline by `wall`. Exact uniform
 * wall for circle/ellipse/regular-polygon (the polygon apothem is reduced by
 * exactly `wall`); approximate for stars (both radii reduced by `wall`).
 * Both this and the .scad use the same formula, so they stay in lockstep.
 */
export function innerOutlinePoints(p: OutlineParams, wall: number): Vec2[] {
  const R = p.diameter / 2;
  switch (p.shape) {
    case 'circle':
      return circlePoints(R - wall, p.fn);
    case 'ellipse': {
      const a = R - wall;
      const b = ellipseSemiMinor(p.diameter, p.eccentricity) - wall;
      return ellipsePoints(a, b, p.fn);
    }
    case 'polygon': {
      // Reduce the apothem by exactly `wall`: R' = R - wall / cos(pi/sides).
      const innerR = R - wall / Math.cos(Math.PI / p.sides);
      return polygonPoints(innerR, p.sides);
    }
    case 'star':
      return starPoints(R - wall, R * p.pointDepth - wall, p.points);
  }
}

/** Smallest inner dimension; <= 0 means the bore would vanish or invert. */
export function innerMargin(p: OutlineParams, wall: number): number {
  const R = p.diameter / 2;
  switch (p.shape) {
    case 'circle':
      return R - wall;
    case 'ellipse':
      return ellipseSemiMinor(p.diameter, p.eccentricity) - wall;
    case 'polygon':
      return polygonApothem(R, p.sides) - wall;
    case 'star':
      return R * p.pointDepth - wall;
  }
}

/** True when a tube wall is too thick for the shape (degenerate inner outline). */
export function innerIsDegenerate(p: OutlineParams, wall: number): boolean {
  return innerMargin(p, wall) <= 0;
}

/** Axis-aligned bounding box of an outline. */
export function bbox(points: Vec2[]): BBox {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [x, y] of points) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { minX, maxX, minY, maxY };
}

/** Largest distance from the center to the outline (for overlap checks). */
export function boundingRadius(p: OutlineParams): number {
  // Outer max radius is the circumradius for every shape we support.
  return p.diameter / 2;
}
