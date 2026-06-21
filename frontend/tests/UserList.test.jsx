import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import UserList from '../src/features/admin/UserList';

test('renders mocked users from the list endpoint', async () => {
  render(<UserList />);
  expect(await screen.findByText('Admin User')).toBeInTheDocument();
  expect(await screen.findByText('PM User')).toBeInTheDocument();
});
