import { deriveTubes, innerDiameter, spacing } from './derive';
import type { HolderParams, ValidationIssue } from './types';

// Slider bounds. Kept loose enough to be useful but tight enough to stay printable.
export const LIMITS = {
  baseLength: { min: 40, max: 400, step: 1 },
  baseDepth: { min: 30, max: 200, step: 1 },
  baseHeight: { min: 2, max: 40, step: 1 },
  wallThickness: { min: 1, max: 12, step: 0.5 },
  tubeCount: { min: 1, max: 10, step: 1 },
  outerDiameter: { min: 10, max: 100, step: 1 },
  tubeHeight: { min: 5, max: 150, step: 1 },
} as const;

/**
 * Validate a parameter set. Errors mean the geometry would be degenerate
 * (no bore, no floor); warnings mean it is printable but probably unintended.
 */
export function validate(params: HolderParams): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const n = params.tubes.length;

  if (n === 0) {
    issues.push({
      level: 'error',
      code: 'NO_TUBES',
      message: 'Add at least one tube.',
    });
    return issues;
  }

  const tubes = deriveTubes(params);

  for (const tube of tubes) {
    const id = innerDiameter(tube.outerDiameter, params.wallThickness);
    if (id <= 0) {
      issues.push({
        level: 'error',
        code: 'WALL_TOO_THICK',
        tubeId: tube.id,
        message: `Tube ${tube.index + 1}: wall thickness (${params.wallThickness} mm) is too large for a ${tube.outerDiameter} mm tube — the bore would vanish.`,
      });
    }

    // The blind floor is one wall thick; the tube must be taller than that.
    if (tube.height <= params.wallThickness) {
      issues.push({
        level: 'error',
        code: 'HEIGHT_TOO_SHORT',
        tubeId: tube.id,
        message: `Tube ${tube.index + 1}: height (${tube.height} mm) must exceed the wall thickness (${params.wallThickness} mm).`,
      });
    }

    if (tube.outerDiameter > params.baseDepth) {
      issues.push({
        level: 'warning',
        code: 'TUBE_EXCEEDS_DEPTH',
        tubeId: tube.id,
        message: `Tube ${tube.index + 1}: diameter (${tube.outerDiameter} mm) is larger than the baseplate depth (${params.baseDepth} mm); it overhangs the plate.`,
      });
    }
  }

  // Adjacent tubes overlap when the gap between centers is less than the
  // average of their radii sum. spacing = baseLength / n.
  const s = spacing(params.baseLength, n);
  for (let i = 0; i < tubes.length - 1; i++) {
    const a = tubes[i];
    const b = tubes[i + 1];
    if ((a.outerDiameter + b.outerDiameter) / 2 > s) {
      issues.push({
        level: 'warning',
        code: 'TUBES_OVERLAP',
        tubeId: b.id,
        message: `Tubes ${a.index + 1} and ${b.index + 1} overlap at the current spacing (${s.toFixed(1)} mm). Widen the baseplate or use fewer/smaller tubes.`,
      });
    }
  }

  return issues;
}
