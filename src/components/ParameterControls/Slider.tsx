import { useEffect, useState } from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  disabled?: boolean;
  /** Hide the visible label text (the accessible names stay); for use inside
   *  a panel whose header already names the attribute. */
  hideLabel?: boolean;
  onChange: (value: number) => void;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/**
 * Labeled range input paired with a number field, so a value can be dragged
 * or typed. The number field carries the plain accessible name; the range
 * input is named "<label> slider".
 */
export function Slider({
  label,
  value,
  min,
  max,
  step,
  unit = 'mm',
  disabled = false,
  hideLabel = false,
  onChange,
}: SliderProps) {
  // Draft mirrors `value` but lets the user type freely (e.g. "1" on the way
  // to "15"); only in-range numbers are committed, the rest resolve on blur.
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);

  const handleText = (text: string) => {
    setDraft(text);
    if (text.trim() === '') return;
    const n = Number(text);
    if (Number.isFinite(n) && n >= min && n <= max) onChange(n);
  };

  const handleBlur = () => {
    const n = Number(draft);
    if (draft.trim() !== '' && Number.isFinite(n)) {
      const c = clamp(n, min, max);
      setDraft(String(c));
      if (c !== value) onChange(c);
    } else {
      setDraft(String(value));
    }
  };

  return (
    <div className="slider">
      <span
        className={`slider__label${hideLabel ? ' slider__label--input-only' : ''}`}
      >
        {!hideLabel && label}
        <span className="slider__value">
          <input
            type="number"
            className="slider__number"
            min={min}
            max={max}
            step={step}
            value={draft}
            disabled={disabled}
            aria-label={label}
            onChange={(e) => handleText(e.target.value)}
            onBlur={handleBlur}
          />
          {unit ? ` ${unit}` : ''}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={`${label} slider`}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
