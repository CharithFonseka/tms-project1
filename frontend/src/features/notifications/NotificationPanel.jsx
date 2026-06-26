import { useEffect, useState } from 'react';
import { listNotificationsRequest, markNotificationReadRequest } from '../../api/notificationsApi';

/* Notification type icons */
const TYPE_ICONS = {
    task_assigned: '📋',
    status_changed: '🔄',
    comment_added: '💬',
    deadline_approaching: '⏰',
    default: '🔔',
};

function formatTime(ts) {
    if (!ts) return '';
    try {
        const d = new Date(ts);
        const now = new Date();
        const diff = Math.floor((now - d) / 60000);
        if (diff < 1)  return 'just now';
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
        return '';
    }
}

export default function NotificationPanel({ open, onClose }) {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (open) listNotificationsRequest(false).then(setNotifications);
    }, [open]);

    async function handleRead(id) {
        await markNotificationReadRequest(id);
        setNotifications((list) => list.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    }

    if (!open) return null;

    const unread = notifications.filter((n) => !n.is_read);
    const read   = notifications.filter((n) => n.is_read);

    return (
        <div
            style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: 340,
                zIndex: 60,
            }}
        >
            <div
                className="card-elevated"
                style={{ padding: 0, overflow: 'hidden' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Panel header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        borderBottom: '1px solid var(--color-hairline)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h3 style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-ink)' }}>
                            Notifications
                        </h3>
                        {unread.length > 0 && (
                            <span className="badge-pill" style={{ fontSize: 10 }}>
                                {unread.length} new
                            </span>
                        )}
                    </div>
                    <button
                        id="notification-panel-close"
                        onClick={onClose}
                        className="btn-icon"
                        aria-label="Close notifications"
                        style={{ border: 'none', backgroundColor: 'transparent' }}
                    >
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                            <path d="M13 1 1 13M1 1l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                {/* Notification list */}
                <ul
                    style={{
                        maxHeight: 380,
                        overflowY: 'auto',
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                    }}
                >
                    {notifications.length === 0 && (
                        <li className="empty-state" style={{ padding: '32px 16px' }}>
                            <span style={{ fontSize: 24 }}>🔔</span>
                            <p className="text-caption">You're all caught up</p>
                        </li>
                    )}
                    {[...unread, ...read].map((n) => (
                        <li
                            key={n.id}
                            onClick={() => !n.is_read && handleRead(n.id)}
                            style={{
                                display: 'flex',
                                gap: 10,
                                padding: '12px 16px',
                                borderBottom: '1px solid var(--color-hairline)',
                                cursor: n.is_read ? 'default' : 'pointer',
                                backgroundColor: n.is_read ? 'transparent' : '#eff6ff',
                                borderLeft: n.is_read ? 'none' : '3px solid var(--color-primary)',
                                transition: 'background-color 0.12s ease',
                            }}
                        >
                            <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>
                                {TYPE_ICONS[n.type] ?? TYPE_ICONS.default}
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p
                                    style={{
                                        fontSize: 14,
                                        lineHeight: 1.43,
                                        color: n.is_read ? 'var(--color-ink-muted)' : 'var(--color-ink-secondary)',
                                        fontWeight: n.is_read ? 400 : 500,
                                        marginBottom: 2,
                                    }}
                                >
                                    {n.message}
                                </p>
                                <span className="text-caption" style={{ fontSize: 12 }}>
                                    {formatTime(n.created_at)}
                                </span>
                            </div>
                            {!n.is_read && (
                                <span
                                    style={{
                                        width: 7, height: 7,
                                        borderRadius: '50%',
                                        backgroundColor: 'var(--color-primary)',
                                        flexShrink: 0,
                                        marginTop: 6,
                                    }}
                                />
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}