import { useEffect, useState, useRef } from "react";
import { socket } from "./socket/socketClient";
import { initPixi, cleanupPixi } from "./game/PixiApp";
import { initPlayerManager, cleanupPlayerManager, updatePlayers } from "./game/PlayerManager";
import { getRoomId } from "./game/ProximityEngine";
import HUD from "./components/HUD";
import ChatPanel from "./components/ChatPanel";

function App() {
  const canvasRef = useRef(null);
  const [user, setUser] = useState(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [connectedUser, setConnectedUser] = useState(null);
  const [usernameInput, setUsernameInput] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput }),
      });
      const data = await res.json();
      
      setUser(data);
      socket.io.opts.query = { userId: data.userId };
      socket.connect();
    } catch (err) {
      console.error(err);
      const fakeUser = { userId: "dev_" + Math.floor(Math.random()*1000), username: usernameInput };
      setUser(fakeUser);
    }
  };

  useEffect(() => {
    if (!user || !canvasRef.current) return;

    initPixi(canvasRef.current);
    initPlayerManager(user.userId, setConnectedUser);

    socket.on("players:update", (playersData) => {
      setOnlineCount(Object.keys(playersData).length);
      updatePlayers(playersData);
    });

    return () => {
      cleanupPlayerManager();
      cleanupPixi();
      socket.off("players:update");
    };
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 border-4 border-slate-800">
        <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-sm border border-slate-700">
          <h1 className="text-3xl font-extrabold text-blue-400 mb-6 text-center tracking-tight">Virtual Cosmos</h1>
          <input
            type="text"
            placeholder="Enter username..."
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-blue-500 mb-4"
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-colors">
            Enter the Cosmos
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900 flex items-center justify-center">
      <HUD onlineCount={onlineCount} />
      
      <div 
        ref={canvasRef} 
        className="shadow-2xl ring-1 ring-slate-800 rounded-lg overflow-hidden" 
        style={{ width: "800px", height: "600px" }}
      />
      
      {connectedUser && (
        <ChatPanel 
          connectedUser={connectedUser} 
          localUserId={user.userId} 
          roomId={getRoomId(user.userId, connectedUser.id)}
        />
      )}
    </div>
  );
}

export default App;
