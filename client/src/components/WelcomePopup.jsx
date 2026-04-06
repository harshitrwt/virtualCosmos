import React, { useState, useEffect } from 'react';

export default function WelcomePopup({ onEnter }) {
  const [isOpen, setIsOpen] = useState(true);

  const handleEnter = () => {
    setIsOpen(false);
    if (onEnter) onEnter();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505]/95 p-4 font-mono">
      <div className="bg-[#0a0a0a] border border-[#27272a] shadow-2xl max-w-lg w-full overflow-hidden transform transition-all rounded-none">
        <div className="p-8">
          <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter">VIRTUAL<span className="text-[#10b981]">COSMOS</span></h2>
          
          <div className="space-y-6 text-neutral-400 font-sans">
            <p className="leading-relaxed">
              Step into your new virtual office. This platform allows you to collaborate, interact, and work alongside your team in a proximity-based 2D environment.
            </p>
            
            <div className="bg-[#050505] p-5 border border-[#27272a]">
              <h3 className="text-sm font-bold text-[#10b981] mb-3 uppercase tracking-widest font-mono">HOW TO NAVIGATE</h3>
              <ul className="list-disc list-inside space-y-3 text-sm">
                <li><strong className="text-neutral-200">Move Around:</strong> Use <kbd className="bg-[#1f2937] border border-[#27272a] px-2 py-0.5 rounded-none font-mono text-[#10b981]">W</kbd> <kbd className="bg-[#1f2937] border border-[#27272a] px-2 py-0.5 rounded-none font-mono text-[#10b981]">A</kbd> <kbd className="bg-[#1f2937] border border-[#27272a] px-2 py-0.5 rounded-none font-mono text-[#10b981]">S</kbd> <kbd className="bg-[#1f2937] border border-[#27272a] px-2 py-0.5 rounded-none font-mono text-[#10b981]">D</kbd> or arrow keys.</li>
                <li><strong className="text-neutral-200">Proximity Chat:</strong> Walk close to a colleague to connect automatically.</li>
                <li><strong className="text-neutral-200">Explore:</strong> Visit different zones with your team.</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleEnter}
              className="bg-[#10b981] hover:bg-[#059669] text-black font-bold py-3 px-8 transition-all uppercase tracking-widest rounded-none shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              INITIALIZE OFFICE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
