# Installation steps

**Commit SHA**: `9e71bdad7ef3f4140340f86861ea3d7a66c21243`

**Date**: `July 18, 2024`

1. Set Node.js version to 14 using NVM:
   ```bash
   nvm use 14
   ```

2. Install project dependencies:
   ```bash
   yarn install
   ```

3. Start the development server:
   ```bash
   yarn dev
   ```

# Making PIXI or __PIXI_APP__ available to global window scope

In file `./src/App.svelte`, around line 176
```
	/* APPLICATION */
	let app = new PIXI.Application({
		backgroundAlpha: 0,
		width: window.innerWidth,
		height: window.innerHeight,
		resizeTo: window,
	});

+	window.__PIXI_APP__ = app;
```
