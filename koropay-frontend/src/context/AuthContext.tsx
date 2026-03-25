import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi } from '../utils/api';

export type UserRole = 'admin' | 'driver' | 'agent';

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  token: string;
  driver?: { id: string; vehiclePlate: string; route: string } | null;
  agent?: { id: string; checkpoint: string; location: string; fee: number } | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('koropay_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem('koropay_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (phone: string, password: string) => {
    const data = await authApi.login(phone, password);
    const authUser: AuthUser = { ...data.user, token: data.token };
    localStorage.setItem('koropay_user', JSON.stringify(authUser));
    setUser(authUser);
  };

  const logout = () => {
    localStorage.removeItem('koropay_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
