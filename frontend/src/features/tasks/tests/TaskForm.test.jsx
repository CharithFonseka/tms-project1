import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TaskForm from '../TaskForm';

vi.mock('../../../api/usersApi', () => ({
  listUsersRequest: () => Promise.resolve({ data: [{ id: 'u1', name: 'Test User' }] }),
}));

describe('TaskForm', () => {
  it('shows validation error when title is empty', async () => {
    render(<TaskForm onClose={vi.fn()} onCreated={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /create task/i }));
    await waitFor(() => expect(screen.getByText('Title is required')).toBeInTheDocument());
  });
});
