import { useEffect, useState } from 'react';
import { listNotificationsRequest, markNotificationReadRequest } from '../../api/notificationsApi';

export default function NotificationPanel({ open, onClose }) {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => { if (open) listNotificationsRequest(false).then(setNotifications); }, [open]);

    async function handleRead(id) {
        await markNotificationReadRequest(id);
        setNotifications((list) => list.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    }

    if (!open) return null;
    return (
        <div className="absolute right-4 top-12 w-80 rounded-lg bg-white p-3 shadow-lg">
            <div className="mb-2 flex justify-between"><h3 className="font-semibold">Notifications</h3><button onClick={onClose}>×</button></div>
            <ul className="max-h-80 space-y-1 overflow-y-auto">
                {notifications.map((n) => (
                    <li key={n.id} onClick={() => handleRead(n.id)} className={`cursor-pointer rounded p-2 text-sm ${n.is_read ? 'text-slate-400' : 'bg-indigo-50'}`}>
                        {n.message}
                    </li>
                ))}
            </ul>
        </div>
    );
}