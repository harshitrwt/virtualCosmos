import { joinRoom, leaveRoom } from "../socket/socketClient";

export const PROXIMITY_RADIUS = 70;
let connectedUserId = null;

function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

export function checkProximity(localPlayer, otherPlayers, setConnectedUser) {
  if (!localPlayer) return;

  let closestUser = null;
  let minDistance = Infinity;

  otherPlayers.forEach((player, id) => {
    if (id === localPlayer.id) return;
    const dist = calculateDistance(localPlayer.x, localPlayer.y, player.x, player.y);
    if (dist < minDistance) {
      minDistance = dist;
      closestUser = { id, ...player };
    }
  });

  if (closestUser && minDistance < PROXIMITY_RADIUS) {
    if (connectedUserId !== closestUser.id) {
      if (connectedUserId) {
        const oldRoom = getRoomId(localPlayer.id, connectedUserId);
        leaveRoom(oldRoom);
      }

      connectedUserId = closestUser.id;
      const newRoom = getRoomId(localPlayer.id, connectedUserId);
      joinRoom(newRoom);
      setConnectedUser(closestUser); 
    }
  } else {
    if (connectedUserId) {
      const roomToLeave = getRoomId(localPlayer.id, connectedUserId);
      leaveRoom(roomToLeave);
      connectedUserId = null;
      setConnectedUser(null);
    }
  }
}

export function getRoomId(id1, id2) {
  const sortedIds = [id1, id2].sort();
  return `room_${sortedIds[0]}_${sortedIds[1]}`;
}
