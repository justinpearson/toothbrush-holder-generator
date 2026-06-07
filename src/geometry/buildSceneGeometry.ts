import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { deriveTubes } from '../model/derive';
import type { HolderParams } from '../model/types';
import { buildTubeProfile } from './tubeProfile';

// Small overlap so tube bottoms genuinely intersect the baseplate rather than
// sharing a coplanar face (avoids zero-thickness gaps / z-fighting in the STL).
const SINK_EPSILON = 0.5;

/**
 * Build a single merged BufferGeometry of the whole holder for STL export, in
 * OpenSCAD / 3D-printer space: X = length, Y = depth, Z = up (height). This
 * matches the reference .scad exactly so the exported STL imports upright in a
 * slicer. (Note: the on-screen 3D preview uses Three.js's native Y-up instead;
 * the export is built fresh here rather than reusing the preview meshes.)
 *
 * Each tube and the baseplate are individually watertight solids; they overlap,
 * which every slicer treats as a filled union.
 *
 * The caller owns the returned geometry and should dispose() it when done.
 */
export function buildSceneGeometry(params: HolderParams): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];

  // Baseplate: scad cube origin is a corner, so shift the centered box to match.
  const base = new THREE.BoxGeometry(
    params.baseLength,
    params.baseDepth,
    params.baseHeight,
  );
  base.translate(
    params.baseLength / 2,
    params.baseDepth / 2,
    params.baseHeight / 2,
  );
  geometries.push(base);

  const baseTop = params.baseHeight;
  for (const tube of deriveTubes(params)) {
    const profile = buildTubeProfile({
      outerDiameter: tube.outerDiameter,
      height: tube.height + SINK_EPSILON,
      wallThickness: params.wallThickness,
    });
    // LatheGeometry revolves around Y; rotate +90° about X so the tube axis
    // points along +Z (up), matching the scad's Z-up cylinders.
    const lathe = new THREE.LatheGeometry(profile, params.fn);
    lathe.rotateX(Math.PI / 2);
    lathe.translate(tube.centerX, tube.centerY, baseTop - SINK_EPSILON);
    geometries.push(lathe);
  }

  const merged = mergeGeometries(geometries, false);
  geometries.forEach((g) => g.dispose());
  if (!merged) {
    throw new Error('Failed to merge holder geometry.');
  }
  merged.computeVertexNormals();
  return merged;
}
