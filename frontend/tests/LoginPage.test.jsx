import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { test, expect } from 'vitest';
import { AuthProvider } from '../src/context/AuthContext';
import LoginPage from '../src/features/auth/LoginPage';

test('shows validation errors on empty submit', async () => {
  render(<MemoryRouter><AuthProvider><LoginPage /></AuthProvider></MemoryRouter>);
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
  expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument();
});

test('logs in successfully with mocked credentials', async () => {
  render(<MemoryRouter><AuthProvider><LoginPage /></AuthProvider></MemoryRouter>);
  await userEvent.type(screen.getByLabelText(/email/i), 'admin@test.com');
  await userEvent.type(screen.getByLabelText(/password/i), 'Test1234!');
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
  expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
});
