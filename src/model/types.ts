// Core parameter types for the toothbrush holder.
// All dimensions are in millimeters.

import type { ShapeKind, Vec2 } from '../geometry/crossSection';

export type { ShapeKind, Vec2 } from '../geometry/crossSection';

/** Shape-specific parameters. Only the field relevant to the active shape is used. */
export interface ShapeParams {
  /** Ellipse eccentricity, 0 = circle. */
  eccentricity: number;
  /** Regular-polygon side count. */
  sides: number;
  /** Star point count. */
  points: number;
  /** Star inner/outer radius ratio. */
  pointDepth: number;
}

/** A single object standing on the baseplate (a tube or a solid prism). */
export interface HolderObject {
  /** Stable key for React lists; not part of the geometry. */
  id: string;
  shape: ShapeKind;
  shapeParams: ShapeParams;
  /** true = solid filled prism; false = hollow blind tube. */
  solid: boolean;
  /** Overall diameter, mm. null = inherit the global default. */
  diameter: number | null;
  /** Height above the baseplate top, mm. null = inherit global. */
  height: number | null;
  /** Wall thickness, mm (tubes only). null = inherit global. */
  wallThickness: number | null;
}

/** Size keys that can be a global default or a per-object override. */
export type SizeKey = 'diameter' | 'height' | 'wallThickness';

export interface GlobalDefaults {
  diameter: number;
  height: number;
  wallThickness: number;
}

export interface HolderParams {
  /** Baseplate length along X, mm. */
  baseLength: number;
  /** Baseplate depth along Y, mm. */
  baseDepth: number;
  /** Baseplate thickness along Z, mm. */
  baseHeight: number;
  globals: GlobalDefaults;
  /** Objects, left -> right. n = objects.length. */
  objects: HolderObject[];
  /** OpenSCAD $fn: facets per curve. */
  fn: number;
}

/** An object with all sizes resolved and its 2D outlines computed. Never stored. */
export interface DerivedObject {
  id: string;
  index: number;
  shape: ShapeKind;
  shapeParams: ShapeParams;
  solid: boolean;
  /** Resolved (override ?? global) values. */
  diameter: number;
  height: number;
  wallThickness: number;
  centerX: number;
  centerY: number;
  /** Outer outline, centered at the object's own origin. */
  outer: Vec2[];
  /** Inner bore outline; null when solid or the wall is too thick. */
  inner: Vec2[] | null;
}

export type ValidationLevel = 'error' | 'warning';

export type ValidationCode =
  | 'NO_OBJECTS'
  | 'WALL_TOO_THICK'
  | 'HEIGHT_TOO_SHORT'
  | 'OBJECT_EXCEEDS_DEPTH'
  | 'OBJECTS_OVERLAP';

export interface ValidationIssue {
  level: ValidationLevel;
  code: ValidationCode;
  message: string;
  /** Which object the issue refers to, if any. */
  objectId?: string;
}
