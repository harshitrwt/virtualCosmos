import React, { useState, useEffect, useRef } from 'react';
import { socket, emitMessage } from '../socket/socketClient';

function ChatPanel({ connectedUser, localUserId, roomId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (roomId) {
      setMessages([]);
      fetch(`/api/history/${roomId}`)
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
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-slate-900/95 backdrop-blur-xl border-l border-slate-700 shadow-2xl flex flex-col transition-transform duration-300 ease-out translate-x-0 z-20">
      <div className="px-6 py-4 flex items-center justify-between border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center overflow-hidden shrink-0">
            <img src={connectedAvatarSrc} alt="avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100">{connectedUser.username}</h3>
            <span className="text-xs text-green-400 flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></span> Nearby
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
                <img src={connectedAvatarSrc} alt="avatar" className="w-6 h-6 rounded-full self-end mr-2" />
              )}
              <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                isMine 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-slate-700 text-slate-100 rounded-bl-none'
              }`}>
                <p className="text-sm">{msg.text}</p>
                <span className="text-[10px] opacity-60 mt-1 block">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {isMine && localAvatarSrc && (
                <img src={localAvatarSrc} alt="me" className="w-6 h-6 rounded-full self-end ml-2" />
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-slate-700 bg-slate-800/30">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${connectedUser.username}...`}
            className="flex-1 bg-slate-700/50 border border-slate-600 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button 
            type="submit" 
            className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white transition-colors flex-shrink-0 shadow-lg shadow-blue-500/20"
          >
            &#10148;
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatPanel;
