jest.mock('../../src/config/db');
jest.mock('../../src/utils/mailer', () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
}));
// Isolate the unit under test from the notification side-effect that
// updateUser (role change) and deactivateUser trigger.
jest.mock('../../src/modules/notifications/notifications.service', () => ({
  createNotification: jest.fn().mockResolvedValue(undefined),
  attachIO: jest.fn(),
}));
const supabase = require('../../src/config/db');
const { createUser, listUsers } = require('../../src/modules/users/users.service');
const { updateUser } = require('../../src/modules/users/users.service');
const { deactivateUser } = require('../../src/modules/users/users.service');

test('createUser succeeds and excludes password from response', async () => {
  let insertedValues = null;
  supabase.from = () => ({
    select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }),
    insert: (vals) => {
      insertedValues = vals;
      return { select: () => ({ single: async () => ({ data: { id: 1, name: vals.name, email: vals.email, role: vals.role } }) }) };
    },
  });
  const user = await createUser({ name: 'Jane Doe', email: 'jane@test.com', role: 'Collaborator' });
  expect(user.password).toBeUndefined();
  expect(insertedValues.must_reset_password).toBe(true);
});

test('createUser throws 409 when email already exists', async () => {
  supabase.from = () => ({
    select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { id: 1 } }) }) }),
  });
  await expect(createUser({ name: 'Jane Doe', email: 'jane@test.com', role: 'Collaborator' }))
    .rejects.toMatchObject({ status: 409 });
});

test('listUsers returns paginated results', async () => {
  supabase.from = () => ({
    select: () => ({
      or: function () { return this; },
      eq: function () { return this; },
      range: async () => ({ data: [{ id: 1, name: 'Jane' }], count: 1 }),
    }),
  });
  const result = await listUsers({});
  expect(result.total).toBe(1);
  expect(result.data).toHaveLength(1);
});

test('listUsers applies role filter correctly', async () => {
  let eqCalledWith = null;
  supabase.from = () => ({
    select: () => ({
      or: function () { return this; },
      eq: function (field, value) { eqCalledWith = { field, value }; return this; },
      range: async () => ({ data: [], count: 0 }),
    }),
  });
  await listUsers({ role: 'Admin' });
  expect(eqCalledWith).toEqual({ field: 'role', value: 'Admin' });
});

test('updateUser succeeds and returns updated data', async () => {
  supabase.from = () => ({
    update: () => ({ eq: () => ({ select: () => ({ maybeSingle: async () => ({ data: { id: 1, name: 'Updated Name' }, error: null }) }) }) }),
  });
  const result = await updateUser(1, { name: 'Updated Name' });
  expect(result.name).toBe('Updated Name');
});

test('updateUser throws 404 when target id does not exist', async () => {
  supabase.from = () => ({
    update: () => ({ eq: () => ({ select: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) }),
  });
  await expect(updateUser('nonexistent-id', { name: 'X' })).rejects.toMatchObject({ status: 404 });
});

test('deactivateUser succeeds for an existing user', async () => {
  supabase.from = () => ({
    update: () => ({ eq: () => ({ select: () => ({ maybeSingle: async () => ({ data: { id: 1, is_active: false }, error: null }) }) }) }),
  });
  await expect(deactivateUser(1)).resolves.toBeUndefined();
});

test('deactivateUser throws 404 for a non-existent user', async () => {
  supabase.from = () => ({
    update: () => ({ eq: () => ({ select: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) }),
  });
  await expect(deactivateUser('nonexistent-id')).rejects.toMatchObject({ status: 404 });
});