import { createContext, useContext, useEffect, useState } from 'react';
import { connectSocket } from '../socket/socket.client';
import { getSocketTokenRequest } from '../api/notificationsApi';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!user) return;
        let s;
        getSocketTokenRequest().then((token) => {
            s = connectSocket(token);
            setSocket(s);
        });
        return () => s?.disconnect();
    }, [user]);

    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}
export const useSocket = () => useContext(SocketContext);