module.exports = function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const body = { code: status, message: err.message || 'Internal Server Error' };
  if (err.description) body.description = err.description;
  if (status === 500) console.error(err);
  res.status(status).json(body);
};