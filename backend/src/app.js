const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middlewares/errorHandler');
const { authLimiter, generalLimiter } = require('./middlewares/rateLimiter');
const sanitize = require('./middlewares/sanitize.middleware');

const app = express();

// Security headers
app.use(helmet());
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:4173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Security middlewares
app.use(sanitize);
app.use(generalLimiter);
app.use('/api/auth/login', authLimiter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/users', require('./modules/users/users.routes'));
app.use('/api/notifications', require('./modules/notifications/notifications.routes'));
app.use('/api/projects', require('./modules/projects/projects.routes'));
app.use('/api/tasks', require('./modules/tasks/tasks.routes'));
app.use('/api/tasks/:taskId/comments', require('./modules/comments/comments.routes'));
app.use('/api/tasks/:taskId/attachments', require('./modules/attachments/attachments.routes'));

const path = require('path');
app.use(express.static(path.join(__dirname, '../public')));

// Catch-all route to serve the React app for non-API routes
app.get(/^.*$/, (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Error handler — must be LAST
app.use(errorHandler);

module.exports = app;