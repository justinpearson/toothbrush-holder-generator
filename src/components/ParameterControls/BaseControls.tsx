import { LIMITS } from '../../model/constraints';
import type { HolderControls } from '../../state/useHolderParams';
import { Slider } from './Slider';

export function BaseControls({ controls }: { controls: HolderControls }) {
  const { params, setBase } = controls;
  return (
    <section className="controls__group" aria-label="Baseplate">
      <h3>Baseplate</h3>
      <Slider
        label="Length"
        value={params.baseLength}
        {...LIMITS.baseLength}
        onChange={(v) => setBase('baseLength', v)}
      />
      <Slider
        label="Depth"
        value={params.baseDepth}
        {...LIMITS.baseDepth}
        onChange={(v) => setBase('baseDepth', v)}
      />
      <Slider
        label="Thickness"
        value={params.baseHeight}
        {...LIMITS.baseHeight}
        onChange={(v) => setBase('baseHeight', v)}
      />
    </section>
  );
}
