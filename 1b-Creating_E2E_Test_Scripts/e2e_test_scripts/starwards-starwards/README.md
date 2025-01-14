# Installation steps

**Commit SHA**: `7e5fa877a34b7d792a8505663f15f17249925935`

**Date**: `July 24, 2024`

## Steps to Run the Application

1. **Set Up Node Version** in Your Terminal:
   ```bash
   nvm use 20
   ```

2. **Install Dependencies for Core Module**:
   ```bash
   npm install
   ```

3. **Build the Core Module**:
   ```bash
   cd ./modules/core
   npm run build:watch
   ```

4. **Open a New Terminal** and Start the Web Development Server:
   ```bash
   cd ./modules/browser
   nvm use 20
   npm install
   npm install use-sync-external-store use-isomorphic-layout-effect
   npm start
   ```

5. **Open Another New Terminal** and Start the API Server:
   ```bash
   cd ./modules/server
   nvm use 20
   node -r ts-node/register/transpile-only ./src/dev.ts
   ```

6. **Access the App**:
   - Open your browser and navigate to `http://localhost/` to access the application.

# Making PIXI or __PIXI_APP__ available to global window scope (if required)

In file: `modules/browser/src/widgets/gm.ts` insert around line 57 as follows:

```ts
                const root = new CameraView({ backgroundColor: radarVisibleBg }, camera, container);
+               window.__PIXI_APP__ = root;
```

(can also do anywhere else CameraView is instantiated to test other parts of app)
