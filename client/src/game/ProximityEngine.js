import { joinRoom, leaveRoom } from "../socket/socketClient";
import { obstacles } from "./PixiApp";

export const PROXIMITY_RADIUS = 70;
let connectedUserId = null;

function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function lineIntersectsRect(x1, y1, x2, y2, rx, ry, rw, rh) {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  
  if (maxX < rx || minX > rx + rw || maxY < ry || minY > ry + rh) return false;

  const ccw = (ax, ay, bx, by, cx, cy) => (cy - ay) * (bx - ax) > (by - ay) * (cx - ax);
  const intersect = (ax, ay, bx, by, cx, cy, dx, dy) => 
    ccw(ax, ay, cx, cy, dx, dy) !== ccw(bx, by, cx, cy, dx, dy) && 
    ccw(ax, ay, bx, by, cx, cy) !== ccw(ax, ay, bx, by, dx, dy);

  return intersect(x1, y1, x2, y2, rx, ry, rx + rw, ry) || 
         intersect(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh) || 
         intersect(x1, y1, x2, y2, rx + rw, ry + rh, rx, ry + rh) || 
         intersect(x1, y1, x2, y2, rx, ry + rh, rx, ry);
}

function hasLineOfSight(x1, y1, x2, y2) {
  for (const obs of obstacles) {
    if (lineIntersectsRect(x1, y1, x2, y2, obs.x, obs.y, obs.w, obs.h)) {
      return false;
    }
  }
  return true;
}

export function checkProximity(localPlayer, otherPlayers, setConnectedUser) {
  if (!localPlayer) return;

  let closestUser = null;
  let minDistance = Infinity;

  otherPlayers.forEach((player, id) => {
    if (id === localPlayer.id) return;
    const dist = calculateDistance(localPlayer.x, localPlayer.y, player.x, player.y);
    if (dist < minDistance && dist < PROXIMITY_RADIUS) {
      if (hasLineOfSight(localPlayer.x, localPlayer.y, player.x, player.y)) {
        minDistance = dist;
        closestUser = { id, ...player };
      }
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
