interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}

/** Labeled range input with a numeric readout. */
export function Slider({
  label,
  value,
  min,
  max,
  step,
  unit = 'mm',
  onChange,
}: SliderProps) {
  return (
    <label className="slider">
      <span className="slider__label">
        {label}
        <span className="slider__value">
          {value}
          {unit ? ` ${unit}` : ''}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
