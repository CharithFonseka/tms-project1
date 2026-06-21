import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, test, expect } from 'vitest';
import ProtectedRoute from '../src/routes/ProtectedRoute';

let mockAuthValue = { user: null, loading: false };

vi.mock('../src/context/AuthContext', () => ({
  useAuth: () => mockAuthValue,
}));

function renderProtected(roles) {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/protected" element={<ProtectedRoute roles={roles}><div>Secret content</div></ProtectedRoute>} />
        <Route path="/login" element={<div>Login page</div>} />
        <Route path="/403" element={<div>Forbidden page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

test('redirects to /login when no user is logged in', () => {
  mockAuthValue = { user: null, loading: false };
  renderProtected();
  expect(screen.getByText(/login page/i)).toBeInTheDocument();
});

test('renders children when logged in with no role restriction', () => {
  mockAuthValue = { user: { role: 'Admin' }, loading: false };
  renderProtected();
  expect(screen.getByText(/secret content/i)).toBeInTheDocument();
});

test('redirects to /403 when role does not match', () => {
  mockAuthValue = { user: { role: 'Collaborator' }, loading: false };
  renderProtected(['Admin']);
  expect(screen.getByText(/forbidden page/i)).toBeInTheDocument();
});

test('renders nothing while loading', () => {
  mockAuthValue = { user: null, loading: true };
  const { container } = renderProtected();
  expect(container).toBeEmptyDOMElement();
});
