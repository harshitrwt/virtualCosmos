import React from 'react';

function HUD({ onlineCount }) {
  return (
    <div className="absolute top-4 left-4 pointer-events-none z-10">
      <div className="bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700 shadow-lg flex items-center space-x-2">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-slate-200 font-medium">Cosmonauts Online: {onlineCount}</span>
      </div>
    </div>
  );
}

export default HUD;
