const router = require('express').Router();
const { loginHandler } = require('./auth.controller');
router.post('/login', loginHandler);
module.exports = router;