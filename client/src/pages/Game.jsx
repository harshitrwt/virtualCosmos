import { useEffect, useState, useRef } from "react";
import { socket, connectSocket, disconnectSocket } from "../socket/socketClient";
import { initPixi, cleanupPixi } from "../game/PixiApp";
import { initPlayerManager, cleanupPlayerManager, updatePlayers } from "../game/PlayerManager";
import { getRoomId } from "../game/ProximityEngine";
import HUD from "../components/HUD";
import ChatPanel from "../components/ChatPanel";
import WelcomePopup from "../components/WelcomePopup";
import { useNavigate } from "react-router-dom";
import leftImg from "../assets/left.png";
import rightImg from "../assets/rightpath.png";

export default function Game() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const [user, setUser] = useState(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [connectedUser, setConnectedUser] = useState(null);
  const [hasEntered, setHasEntered] = useState(false);
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
      socket.off("players:update");
    };
  }, [user]);


  useEffect(() => {
    return () => {
      // Intentionally empty to prevent HMR from destroying the Pixi instance!
    };
  }, []);

  const handleEnterOffice = () => {
    setHasEntered(true);
    if (audioRef.current) {
      audioRef.current.volume = 0.3; 
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
  };

  const handleLogout = () => {
    disconnectSocket();
    cleanupPixi();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth");
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-[#050505] overflow-hidden">
      {!hasEntered && <WelcomePopup onEnter={handleEnterOffice} />}
      
      
      <audio 
        ref={audioRef} 
        src="https://cdn.pixabay.com/download/audio/2021/08/04/audio_3d1da9a6a8.mp3" 
        loop 
        preload="auto"
      />

      <img src={leftImg} className="absolute left-0 top-0 h-full w-1/2 object-cover object-right opacity-70 pointer-events-none" alt="" />
      <img src={rightImg} className="absolute right-0 top-0 h-full w-1/2 object-cover object-left opacity-70 pointer-events-none" alt="" />

      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div 
          ref={canvasRef} 
          className="relative pointer-events-auto w-full h-full flex items-center justify-center [&>canvas]:max-w-full [&>canvas]:max-h-full [&>canvas]:object-contain"
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
