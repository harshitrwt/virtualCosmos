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

    const setup = async () => {
      await initPixi(canvasRef.current);
      initPlayerManager(user.userId, setConnectedUser);
      socket.emit('players:request');
    };
    setup();

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

  const handleLogout = () => {
    disconnectSocket();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth");
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 overflow-hidden bg-slate-50">
      <div 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-auto"
      />
      
      <HUD onlineCount={onlineCount} username={user.username} onLogout={handleLogout} />
      
      {connectedUser && (
        <div className="absolute top-0 right-0 h-full w-[350px] z-50 pointer-events-auto shadow-[-20px_0_40px_-15px_rgba(0,0,0,0.5)]">
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
