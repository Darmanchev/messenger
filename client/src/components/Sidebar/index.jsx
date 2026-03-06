import { useEffect, useState } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

function Avatar({ name }) {
  const colors = ['bg-purple-600','bg-blue-600','bg-green-600','bg-orange-600','bg-pink-600'];
  const color = colors[name?.charCodeAt(0) % colors.length] || 'bg-gray-600';
  return (
    <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white font-medium text-xs flex-shrink-0`}>
      {name?.[0]?.toUpperCase()}
    </div>
  );
}

export default function Sidebar({ activeChannel, onSelect }) {
  const { user, logout } = useAuth();
  const [channels, setChannels] = useState([]);
  const [newName, setNewName]   = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.get('/channels').then(r => {
      setChannels(r.data);
      if (!activeChannel && r.data.length > 0) onSelect(r.data[0]);
    });
  }, []);

  const createChannel = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const { data } = await api.post('/channels', { name: newName.trim() });
      setChannels(p => [...p, data]);
      onSelect(data);
      setNewName(''); setCreating(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  return (
    <div className="w-64 flex-shrink-0 bg-surface h-screen flex flex-col border-r border-surface-border">
      {/* Header */}
      <div className="px-4 py-4 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c6aff" strokeWidth="2.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <span className="font-semibold text-white text-sm tracking-tight">Messenger</span>
        </div>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-3 mb-1 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-white/30 uppercase tracking-widest">Channels</span>
          <button
            onClick={() => setCreating(p => !p)}
            className="text-white/30 hover:text-accent transition-colors w-5 h-5 flex items-center justify-center rounded"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>

        {creating && (
          <form onSubmit={createChannel} className="px-3 mb-2">
            <input
              autoFocus value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="channel-name"
              className="w-full px-3 py-1.5 bg-surface-light border border-accent/40 rounded-lg text-xs text-msg placeholder-white/25 focus:outline-none font-mono"
            />
          </form>
        )}

        <div className="space-y-0.5 px-2">
          {channels.map(ch => (
            <button
              key={ch._id}
              onClick={() => onSelect(ch)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all group ${
                activeChannel?._id === ch._id
                  ? 'bg-accent/20 text-white'
                  : 'text-white/50 hover:text-white/80 hover:bg-surface-light'
              }`}
            >
              <span className={`text-sm font-mono transition-colors ${
                activeChannel?._id === ch._id ? 'text-accent' : 'text-white/30 group-hover:text-white/50'
              }`}>#</span>
              <span className="text-sm truncate">{ch.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-surface-border flex items-center gap-2.5">
        <div className="relative">
          <Avatar name={user?.username} />
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-online rounded-full border-2 border-surface" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-white truncate">{user?.username}</p>
          <p className="text-[10px] text-online">online</p>
        </div>
        <button onClick={logout} className="text-white/25 hover:text-white/60 transition-colors" title="Logout">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </div>
  );
}