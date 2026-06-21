require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const initSocketServer = require('./src/sockets/socket.server');
const registerSocketAuth = require('./src/sockets/socket.auth');
const notificationsService = require('./src/modules/notifications/notifications.service');
const { listNotifications } = require('./src/modules/notifications/notifications.service');
const { startDeadlineReminderJob } = require('./src/jobs/deadlineReminder.job');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = initSocketServer(server);
registerSocketAuth(io);
notificationsService.attachIO(io);

io.on('connection', async (socket) => {
  socket.join(`user:${socket.user.id}`);
  const pending = await listNotifications(socket.user.id, { unreadOnly: true });
  if (pending.length) socket.emit('notification:pending', pending);
});

startDeadlineReminderJob();

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));