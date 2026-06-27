
import { createContext, useContext, useState } from 'react';
import { loginRequest, logoutRequest } from '../api/authApi';

const AuthContext = createContext(null);

function readStoredUser() {
    // Only non-sensitive display info is persisted client-side — the actual
    // JWT lives in an httpOnly cookie and is never readable from JS.
    const stored = sessionStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
}

export function AuthProvider({ children }) {
    // Hydrate synchronously so consumers never see a null-user first render.
    const [user, setUser] = useState(readStoredUser);

    async function login(email, password) {
        const data = await loginRequest(email, password);
        setUser(data);
        sessionStorage.setItem('user', JSON.stringify(data));
        return data;
    }

    async function logout() {
        setUser(null);
        sessionStorage.removeItem('user');
        // Best-effort: clear the httpOnly auth/refresh cookies server-side.
        try { await logoutRequest(); } catch { /* ignore network errors on logout */ }
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading: false }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
