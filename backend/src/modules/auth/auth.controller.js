const authService = require('./auth.service');
const ApiError = require('../../utils/ApiError');
const { signToken, signRefreshToken, verifyToken } = require('../../utils/token.util');

const FIFTEEN_MIN = 15 * 60 * 1000;
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

// Cross-origin (SWA/Vercel frontend -> API) cookies must be SameSite=None; Secure.
const baseCookie = { httpOnly: true, secure: true, sameSite: 'none' };
const accessCookie = { ...baseCookie, maxAge: FIFTEEN_MIN };
const refreshCookie = { ...baseCookie, maxAge: SEVEN_DAYS, path: '/api/auth' };

async function loginHandler(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await authService.login(email, password);
    res.cookie('tms_token', signToken(user), accessCookie);
    res.cookie('tms_refresh', signRefreshToken(user), refreshCookie);
    res.json({ id: user.id, name: user.name, role: user.role, mustResetPassword: user.must_reset_password });
  } catch (err) { next(err); }
}

async function refreshHandler(req, res, next) {
  try {
    const token = req.cookies?.tms_refresh;
    if (!token) throw new ApiError(401, 'No refresh token provided');

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }
    if (payload.type !== 'refresh') throw new ApiError(401, 'Invalid refresh token');

    res.cookie('tms_token', signToken({ id: payload.id, role: payload.role }), accessCookie);
    res.json({ message: 'Access token refreshed' });
  } catch (err) { next(err); }
}

function logoutHandler(req, res) {
  // Clearing the cookies invalidates the client's session.
  res.clearCookie('tms_token', baseCookie);
  res.clearCookie('tms_refresh', { ...baseCookie, path: '/api/auth' });
  res.json({ message: 'Logged out' });
}

async function resetPasswordHandler(req, res, next) {
  try {
    const { oldPassword, newPassword } = req.body;
    await authService.resetPassword(req.user.id, oldPassword, newPassword);
    res.json({ message: 'Password updated successfully' });
  } catch (err) { next(err); }
}

async function getSocketTokenHandler(req, res, next) {
  try {
    // We already have req.user from the authenticate middleware
    // We generate a short-lived token or simply sign their current session details for the socket
    const token = signToken({ id: req.user.id, name: req.user.name, role: req.user.role });
    res.json({ token });
  } catch (err) { next(err); }
}

module.exports = {
  loginHandler,
  refreshHandler,
  logoutHandler,
  resetPasswordHandler,
  getSocketTokenHandler,
};
