// Core parameter types for the toothbrush holder.
// All dimensions are in millimeters, matching the OpenSCAD reference model.

export interface TubeParams {
  /** Stable key for React lists; not part of the geometry. */
  id: string;
  /** Outer diameter of the tube, mm. Varies between tubes. */
  outerDiameter: number;
  /** Height of the tube above the baseplate top, mm. Varies between tubes. */
  height: number;
}

export interface HolderParams {
  /** Baseplate length along X, mm. */
  baseLength: number;
  /** Baseplate depth along Y, mm. */
  baseDepth: number;
  /** Baseplate thickness along Z, mm. */
  baseHeight: number;
  /** Wall thickness shared by every tube, mm. innerDiameter = OD - 2*wall. */
  wallThickness: number;
  /** Tubes, left -> right. n = tubes.length. */
  tubes: TubeParams[];
  /** OpenSCAD $fn: facets per circle. Also the lathe segment count. */
  fn: number;
}

/** A tube enriched with values derived from the whole holder. Never stored. */
export interface DerivedTube extends TubeParams {
  index: number;
  /** outerDiameter - 2 * wallThickness, mm. */
  innerDiameter: number;
  /** Center position along X, mm. */
  centerX: number;
  /** Center position along Y, mm (always baseDepth/2). */
  centerY: number;
}

export type ValidationLevel = 'error' | 'warning';

export type ValidationCode =
  | 'WALL_TOO_THICK'
  | 'HEIGHT_TOO_SHORT'
  | 'TUBE_EXCEEDS_DEPTH'
  | 'TUBES_OVERLAP'
  | 'NO_TUBES';

export interface ValidationIssue {
  level: ValidationLevel;
  code: ValidationCode;
  message: string;
  /** Which tube the issue refers to, if any. */
  tubeId?: string;
}
