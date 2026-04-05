import * as PIXI from "pixi.js";

export let pixiApp = null;

export const obstacles = [];

export async function initPixi(canvasContainer) {
  if (pixiApp) return pixiApp;

  pixiApp = new PIXI.Application();
  
  await pixiApp.init({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x5F6368, // Light grey/white office setup
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  window.addEventListener("resize", handleResize);

  while (canvasContainer.firstChild) {
    canvasContainer.removeChild(canvasContainer.firstChild);
  }
  canvasContainer.appendChild(pixiApp.canvas);

  obstacles.length = 0;
  drawEnvironment();

  return pixiApp;
}

function createRoom(x, y, w, h, doorDir, wallColor, floorColor, name) {
  // Floor
  const floor = new PIXI.Graphics();
  floor.rect(x, y, w, h);
  floor.fill({ color: floorColor, alpha: 0.15 }); // Lighter floor
  pixiApp.stage.addChild(floor);

  // Walls
  const wallThick = 8; // Slightly thinner walls
  const doorSize = 70; // Plenty of room for 40px player
  const walls = new PIXI.Graphics();
  walls.fill({ color: wallColor, alpha: 0.85 });

  // Add Wall Collision Helper
  const addWall = (wx, wy, ww, wh) => {
    walls.rect(wx, wy, ww, wh);
    obstacles.push({x: wx, y: wy, w: ww, h: wh});
  };

  // Top wall
  if (doorDir === 'top') {
    addWall(x, y, (w-doorSize)/2, wallThick);
    addWall(x + (w+doorSize)/2, y, (w-doorSize)/2, wallThick);
  } else {
    addWall(x, y, w, wallThick);
  }

  // Bottom wall
  if (doorDir === 'bottom') {
    addWall(x, y + h - wallThick, (w-doorSize)/2, wallThick);
    addWall(x + (w+doorSize)/2, y + h - wallThick, (w-doorSize)/2, wallThick);
  } else {
    addWall(x, y + h - wallThick, w, wallThick);
  }

  // Left wall
  if (doorDir === 'left') {
    addWall(x, y, wallThick, (h-doorSize)/2);
    addWall(x, y + (h+doorSize)/2, wallThick, (h-doorSize)/2);
  } else {
    addWall(x, y, wallThick, h);
  }

  // Right wall
  if (doorDir === 'right') {
    addWall(x + w - wallThick, y, wallThick, (h-doorSize)/2);
    addWall(x + w - wallThick, y + (h+doorSize)/2, wallThick, (h-doorSize)/2);
  } else {
    addWall(x + w - wallThick, y, wallThick, h);
  }

  pixiApp.stage.addChild(walls);

  if (name) {
    const text = new PIXI.Text({
      text: name,
      style: { 
        fontFamily: 'sans-serif', 
        fontSize: 16, 
        fill: 0x475569, // Dark slate text for legibility
        fontWeight: 'bold' 
      }
    });
    text.x = x + 12; text.y = y + 12;
    pixiApp.stage.addChild(text);
  }
}

function drawEnvironment() {
  // Smaller Rooms setup for light theme
  const wallCol = 0x64748b; // Slate 500 walls
  const floorCol = 0x94a3b8; // Slate 400 floor
  
  // Adjusted sizes to be smaller
  createRoom(200, 200, 220, 160, 'bottom', wallCol, floorCol, "Meeting Room");
  createRoom(1300, 150, 200, 220, 'left', wallCol, 0x38bdf8, "Lounge"); // sky blue floor tint
  createRoom(50, 550, 180, 150, 'top', wallCol, 0x10b981, "Kitchen"); // emerald tint
  createRoom(800, 500, 200, 180, 'left', wallCol, 0xa855f7, "Engineering"); // purple tint

  // Furniture (Solid blocks within rooms or outside)
  const furniture = new PIXI.Graphics();
  furniture.fill({ color: 0xcbcfd5, alpha: 1.0 }); // Light grey tables
  
  // Meeting Room table (Center of 200,200)
  const mrTx = 250; const mrTy = 250;
  furniture.rect(mrTx, mrTy, 120, 40);
  obstacles.push({x: mrTx, y: mrTy, w: 120, h: 40});

  // Lounge Sofas
  furniture.fill({ color: 0x94a3b8, alpha: 1.0 });
  const sofa1x = 680; const sofa1y = 180;
  const sofa2x = 680; const sofa2y = 280;
  furniture.rect(sofa1x, sofa1y, 100, 30);
  furniture.rect(sofa2x, sofa2y, 100, 30);
  obstacles.push({x: sofa1x, y: sofa1y, w: 100, h: 30});
  obstacles.push({x: sofa2x, y: sofa2y, w: 100, h: 30});

  // Kitchen Counter
  const kcx = 260; const kcy = 600;
  furniture.rect(kcx, kcy, 100, 30);
  obstacles.push({x: kcx, y: kcy, w: 100, h: 30});

  pixiApp.stage.addChild(furniture);

  // Plants (Solid obstacles)
  const plants = new PIXI.Graphics();
  plants.fill({ color: 0x10b981, alpha: 0.9 }); // Bright green plants
  
  const plantRadius = 15;
  const plantPositions = [
    {x: 215, y: 215}, {x: 405, y: 215}, 
    {x: 785, y: 165}, {x: 150, y: 400},
    {x: 550, y: 560}, {x: 980, y: 660}
  ];

  plantPositions.forEach(p => {
    plants.circle(p.x, p.y, plantRadius);
    // Rough bounding box for circular plant
    obstacles.push({x: p.x - plantRadius*.8, y: p.y - plantRadius*.8, w: plantRadius*1.6, h: plantRadius*1.6});
  });

  pixiApp.stage.addChild(plants);
}

function handleResize() {
  if (pixiApp) {
    pixiApp.renderer.resize(window.innerWidth, window.innerHeight);
  }
}

export function cleanupPixi() {
  window.removeEventListener("resize", handleResize);
  if (pixiApp) {
    if (pixiApp.canvas.parentNode) {
      pixiApp.canvas.parentNode.removeChild(pixiApp.canvas);
    }
    pixiApp.destroy(true, { children: true, texture: true, baseTexture: true });
    pixiApp = null;
  }
}
