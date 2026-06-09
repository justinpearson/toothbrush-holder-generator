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
      <Slider
        label="Diameter"
        value={params.globals.diameter}
        {...LIMITS.diameter}
        onChange={(v) => setGlobal('diameter', v)}
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
