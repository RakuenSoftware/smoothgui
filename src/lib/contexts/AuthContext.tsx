import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export interface AuthContextValue {
  loggedIn: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

interface AuthProviderProps {
  storagePrefix?: string;
  /** Idle timeout in milliseconds. 0 disables. Default: 0 (disabled). */
  idleTimeoutMs?: number;
  onLogin: (username: string, password: string) => Promise<void>;
  onLogout: () => Promise<void>;
  children: ReactNode;
}

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll'] as const;

const AuthContext = createContext<AuthContextValue>(null!);

export function AuthProvider({
  storagePrefix = 'app',
  idleTimeoutMs = 0,
  onLogin,
  onLogout,
  children,
}: AuthProviderProps) {
  const sessionKey = `${storagePrefix}_session`;
  const userKey = `${storagePrefix}_user`;

  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem(sessionKey) === 'true');
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem(userKey));
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loggedInRef = useRef(loggedIn);

  // Keep ref in sync so the activity handler doesn't capture stale state.
  loggedInRef.current = loggedIn;

  const doLogout = useCallback(() => {
    onLogout().catch(() => {});
    localStorage.removeItem(sessionKey);
    localStorage.removeItem(userKey);
    setUsername(null);
    setLoggedIn(false);
    navigate('/login');
  }, [onLogout, sessionKey, userKey, navigate]);

  // --- idle timeout ---
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (idleTimeoutMs > 0 && loggedInRef.current) {
      timerRef.current = setTimeout(doLogout, idleTimeoutMs);
    }
  }, [idleTimeoutMs, doLogout]);

  useEffect(() => {
    if (idleTimeoutMs <= 0 || !loggedIn) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    // Start the idle timer.
    resetTimer();

    // Reset on user activity.
    const handler = () => resetTimer();
    for (const evt of ACTIVITY_EVENTS) {
      window.addEventListener(evt, handler, { passive: true });
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      for (const evt of ACTIVITY_EVENTS) {
        window.removeEventListener(evt, handler);
      }
    };
  }, [idleTimeoutMs, loggedIn, resetTimer]);

  async function login(user: string, password: string): Promise<void> {
    await onLogin(user, password);
    localStorage.setItem(sessionKey, 'true');
    localStorage.setItem(userKey, user);
    setUsername(user);
    setLoggedIn(true);
  }

  return (
    <AuthContext.Provider value={{ loggedIn, username, login, logout: doLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
