import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Slider } from './Slider';

function renderSlider(overrides: Partial<Parameters<typeof Slider>[0]> = {}) {
  const onChange = vi.fn();
  render(
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
  const number = screen.getByLabelText<HTMLInputElement>('Diameter');
  const range = screen.getByLabelText<HTMLInputElement>('Diameter slider');
  return { onChange, number, range };
}

describe('Slider', () => {
  it('renders both a range input and a number input showing the value', () => {
    const { number, range } = renderSlider();
    expect(number.type).toBe('number');
    expect(range.type).toBe('range');
    expect(number).toHaveValue(48);
    expect(range).toHaveValue('48');
  });

  it('typing a valid number commits it', () => {
    const { onChange, number } = renderSlider();
    fireEvent.change(number, { target: { value: '15' } });
    expect(onChange).toHaveBeenLastCalledWith(15);
  });

  it('does not commit out-of-range values while typing, and clamps on blur', () => {
    const { onChange, number } = renderSlider();
    fireEvent.change(number, { target: { value: '500' } });
    expect(onChange).not.toHaveBeenCalledWith(500);
    fireEvent.blur(number);
    expect(onChange).toHaveBeenLastCalledWith(120);
  });

  it('an emptied field commits nothing and restores the value on blur', () => {
    const { onChange, number } = renderSlider();
    fireEvent.change(number, { target: { value: '' } });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.blur(number);
    expect(onChange).not.toHaveBeenCalled();
    expect(number).toHaveValue(48);
  });

  it('moving the range input commits the value', () => {
    const { onChange, range } = renderSlider();
    fireEvent.change(range, { target: { value: '60' } });
    expect(onChange).toHaveBeenLastCalledWith(60);
  });

  it('disables both inputs when disabled', () => {
    const { number, range } = renderSlider({ disabled: true });
    expect(number).toBeDisabled();
    expect(range).toBeDisabled();
  });
});
