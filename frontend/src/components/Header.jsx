import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { listNotificationsRequest, markNotificationReadRequest } from '../api/notificationsApi';

export default function Header() {
    const { user } = useAuth();
    const socket = useSocket();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        if (!user) return;
        listNotificationsRequest(true).then(setNotifications).catch(console.error);
    }, [user]);

    useEffect(() => {
        if (!socket) return;
        const handler = (notification) => {
            setNotifications(prev => [notification, ...prev]);
        };
        socket.on('notification:new', handler);
        return () => socket.off('notification:new', handler);
    }, [socket]);

    const handleNotificationClick = async (notif) => {
        if (!notif.is_read) {
            await markNotificationReadRequest(notif.id);
            setNotifications(prev => prev.filter(n => n.id !== notif.id));
        }
        setShowNotifications(false);
    };

    if (!user) return null;

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <header className="h-20 border-b border-slate-900 bg-slate-950 flex items-center justify-between px-8 sticky top-0 z-30">
            {/* Left: Global Search Placeholder */}
            <div className="flex-1 max-w-md relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input 
                    type="text" 
                    placeholder="Search tasks, projects..." 
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-full text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
            </div>
            
            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 text-slate-400">
                    <button className="hover:text-indigo-400 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    </button>
                    
                    <div className="relative">
                        <button 
                            className="hover:text-amber-400 transition-colors relative"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {notifications.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-950"></span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 mt-4 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50">
                                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                                    <h3 className="text-sm font-bold text-slate-200">Notifications</h3>
                                    <span className="text-xs font-semibold text-indigo-400">{notifications.length} unread</span>
                                </div>
                                <div className="max-h-[320px] overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-6 text-center text-sm text-slate-500">No new notifications</div>
                                    ) : (
                                        notifications.map(notif => (
                                            <div 
                                                key={notif.id} 
                                                onClick={() => handleNotificationClick(notif)}
                                                className="p-4 border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors"
                                            >
                                                <p className="text-sm text-slate-300 font-medium">{notif.message}</p>
                                                <p className="text-xs text-slate-500 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-3 pl-6 border-l border-slate-800">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-slate-200">{user.name}</p>
                        <p className="text-xs font-semibold text-slate-500">{user.role}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-600/20">
                        {getInitials(user.name)}
                    </div>
                </div>
            </div>
        </header>
    );
}
