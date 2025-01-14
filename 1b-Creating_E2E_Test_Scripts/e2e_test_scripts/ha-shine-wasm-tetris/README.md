# Installation steps...

**Commit SHA**: `9e96f6ea268dc4b62655ab112d2d40959f4e172e`

**Date**: `25 July 2024`


This document outlines the steps taken to set up the project with PIXI and TypeScript.

## Steps to Setup and Run the Project

1. **Installed Required Tools**:
   - Installed Rust, Cargo, wasm-pack, and Yarn on your system.

2. `nvm use 20`

3. **Installed Project Dependencies**:
   - Navigated to your project directory and ran:
     ```bash
     yarn install
     ```

4. **Added TypeScript Definitions for PIXI**:
   - Added the PIXI type definitions by running:
     ```bash
     yarn add --dev @types/pixi.js
     ```

5. **Started the Development Server**:
   - Launched the project using:
     ```bash
     npm start
     ```
## Summary

By following these steps, you successfully set up your project environment, allowing you to develop with PIXI and TypeScript effectively.

# Making PIXI or __PIXI_APP__ available to global window scope (if required)

In file: `ts/Applications.ts` around line 22:

```
	export class Application {
	    private readonly app: PIXI.Application;
	    private readonly state: GameState;
	    private readonly renderer: Renderer;
	    private readonly ticker: PIXI.Ticker;

	    private constructor(canvas: HTMLCanvasElement, resources: Record<string, any>) {
	        this.app = new PIXI.Application({
	            width: CANVAS_WIDTH,
	            height: CANVAS_HEIGHT,
	            backgroundAlpha: 0,
	            antialias: true,
	            view: canvas
	        });
	        //@ts-ignore
+	        window.__PIXI_APP__ = this.app;

```