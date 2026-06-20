const authService = require('./auth.service');
const { signToken } = require('../../utils/token.util');

async function loginHandler(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await authService.login(email, password);
    const token = signToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.json({ id: user.id, name: user.name, role: user.role, mustResetPassword: user.must_reset_password });
  } catch (err) { next(err); }
}

async function resetPasswordHandler(req, res, next) {
  try {
    const { oldPassword, newPassword } = req.body;
    await authService.resetPassword(req.user.id, oldPassword, newPassword);
    res.json({ message: 'Password updated successfully' });
  } catch (err) { next(err); }
}

module.exports = { loginHandler, resetPasswordHandler };