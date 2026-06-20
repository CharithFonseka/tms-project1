const router = require('express').Router();
const { loginHandler, resetPasswordHandler } = require('./auth.controller');
const authenticate = require('../../middlewares/jwt.middleware');

router.post('/login', loginHandler);
router.put('/reset-password', authenticate, resetPasswordHandler);

module.exports = router;