import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { setPasswordChangeRequiredHandler, setUnauthorizedHandler } from '../api/fetch';
import ForcedPasswordChange from '../components/ForcedPasswordChange/ForcedPasswordChange';

export interface AuthContextValue {
  loggedIn: boolean;
  username: string | null;
  /** True when the session is valid but the password must be changed first. */
  mustChange: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

/** Optional shape onLogin may return to signal a forced password change. */
export interface LoginResult {
  mustChange?: boolean;
}

interface AuthProviderProps {
  storagePrefix?: string;
  /** Idle timeout in milliseconds. 0 disables. Default: 0 (disabled). */
  idleTimeoutMs?: number;
  /**
   * Performs the login. Return `{ mustChange: true }` when the credential was
   * correct but the account must change its password before continuing.
   */
  onLogin: (username: string, password: string) => Promise<LoginResult | void>;
  onLogout: () => Promise<void>;
  /**
   * Changes the password. Required to support the forced-change flow; when
   * provided, a blocking change screen is shown while a session is must-change.
   */
  onChangePassword?: (currentPassword: string, newPassword: string) => Promise<void>;
  /** App name shown on the forced password-change screen. */
  appName?: string;
  children: ReactNode;
}

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll'] as const;

const AuthContext = createContext<AuthContextValue>(null!);

export function AuthProvider({
  storagePrefix = 'app',
  idleTimeoutMs = 0,
  onLogin,
  onLogout,
  onChangePassword,
  appName = 'Settings',
  children,
}: AuthProviderProps) {
  const sessionKey = `${storagePrefix}_session`;
  const userKey = `${storagePrefix}_user`;
  const mustChangeKey = `${storagePrefix}_must_change`;

  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem(sessionKey) === 'true');
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem(userKey));
  const [mustChange, setMustChange] = useState(() => localStorage.getItem(mustChangeKey) === 'true');
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loggedInRef = useRef(loggedIn);

  // Keep ref in sync so the activity handler doesn't capture stale state.
  loggedInRef.current = loggedIn;

  const doLogout = useCallback(() => {
    onLogout().catch(() => {});
    localStorage.removeItem(sessionKey);
    localStorage.removeItem(userKey);
    localStorage.removeItem(mustChangeKey);
    setUsername(null);
    setLoggedIn(false);
    setMustChange(false);
    navigate('/login');
  }, [onLogout, sessionKey, userKey, mustChangeKey, navigate]);

  // Raise the forced-change gate if any request is rejected with
  // auth.password_change_required — covers sessions discovered mid-flight
  // (e.g. after a page reload, where login-time state was lost).
  useEffect(() => {
    setPasswordChangeRequiredHandler(() => {
      setMustChange(true);
      localStorage.setItem(mustChangeKey, 'true');
    });
    return () => setPasswordChangeRequiredHandler(null);
  }, [mustChangeKey]);

  // Drop client auth state when the server rejects the session (401): the
  // localStorage "logged in" flag can outlive the cookie — session expiry, a
  // server reinstall — and without this every view renders permanently empty.
  // Guarded on loggedInRef so a 401 from a failed login attempt (where we are
  // not logged in) doesn't trigger a spurious logout round-trip.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (loggedInRef.current) doLogout();
    });
    return () => setUnauthorizedHandler(null);
  }, [doLogout]);

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
    const result = await onLogin(user, password);
    const mc = !!(result && result.mustChange);
    localStorage.setItem(sessionKey, 'true');
    localStorage.setItem(userKey, user);
    if (mc) localStorage.setItem(mustChangeKey, 'true');
    else localStorage.removeItem(mustChangeKey);
    setUsername(user);
    setLoggedIn(true);
    setMustChange(mc);
  }

  const showForcedChange = loggedIn && mustChange && !!onChangePassword;

  return (
    <AuthContext.Provider value={{ loggedIn, username, mustChange, login, logout: doLogout }}>
      {showForcedChange ? (
        <ForcedPasswordChange
          appName={appName}
          onChangePassword={onChangePassword!}
          onComplete={() => {
            localStorage.removeItem(mustChangeKey);
            setMustChange(false);
          }}
        />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
