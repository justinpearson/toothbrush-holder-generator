import { describe, expect, it, vi } from 'vitest';
import { blurElement, renderInto, setInputValue } from '../../test/render';
import { Slider } from './Slider';

function renderSlider(overrides: Partial<Parameters<typeof Slider>[0]> = {}) {
  const onChange = vi.fn();
  const { container } = renderInto(
    <Slider
      label="Diameter"
      value={48}
      min={10}
      max={120}
      step={1}
      onChange={onChange}
      {...overrides}
    />,
  );
  const number = container.querySelector<HTMLInputElement>(
    'input[type="number"]',
  )!;
  const range = container.querySelector<HTMLInputElement>(
    'input[type="range"]',
  )!;
  return { onChange, number, range };
}

describe('Slider', () => {
  it('renders both a range input and a number input showing the value', () => {
    const { number, range } = renderSlider();
    expect(number).not.toBeNull();
    expect(range).not.toBeNull();
    expect(number.value).toBe('48');
    expect(range.value).toBe('48');
    // Distinct accessible names so getByLabel(label) is unambiguous.
    expect(number.getAttribute('aria-label')).toBe('Diameter');
    expect(range.getAttribute('aria-label')).toBe('Diameter slider');
  });

  it('typing a valid number commits it', () => {
    const { onChange, number } = renderSlider();
    setInputValue(number, '15');
    expect(onChange).toHaveBeenLastCalledWith(15);
  });

  it('does not commit out-of-range values while typing, and clamps on blur', () => {
    const { onChange, number } = renderSlider();
    setInputValue(number, '500');
    expect(onChange).not.toHaveBeenCalledWith(500);
    blurElement(number);
    expect(onChange).toHaveBeenLastCalledWith(120);
  });

  it('an emptied field commits nothing and restores the value on blur', () => {
    const { onChange, number } = renderSlider();
    setInputValue(number, '');
    expect(onChange).not.toHaveBeenCalled();
    blurElement(number);
    expect(onChange).not.toHaveBeenCalled();
    expect(number.value).toBe('48');
  });

  it('moving the range input commits the value', () => {
    const { onChange, range } = renderSlider();
    setInputValue(range, '60');
    expect(onChange).toHaveBeenLastCalledWith(60);
  });

  it('disables both inputs when disabled', () => {
    const { number, range } = renderSlider({ disabled: true });
    expect(number.disabled).toBe(true);
    expect(range.disabled).toBe(true);
  });
});
