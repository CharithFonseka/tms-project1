const router = require('express').Router();
const { createUserHandler, listUsersHandler, updateUserHandler } = require('./users.controller');
const authenticate = require('../../middlewares/jwt.middleware');
const requireRole = require('../../middlewares/rbac.middleware');
const validate = require('../../middlewares/validate.middleware');
const { createUserSchema, updateUserSchema } = require('./users.validation');

router.post('/', authenticate, requireRole('Admin'), validate(createUserSchema), createUserHandler);
router.get('/', authenticate, requireRole('Admin'), listUsersHandler);
router.put('/:id', authenticate, requireRole('Admin'), validate(updateUserSchema), updateUserHandler);

module.exports = router;
