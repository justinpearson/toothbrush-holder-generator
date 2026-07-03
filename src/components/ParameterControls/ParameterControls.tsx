import { useMemo, useState } from 'react';
import { validate } from '../../model/constraints';
import type { HolderControls } from '../../state/useHolderParams';
import { BaseControls } from './BaseControls';
import { CollapseContext, type CollapseStore } from './Collapsible';
import { GlobalControls } from './GlobalControls';
import { ObjectControls } from './ObjectControls';

/**
 * Per-panel open/closed overrides on top of a fallback that "Expand all"
 * (fallback true) and "Collapse all" (fallback false) reset wholesale.
 */
interface CollapseState {
  overrides: Record<string, boolean>;
  fallback: boolean;
}

export function ParameterControls({ controls }: { controls: HolderControls }) {
  const issues = validate(controls.params);
  const [collapse, setCollapse] = useState<CollapseState>({
    overrides: {},
    fallback: true,
  });
  const store = useMemo<CollapseStore>(
    () => ({
      isOpen: (key) => collapse.overrides[key] ?? collapse.fallback,
      toggle: (key) =>
        setCollapse((c) => ({
          ...c,
          overrides: {
            ...c.overrides,
            [key]: !(c.overrides[key] ?? c.fallback),
          },
        })),
    }),
    [collapse],
  );

  return (
    <div className="controls">
      <div className="controls__header">
        <h2>Design</h2>
        <div className="controls__header-actions">
          <button
            type="button"
            className="controls__reset"
            onClick={() => setCollapse({ overrides: {}, fallback: true })}
          >
            Expand all
          </button>
          <button
            type="button"
            className="controls__reset"
            onClick={controls.reset}
          >
            Reset
          </button>
        </div>
      </div>

      <CollapseContext.Provider value={store}>
        <BaseControls controls={controls} />
        <GlobalControls controls={controls} />
        <ObjectControls controls={controls} />
      </CollapseContext.Provider>

      {issues.length > 0 && (
        <ul className="issues" aria-label="Validation messages">
          {issues.map((issue, i) => (
            <li key={`${issue.code}-${i}`} className={`issues__item issues__item--${issue.level}`}>
              {issue.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
