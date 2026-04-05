import React from 'react';

function HUD({ onlineCount, username, onLogout }) {
  return (
    <div className="absolute top-0 left-0 w-full pointer-events-none z-10 flex justify-between p-4">
      
      <div className="bg-slate-800/80 backdrop-blur-md px-2 py-2 rounded-full border border-slate-700 shadow-lg flex items-center space-x-2">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-slate-200 font-medium">{onlineCount}</span>
      </div>

      <div className="bg-slate-800/80 backdrop-blur-md px-2 py-2 rounded-full border border-slate-700 shadow-lg flex items-center space-x-2">
        <h1>Welcome to Vcosmos Office </h1>
       
      </div>
      <div className="flex items-center space-x-4">
        <div className="bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700 shadow-lg hidden sm:flex items-center">
          <span className="text-slate-300 mr-2 text-sm">Logged as</span>
          <span className="text-blue-400 font-bold">{username}</span>
        </div>
        <button 
          onClick={onLogout}
          className="pointer-events-auto bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700 shadow-lg text-slate-200 font-medium transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default HUD;
