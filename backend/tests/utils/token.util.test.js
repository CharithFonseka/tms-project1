const { signToken, verifyToken } = require('../../src/utils/token.util');

test('signed token contains id, role and expiry, and verifies correctly', () => {
  const token = signToken({ id: 'abc', role: 'Admin' });
  const decoded = verifyToken(token);
  expect(decoded.id).toBe('abc');
  expect(decoded.role).toBe('Admin');
  expect(decoded.exp).toBeDefined();
});

test('tampered token fails verification', () => {
  const token = signToken({ id: 'abc', role: 'Admin' });
  const tampered = token.slice(0, -2) + 'xx';
  expect(() => verifyToken(tampered)).toThrow();
});

test('refresh token carries type "refresh" and verifies', () => {
  const { signRefreshToken } = require('../../src/utils/token.util');
  const decoded = verifyToken(signRefreshToken({ id: 'abc', role: 'Admin' }));
  expect(decoded.type).toBe('refresh');
  expect(decoded.id).toBe('abc');
});
