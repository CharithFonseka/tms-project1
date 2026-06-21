require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const initSocketServer = require('./src/sockets/socket.server');
const registerSocketAuth = require('./src/sockets/socket.auth');
const notificationsService = require('./src/modules/notifications/notifications.service');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = initSocketServer(server);
registerSocketAuth(io);
notificationsService.attachIO(io);

io.on('connection', (socket) => {
  socket.join(`user:${socket.user.id}`);
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));