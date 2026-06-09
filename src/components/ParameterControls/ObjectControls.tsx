import { LIMITS } from '../../model/constraints';
import type { HolderControls } from '../../state/useHolderParams';
import { ObjectCard } from './ObjectCard';
import { Slider } from './Slider';

export function ObjectControls({ controls }: { controls: HolderControls }) {
  const { params } = controls;
  const canAdd = params.objects.length < LIMITS.objectCount.max;
  const canRemove = params.objects.length > LIMITS.objectCount.min;

  return (
    <section className="controls__group" aria-label="Objects">
      <h3>Objects</h3>
      <Slider
        label="Number of objects"
        value={params.objects.length}
        {...LIMITS.objectCount}
        unit=""
        onChange={controls.setObjectCount}
      />

      {params.objects.map((object, i) => (
        <ObjectCard
          key={object.id}
          object={object}
          index={i}
          globals={params.globals}
          controls={controls}
          canRemove={canRemove}
        />
      ))}

      <button
        type="button"
        className="controls__add"
        disabled={!canAdd}
        onClick={controls.addObject}
      >
        + Add object
      </button>
    </section>
  );
}
