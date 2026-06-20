jest.mock('../../src/config/db');
const supabase = require('../../src/config/db');
const { login, resetPassword } = require('../../src/modules/auth/auth.service');
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

test('resetPassword succeeds with correct old password and valid new password', async () => {
    const hashed = await hashPassword('oldpass123');
    let updateCalledWith = null;
    supabase.from = () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: { id: 1, password: hashed } }) }) }),
        update: (vals) => { updateCalledWith = vals; return { eq: async () => ({}) }; },
    });
    await resetPassword(1, 'oldpass123', 'newpass456');
    expect(updateCalledWith.must_reset_password).toBe(false);
});

test('resetPassword throws 401 for wrong old password', async () => {
    const hashed = await hashPassword('oldpass123');
    supabase.from = () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: { password: hashed } }) }) }),
    });
    await expect(resetPassword(1, 'wrongold', 'newpass456')).rejects.toMatchObject({ status: 401 });
});

test('resetPassword throws 400 for short new password', async () => {
    const hashed = await hashPassword('oldpass123');
    supabase.from = () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: { password: hashed } }) }) }),
    });
    await expect(resetPassword(1, 'oldpass123', 'short')).rejects.toMatchObject({ status: 400 });
});