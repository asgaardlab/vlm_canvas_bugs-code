# Installation steps

**Commit SHA**: `3a373ae8f8ce3f1c61f3cdb5567b89043b32e65d`

**Date**: `July 29, 2024`

## Steps to Setup and Run the Project

1. **Start with a Clean Repository**:
   - Ensure you have cloned the `higlass-higlass` repository.

2. **Use Node Version 20**:
   - Use nvm to switch to Node.js version 20:
     ```bash
     nvm use 20
     ```

3. **Install Node.js Dependencies**:
   - Cleanly install the dependencies using npm:
     ```bash
     npm clean-install
     ```

4. **Start the Development Server**:
   - Run the following command to start the server:
     ```bash
     npm run start
     ```
   - This will start a server in development mode at `http://localhost:5173/`.

5. **View Examples**:
   - Once the server is running, examples can be explored by navigating to:
     ```plaintext
     http://localhost:5173/examples.html
     ```

## Troubleshooting
- If you face installation issues related to `sharp` and `node-gyp`, you can run:
  ```bash
  npm ci --python=/usr/bin/python2 && rm -rf node_modules/node-sass && npm ci
  ```

## Summary
This Quick Start will help you quickly set up and run the Higlass project. Follow these steps to start the development server and explore the application.

# Making PIXI or __PIXI_APP__ available to global window scope (if required)

In `app/scripts/HiGlassComponent.jsx` around Line 544, update as follows:

```
	    const versionNumber = parseInt(PIXI.VERSION[0], 10);

	    if (versionNumber === 4) {
	      console.warn(
	        'Deprecation warning: please update Pixi.js to version 5 or above!',
	      );
	      if (this.props.options.renderer === 'canvas') {
	        this.pixiRenderer = new GLOBALS.PIXI.CanvasRenderer(rendererOptions);
	      } else {
	        this.pixiRenderer = new GLOBALS.PIXI.WebGLRenderer(rendererOptions);
	      }

	    } else {
	      if (versionNumber < 4) {
	        console.warn(
	          'Deprecation warning: please update Pixi.js to version 5 or above! ' +
	            'This version of Pixi.js is unsupported. Good luck 🤞',
	        );
	      }

	      if (this.props.options.renderer === 'canvas') {
	        this.pixiRenderer = new GLOBALS.PIXI.CanvasRenderer(rendererOptions);
	      } else {
	        this.pixiRenderer = new GLOBALS.PIXI.Renderer(rendererOptions);
	      }
	    }

+	    this.stage = this.pixiStage;
+	    this.renderer = this.pixiRenderer;
+   	window.__PIXI_APP__ = this;
```