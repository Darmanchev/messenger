import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm]   = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy]   = useState(false);

  const set = (k) => (e) => setForm(p => ({...p, [k]: e.target.value}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await register(form.username, form.email, form.password);
      nav('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
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
          <h1 className="text-2xl font-semibold text-white tracking-tight">Create account</h1>
          <p className="text-sm text-white/40 mt-1">Join the conversation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            placeholder="Username" autoFocus minLength={3}
            value={form.username} onChange={set('username')}
            className="w-full px-4 py-3 bg-surface border border-surface-border rounded-xl text-msg placeholder-white/25 focus:outline-none focus:border-accent transition-colors text-sm"
          />
          <input
            type="email" placeholder="Email"
            value={form.email} onChange={set('email')}
            className="w-full px-4 py-3 bg-surface border border-surface-border rounded-xl text-msg placeholder-white/25 focus:outline-none focus:border-accent transition-colors text-sm"
          />
          <input
            type="password" placeholder="Password" minLength={6}
            value={form.password} onChange={set('password')}
            className="w-full px-4 py-3 bg-surface border border-surface-border rounded-xl text-msg placeholder-white/25 focus:outline-none focus:border-accent transition-colors text-sm"
          />
          {error && <p className="text-red-400 text-xs px-1">{error}</p>}
          <button
            type="submit" disabled={busy}
            className="w-full py-3 bg-accent hover:bg-accent-hover disabled:opacity-50 rounded-xl text-white font-medium text-sm transition-colors"
          >
            {busy ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-white/30 mt-6">
          Have an account?{' '}
          <Link to="/login" className="text-accent hover:text-accent-hover transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}