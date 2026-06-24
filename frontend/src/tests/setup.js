
import '@testing-library/jest-dom';
import { server } from '../mocks/server';

beforeAll(() => server.listen());
beforeEach(() => {
  sessionStorage.setItem('user', JSON.stringify({ id: 'mock-admin', role: 'Admin', name: 'Test Admin' }));
});
afterEach(() => {
  server.resetHandlers();
  sessionStorage.clear();
});
afterAll(() => server.close());