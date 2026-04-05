import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <nav className="flex justify-between items-center p-6 lg:px-12 border-b border-slate-800">
        <div className="text-2xl font-extrabold tracking-tighter text-blue-400">
          Virtual Cosmos
        </div>
        <button
          onClick={() => navigate("/auth")}
          className="text-sm font-semibold hover:text-blue-400 transition-colors"
        >
          Login
        </button>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight z-10">
          Your Virtual Office, <span className="text-blue-500">Reimagined</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl z-10 font-light">
          Experience proximity-based real-time collaboration in a seamless 2D shared space. Connect naturally, just like in the real world.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 z-10 mb-20">
          <button
            onClick={() => navigate("/auth")}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate("/auth")}
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold text-lg transition-all border border-slate-700"
          >
            Login
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full z-10">
          <FeatureCard 
            icon={<MoveIcon />}
            title="Real-time Movement"
            desc="Navigate freely in a shared 2D environment and see colleagues move instantly."
          />
          <FeatureCard 
            icon={<ChatIcon />}
            title="Proximity Chat"
            desc="Conversations spark naturally—chat panels open automatically when you're nearby."
          />
          <FeatureCard 
            icon={<UserIcon />}
            title="Persistent Identity"
            desc="Your custom avatar and position are securely saved for your next session."
          />
        </div>
      </main>

      <footer className="text-center p-6 border-t border-slate-800 text-slate-500 text-sm">
        <p>Virtual Cosmos &copy; {new Date().getFullYear()}. Built with React, PixiJS and Socket.IO.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm text-left hover:bg-slate-800 transition-colors">
      <div className="w-12 h-12 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{desc}</p>
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
