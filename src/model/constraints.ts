import { bbox } from '../geometry/crossSection';
import { deriveObjects, spacing } from './derive';
import type { HolderParams, ValidationIssue } from './types';

// Slider bounds. Loose enough to be useful, tight enough to stay printable.
export const LIMITS = {
  baseLength: { min: 40, max: 400, step: 1 },
  baseDepth: { min: 30, max: 200, step: 1 },
  baseHeight: { min: 2, max: 40, step: 1 },
  diameter: { min: 10, max: 120, step: 1 },
  height: { min: 5, max: 200, step: 1 },
  wallThickness: { min: 1, max: 12, step: 0.5 },
  objectCount: { min: 1, max: 12, step: 1 },
  // Shape-specific:
  eccentricity: { min: 0, max: 0.9, step: 0.05 },
  sides: { min: 3, max: 12, step: 1 },
  points: { min: 3, max: 12, step: 1 },
  pointDepth: { min: 0.2, max: 0.9, step: 0.05 },
} as const;

const SHAPE_LABEL: Record<string, string> = {
  circle: 'circle',
  ellipse: 'ellipse',
  polygon: 'polygon',
  star: 'star',
};

/**
 * Validate a parameter set. Errors mean degenerate geometry (vanished bore, no
 * floor); warnings mean printable but probably unintended.
 */
export function validate(params: HolderParams): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const n = params.objects.length;

  if (n === 0) {
    issues.push({ level: 'error', code: 'NO_OBJECTS', message: 'Add at least one object.' });
    return issues;
  }

  const objects = deriveObjects(params);

  for (const obj of objects) {
    const label = `Object ${obj.index + 1} (${SHAPE_LABEL[obj.shape]})`;

    // A non-solid object whose bore vanished: wall is too thick for the shape.
    if (!obj.solid && obj.inner === null) {
      issues.push({
        level: 'error',
        code: 'WALL_TOO_THICK',
        objectId: obj.id,
        message: `${label}: wall thickness (${obj.wallThickness} mm) is too large — the bore would vanish. Reduce the wall or enlarge the object.`,
      });
    }

    // The blind floor is one wall thick; the tube must be taller than that.
    if (!obj.solid && obj.height <= obj.wallThickness) {
      issues.push({
        level: 'error',
        code: 'HEIGHT_TOO_SHORT',
        objectId: obj.id,
        message: `${label}: height (${obj.height} mm) must exceed the wall thickness (${obj.wallThickness} mm).`,
      });
    }

    const box = bbox(obj.outer);
    const yExtent = box.maxY - box.minY;
    if (yExtent > params.baseDepth) {
      issues.push({
        level: 'warning',
        code: 'OBJECT_EXCEEDS_DEPTH',
        objectId: obj.id,
        message: `${label}: it is ${yExtent.toFixed(0)} mm deep, larger than the baseplate depth (${params.baseDepth} mm); it overhangs the plate.`,
      });
    }
  }

  // Adjacent objects overlap when their bounding radii sum exceeds the spacing.
  const s = spacing(params.baseLength, n);
  for (let i = 0; i < objects.length - 1; i++) {
    const a = objects[i];
    const b = objects[i + 1];
    if (a.diameter / 2 + b.diameter / 2 > s) {
      issues.push({
        level: 'warning',
        code: 'OBJECTS_OVERLAP',
        objectId: b.id,
        message: `Objects ${a.index + 1} and ${b.index + 1} overlap at the current spacing (${s.toFixed(1)} mm). Widen the baseplate or use fewer/smaller objects.`,
      });
    }
  }

  return issues;
}
