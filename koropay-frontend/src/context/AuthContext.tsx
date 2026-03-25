import { createContext, useContext, useState, type ReactNode } from 'react';

export type UserRole = 'admin' | 'driver' | 'agent';

interface AuthUser {
  name: string;
  phone: string;
  role: UserRole;
}

interface RegisteredUser {
  name: string;
  phone: string;
  password: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  registeredUsers: RegisteredUser[];
  login: (user: AuthUser) => void;
  logout: () => void;
  registerUser: (user: RegisteredUser) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  registeredUsers: [],
  login: () => {},
  logout: () => {},
  registerUser: () => {},
});

const defaultUsers: RegisteredUser[] = [
  { name: 'Admin User', phone: '08000000000', password: 'admin123', role: 'admin' },
  { name: 'Ade Ogunbiyi', phone: '08012345678', password: 'driver123', role: 'driver' },
  { name: 'Ojuelegba Agent', phone: '08099887766', password: 'agent123', role: 'agent' },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(defaultUsers);

  const login = (userData: AuthUser) => setUser(userData);
  const logout = () => setUser(null);
  const registerUser = (newUser: RegisteredUser) =>
    setRegisteredUsers((prev) => [...prev, newUser]);

  return (
    <AuthContext.Provider value={{ user, registeredUsers, login, logout, registerUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
