import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import App from './App';
import { api } from './services/mockApi';

beforeEach(() => api.reset());

async function ready() {
  render(<App />);
  await screen.findByRole('region', { name: 'Close summary' });
}

describe('application accessibility', () => {
  it('has no structural accessibility violations in overview', async () => {
    await ready();
    const result = await axe.run(document.body, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(
      result.violations.map((violation) => `${violation.id}: ${violation.description}`),
    ).toEqual([]);
  });

  it('has no structural accessibility violations in the review dialog', async () => {
    const user = userEvent.setup();
    await ready();
    await user.click(screen.getByRole('button', { name: 'Capitation receivables' }));
    await user.click(screen.getByRole('tab', { name: 'Agent recommendation' }));
    const result = await axe.run(screen.getByRole('dialog'), {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(
      result.violations.map((violation) => `${violation.id}: ${violation.description}`),
    ).toEqual([]);
  });
});
