jest.mock('../../src/config/db');
const supabase = require('../../src/config/db');
const { login } = require('../../src/modules/auth/auth.service');
const { hashPassword } = require('../../src/utils/password.util');

test('login succeeds with correct password', async () => {
    const hashed = await hashPassword('correctpass');
    supabase.from = () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: { id: 1, password: hashed, is_active: true, role: 'Admin' } }) }) }),
    });
    const user = await login('admin@test.com', 'correctpass');
    expect(user.id).toBe(1);
});

test('login throws 401 for wrong password', async () => {
    const hashed = await hashPassword('correctpass');
    supabase.from = () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: { password: hashed, is_active: true } }) }) }),
    });
    await expect(login('admin@test.com', 'wrongpass')).rejects.toMatchObject({ status: 401 });
});