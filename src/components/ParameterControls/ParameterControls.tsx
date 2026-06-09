import { validate } from '../../model/constraints';
import type { HolderControls } from '../../state/useHolderParams';
import { BaseControls } from './BaseControls';
import { GlobalControls } from './GlobalControls';
import { ObjectControls } from './ObjectControls';

export function ParameterControls({ controls }: { controls: HolderControls }) {
  const issues = validate(controls.params);

  return (
    <div className="controls">
      <div className="controls__header">
        <h2>Design</h2>
        <button type="button" className="controls__reset" onClick={controls.reset}>
          Reset
        </button>
      </div>

      <BaseControls controls={controls} />
      <GlobalControls controls={controls} />
      <ObjectControls controls={controls} />

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
