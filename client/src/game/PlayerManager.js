import * as PIXI from "pixi.js";
import { pixiApp } from "./PixiApp";
import { emitMove } from "../socket/socketClient";
import { checkProximity } from "./ProximityEngine";

export const players = new Map();
const sprites = new Map();
let localPlayerId = null;
let setConnectedUserCallback = null;

let lastMoveTime = 0;
const MOVE_THROTTLE = 50;

const keys = {
  w: false, a: false, s: false, d: false,
  ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false
};

const SPEED = 4;

export function initPlayerManager(userId, onProximityChange) {
  localPlayerId = userId;
  setConnectedUserCallback = onProximityChange;

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  if (pixiApp) {
    pixiApp.ticker.add(updateLocalPlayer);
  }
}

export function cleanupPlayerManager() {
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("keyup", handleKeyUp);
  if (pixiApp) {
    pixiApp.ticker.remove(updateLocalPlayer);
  }
  players.clear();
  sprites.forEach(sprite => sprite.destroy());
  sprites.clear();
}

function handleKeyDown(e) {
  if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
}

function handleKeyUp(e) {
  if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
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
    localPlayer.x = Math.max(20, Math.min(800 - 20, localPlayer.x + dx));
    localPlayer.y = Math.max(20, Math.min(600 - 20, localPlayer.y + dy));

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

export function updatePlayers(serverPlayers) {
  if (!pixiApp || !pixiApp.stage) return;

  for (const [id, data] of Object.entries(serverPlayers)) {
    if (!players.has(id)) {
      createPlayerSprite(id, data);
    } else {
      const player = players.get(id);
      player.x = data.x;
      player.y = data.y;
      player.username = data.username;
      
      if (id !== localPlayerId) {
        const sprite = sprites.get(id);
        if (sprite) {
          sprite.x = data.x;
          sprite.y = data.y;
        }
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
  players.set(id, { ...data });

  const container = new PIXI.Container();
  container.x = data.x;
  container.y = data.y;

  const graphics = new PIXI.Graphics();
  const isLocal = id === localPlayerId;
  const color = isLocal ? 0x60a5fa : 0xf472b6;
  
  graphics.beginFill(color);
  graphics.drawCircle(0, 0, 20);
  graphics.endFill();

  const text = new PIXI.Text(data.username, {
    fontFamily: 'sans-serif',
    fontSize: 14,
    fill: 0xffffff,
    align: 'center',
  });
  text.anchor.set(0.5);
  text.y = -30;

  container.addChild(graphics);
  container.addChild(text);

  pixiApp.stage.addChild(container);
  sprites.set(id, container);
}

function removePlayer(id) {
  players.delete(id);
  const sprite = sprites.get(id);
  if (sprite) {
    pixiApp.stage.removeChild(sprite);
    sprite.destroy();
    sprites.delete(id);
  }
}
