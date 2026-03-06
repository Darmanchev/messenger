import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await login(form.email, form.password);
      nav('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-void">
      <div className="w-full max-w-sm px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/20 border border-accent/30 mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c6aff" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Welcome back</h1>
          <p className="text-sm text-white/40 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email" placeholder="Email" autoFocus
            value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
            className="w-full px-4 py-3 bg-surface border border-surface-border rounded-xl text-msg placeholder-white/25 focus:outline-none focus:border-accent transition-colors text-sm"
          />
          <input
            type="password" placeholder="Password"
            value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))}
            className="w-full px-4 py-3 bg-surface border border-surface-border rounded-xl text-msg placeholder-white/25 focus:outline-none focus:border-accent transition-colors text-sm"
          />
          {error && <p className="text-red-400 text-xs px-1">{error}</p>}
          <button
            type="submit" disabled={busy}
            className="w-full py-3 bg-accent hover:bg-accent-hover disabled:opacity-50 rounded-xl text-white font-medium text-sm transition-colors"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-white/30 mt-6">
          No account?{' '}
          <Link to="/register" className="text-accent hover:text-accent-hover transition-colors">Create one</Link>
        </p>

        <div className="mt-6 p-3 bg-surface-light border border-surface-border rounded-xl">
          <p className="text-xs text-white/40 text-center font-mono">
            demo: alice@demo.com / password123
          </p>
        </div>
      </div>
    </div>
  );
}