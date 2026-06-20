const { createUserSchema, updateUserSchema } = require('../../src/modules/users/users.validation');

test('createUserSchema fails when required fields are missing', () => {
  const { error } = createUserSchema.validate({}, { abortEarly: false });
  expect(error).toBeDefined();
  const fields = error.details.map((d) => d.path[0]);
  expect(fields).toEqual(expect.arrayContaining(['name', 'email', 'role']));
});

test('createUserSchema fails on invalid email format', () => {
  const { error } = createUserSchema.validate({ name: 'John Doe', email: 'not-an-email', role: 'Admin' });
  expect(error).toBeDefined();
});

test('createUserSchema fails on role outside allowed enum', () => {
  const { error } = createUserSchema.validate({ name: 'John Doe', email: 'john@test.com', role: 'SuperAdmin' });
  expect(error).toBeDefined();
});

test('createUserSchema passes with valid payload', () => {
  const { error } = createUserSchema.validate({ name: 'John Doe', email: 'john@test.com', role: 'Admin' });
  expect(error).toBeUndefined();
});

test('updateUserSchema requires at least one field', () => {
  const { error } = updateUserSchema.validate({});
  expect(error).toBeDefined();
});

test('updateUserSchema passes with a single valid field', () => {
  const { error } = updateUserSchema.validate({ is_active: false });
  expect(error).toBeUndefined();
});
