import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="h-full bg-[#050505] text-neutral-300 flex flex-col font-mono selection:bg-[#10b981]/30 overflow-x-hidden">
      <nav className="flex justify-between items-center p-6 lg:px-12">
        <div className="text-2xl font-black tracking-tighter text-white">
          VIRTUAL<span className="text-[#10b981]">COSMOS</span>
        </div>
        <button
          onClick={() => navigate("/auth")}
          className="cursor-pointer text-sm font-semibold text-neutral-400 hover:text-white transition-colors uppercase tracking-widest"
        >
          Login
        </button>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#10b981]/5 rounded-none blur-[120px] pointer-events-none" />
        
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight z-10 text-white uppercase">
          Your Virtual Office, <br/><span className="text-[#10b981]">Reimagined</span>
        </h1>
        <p className="text-lg md:text-xl text-neutral-400 mb-10 max-w-2xl z-10 font-normal">
          Experience proximity-based real-time collaboration in a seamless 2D shared space. Connect naturally, just like in the real world.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 z-10 mb-20">
          <button
            onClick={() => navigate("/auth")}
            className="cursor-pointer px-8 py-4 bg-[#10b981] hover:bg-[#059669] text-black rounded-none font-bold text-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] uppercase tracking-wider"
          >
            Get Started
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full z-10">
          <FeatureCard 
            icon={<MoveIcon />}
            title="REAL-TIME MOVEMENT"
            desc="Navigate freely in a shared 2D environment and see colleagues move instantly."
          />
          <FeatureCard 
            icon={<ChatIcon />}
            title="PROXIMITY CHAT"
            desc="Conversations spark naturally—chat panels open automatically when you're nearby."
          />
          <FeatureCard 
            icon={<UserIcon />}
            title="PERSISTENT IDENTITY"
            desc="Your custom avatar and position are securely saved for your next session."
          />
        </div>
      </main>

      <footer className="text-center p-6 border-t border-[#1f2937] text-neutral-500 text-xs tracking-widest uppercase">
        <p>&copy; {new Date().getFullYear()} VIRTUAL COSMOS STUDIO. BUILT WITH REACT & PIXIJS.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="p-8 rounded-none bg-[#0a0a0a] border border-[#27272a] text-left hover:border-[#10b981] transition-colors group">
      <div className="w-12 h-12 rounded-none bg-neutral-900 border border-[#27272a] group-hover:bg-[#10b981]/10 group-hover:border-[#10b981]/30 text-[#10b981] flex items-center justify-center mb-6 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 tracking-wide text-white">{title}</h3>
      <p className="text-neutral-400 leading-relaxed font-sans text-sm">{desc}</p>
    </div>
  );
}

const MoveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 9 2 12 5 15"></polyline><polyline points="9 5 12 2 15 5"></polyline><polyline points="19 9 22 12 19 15"></polyline><polyline points="9 19 12 22 15 19"></polyline><line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line></svg>
);

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
