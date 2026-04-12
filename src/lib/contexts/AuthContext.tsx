import { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export interface AuthContextValue {
  loggedIn: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

interface AuthProviderProps {
  storagePrefix?: string;
  onLogin: (username: string, password: string) => Promise<void>;
  onLogout: () => Promise<void>;
  children: ReactNode;
}

const AuthContext = createContext<AuthContextValue>(null!);

export function AuthProvider({
  storagePrefix = 'app',
  onLogin,
  onLogout,
  children,
}: AuthProviderProps) {
  const sessionKey = `${storagePrefix}_session`;
  const userKey = `${storagePrefix}_user`;

  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem(sessionKey) === 'true');
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem(userKey));
  const navigate = useNavigate();

  async function login(user: string, password: string): Promise<void> {
    await onLogin(user, password);
    localStorage.setItem(sessionKey, 'true');
    localStorage.setItem(userKey, user);
    setUsername(user);
    setLoggedIn(true);
  }

  function logout(): void {
    onLogout().catch(() => {});
    localStorage.removeItem(sessionKey);
    localStorage.removeItem(userKey);
    setUsername(null);
    setLoggedIn(false);
    navigate('/login');
  }

  return (
    <AuthContext.Provider value={{ loggedIn, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
