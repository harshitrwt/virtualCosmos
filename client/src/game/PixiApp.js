import * as PIXI from "pixi.js";
import devRoomImg from '../assets/devroom.png';
import waitingRoomImg from '../assets/waiting.png';
import kitchenImg from '../assets/kitchen.png';
import loungeImg from '../assets/lounge.png';
import confImg from '../assets/conf.png';
import teamImg from '../assets/team.png';

export let pixiApp = window.__PIXI_APP__ || null;
export let environmentContainer = window.__PIXI_ENV__ || null;
export let obstacles = window.__PIXI_OBS__ || [];

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // On hot reload of this file, safely redraw the environment!
    if (window.__PIXI_APP__ && window.__PIXI_ENV__) {
      window.__PIXI_ENV__.removeChildren();
      window.__PIXI_OBS__.length = 0;
      if (newModule && newModule.drawEnvironment) {
        newModule.drawEnvironment();
      }
    }
  });
}

export async function initPixi(canvasContainer) {
  if (pixiApp) {
    if (pixiApp.canvas && pixiApp.canvas.parentNode !== canvasContainer) {
      while (canvasContainer.firstChild) {
        canvasContainer.removeChild(canvasContainer.firstChild);
      }
      canvasContainer.appendChild(pixiApp.canvas);
    }
    pixiApp.renderer.resize(1600, 1000); 
    return pixiApp;
  }

  pixiApp = new PIXI.Application();
  window.__PIXI_APP__ = pixiApp;
  
  await pixiApp.init({
    width: 1600,
    height: 1000,
    backgroundColor: 0x050505,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  while (canvasContainer.firstChild) {
    canvasContainer.removeChild(canvasContainer.firstChild);
  }
  canvasContainer.appendChild(pixiApp.canvas);

  environmentContainer = new PIXI.Container();
  window.__PIXI_ENV__ = environmentContainer;
  pixiApp.stage.addChild(environmentContainer);

  window.__PIXI_OBS__ = obstacles;
  obstacles.length = 0;
  drawEnvironment();

  return pixiApp;
}

function createRoom(x, y, w, h, doorDir, wallColor, floorColor, name, bgImg) {
  if (bgImg) {
    const sprite = new PIXI.Sprite();
    sprite.x = x;
    sprite.y = y;
    sprite.alpha = 1.0;
    environmentContainer.addChild(sprite);

    const img = new Image();
    img.src = bgImg;
    img.onload = () => {
      sprite.texture = PIXI.Texture.from(img);
      sprite.width = w;
      sprite.height = h;
    };
  } else {
    const floor = new PIXI.Graphics();
    floor.rect(x, y, w, h);
    floor.fill({ color: floorColor, alpha: 0.08 });
    environmentContainer.addChild(floor);
  }

  const wallThick = 2; 
  const doorSize = 90; 
  const walls = new PIXI.Graphics();
  walls.fill({ color: 0xffffff, alpha: 0.8 }); 

  const entryText = new PIXI.Text({
    text: '▼',
    style: { fontFamily: 'Inter, sans-serif', fontSize: 14, fill: 0x4ade80, alpha: 0.8, fontWeight: 'bold' }
  });

  const addWall = (wx, wy, ww, wh) => {
    walls.rect(wx, wy, ww, wh);
    obstacles.push({x: wx, y: wy, w: ww, h: wh});
  };

  if (doorDir === 'top') {
    addWall(x, y, (w-doorSize)/2, wallThick);
    addWall(x + (w+doorSize)/2, y, (w-doorSize)/2, wallThick);
    entryText.x = x + w/2 - entryText.width/2;
    entryText.y = y - 15;
  } else {
    addWall(x, y, w, wallThick);
  }

  if (doorDir === 'bottom') {
    addWall(x, y + h - wallThick, (w-doorSize)/2, wallThick);
    addWall(x + (w+doorSize)/2, y + h - wallThick, (w-doorSize)/2, wallThick);
    entryText.text = '▲';
    entryText.x = x + w/2 - entryText.width/2;
    entryText.y = y + h - 5;
  } else {
    addWall(x, y + h - wallThick, w, wallThick);
  }

  if (doorDir === 'left') {
    addWall(x, y, wallThick, (h-doorSize)/2);
    addWall(x, y + (h+doorSize)/2, wallThick, (h-doorSize)/2);
    entryText.text = '▶';
    entryText.x = x - 15;
    entryText.y = y + h/2 - entryText.height/2;
  } else {
    addWall(x, y, wallThick, h);
  }

  if (doorDir === 'right') {
    addWall(x + w - wallThick, y, wallThick, (h-doorSize)/2);
    addWall(x + w - wallThick, y + (h+doorSize)/2, wallThick, (h-doorSize)/2);
    entryText.text = '◀';
    entryText.x = x + w + 2;
    entryText.y = y + h/2 - entryText.height/2;
  } else {
    addWall(x + w - wallThick, y, wallThick, h);
  }

  environmentContainer.addChild(walls);
  
  if (doorDir) {
    environmentContainer.addChild(entryText);
  }

  if (name) {
    const text = new PIXI.Text({
      text: name,
      style: { 
        fontFamily: 'Inter, sans-serif', 
        fontSize: 16, 
        fill: 0xffffff,
        fontWeight: 'bold',
        alpha: 0.9,
        letterSpacing: 2
      }
    });
    text.x = x + 12; text.y = y + 12;
    environmentContainer.addChild(text);
  }
}

export function drawEnvironment() {
  const wallCol = 0xffffff;
  
  createRoom(100, 50, 1400, 250, 'bottom', wallCol, 0x3b82f6, "DEVELOPMENT AREA", devRoomImg);
  
  createRoom(100, 380, 250, 300, 'right', wallCol, 0x10b981, "KITCHEN", kitchenImg);
  createRoom(400, 380, 350, 200, 'top', wallCol, 0x06b6d4, "LOUNGE", loungeImg);
  createRoom(400, 630, 350, 250, 'top', wallCol, 0x8b5cf6, "WAITING AREA", waitingRoomImg);
  
  createRoom(900, 380, 600, 250, 'left', wallCol, 0xf59e0b, "CONFERENCE ROOM", confImg);
  createRoom(1100, 680, 400, 200, 'left', wallCol, 0xec4899, "TEAM ROOM", teamImg);

  const decos = new PIXI.Graphics();
  decos.fill({ color: 0xffffff, alpha: 0.1 });
  
  decos.rect(120, 420, 80, 40); 
  decos.rect(950, 450, 300, 80); 
  decos.rect(450, 450, 100, 60); 
  decos.rect(600, 450, 100, 60); 
  
  obstacles.push({x: 120, y: 420, w: 80, h: 40});
  obstacles.push({x: 950, y: 450, w: 300, h: 80});
  obstacles.push({x: 450, y: 450, w: 100, h: 60});
  obstacles.push({x: 600, y: 450, w: 100, h: 60});

  environmentContainer.addChild(decos);
}

export function cleanupPixi() {
  if (pixiApp) {
    if (pixiApp.canvas.parentNode) {
      pixiApp.canvas.parentNode.removeChild(pixiApp.canvas);
    }
    pixiApp.destroy(true, { children: true, texture: true, baseTexture: true });
    pixiApp = null;
    environmentContainer = null;
    obstacles.length = 0;
    
    // Clear global caches
    window.__PIXI_APP__ = null;
    window.__PIXI_ENV__ = null;
    window.__PIXI_OBS__ = null;
    window.__PIXI_PLAYERS__ = null;
    window.__PIXI_SPRITES__ = null;
  }
}
