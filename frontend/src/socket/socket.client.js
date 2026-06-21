import { io } from 'socket.io-client';

export function connectSocket(token) {
    const socket = io(import.meta.env.VITE_SOCKET_URL, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
    });
    socket.on('connect_error', (err) => console.warn('Socket auth failed:', err.message));
    return socket;
}