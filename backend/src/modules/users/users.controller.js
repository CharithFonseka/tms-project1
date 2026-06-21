const usersService = require('./users.service');

async function createUserHandler(req, res, next) {
  try {
    const user = await usersService.createUser(req.body);
    res.status(201).json(user);
  } catch (err) { next(err); }
}

async function listUsersHandler(req, res, next) {
  try {
    const { search, role, page, limit } = req.query;
    const result = await usersService.listUsers({
      search,
      role,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
    res.json(result);
  } catch (err) { next(err); }
}

async function updateUserHandler(req, res, next) {
  try {
    const user = await usersService.updateUser(req.params.id, req.body);
    res.json(user);
  } catch (err) { next(err); }
}

module.exports = { createUserHandler, listUsersHandler, updateUserHandler };
