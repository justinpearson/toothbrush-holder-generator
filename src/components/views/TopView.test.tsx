import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DEFAULT_PARAMS } from '../../model/defaults';
import type { HolderParams } from '../../model/types';
import { TopView } from './TopView';

function labels(container: HTMLElement, testid: string): string[] {
  return [
    ...container.querySelectorAll(`[data-testid="${testid}"] text`),
  ].map((t) => t.textContent ?? '');
}

describe('TopView dimensions', () => {
  it('dimensions each object with its printed outer width', () => {
    const { container } = render(<TopView params={DEFAULT_PARAMS} />);
    // Default objects: outer = 36+4+8 = 48 and 30+4+8 = 42.
    expect(labels(container, 'top-width-dim')).toEqual(['48', '42', '42', '48']);
  });

  it('chains center-to-center and edge-to-center spacing dimensions', () => {
    const { container } = render(<TopView params={DEFAULT_PARAMS} />);
    // 4 objects on a 250 plate: edge 31.25, then 62.5 between centers.
    expect(labels(container, 'top-spacing-dim')).toEqual([
      '31.25',
      '62.5',
      '62.5',
      '62.5',
      '31.25',
    ]);
  });

  it('sorts the spacing chain by actual X when objects are custom-placed', () => {
    // Object 4 moved between objects 2 and 3: centers become
    // 31.25, 93.75, 100 (custom), 156.25.
    const params: HolderParams = {
      ...DEFAULT_PARAMS,
      objects: DEFAULT_PARAMS.objects.map((o, i) =>
        i === 3 ? { ...o, positionX: 100 } : o,
      ),
    };
    const { container } = render(<TopView params={params} />);
    expect(labels(container, 'top-spacing-dim')).toEqual([
      '31.25',
      '62.5',
      '6.25',
      '56.25',
      '93.75',
    ]);
  });
});
