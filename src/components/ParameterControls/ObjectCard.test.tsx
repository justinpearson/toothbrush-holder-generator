import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_PARAMS, DEFAULT_SHAPE_PARAMS } from '../../model/defaults';
import type { HolderObject } from '../../model/types';
import type { HolderControls } from '../../state/useHolderParams';
import { clickElement, renderInto } from '../../test/render';
import { ObjectCard } from './ObjectCard';

function fakeControls(): HolderControls {
  return {
    params: DEFAULT_PARAMS,
    setBase: vi.fn(),
    setGlobal: vi.fn(),
    setObjectCount: vi.fn(),
    addObject: vi.fn(),
    removeObject: vi.fn(),
    setObjectShape: vi.fn(),
    setObjectSolid: vi.fn(),
    setShapeParam: vi.fn(),
    setOverride: vi.fn(),
    reset: vi.fn(),
  };
}

function makeObject(overrides: Partial<HolderObject> = {}): HolderObject {
  return {
    id: 'obj-1',
    shape: 'circle',
    shapeParams: { ...DEFAULT_SHAPE_PARAMS },
    solid: false,
    diameter: null,
    height: null,
    wallThickness: null,
    ...overrides,
  };
}

function renderCard(object: HolderObject) {
  const controls = fakeControls();
  const { container } = renderInto(
    <ObjectCard
      object={object}
      index={0}
      globals={DEFAULT_PARAMS.globals}
      controls={controls}
      canRemove
    />,
  );
  const diameter = container.querySelector<HTMLInputElement>(
    'input[type="number"][aria-label="Diameter"]',
  )!;
  const toggle = container.querySelector<HTMLInputElement>(
    'input[type="checkbox"][aria-label="Override global diameter"]',
  )!;
  return { container, controls, diameter, toggle };
}

describe('ObjectCard override rows', () => {
  it('shows an inherited size as a disabled slider at the global value', () => {
    const { container, diameter, toggle } = renderCard(makeObject());
    expect(diameter).not.toBeNull();
    expect(diameter.disabled).toBe(true);
    expect(diameter.value).toBe(String(DEFAULT_PARAMS.globals.diameter));
    expect(toggle.checked).toBe(false);
    expect(container.textContent).toContain('Inheriting the global value');
  });

  it('checking the override box starts an override at the global value', () => {
    const { controls, toggle } = renderCard(makeObject());
    clickElement(toggle);
    expect(controls.setOverride).toHaveBeenCalledWith(
      'obj-1',
      'diameter',
      DEFAULT_PARAMS.globals.diameter,
    );
  });

  it('shows an overridden size as an enabled slider with its own value', () => {
    const { diameter, toggle } = renderCard(makeObject({ diameter: 15 }));
    expect(diameter.disabled).toBe(false);
    expect(diameter.value).toBe('15');
    expect(toggle.checked).toBe(true);
    // The diameter row (unlike the still-inherited rows) drops its note.
    const row = diameter.closest('.override')!;
    expect(row.textContent).not.toContain('Inheriting the global value');
  });

  it('unchecking the override box reverts to inheriting', () => {
    const { controls, toggle } = renderCard(makeObject({ diameter: 15 }));
    clickElement(toggle);
    expect(controls.setOverride).toHaveBeenCalledWith('obj-1', 'diameter', null);
  });
});
