const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Routes get mounted here as each module is built
app.use('/api/auth', require('./modules/auth/auth.routes'));
// app.use('/api/users', require('./modules/users/users.routes'));

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  res.status(status).json({ code: status, message: err.message || 'Internal server error' });
}
app.use(errorHandler);

module.exports = app;
