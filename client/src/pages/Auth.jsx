import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1); // 1 = form, 2 = avatar

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  // Avatar states
  const [avatarSeed, setAvatarSeed] = useState("");
  const [avatarOptions, setAvatarOptions] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Check if token exists, redirect to game
    const token = localStorage.getItem("token");
    if (token) navigate("/game");
  }, [navigate]);

  const generateAvatars = () => {
    const options = Array.from({ length: 6 }).map(() => Math.random().toString(36).substring(7));
    setAvatarOptions(options);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/game");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      if (step === 1) {
        if (!username || !email || !password) return setError("All fields are required");
        generateAvatars();
        setStep(2);
      }
    }
  };

  const handleRegisterFinal = async (seed) => {
    setLoading(true);
    setAvatarSeed(seed);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          avatarStyle: "avataaars",
          avatarSeed: seed,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Auto login
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.error);

      localStorage.setItem("token", loginData.token);
      localStorage.setItem("user", JSON.stringify(loginData.user));
      navigate("/game");
    } catch (err) {
      setError(err.message);
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden font-mono text-neutral-300">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#10b981]/5 rounded-none blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#10b981]/5 rounded-none blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#0a0a0a] backdrop-blur-xl border border-[#27272a] rounded-sm p-8 shadow-2xl z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2 uppercase">VIRTUAL<span className="text-[#10b981]">COSMOS</span></h1>
          <p className="text-neutral-500 text-sm tracking-widest uppercase">{isLogin ? "Welcome back" : "Create identity"}</p>
        </div>

        {error && <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">{error}</div>}

        {step === 1 ? (
          <>
            <div className="flex bg-[#050505] border border-[#27272a] p-1 rounded-sm mb-8">
              <button
                className={`flex-1 py-2 rounded-sm text-sm font-bold uppercase tracking-wider transition-all ${isLogin ? "bg-[#10b981] text-black" : "text-neutral-500 hover:text-white"}`}
                onClick={() => { setIsLogin(true); setError(""); }}
              >
                Login
              </button>
              <button
                className={`flex-1 py-2 rounded-sm text-sm font-bold uppercase tracking-wider transition-all ${!isLogin ? "bg-[#10b981] text-black" : "text-neutral-500 hover:text-white"}`}
                onClick={() => { setIsLogin(false); setError(""); }}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1 ml-1 uppercase tracking-wider">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#050505] border border-[#27272a] rounded-sm px-4 py-3 text-white focus:outline-none focus:border-[#10b981] transition-all placeholder:text-neutral-600 font-sans"
                    placeholder="CosmicExplorer"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1 ml-1 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#050505] border border-[#27272a] rounded-sm px-4 py-3 text-white focus:outline-none focus:border-[#10b981] transition-all placeholder:text-neutral-600 font-sans"
                  placeholder="you@domain.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1 ml-1 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#050505] border border-[#27272a] rounded-sm px-4 py-3 text-white focus:outline-none focus:border-[#10b981] transition-all placeholder:text-neutral-600 font-sans"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#10b981] hover:bg-[#059669] text-black font-bold py-3.5 rounded-sm transition-all uppercase tracking-wider disabled:opacity-50 mt-4"
              >
                {loading ? "PLEASE WAIT..." : (isLogin ? "SIGN IN" : "CONTINUE")}
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-1 uppercase tracking-widest">CHOOSE AVATAR</h3>
              <p className="text-xs text-neutral-500 mb-4 uppercase tracking-wider">Select one to begin.</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {avatarOptions.map(seed => (
                <button
                  key={seed}
                  onClick={() => handleRegisterFinal(seed)}
                  className="bg-[#050505] border border-[#27272a] hover:border-[#10b981] rounded-sm p-2 aspect-square transition-all hover:scale-105 group"
                >
                  <img 
                    src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`} 
                    alt="avatar" 
                    className="w-full h-full object-contain group-hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                  />
                </button>
              ))}
            </div>

            <button
              onClick={generateAvatars}
              className="w-full py-3 text-sm font-bold text-neutral-300 hover:text-white bg-[#050505] border border-[#27272a] hover:border-[#1f2937] rounded-sm transition-colors uppercase tracking-wider"
            >
              RANDOMIZE OPTIONS
            </button>
            <button
              onClick={() => setStep(1)}
              className="w-full py-2 text-sm text-neutral-500 hover:text-neutral-300 transition-colors uppercase tracking-wider font-bold"
            >
              BACK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
