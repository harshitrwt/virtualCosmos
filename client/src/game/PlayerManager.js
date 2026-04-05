import * as PIXI from "pixi.js";
import { pixiApp, obstacles } from "./PixiApp";
import { emitMove } from "../socket/socketClient";
import { checkProximity } from "./ProximityEngine";

export const players = window.__PIXI_PLAYERS__ || new Map();
const sprites = window.__PIXI_SPRITES__ || new Map();
window.__PIXI_PLAYERS__ = players;
window.__PIXI_SPRITES__ = sprites;
let localPlayerId = null;
let setConnectedUserCallback = null;

let lastMoveTime = 0;
const MOVE_THROTTLE = 50; 

const keys = {
  w: false, a: false, s: false, d: false,
  ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false
};

const SPEED = 4;
const PLAYER_RADIUS = 14;

export function initPlayerManager(userId, onProximityChange) {
  localPlayerId = userId;
  setConnectedUserCallback = onProximityChange;

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  if (pixiApp) {
    pixiApp.ticker.add(updateLocalPlayer);
    pixiApp.ticker.add(interpolateRemotePlayers);
  }
}

export function cleanupPlayerManager(fullCleanup = false) {
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("keyup", handleKeyUp);
  if (pixiApp) {
    pixiApp.ticker.remove(updateLocalPlayer);
    pixiApp.ticker.remove(interpolateRemotePlayers);
  }
  
  if (fullCleanup) {
    players.clear();
    sprites.forEach(sprite => sprite.destroy(true));
    sprites.clear();
  }
}

function handleKeyDown(e) {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
  }
}

function handleKeyUp(e) {
  if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
}

function checkCollision(x, y) {
  const buffer = 16; 
  for (const obs of obstacles) {
    const hitX = (x + buffer > obs.x) && (x - buffer < obs.x + obs.w);
    const hitY = (y + buffer > obs.y) && (y - buffer < obs.y + obs.h);
    if (hitX && hitY) return true;
  }
  return false;
}

function updateLocalPlayer() {
  if (!localPlayerId || !players.has(localPlayerId)) return;

  const localPlayer = players.get(localPlayerId);
  let dx = 0; let dy = 0;

  if (keys.w || keys.ArrowUp) dy -= SPEED;
  if (keys.s || keys.ArrowDown) dy += SPEED;
  if (keys.a || keys.ArrowLeft) dx -= SPEED;
  if (keys.d || keys.ArrowRight) dx += SPEED;

  if (dx !== 0 || dy !== 0) {
    const w = 1600;
    const h = 1000;
    
    let newX = Math.max(PLAYER_RADIUS, Math.min(w - PLAYER_RADIUS, localPlayer.x + dx));
    let newY = Math.max(PLAYER_RADIUS, Math.min(h - PLAYER_RADIUS, localPlayer.y + dy));

    if (checkCollision(newX, localPlayer.y)) newX = localPlayer.x;
    if (checkCollision(localPlayer.x, newY)) newY = localPlayer.y;
    if (checkCollision(newX, newY)) {
      newX = localPlayer.x;
      newY = localPlayer.y;
    }

    if (newX !== localPlayer.x || newY !== localPlayer.y) {
      localPlayer.x = newX;
      localPlayer.y = newY;

      const sprite = sprites.get(localPlayerId);
      if (sprite) {
        sprite.x = localPlayer.x;
        sprite.y = localPlayer.y;
      }

      const now = Date.now();
      if (now - lastMoveTime > MOVE_THROTTLE) {
        emitMove(localPlayer.x, localPlayer.y);
        lastMoveTime = now;
      }

      checkProximity({ id: localPlayerId, ...localPlayer }, players, setConnectedUserCallback);
    }
  }
}

function interpolateRemotePlayers(time) {
  const LERP_FACTOR = 0.2; 
  players.forEach((player, id) => {
    if (id !== localPlayerId && player.targetX !== undefined && player.targetY !== undefined) {
      const sprite = sprites.get(id);
      if (sprite) {
        sprite.x += (player.targetX - sprite.x) * LERP_FACTOR;
        sprite.y += (player.targetY - sprite.y) * LERP_FACTOR;
        player.x = sprite.x;
        player.y = sprite.y;
      }
    }
  });
}

export function updatePlayers(serverPlayers) {
  if (!pixiApp || !pixiApp.stage) return;

  for (const [id, data] of Object.entries(serverPlayers)) {
    if (!players.has(id)) {
      createPlayerSprite(id, data);
    } else {
      const player = players.get(id);
      player.username = data.username;
      player.avatarStyle = data.avatarStyle;
      player.avatarSeed = data.avatarSeed;
      
      const sprite = sprites.get(id);
      if (sprite && id !== localPlayerId) {
        player.targetX = data.x;
        player.targetY = data.y;
      }
    }
  }

  for (const id of players.keys()) {
    if (!serverPlayers[id]) {
      removePlayer(id);
    }
  }
}

function createPlayerSprite(id, data) {
  players.set(id, { ...data, targetX: data.x, targetY: data.y });

  const container = new PIXI.Container();
  container.x = data.x;
  container.y = data.y;

  const fallback = new PIXI.Graphics();
  fallback.circle(0, 0, 14);
  fallback.fill({ color: id === localPlayerId ? 0x60a5fa : 0xf472b6 });
  container.addChild(fallback);

  const style = data.avatarStyle || 'avataaars';
  const seed = data.avatarSeed || data.username || 'default';
  const spriteUrl = `https://api.dicebear.com/9.x/${style}/png?seed=${seed}&size=32`;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = spriteUrl;
  img.onload = () => {
    try {
      const texture = PIXI.Texture.from(img);
      const sprite = new PIXI.Sprite(texture);
      sprite.width = 32;
      sprite.height = 32;
      sprite.anchor.set(0.5);
      
      container.removeChild(fallback);
      container.addChildAt(sprite, 0);
    } catch(e) {
      console.warn("Could not apply loaded image texture in PixiJS", e);
    }
  };

  const text = new PIXI.Text({
    text: data.username,
    style: {
      fontFamily: 'sans-serif',
      fontSize: 14,
      fill: 0xffffff,
      align: 'center',
      dropShadow: {
        alpha: 0.8,
        angle: Math.PI / 4,
        blur: 3,
        color: 0x000000,
        distance: 1,
      }
    }
  });

  text.anchor.set(0.5);
  text.y = -35;
  container.addChild(text);

  pixiApp.stage.addChild(container);
  sprites.set(id, container);
}

function removePlayer(id) {
  players.delete(id);
  const sprite = sprites.get(id);
  if (sprite) {
    pixiApp.stage.removeChild(sprite);
    sprite.destroy({ children: true });
    sprites.delete(id);
  }
}
