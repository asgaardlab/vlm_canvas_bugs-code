# Installation steps

**Commit SHA**: `00c526ae9a61f32b8a9516b7c34a1c5f3972f5f1`

**Date**: `July 25, 2024`

This document outlines the steps to quickly set up and run the project with PIXI and TypeScript.

## Steps to Setup and Run the Project

1. **Install Required Tools**:
   - Ensure you have Rust, Cargo, wasm-pack, and Yarn installed on your system.

2. **Clone the Repository**:
   - Clone the repository and navigate to the project directory:
     ```bash
     git clone <repository-url>
     cd ourcade-ecs-dependency-injection
     ```

3. **Install Project Dependencies**:
   - Run the following command to install the necessary dependencies:
     ```bash
     yarn install
     ```

4. **Run the Development Server**:
   - Start the development server with:
     ```bash
     npm run dev
     ```

5. **Access the Application**:
   - Open your web browser and navigate to:
     ```plaintext
     http://localhost:3000/pixi.html
     ```

## Node.js Version Recommendation
- It is recommended to use Node.js version 14 or higher for compatibility with the project dependencies.

# Making PIXI or __PIXI_APP__ available to global window scope (if required)

Update `src/pixi/main.ts` as follows:

```
	import { createChildContainer } from '../container'
	import { StartGame } from '../tokens'

	import { registerBindings, registerInjections } from './register'
	import { App, Loop } from './tokens'

	const container = createChildContainer()

	registerInjections()
	registerBindings(container)

	const app = container.get(App)
	const loop = container.get(Loop)
	const startGame = container.get(StartGame)

	app.ticker.add((dt) => {
		loop(dt)
	})

	startGame()

	document.getElementById('app')?.appendChild(app.view)
+	window.__PIXI_APP__ = app;
```
