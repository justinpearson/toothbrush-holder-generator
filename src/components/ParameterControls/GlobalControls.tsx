import { LIMITS } from '../../model/constraints';
import type { HolderControls } from '../../state/useHolderParams';
import { Slider } from './Slider';

/** Global default sizes that objects inherit unless they override. */
export function GlobalControls({ controls }: { controls: HolderControls }) {
  const { params, setGlobal } = controls;
  return (
    <section className="controls__group" aria-label="Global defaults">
      <h3>Global defaults</h3>
      <p className="controls__hint">Objects use these unless they override below.</p>
      <p className="controls__hint">
        Object diameter is the item the holder holds (e.g. a 26 mm toothbrush).
        A tube&apos;s bore is object diameter + padding; its printed outer size
        adds a wall on each side.
      </p>
      <Slider
        label="Object diameter"
        value={params.globals.objectDiameter}
        {...LIMITS.objectDiameter}
        onChange={(v) => setGlobal('objectDiameter', v)}
      />
      <Slider
        label="Padding"
        value={params.globals.padding}
        {...LIMITS.padding}
        onChange={(v) => setGlobal('padding', v)}
      />
      <Slider
        label="Height"
        value={params.globals.height}
        {...LIMITS.height}
        onChange={(v) => setGlobal('height', v)}
      />
      <Slider
        label="Wall thickness"
        value={params.globals.wallThickness}
        {...LIMITS.wallThickness}
        onChange={(v) => setGlobal('wallThickness', v)}
      />
    </section>
  );
}
