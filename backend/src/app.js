const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/notifications', require('./modules/notifications/notifications.routes'));

// Error handler — must be LAST
app.use(errorHandler);

module.exports = app;