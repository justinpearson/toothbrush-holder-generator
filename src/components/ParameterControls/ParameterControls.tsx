import { useState } from 'react';
import { validate } from '../../model/constraints';
import type { HolderControls } from '../../state/useHolderParams';
import { BaseControls } from './BaseControls';
import { ExpandAllContext } from './Collapsible';
import { GlobalControls } from './GlobalControls';
import { ObjectControls } from './ObjectControls';

export function ParameterControls({ controls }: { controls: HolderControls }) {
  const issues = validate(controls.params);
  // Bumping the tick tells every Collapsible below to open.
  const [expandAllTick, setExpandAllTick] = useState(0);

  return (
    <div className="controls">
      <div className="controls__header">
        <h2>Design</h2>
        <div className="controls__header-actions">
          <button
            type="button"
            className="controls__reset"
            onClick={() => setExpandAllTick((t) => t + 1)}
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

      <ExpandAllContext.Provider value={expandAllTick}>
        <BaseControls controls={controls} />
        <GlobalControls controls={controls} />
        <ObjectControls controls={controls} />
      </ExpandAllContext.Provider>

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
