import * as THREE from 'three';
import { innerDiameter } from '../model/derive';

export interface TubeProfileInput {
  outerDiameter: number;
  height: number;
  wallThickness: number;
}

/**
 * 2D cross-section of a blind hollow tube, to be revolved with THREE.LatheGeometry
 * around the Y axis. y=0 is the baseplate top; the profile is a closed loop so the
 * revolved surface is watertight:
 *
 *   (0,0) -> (ro,0)   solid bottom (sits on the baseplate)
 *   (ro,0) -> (ro,h)  outer wall
 *   (ro,h) -> (ri,h)  top rim (one wall thick)
 *   (ri,h) -> (ri,floor) inner bore wall
 *   (ri,floor) -> (0,floor) blind floor (one wall thick)
 *   (0,floor) -> (0,0) back up the axis to close
 *
 * Both endpoints lie on the axis (x=0) so the lathe caps top and bottom cleanly.
 */
export function buildTubeProfile(input: TubeProfileInput): THREE.Vector2[] {
  const ro = input.outerDiameter / 2;
  const ri = innerDiameter(input.outerDiameter, input.wallThickness) / 2;
  const h = input.height;
  const floor = input.wallThickness;
  return [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(ro, 0),
    new THREE.Vector2(ro, h),
    new THREE.Vector2(ri, h),
    new THREE.Vector2(ri, floor),
    new THREE.Vector2(0, floor),
  ];
}
