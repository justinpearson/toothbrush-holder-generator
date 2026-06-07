import { LIMITS } from '../../model/constraints';
import type { HolderControls } from '../../state/useHolderParams';
import { Slider } from './Slider';

export function TubeControls({ controls }: { controls: HolderControls }) {
  const { params, setTube, addTube, removeTube, setTubeCount } = controls;
  const canRemove = params.tubes.length > LIMITS.tubeCount.min;
  const canAdd = params.tubes.length < LIMITS.tubeCount.max;

  return (
    <section className="controls__group" aria-label="Tubes">
      <h3>Tubes</h3>
      <Slider
        label="Number of tubes"
        value={params.tubes.length}
        {...LIMITS.tubeCount}
        unit=""
        onChange={setTubeCount}
      />

      {params.tubes.map((tube, i) => (
        <div className="tube-row" key={tube.id} data-testid="tube-row">
          <div className="tube-row__head">
            <strong>Tube {i + 1}</strong>
            <button
              type="button"
              className="tube-row__remove"
              disabled={!canRemove}
              aria-label={`Remove tube ${i + 1}`}
              onClick={() => removeTube(tube.id)}
            >
              ✕
            </button>
          </div>
          <Slider
            label="Diameter"
            value={tube.outerDiameter}
            {...LIMITS.outerDiameter}
            onChange={(v) => setTube(tube.id, 'outerDiameter', v)}
          />
          <Slider
            label="Height"
            value={tube.height}
            {...LIMITS.tubeHeight}
            onChange={(v) => setTube(tube.id, 'height', v)}
          />
        </div>
      ))}

      <button
        type="button"
        className="controls__add"
        disabled={!canAdd}
        onClick={addTube}
      >
        + Add tube
      </button>
    </section>
  );
}
