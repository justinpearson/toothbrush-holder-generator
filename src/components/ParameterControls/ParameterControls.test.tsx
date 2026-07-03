import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useHolderParams } from '../../state/useHolderParams';
import { ParameterControls } from './ParameterControls';

function Harness() {
  return <ParameterControls controls={useHolderParams()} />;
}

describe('ParameterControls collapsing', () => {
  it('collapses and reopens the Baseplate section', () => {
    render(<Harness />);
    const head = screen.getByRole('button', { name: /^Baseplate/ });
    expect(screen.queryByLabelText('Length')).not.toBeNull();
    fireEvent.click(head);
    expect(screen.queryByLabelText('Length')).toBeNull();
    fireEvent.click(head);
    expect(screen.queryByLabelText('Length')).not.toBeNull();
  });

  it('collapses the Global defaults section', () => {
    render(<Harness />);
    // Scope to the section: the object cards have "Padding" inputs too.
    const section = screen.getByRole('region', { name: 'Global defaults' });
    expect(within(section).queryByLabelText('Padding')).not.toBeNull();
    fireEvent.click(
      within(section).getByRole('button', { name: /^Global defaults/ }),
    );
    expect(within(section).queryByLabelText('Padding')).toBeNull();
  });

  it('collapses an attribute panel to a value summary', () => {
    render(<Harness />);
    const card = screen.getAllByTestId('object-card')[0];
    const head = within(card).getByRole('button', { name: /^Object diameter/ });
    fireEvent.click(head);
    expect(within(card).queryByLabelText('Object diameter')).toBeNull();
    // Collapsed header summarizes the inherited value.
    expect(head.textContent).toContain('36 mm (global)');
  });

  it('Expand all reopens every collapsed panel', () => {
    render(<Harness />);
    const card = screen.getAllByTestId('object-card')[0];
    fireEvent.click(screen.getByRole('button', { name: /^Baseplate/ }));
    fireEvent.click(within(card).getByRole('button', { name: /^Object diameter/ }));
    fireEvent.click(screen.getByRole('button', { name: /^Object 1/ }));
    expect(screen.queryByLabelText('Length')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Expand all' }));
    expect(screen.queryByLabelText('Length')).not.toBeNull();
    expect(within(card).queryByLabelText('Object diameter')).not.toBeNull();
  });
});
