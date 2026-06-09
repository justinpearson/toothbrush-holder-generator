import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { DerivedObject, Vec2 } from '../model/types';

// Small overlap so stacked pieces (and the object/baseplate seam) genuinely
// intersect rather than sharing a coplanar face.
export const SINK_EPSILON = 0.5;

/** Vector2 list wound to the requested orientation (ExtrudeGeometry wants outer
 *  CCW, holes CW). */
function wound(points: Vec2[], wantClockwise: boolean): THREE.Vector2[] {
  const v = points.map(([x, y]) => new THREE.Vector2(x, y));
  if (THREE.ShapeUtils.isClockWise(v) !== wantClockwise) v.reverse();
  return v;
}

function shapeFrom(outer: Vec2[], hole?: Vec2[] | null): THREE.Shape {
  const shape = new THREE.Shape(wound(outer, false));
  if (hole) shape.holes.push(new THREE.Path(wound(hole, true)));
  return shape;
}

function extrude(shape: THREE.Shape, depth: number): THREE.ExtrudeGeometry {
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, steps: 1 });
}

/**
 * Build one object as a watertight BufferGeometry in a canonical Z-up local
 * frame: the cross-section lies in XY, extruded up +Z. The base sits at
 * z = -SINK_EPSILON (so it overlaps whatever it stands on) and the top at
 * z = height.
 *
 * - solid (or a tube whose wall is too thick → inner is null): one extrusion.
 * - tube (blind): a solid base slab plus a holed upper ring, overlapping at the
 *   floor seam, so the bore is blind (stops one wall above the base).
 *
 * The caller owns the returned geometry and should dispose() it.
 */
export function buildObjectGeometry(obj: DerivedObject): THREE.BufferGeometry {
  const { outer, inner, height } = obj;

  if (inner === null) {
    const g = extrude(shapeFrom(outer), height + SINK_EPSILON);
    g.translate(0, 0, -SINK_EPSILON);
    return g;
  }

  const floor = obj.wallThickness;

  // Solid base slab: z = -SINK .. floor.
  const slab = extrude(shapeFrom(outer), floor + SINK_EPSILON);
  slab.translate(0, 0, -SINK_EPSILON);

  // Holed upper ring: z = floor - SINK .. height (overlaps the slab at the seam).
  const ring = extrude(shapeFrom(outer, inner), height - floor + SINK_EPSILON);
  ring.translate(0, 0, floor - SINK_EPSILON);

  const merged = mergeGeometries([slab, ring], false);
  slab.dispose();
  ring.dispose();
  if (!merged) throw new Error('Failed to merge tube geometry.');
  return merged;
}
