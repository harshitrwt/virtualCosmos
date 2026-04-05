import { useEffect, useState, useRef } from "react";
import { socket, connectSocket, disconnectSocket } from "../socket/socketClient";
import { initPixi, cleanupPixi } from "../game/PixiApp";
import { initPlayerManager, cleanupPlayerManager, updatePlayers } from "../game/PlayerManager";
import { getRoomId } from "../game/ProximityEngine";
import HUD from "../components/HUD";
import ChatPanel from "../components/ChatPanel";
import { useNavigate } from "react-router-dom";

export default function Game() {
  const canvasRef = useRef(null);
  const [user, setUser] = useState(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [connectedUser, setConnectedUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      navigate("/auth");
      return;
    }

    try {
      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);
      connectSocket(token);
    } catch (e) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/auth");
    }

    return () => {
      disconnectSocket();
    };
  }, [navigate]);

  useEffect(() => {
    if (!user || !canvasRef.current) return;

    let isMounted = true;
    const setup = async () => {
      await initPixi(canvasRef.current);
      if (!isMounted) return;
      initPlayerManager(user.userId, setConnectedUser);
      socket.emit('players:request');
    };
    setup();

    socket.on("players:update", (playersData) => {
      if (!isMounted) return;
      setOnlineCount(Object.keys(playersData).length);
      updatePlayers(playersData);
    });

    return () => {
      isMounted = false;
      cleanupPlayerManager();
      // DO NOT call cleanupPixi() here! It causes blank screen on HMR.
      socket.off("players:update");
    };
  }, [user]);

  // Clean up Pixi ONLY when the component is actually unmounted (e.g., logging out)
  useEffect(() => {
    return () => {
      cleanupPixi();
    };
  }, []);

  const handleLogout = () => {
    disconnectSocket();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth");
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-[#1A1E29]">
      <div className="absolute inset-0 overflow-auto">
        <div 
          ref={canvasRef} 
          className="relative w-[1600px] h-[1000px] pointer-events-auto"
        />
      </div>
      
      <div className="fixed top-0 left-0 w-full z-40 pointer-events-none">
        <div className="pointer-events-auto">
          <HUD onlineCount={onlineCount} username={user.username} onLogout={handleLogout} />
        </div>
      </div>
      
      {connectedUser && (
        <div className="fixed top-0 right-0 h-full w-[350px] z-50 pointer-events-auto shadow-[-20px_0_40px_-15px_rgba(0,0,0,0.5)]">
          <ChatPanel 
            connectedUser={connectedUser} 
            localUserId={user.userId} 
            roomId={getRoomId(user.userId, connectedUser.id)}
          />
        </div>
      )}
    </div>
  );
}
