import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { deriveObjects } from '../model/derive';
import type { HolderParams } from '../model/types';
import { buildObjectGeometry } from './buildObjectGeometry';

/**
 * Build a single merged BufferGeometry of the whole holder for STL export, in
 * OpenSCAD / 3D-printer space: X = length, Y = depth, Z = up. Each object's
 * geometry is built in a Z-up local frame (base near z=0) and translated onto
 * the baseplate top. Objects overlap the baseplate, which slicers fill as a union.
 *
 * The caller owns the returned geometry and should dispose() it.
 */
export function buildSceneGeometry(params: HolderParams): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];

  // Baseplate: scad cube origin is a corner, so shift the centered box to match.
  const base = new THREE.BoxGeometry(
    params.baseLength,
    params.baseDepth,
    params.baseHeight,
  );
  base.translate(params.baseLength / 2, params.baseDepth / 2, params.baseHeight / 2);
  geometries.push(base);

  for (const obj of deriveObjects(params)) {
    const g = buildObjectGeometry(obj);
    g.translate(obj.centerX, obj.centerY, params.baseHeight);
    geometries.push(g);
  }

  // ExtrudeGeometry is non-indexed but BoxGeometry is indexed; mergeGeometries
  // requires a uniform layout, so drop indices on everything first.
  const flat = geometries.map((g) => {
    const ni = g.index ? g.toNonIndexed() : g;
    if (ni !== g) g.dispose();
    return ni;
  });
  const merged = mergeGeometries(flat, false);
  flat.forEach((g) => g.dispose());
  if (!merged) {
    throw new Error('Failed to merge holder geometry.');
  }
  merged.computeVertexNormals();
  return merged;
}
