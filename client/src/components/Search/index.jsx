import { useState, useRef } from 'react';
import api from '../../api';

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function SearchBar({ channel }) {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);
  const timerRef = useRef(null);

  const search = async (q) => {
    if (!q.trim() || !channel) { setResults(null); return; }
    setLoading(true);
    try {
      const { data } = await api.get(`/messages/${channel._id}?search=${encodeURIComponent(q)}&limit=20`);
      setResults(data);
    } catch { setResults([]); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const v = e.target.value;
    setQuery(v);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(v), 400);
  };

  const highlight = (text) => {
    if (!query.trim()) return text;
    const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.split(re).map((part, i) =>
      re.test(part) ? <mark key={i} className="bg-accent/30 text-white rounded px-0.5">{part}</mark> : part
    );
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-surface-light border border-surface-border rounded-lg text-white/30 hover:text-white/60 hover:border-white/20 transition-all text-xs"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <span className="font-mono">Search #{channel?.name}</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-light border border-accent/40 rounded-lg min-w-[280px]">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7c6aff" strokeWidth="2.5" className="flex-shrink-0">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          autoFocus value={query} onChange={handleChange}
          placeholder={`Search in #${channel?.name}…`}
          className="flex-1 bg-transparent text-xs text-msg placeholder-white/25 focus:outline-none font-mono"
        />
        {loading && (
          <div className="w-3 h-3 border border-accent/50 border-t-accent rounded-full animate-spin flex-shrink-0"/>
        )}
        <button onClick={() => { setOpen(false); setQuery(''); setResults(null); }} className="text-white/25 hover:text-white/60">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {results !== null && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-surface border border-surface-border rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-surface-border">
            <span className="text-[11px] text-white/40 font-mono">
              {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
            </span>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-center text-white/25 text-xs py-8">No messages found</p>
            ) : results.map(msg => (
              <div key={msg._id} className="px-3 py-2.5 hover:bg-surface-light border-b border-surface-border/50 last:border-0 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-medium text-accent">{msg.userId?.username}</span>
                  <span className="text-[10px] text-white/25 font-mono">{formatTime(msg.createdAt)}</span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">{highlight(msg.text)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}