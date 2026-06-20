const authService = require('./auth.service');

async function loginHandler(req, res, next) {
    try {
        const { email, password } = req.body;
        const user = await authService.login(email, password);
        res.json({ id: user.id, name: user.name, role: user.role, mustResetPassword: user.must_reset_password });
    } catch (err) { next(err); }
}
module.exports = { loginHandler };