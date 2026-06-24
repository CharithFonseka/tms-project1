const router = require('express').Router();
const {
  createTaskHandler,
  listTasksHandler,
  updateTaskHandler,
  updateStatusHandler,
  deleteTaskHandler,
  addAssigneeHandler,
  removeAssigneeHandler,
} = require('./tasks.controller');
const authenticate = require('../../middlewares/jwt.middleware');
const requireRole = require('../../middlewares/rbac.middleware');
const validate = require('../../middlewares/validate.middleware');
const { createTaskSchema, updateTaskSchema, statusUpdateSchema } = require('./tasks.validation');

// All task routes require a valid JWT
router.use(authenticate);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: List tasks (filtered by role — Collaborators see only assigned tasks)
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [To Do, In Progress, Completed] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [Low, Medium, High] }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc] }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paginated task list
 */
router.get('/', listTasksHandler);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task (Admin / Project Manager only)
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, due_date, assignees]
 *             properties:
 *               title:       { type: string }
 *               description: { type: string }
 *               due_date:    { type: string, format: date }
 *               priority:    { type: string, enum: [Low, Medium, High] }
 *               assignees:   { type: array, items: { type: string, format: uuid } }
 *     responses:
 *       201:
 *         description: Task created
 *       403:
 *         description: Insufficient role
 */
router.post('/', requireRole('Admin', 'Project Manager'), validate(createTaskSchema), createTaskHandler);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update task details (Admin / Project Manager only)
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated task
 */
router.put('/:id', requireRole('Admin', 'Project Manager'), validate(updateTaskSchema), updateTaskHandler);

/**
 * @swagger
 * /api/tasks/{id}/status:
 *   patch:
 *     summary: Update task status (all roles — Collaborators must be assigned)
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [To Do, In Progress, Completed] }
 *     responses:
 *       200:
 *         description: Status updated
 *       403:
 *         description: Collaborator not assigned to this task
 */
router.patch('/:id/status', validate(statusUpdateSchema), updateStatusHandler);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task and all its comments/attachments (Admin / Project Manager only)
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Task deleted
 */
router.delete('/:id', requireRole('Admin', 'Project Manager'), deleteTaskHandler);

/**
 * @swagger
 * /api/tasks/{id}/assignees:
 *   post:
 *     summary: Add an assignee to a task (Admin / Project Manager only)
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *   delete:
 *     summary: Remove an assignee from a task (Admin / Project Manager only)
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 */
router.post('/:id/assignees', requireRole('Admin', 'Project Manager'), addAssigneeHandler);
router.delete('/:id/assignees', requireRole('Admin', 'Project Manager'), removeAssigneeHandler);

module.exports = router;
