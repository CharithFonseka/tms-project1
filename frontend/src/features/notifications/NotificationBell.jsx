import { useEffect, useState } from 'react';
import { listNotificationsRequest } from '../../api/notificationsApi';
import { useSocket } from '../../context/SocketContext';

export default function NotificationBell({ onClick }) {
    const [unreadCount, setUnreadCount] = useState(0);
    const socket = useSocket();

    useEffect(() => {
        listNotificationsRequest(true).then((data) => setUnreadCount(data.length));
    }, []);

    useEffect(() => {
        if (!socket) return;
        const bump = () => setUnreadCount((c) => c + 1);
        socket.on('notification:new', bump);
        socket.on('notification:pending', (batch) => setUnreadCount((c) => c + batch.length));
        return () => { socket.off('notification:new', bump); socket.off('notification:pending'); };
    }, [socket]);

    return (
        <button onClick={onClick} className="relative">
            🔔
            {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-xs text-white">{unreadCount}</span>
            )}
        </button>
    );
}