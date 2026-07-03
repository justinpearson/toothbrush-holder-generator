import { describe, expect, it } from 'vitest';
import { DEFAULT_PARAMS, DEFAULT_SHAPE_PARAMS } from '../../model/defaults';
import type { HolderObject, HolderParams } from '../../model/types';
import { renderInto } from '../../test/render';
import { SideView } from './SideView';

function singleObject(overrides: Partial<HolderObject>): HolderParams {
  const obj: HolderObject = {
    id: 'o',
    shape: 'circle',
    shapeParams: { ...DEFAULT_SHAPE_PARAMS },
    solid: false,
    objectDiameter: null,
    height: null,
    wallThickness: null,
    padding: null,
    ...overrides,
  };
  return { ...DEFAULT_PARAMS, objects: [obj] };
}

function objectDimensionLabel(params: HolderParams): string {
  const { container } = renderInto(<SideView params={params} />);
  const text = container.querySelector('[data-testid="side-object"] text')!;
  return text.textContent ?? '';
}

describe('SideView dimension labels', () => {
  it('labels a solid star with its set diameter, not its rounded bbox width', () => {
    // A 5-point star of diameter 15 spans only ~13.6 mm horizontally; the
    // label must still read 15, matching what the user set.
    const label = objectDimensionLabel(
      singleObject({ shape: 'star', solid: true, objectDiameter: 15 }),
    );
    expect(label).toBe('15');
  });

  it('labels a circle tube with its printed outer diameter', () => {
    // 36 object + 4 padding + 2*4 wall = 48.
    const label = objectDimensionLabel(singleObject({ objectDiameter: 36 }));
    expect(label).toBe('48');
  });
});
