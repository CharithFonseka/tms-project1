import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import './App.css';

/**
 * App root — provides Router + Auth context only.
 * SocketProvider is intentionally scoped to AppShell (authenticated pages only)
 * to avoid connecting sockets for unauthenticated users.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}