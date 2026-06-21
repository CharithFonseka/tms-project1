const errorHandler = require('../../src/middlewares/errorHandler');

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

test('returns correct status and message for ApiError', () => {
  const err = { status: 400, message: 'Bad request' };
  const res = mockRes();
  errorHandler(err, {}, res, () => {});
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({ code: 400, message: 'Bad request' });
});

test('returns 500 for unknown errors', () => {
  const err = new Error('boom');
  const res = mockRes();
  errorHandler(err, {}, res, () => {});
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ code: 500, message: 'boom' });
});

test('includes description if present', () => {
  const err = { status: 422, message: 'Validation failed', description: 'Email is invalid' };
  const res = mockRes();
  errorHandler(err, {}, res, () => {});
  expect(res.json).toHaveBeenCalledWith({
    code: 422,
    message: 'Validation failed',
    description: 'Email is invalid',
  });
});