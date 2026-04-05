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
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Virtual Cosmos</h1>
          <p className="text-slate-400">{isLogin ? "Welcome back to your workspace" : "Create your identity"}</p>
        </div>

        {error && <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">{error}</div>}

        {step === 1 ? (
          <>
            <div className="flex bg-slate-900/50 p-1 rounded-xl mb-8">
              <button
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${isLogin ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-white"}`}
                onClick={() => { setIsLogin(true); setError(""); }}
              >
                Login
              </button>
              <button
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${!isLogin ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-white"}`}
                onClick={() => { setIsLogin(false); setError(""); }}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1 ml-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500"
                    placeholder="CosmicExplorer"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 ml-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500"
                  placeholder="you@domain.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 ml-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70 mt-4"
              >
                {loading ? "Please wait..." : (isLogin ? "Sign In" : "Continue to Avatar")}
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-1">Choose your Avatar</h3>
              <p className="text-sm text-slate-400 mb-4">Click one to select and create your account.</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {avatarOptions.map(seed => (
                <button
                  key={seed}
                  onClick={() => handleRegisterFinal(seed)}
                  className="bg-slate-900/50 border border-slate-700 hover:border-blue-500 rounded-xl p-2 aspect-square transition-all hover:scale-105 group"
                >
                  <img 
                    src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`} 
                    alt="avatar" 
                    className="w-full h-full object-contain group-hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  />
                </button>
              ))}
            </div>

            <button
              onClick={generateAvatars}
              className="w-full py-3 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 rounded-xl transition-colors"
            >
              Randomize Options
            </button>
            <button
              onClick={() => setStep(1)}
              className="w-full py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
