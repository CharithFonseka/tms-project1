const tasksService = require('./tasks.service');

async function createTaskHandler(req, res, next) {
  try {
    const task = await tasksService.createTask(req.body, req.user.id);
    res.status(201).json(task);
  } catch (err) { next(err); }
}

async function listTasksHandler(req, res, next) {
  try {
    const { status, priority, sortBy, order, page, limit } = req.query;
    const result = await tasksService.listTasks(
      {
        status,
        priority,
        sortBy,
        order,
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
      },
      req.user
    );
    res.json(result);
  } catch (err) { next(err); }
}

async function updateTaskHandler(req, res, next) {
  try {
    const task = await tasksService.updateTask(req.params.id, req.body);
    res.json(task);
  } catch (err) { next(err); }
}

async function updateStatusHandler(req, res, next) {
  try {
    const task = await tasksService.updateStatus(req.params.id, req.body.status, req.user);
    res.json(task);
  } catch (err) { next(err); }
}

async function deleteTaskHandler(req, res, next) {
  try {
    await tasksService.deleteTask(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) { next(err); }
}

async function addAssigneeHandler(req, res, next) {
  try {
    await tasksService.addAssignee(req.params.id, req.body.userId);
    res.json({ message: 'Assignee added' });
  } catch (err) { next(err); }
}

async function removeAssigneeHandler(req, res, next) {
  try {
    await tasksService.removeAssignee(req.params.id, req.body.userId);
    res.json({ message: 'Assignee removed' });
  } catch (err) { next(err); }
}

module.exports = {
  createTaskHandler,
  listTasksHandler,
  updateTaskHandler,
  updateStatusHandler,
  deleteTaskHandler,
  addAssigneeHandler,
  removeAssigneeHandler,
};
