# Installation steps

**Commit SHA**: `3c95c02ae590b959607ba808fea0eb89412f310c`

**Date**: `July 30, 2024`

This guide outlines the steps to set up and run the Getkey-BLE application.

## Steps to Set Up Your Development Environment

1. **Set Node Version**:
   Ensure you are using the correct Node.js version with NVM:
   ```bash
   nvm use 16
   ```

2. **Install Dependencies**:
   Navigate to the project directory and install the required dependencies using Yarn:
   ```bash
   yarn install
   ```

3. **Run the Development Server**:
   Once the installation is complete, start the development server with:
   ```bash
   yarn dev
   ```

4. **Access the Editor**:
   Open your web browser and navigate to:
   ```
   http://localhost:8080
   ```

This will allow you to access the level editor for the game BombHopper.io.

# Making PIXI or __PIXI_APP__ available to global window scope (if required)

In `src/app.ts` around line 17 modify as follows:

```
	const app = new Application({
		backgroundColor: 0x121f1f,
		resizeTo: pixiContainer,
	});

+	(window as any).__PIXI_APP__ = app;
```
