import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_PARAMS, DEFAULT_SHAPE_PARAMS } from '../../model/defaults';
import type { HolderObject } from '../../model/types';
import type { HolderControls } from '../../state/useHolderParams';
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
    objectDiameter: null,
    height: null,
    wallThickness: null,
    padding: null,
    ...overrides,
  };
}

function renderCard(object: HolderObject) {
  const controls = fakeControls();
  const { container } = render(
    <ObjectCard
      object={object}
      index={0}
      globals={DEFAULT_PARAMS.globals}
      controls={controls}
      canRemove
    />,
  );
  const diameter = screen.getByLabelText<HTMLInputElement>('Object diameter');
  const toggle = screen.getByLabelText<HTMLInputElement>(
    'Override global object diameter',
  );
  return { container, controls, diameter, toggle };
}

describe('ObjectCard override rows', () => {
  it('shows an inherited size as a disabled slider at the global value', () => {
    const { container, diameter, toggle } = renderCard(makeObject());
    expect(diameter).toBeDisabled();
    expect(diameter).toHaveValue(DEFAULT_PARAMS.globals.objectDiameter);
    expect(toggle).not.toBeChecked();
    expect(container.textContent).toContain('Inheriting the global value');
  });

  it('checking the override box starts an override at the global value', () => {
    const { controls, toggle } = renderCard(makeObject());
    fireEvent.click(toggle);
    expect(controls.setOverride).toHaveBeenCalledWith(
      'obj-1',
      'objectDiameter',
      DEFAULT_PARAMS.globals.objectDiameter,
    );
  });

  it('shows an overridden size as an enabled slider with its own value', () => {
    const { diameter, toggle } = renderCard(makeObject({ objectDiameter: 15 }));
    expect(diameter).toBeEnabled();
    expect(diameter).toHaveValue(15);
    expect(toggle).toBeChecked();
    // The diameter row (unlike the still-inherited rows) drops its note.
    const row = diameter.closest('.override')!;
    expect(row.textContent).not.toContain('Inheriting the global value');
  });

  it('unchecking the override box reverts to inheriting', () => {
    const { controls, toggle } = renderCard(makeObject({ objectDiameter: 15 }));
    fireEvent.click(toggle);
    expect(controls.setOverride).toHaveBeenCalledWith(
      'obj-1',
      'objectDiameter',
      null,
    );
  });
});

describe('ObjectCard collapsing', () => {
  it('collapses to a summary and expands again', () => {
    renderCard(makeObject({ solid: true }));
    const head = screen.getByRole('button', { name: /Object 1/ });
    expect(head).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByLabelText('Object diameter')).not.toBeNull();

    fireEvent.click(head);
    expect(head).toHaveAttribute('aria-expanded', 'false');
    // Body is gone; the header summarizes the object.
    expect(screen.queryByLabelText('Object diameter')).toBeNull();
    expect(head.textContent).toContain('Circle');
    expect(head.textContent).toContain('Solid');

    fireEvent.click(head);
    expect(screen.queryByLabelText('Object diameter')).not.toBeNull();
  });

  it('keeps the remove button outside the collapse toggle', () => {
    const { controls } = renderCard(makeObject());
    fireEvent.click(screen.getByLabelText('Remove object 1'));
    expect(controls.removeObject).toHaveBeenCalledWith('obj-1');
  });
});
