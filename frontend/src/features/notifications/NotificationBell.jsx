import { useEffect, useState } from 'react';
import { listNotificationsRequest } from '../../api/notificationsApi';
import { useSocket } from '../../context/SocketContext';

/* SVG bell icon — replaces emoji */
function BellIcon({ hasUnread }) {
    return (
        <svg
            width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ color: hasUnread ? 'var(--color-primary)' : 'var(--color-ink-muted)' }}
        >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
    );
}

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
        return () => {
            socket.off('notification:new', bump);
            socket.off('notification:pending');
        };
    }, [socket]);

    return (
        <button
            id="notification-bell-btn"
            onClick={onClick}
            className="btn-icon"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            style={{
                position: 'relative',
                border: 'none',
                backgroundColor: 'transparent',
            }}
        >
            <BellIcon hasUnread={unreadCount > 0} />
            {unreadCount > 0 && (
                <span
                    style={{
                        position: 'absolute',
                        top: -2,
                        right: -2,
                        minWidth: 16,
                        height: 16,
                        backgroundColor: 'var(--color-error)',
                        color: '#fff',
                        fontSize: 10,
                        fontWeight: 700,
                        borderRadius: 'var(--rounded-full)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 4px',
                        lineHeight: 1,
                        border: '1.5px solid var(--color-canvas)',
                    }}
                >
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </button>
    );
}