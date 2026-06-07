import { FILAMENTS } from '../model/filaments';

interface FilamentPickerProps {
  color: string;
  onChange: (hex: string) => void;
}

/** Filament color swatches plus a custom color input, for the 3D preview. */
export function FilamentPicker({ color, onChange }: FilamentPickerProps) {
  const current = color.toLowerCase();
  const isPreset = FILAMENTS.some((f) => f.hex.toLowerCase() === current);

  return (
    <div className="filament" data-testid="filament-picker">
      <span className="filament__label">Filament</span>
      <div className="filament__swatches">
        {FILAMENTS.map((f) => {
          const selected = f.hex.toLowerCase() === current;
          return (
            <button
              key={f.hex}
              type="button"
              className={`filament__swatch${selected ? ' is-selected' : ''}`}
              style={{ background: f.hex }}
              title={f.name}
              aria-label={f.name}
              aria-pressed={selected}
              onClick={() => onChange(f.hex)}
            />
          );
        })}
        <label
          className={`filament__custom${isPreset ? '' : ' is-selected'}`}
          title="Custom color"
        >
          <input
            type="color"
            aria-label="Custom filament color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
          />
          <span aria-hidden="true">+</span>
        </label>
      </div>
    </div>
  );
}
