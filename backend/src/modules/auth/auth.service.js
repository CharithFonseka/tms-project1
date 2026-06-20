const supabase = require('../../config/db');
const { comparePassword, hashPassword } = require('../../utils/password.util');
const ApiError = require('../../utils/ApiError');

async function login(email, password) {
    const { data: user } = await supabase.from('Users').select('*').eq('email', email).single();
    if (!user || !user.is_active) throw new ApiError(401, 'Invalid credentials');

    const valid = await comparePassword(password, user.password);
    if (!valid) throw new ApiError(401, 'Invalid credentials');

    return user;
}

async function resetPassword(userId, oldPassword, newPassword) {
    const { data: user } = await supabase.from('Users').select('*').eq('id', userId).single();
    if (!(await comparePassword(oldPassword, user.password))) throw new ApiError(401, 'Current password incorrect');
    if (newPassword.length < 8) throw new ApiError(400, 'Password must be at least 8 characters');

    const hashed = await hashPassword(newPassword);
    await supabase.from('Users').update({ password: hashed, must_reset_password: false }).eq('id', userId);
}

module.exports = { login, resetPassword };