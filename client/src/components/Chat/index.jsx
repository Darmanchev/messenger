import { useEffect, useRef, useState } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import SearchBar from '../Search';

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function Avatar({ name }) {
  const colors = ['bg-purple-600','bg-blue-600','bg-green-600','bg-orange-600','bg-pink-600'];
  const color = colors[name?.charCodeAt(0) % colors.length] || 'bg-gray-600';
  return (
    <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white font-medium text-xs flex-shrink-0 mt-0.5`}>
      {name?.[0]?.toUpperCase()}
    </div>
  );
}

function MessageGroup({ messages, currentUserId }) {
  const first = messages[0];
  const isOwn = first.userId?._id === currentUserId;

  return (
    <div className="flex gap-3 group">
      <Avatar name={first.userId?.username} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className={`text-xs font-semibold ${isOwn ? 'text-accent' : 'text-white/80'}`}>
            {first.userId?.username}
          </span>
          <span className="text-[10px] text-white/20 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
            {formatTime(first.createdAt)}
          </span>
        </div>
        <div className="space-y-0.5">
          {messages.map((msg, i) => (
            <p key={msg._id} className={`text-sm text-msg/90 leading-relaxed ${i === messages.length-1 ? 'msg-enter' : ''}`}>
              {msg.text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Chat({ channel }) {
  const { user }                    = useAuth();
  const { socket }                  = useSocket();
  const [messages, setMessages]     = useState([]);
  const [text, setText]             = useState('');
  const [typing, setTyping]         = useState([]);
  const [loading, setLoading]       = useState(false);
  const bottomRef                   = useRef(null);
  const typingTimer                 = useRef(null);

  useEffect(() => {
    if (!channel) return;
    setMessages([]); setLoading(true);
    api.get(`/messages/${channel._id}`)
      .then(r => setMessages(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [channel?._id]);

  useEffect(() => {
    if (!socket || !channel) return;
    socket.emit('channel:join', channel._id);

    const onNew = (msg) => setMessages(p => [...p, msg]);
    const onTyping = ({ userId, username, typing: isTyping }) => {
      if (userId === user._id) return;
      setTyping(p => isTyping
        ? [...p.filter(u => u !== username), username]
        : p.filter(u => u !== username)
      );
    };

    socket.on('message:new', onNew);
    socket.on('typing:update', onTyping);
    return () => { socket.off('message:new', onNew); socket.off('typing:update', onTyping); };
  }, [socket, channel?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !socket || !channel) return;
    socket.emit('message:send', { channelId: channel._id, text: text.trim() });
    socket.emit('typing:stop', { channelId: channel._id });
    setText('');
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (!socket || !channel) return;
    socket.emit('typing:start', { channelId: channel._id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('typing:stop', { channelId: channel._id });
    }, 2000);
  };

  const grouped = messages.reduce((acc, msg) => {
    const last = acc[acc.length - 1];
    if (last && last[0].userId?._id === msg.userId?._id &&
        new Date(msg.createdAt) - new Date(last[last.length-1].createdAt) < 5 * 60000) {
      last.push(msg);
    } else {
      acc.push([msg]);
    }
    return acc;
  }, []);

  if (!channel) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-white/20 text-sm">Select a channel</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen min-w-0">
      {/* Header */}
      <div className="px-6 py-3.5 border-b border-surface-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="text-accent font-mono text-lg">#</span>
          <h2 className="font-semibold text-white text-sm">{channel.name}</h2>
          {channel.description && (
            <>
              <span className="text-white/15">|</span>
              <span className="text-white/35 text-xs">{channel.description}</span>
            </>
          )}
        </div>
        <SearchBar channel={channel} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin"/>
          </div>
        ) : (
          <>
            <div className="pb-2 border-b border-surface-border/50 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-3">
                <span className="text-accent text-xl font-mono">#</span>
              </div>
              <h3 className="font-semibold text-white">Welcome to #{channel.name}</h3>
              <p className="text-white/35 text-sm mt-0.5">{channel.description || 'This is the beginning of this channel.'}</p>
            </div>
            {grouped.map((group, i) => (
              <MessageGroup key={i} messages={group} currentUserId={user?._id} />
            ))}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Typing indicator */}
      {typing.length > 0 && (
        <div className="px-6 py-1 flex items-center gap-2">
          <div className="flex gap-0.5">
            <span className="typing-dot w-1 h-1 bg-white/40 rounded-full inline-block"/>
            <span className="typing-dot w-1 h-1 bg-white/40 rounded-full inline-block"/>
            <span className="typing-dot w-1 h-1 bg-white/40 rounded-full inline-block"/>
          </div>
          <span className="text-xs text-white/30">
            {typing.join(', ')} {typing.length === 1 ? 'is' : 'are'} typing…
          </span>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 flex-shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2 bg-surface-light border border-surface-border rounded-xl px-4 py-2.5 focus-within:border-accent/40 transition-colors">
          <input
            value={text} onChange={handleTyping}
            placeholder={`Message #${channel.name}`}
            className="flex-1 bg-transparent text-sm text-msg placeholder-white/20 focus:outline-none"
          />
          <button
            type="submit" disabled={!text.trim()}
            className="w-7 h-7 bg-accent hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-all flex-shrink-0"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}