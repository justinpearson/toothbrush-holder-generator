import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DEFAULT_PARAMS, DEFAULT_SHAPE_PARAMS } from '../../model/defaults';
import type { HolderObject, HolderParams } from '../../model/types';
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
    positionX: null,
    ...overrides,
  };
  return { ...DEFAULT_PARAMS, objects: [obj] };
}

function objectDimensionLabel(params: HolderParams): string {
  const { container } = render(<SideView params={params} />);
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

  it('labels a tube with the held object diameter, not the printed outer size', () => {
    const label = objectDimensionLabel(singleObject({ objectDiameter: 26 }));
    expect(label).toBe('26');
  });
});

describe('SideView held object (dummy toothbrush)', () => {
  it('draws a held-object silhouette inside a tube, sticking out the top', () => {
    const params = singleObject({ objectDiameter: 26 });
    const { container } = render(<SideView params={params} />);
    const held = container.querySelector('[data-testid="side-held"]')!;
    expect(held).not.toBeNull();
    const tube = container.querySelector('[data-testid="side-object-rect"]')!;
    // The held object is narrower than the tube and taller (sticks out).
    expect(Number(held.getAttribute('width'))).toBeLessThan(
      Number(tube.getAttribute('width')),
    );
    expect(Number(held.getAttribute('y'))).toBeLessThan(
      Number(tube.getAttribute('y')),
    );
  });

  it('draws no held object for a solid', () => {
    const params = singleObject({ solid: true });
    const { container } = render(<SideView params={params} />);
    expect(container.querySelector('[data-testid="side-held"]')).toBeNull();
  });
});

describe('SideView height dimensions', () => {
  it('draws a vertical height dimension beside each object', () => {
    const params: HolderParams = {
      ...DEFAULT_PARAMS,
      objects: [
        { ...singleObject({ height: 50 }).objects[0], id: 'a' },
        { ...singleObject({ height: 120 }).objects[0], id: 'b' },
      ],
    };
    const { container } = render(<SideView params={params} />);
    const labels = [
      ...container.querySelectorAll('[data-testid="side-height-dim"] text'),
    ].map((t) => t.textContent);
    expect(labels).toEqual(['50', '120']);
  });
});
