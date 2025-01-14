# Installation steps

**Commit SHA**: `14fa53d`

**Date**: `July 17, 2024`

To quickly get started with the "ants-sandbox" project, follow these simple steps:

1. **Node Version Manager Configuration:**
    - Make sure to switch to Node.js version 14 using `nvm use 14`

2. **Install Dependencies:**
    - Run `npm i` to install the project dependencies

3. **Start the Development Server:**
    - Execute `npm run start` to start the development server

**Note:**
- Ensure that you have Node.js version 14 installed before proceeding with the setup.
- These steps assume that you have already cloned and navigated to the "ants-sandbox" repository.

# Making PIXI or __PIXI_APP__ available to global window scope (if required)

In the file: `src/canvas/canvas.ts`

Add `window.__PIXI_APP__ = this.app` around line 14/15 as follows:
```
	      resizeTo: window,
	      backgroundColor: 0x111111,
	    });
+	    window.__PIXI_APP__ = this.app
	    this.camera = new Camera(this);
	  }
	}
```
