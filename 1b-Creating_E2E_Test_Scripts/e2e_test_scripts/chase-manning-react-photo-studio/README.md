# Running react-photo-studio Locally

This document provides concise steps to set up and run the `react-photo-studio` application for local development.

**Commit SHA**: `c804eefdfd2052d80fbd51427a28070fda828059`

**Date**: `Mar 27, 2024`

## Steps to Setup and Run

1. **Ensure Node.js version 16 is in use**
   
   Install and use Node.js version 16 using `nvm`:
   ```sh
   nvm install 16
   nvm use 16
   ```

2. **Install Specific Version of react-scripts**
   
   Install `react-scripts@4.0.3` to fix a peer dependency error between `react-scripts` and `typescript@^4`:
   ```sh
   npm install react-scripts@4.0.3
   ```

   **Explanation**:
   - During installation, we encountered a peer dependency conflict where `react-scripts@4.0.1` required `typescript@^3.2.1`, which conflicted with `typescript@^4` specified in `package.json`.
   - By upgrading to `react-scripts@4.0.3`, we align with a version that supports `typescript@^4`, thus resolving the conflict.

3. **Install Dependencies Using Exact Versions**
   
   Use the `--save-exact` flag to install dependencies at the exact versions listed in `package.json`:
   ```sh
   npm install --save-exact
   ```
   - This ensures that `react-scripts` will now use version `4.0.3` as specified.
   - This also ensures that `pixi.js` will use `6.2.1` as specified
      - Issues occured when installing `pixi.js >6.2.1`

4. **Start the Development Server**
   
   Start the development server to run the application:
   ```sh
   npm start
   ```

Follow these steps to successfully set up and run the `react-photo-studio` application locally. If you encounter any issues, revisit the steps to ensure accuracy or seek further assistance.

# Making `__PIXI_APP__` Available to Global Scope

## Steps Taken

1. First, we found where `PIXI.Application` was instantiated: `src/sections/documents/Canvas.tsx`
2. In that file, we added the following at line 8 to declare `__PIXI_APP__` on the `window` object:

```typescript
 declare global {
    interface Window {
        __PIXI_APP__: any;
    }
 }
```

3. Then, in the same file, we added the following at line 28 to assign the Pixi application instance to the global `__PIXI_APP__`:

```typescript
 window.__PIXI_APP__ = app;
```

These changes make `__PIXI_APP__` accessible from the global scope in the browser, which can be useful for debugging or interacting with the Pixi application instance from the browser console.