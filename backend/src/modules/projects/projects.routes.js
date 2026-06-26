const express = require('express');
const router = express.Router();
const projectsController = require('./projects.controller');
const requireAuth = require('../../middlewares/jwt.middleware');
const requireRole = require('../../middlewares/rbac.middleware');

router.use(requireAuth);

router.post('/', requireRole(['Admin', 'Project Manager']), projectsController.createProject);
router.get('/', projectsController.listProjects);
router.get('/:id', projectsController.getProject);
router.patch('/:id', requireRole(['Admin', 'Project Manager']), projectsController.updateProject);
router.delete('/:id', requireRole(['Admin', 'Project Manager']), projectsController.deleteProject);

module.exports = router;
