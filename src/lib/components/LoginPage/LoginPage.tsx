import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { extractError } from '../../utils/errors';
import './LoginPage.scss';

export interface LoginPageProps {
  appName: string;
  subtitle?: string;
  redirectTo?: string;
}

export default function LoginPage({
  appName,
  subtitle,
  redirectTo = '/dashboard',
}: LoginPageProps) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate(redirectTo);
    } catch (err) {
      setError(extractError(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sg-login-container">
      <div className="sg-login-card">
        <h1>{appName}</h1>
        {subtitle && <p className="sg-login-subtitle">{subtitle}</p>}
        <form onSubmit={onSubmit}>
          <div className="sg-login-field">
            <label htmlFor="sg-username">Username</label>
            <input
              id="sg-username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              required
              autoFocus
            />
          </div>
          <div className="sg-login-field">
            <label htmlFor="sg-password">Password</label>
            <input
              id="sg-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {error && <div className="sg-login-error">{error}</div>}
          <button type="submit" disabled={loading || !username || !password}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
