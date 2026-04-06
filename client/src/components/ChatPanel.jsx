import React, { useState, useEffect, useRef } from 'react';
import { socket, emitMessage } from '../socket/socketClient';

function ChatPanel({ connectedUser, localUserId, roomId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (roomId) {
      setMessages([]);
      const API_URL = import.meta.env.VITE_API_URL || "";
      fetch(`${API_URL}/api/history/${roomId}`)
        .then(res => res.json())
        .then(data => setMessages(data.reverse()))
        .catch(err => console.error(err));
    }
  }, [roomId]);

  useEffect(() => {
    const handleReceive = (msg) => {
      if (msg.roomId === roomId) {
        setMessages(prev => [...prev, msg]);
      }
    };
    socket.on('chat:receive', handleReceive);
    return () => socket.off('chat:receive', handleReceive);
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    emitMessage(roomId, input);
    
    setMessages(prev => [...prev, {
      senderId: localUserId,
      text: input,
      timestamp: new Date().toISOString()
    }]);
    
    setInput('');
  };

  if (!connectedUser) return null;

  const connectedAvatarSrc = `https://api.dicebear.com/9.x/${connectedUser.avatarStyle || 'avataaars'}/png?seed=${connectedUser.avatarSeed || connectedUser.username}&size=32`;
  
  // Look up local user from localStorage assuming it was stored
  let localAvatarSrc = null;
  try {
    const u = JSON.parse(localStorage.getItem('user'));
    localAvatarSrc = `https://api.dicebear.com/9.x/${u.avatarStyle || 'avataaars'}/png?seed=${u.avatarSeed || u.username}&size=24`;
  } catch(e) {}

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-[#050505] border-l border-[#27272a] shadow-2xl flex flex-col transition-transform duration-300 ease-out translate-x-0 z-20 font-mono">
      <div className="px-6 py-4 flex items-center justify-between border-b border-[#27272a] bg-[#0a0a0a]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#050505] border border-[#27272a] flex items-center justify-center overflow-hidden shrink-0">
            <img src={connectedAvatarSrc} alt="avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-bold text-white uppercase tracking-wider text-sm">{connectedUser.username}</h3>
            <span className="text-xs text-[#10b981] flex items-center uppercase tracking-widest mt-1">
              <span className="w-2 h-2 bg-[#10b981] mr-1 animate-pulse"></span> NEARBY
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => {
          const isMine = msg.senderId === localUserId;
          return (
            <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              {!isMine && (
                <img src={connectedAvatarSrc} alt="avatar" className="w-6 h-6 self-end mr-2 border border-[#27272a]" />
              )}
              <div className={`max-w-[75%] px-4 py-2 ${
                isMine 
                  ? 'bg-[#10b981] text-black border border-[#10b981]' 
                  : 'bg-[#0a0a0a] border border-[#27272a] text-neutral-300'
              }`}>
                <p className="text-sm font-sans">{msg.text}</p>
                <span className={`text-[10px] mt-1 block uppercase tracking-widest ${isMine ? 'text-black/60' : 'text-neutral-500'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {isMine && localAvatarSrc && (
                <img src={localAvatarSrc} alt="me" className="w-6 h-6 self-end ml-2 border border-[#27272a]" />
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-[#27272a] bg-[#0a0a0a]">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`MESSAGE...`}
            className="flex-1 bg-[#050505] border border-[#27272a] px-4 py-2 text-sm text-white focus:outline-none focus:border-[#10b981] font-sans"
          />
          <button 
            type="submit" 
            className="w-10 h-10 bg-[#10b981] hover:bg-[#059669] flex items-center justify-center text-black font-bold transition-colors flex-shrink-0"
          >
            &#10148;
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatPanel;
