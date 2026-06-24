const crypto = require('crypto');
const supabase = require('../../config/db');
const { hashPassword } = require('../../utils/password.util');
const ApiError = require('../../utils/ApiError');
const { sendWelcomeEmail } = require('../../utils/mailer');

async function createUser({ name, email, role }) {
  const { data: existing } = await supabase.from('Users').select('id').eq('email', email).maybeSingle();
  if (existing) throw new ApiError(409, 'Email already in use');

  const tempPassword = crypto.randomBytes(6).toString('hex');
  const hashed = await hashPassword(tempPassword);

  const { data: user, error } = await supabase
    .from('Users')
    .insert({ name, email, role, password: hashed, must_reset_password: true })
    .select('id, name, email, role')
    .single();
  if (error) throw new ApiError(400, error.message);

  await sendWelcomeEmail(email, tempPassword);

  return user;
}

async function listUsers({ search, role, page = 1, limit = 20 }) {
  let query = supabase.from('Users').select('id, name, email, role, is_active', { count: 'exact' });
  if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  if (role) query = query.eq('role', role);
  const { data, count } = await query.range((page - 1) * limit, page * limit - 1);
  return { data, total: count };
}

async function updateUser(targetId, updates) {
  const { data, error } = await supabase.from('Users').update(updates).eq('id', targetId).select().maybeSingle();
  if (error) throw new ApiError(400, error.message);
  if (!data) throw new ApiError(404, 'User not found');
  return data;
}

async function deactivateUser(targetId) {
  const { data, error } = await supabase.from('Users').update({ is_active: false }).eq('id', targetId).select().maybeSingle();
  if (error) throw new ApiError(400, error.message);
  if (!data) throw new ApiError(404, 'User not found');
}

module.exports = { createUser, listUsers, updateUser, deactivateUser };
