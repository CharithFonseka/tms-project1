import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { test, expect } from 'vitest';
import ResetPasswordPage from '../src/features/auth/ResetPasswordPage';

test('blocks submission when new password is too short', async () => {
  render(<MemoryRouter><ResetPasswordPage /></MemoryRouter>);
  await userEvent.type(screen.getByLabelText(/current/i), 'temp123');
  await userEvent.type(screen.getByLabelText(/new password/i), 'short');
  await userEvent.click(screen.getByRole('button', { name: /update password/i }));
  expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
});
