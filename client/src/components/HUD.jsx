import React from 'react';

function HUD({ onlineCount, username, onLogout }) {
  return (
    <div className="absolute top-0 left-0 w-full pointer-events-none z-10 flex justify-between p-4 font-mono">
      
      <div className="bg-[#050505] px-3 py-2 border border-[#27272a] flex items-center space-x-3">
        <div className="w-2 h-2 bg-[#10b981] rounded-none animate-pulse"></div>
        <span className="text-white text-xs font-bold tracking-widest">{onlineCount} ONLINE</span>
      </div>

      
      <div className="flex items-center space-x-4">
        <div className="bg-[#050505] px-4 py-2 border border-[#27272a] hidden sm:flex items-center">
          <span className="text-neutral-500 mr-2 text-xs uppercase tracking-widest">LOGGED IN AS</span>
          <span className="text-[#10b981] font-bold text-xs uppercase tracking-widest">{username}</span>
        </div>
        <button 
          onClick={onLogout}
          className="pointer-events-auto bg-[#10b981] hover:bg-[#059669] px-4 py-2 text-black text-xs font-bold transition-colors uppercase tracking-widest"
        >
          LOGOUT
        </button>
      </div>
    </div>
  );
}

export default HUD;
