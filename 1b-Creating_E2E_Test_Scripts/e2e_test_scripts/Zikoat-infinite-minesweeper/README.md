# Installation steps...

**Commit SHA**: `9cd5ccdee8a57ae9b1929f1c7a01f8128bf77945`

**Date**: `July 25, 2024`

## Steps to Run the Project

1. **Set Node Version**:
   - Use Node.js version 14:
     ```bash
     nvm use 14
     ```

2. **Install Dependencies**:
   - Install the required dependencies:
     ```bash
     npm install
     ```

3. **Start Development Server**:
   - Launch the development server:
     ```bash
     npm run dev
     ```

### Result
- Running `npm run dev` should open a browser tab with the infinite minesweeper game ready for you to play and test.

# Making PIXI or __PIXI_APP__ available to global window scope (if required)...

In ``` around line 44:

```
	const app = new PIXI.Application({
	  resizeTo: window,
	  backgroundColor: 0x1099bb,
	});

+	window.__PIXI_APP__ = app;
```
