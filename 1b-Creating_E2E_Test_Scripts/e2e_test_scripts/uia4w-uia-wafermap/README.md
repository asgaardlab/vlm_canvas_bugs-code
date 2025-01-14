# Installation steps

**Commit SHA**: `83722f15edc163162dc129d98e03e18c7cf7e77a`

**Date**: `29 July, 2024`

Welcome to the uia-wafermap project! This guide will help you get started quickly with running and testing the application.

## Prerequisites

- **Node.js** (version 14.x or later)
- **npm** (comes with Node.js)
- **Python 3** (for running a local web server)

## Installation

1. **Clone the Repository**:
   If you haven't cloned the repository yet, do so using:
   ```bash
   git clone https://github.com/uia4w/uia-wafermap.git
   cd uia-wafermap
   ```

2. **Set Node Version**:
   Ensure you're using the correct Node.js version with NVM:
   ```bash
   nvm use 14
   ```

3. **Install Rollup Globally**:
   Install Rollup globally to ensure it's available:
   ```bash
   npm install -g rollup
   ```

4. **Install Dependencies**:
   Use npm to install the required dependencies:
   ```bash
   npm install
   ```

5. **Update Import Statements**:
   Modify the following files to include the new PIXI import:
   - `src/maplegend/draw.js`
   - `src/shotmap/blocking.js`
   - `src/shotmap/create.js`
   - `src/shotmap/draw.js`

   Replace the previous PIXI import:
   ```javascript
   import * as PIXI from "pixi.js/dist/browser/pixi";
   ```
   With the new import:
   ```javascript
   import * as PIXI from "pixi.js";
   ```

   Additionally, comment out the following line in `blocking.js`:
   ```javascript
   // import { ArrayResource } from "pixi.js/dist/browser/pixi";
   ```

6. **Build the Project**:
   Build the project to create the necessary distribution files:
   ```bash
   npm run build
   ```

## Running the Application

1. **Start a Local Server**:
   You can run a simple local server using Python. Open a terminal and run:
   ```bash
   python3 -m http.server
   ```

2. **Access the Application**:
   Open your web browser and navigate to:
   ```
   http://localhost:8000/test/pages/example1.html
   ```

## Modifying the Code

After making any changes to the code, remember to rebuild the project to see your updates:

```bash
npm run build
```

## Conclusion

You are now set up to work with the uia-wafermap project. For further documentation and usage details, please refer to the project's README or other documentation files.

Enjoy coding!

# Making PIXI or __PIXI_APP__ available to global window scope

Not required.
