import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { AuthService } from '@/lib/authService';

interface AdminContextType {
  isAdmin: boolean;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType>({ isAdmin: false, logout: () => {} });

export const useAdmin = () => useContext(AdminContext);

export function AdminProvider({ children, isAdmin }: { children: ReactNode; isAdmin: boolean }) {
  const [auth, setAuth] = useState(isAdmin);

  useEffect(() => {
    // Check if there's a valid session on mount
    const isAuthenticated = AuthService.isAuthenticated();
    setAuth(isAdmin || isAuthenticated);
  }, [isAdmin]);

  const handleLogout = () => {
    AuthService.logout();
    setAuth(false);
  };

  return (
    <AdminContext.Provider value={{ isAdmin: auth, logout: handleLogout }}>
      {children}
    </AdminContext.Provider>
  );
}
