import * as PIXI from "pixi.js";

export let pixiApp = null;

export async function initPixi(canvasContainer) {
  if (pixiApp) return pixiApp;

  pixiApp = new PIXI.Application();
  
  await pixiApp.init({
    width: 800,
    height: 600,
    backgroundColor: 0x0f172a,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  canvasContainer.appendChild(pixiApp.canvas);

  const grid = new PIXI.Graphics();
  const cellSize = 50;
  grid.lineStyle(1, 0x1e293b, 0.5);
  for (let x = 0; x <= 800; x += cellSize) {
    grid.moveTo(x, 0);
    grid.lineTo(x, 600);
  }
  for (let y = 0; y <= 600; y += cellSize) {
    grid.moveTo(0, y);
    grid.lineTo(800, y);
  }
  pixiApp.stage.addChild(grid);

  return pixiApp;
}

export function cleanupPixi() {
  if (pixiApp) {
    pixiApp.destroy(true, { children: true, texture: true, baseTexture: true });
    pixiApp = null;
  }
}
