const supabase = require('../../config/db');
const { comparePassword } = require('../../utils/password.util');
const ApiError = require('../../utils/ApiError');

async function login(email, password) {
    const { data: user } = await supabase.from('Users').select('*').eq('email', email).single();
    if (!user || !user.is_active) throw new ApiError(401, 'Invalid credentials');

    const valid = await comparePassword(password, user.password);
    if (!valid) throw new ApiError(401, 'Invalid credentials');

    return user;
}
module.exports = { login };