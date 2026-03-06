import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Chat    from '../components/Chat';

export default function ChatPage() {
  const [activeChannel, setActiveChannel] = useState(null);

  return (
    <div className="flex h-screen overflow-hidden bg-void">
      <Sidebar activeChannel={activeChannel} onSelect={setActiveChannel} />
      <Chat channel={activeChannel} />
    </div>
  );
}