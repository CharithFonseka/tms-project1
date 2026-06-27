import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { test, expect, vi } from 'vitest';
import UserForm from '../src/features/admin/UserForm';

test('maps a 409 email conflict to the email field specifically', async () => {
  const onSuccess = vi.fn();
  render(<UserForm onSuccess={onSuccess} />);
  await userEvent.type(screen.getByPlaceholderText(/jane smith/i), 'Test Name');
  await userEvent.type(screen.getByPlaceholderText(/jane@example\.com/i), 'admin@test.com');
  await userEvent.click(screen.getByRole('button', { name: /create user/i }));
  expect(await screen.findByText(/email already in use/i)).toBeInTheDocument();
  expect(onSuccess).not.toHaveBeenCalled();
});
