# Installation steps

**Commit SHA**: `a5512bd7d5f97e264ef6515de61ba85fca54ae53`

**Date**: `July 18, 2024`

Follow these steps to quickly get started with the game:

1. Set Node.js version to 14 using NVM:
   ```bash
   nvm use 14
   ```

2. Install project dependencies:
   ```bash
   npm i
   ```

3. Start the game:
   ```bash
   npm start
   ```

# Making PIXI or __PIXI_APP__ available to global window scope (if required)

In file `src/renderer/Renderer.ts` around line 140-150

Insert as follows:
```
  	public constructor({
	    gridWidth,
	    gridHeight,
	    tileWidth,
	    tileHeight,
	    appWidth,
	    appHeight,
	    backgroundColor,
	    autoCenterEnabled,
	}: RendererConfig) {
	    this.gridWidth = gridWidth;
	    this.gridHeight = gridHeight;
	    this.tileWidth = tileWidth;
	    this.tileHeight = tileHeight;
	    this.app = new PIXI.Application({
	      width: appWidth,
	      height: appHeight,
	      backgroundColor: hexToNumber(backgroundColor),
	      antialias: false,
	    });
	    this.app.ticker.maxFPS = 30;
	    this.autoCenterEnabled = Boolean(autoCenterEnabled);

	    this.viewport.destroy();
	    this.viewport = new Viewport({
	      screenWidth: appWidth,
	      screenHeight: appHeight,
	      worldWidth: gridWidth * tileWidth,
	      worldHeight: gridHeight * tileHeight,
	      interaction: this.app.renderer.plugins.interaction,
	    });
	    this.viewport.sortableChildren = true;
	    this.app.stage.addChild(this.viewport);
	    if (this.autoCenterEnabled) {
	      this.viewport
	        .wheel({ smooth: 10 })
	        .on("moved", () =>
	          this.viewportChangedListeners.forEach((listener) => listener())
	        );
	    }
+   	window.__PIXI_APP__ = {};
+   	Object.assign(window.__PIXI_APP__, this.app);
  }
```
