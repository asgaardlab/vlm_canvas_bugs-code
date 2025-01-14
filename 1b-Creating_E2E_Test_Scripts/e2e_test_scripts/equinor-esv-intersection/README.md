# Installation steps

**Commit SHA**: `112bb9c62cc37b5c0f8e033e4bd52fc1c4b785cf`

**Date**: `July 18, 2024`

1. Set Node.js version to 18 using NVM:
   ```bash
   nvm use 18
   ```

2. Install project dependencies:
   ```bash
   npm i
   ```

3. Initialize and update submodules:
   ```bash
   git submodule update --init
   ```

4. Start the Storybook:
   ```bash
   npm run storybook
   ```

# Making PIXI or __PIXI_APP__ available to global window scope (if required)

In file `.storybook/src/complete-example/intersection.stories.ts` around line 110:

Change as follows:
```
    const pixiContext1 = new PixiRenderApplication({ width, height });
    const pixiContext2 = new PixiRenderApplication({ width, height });

+   console.log("Two app instances!");
+   console.log(pixiContext1);
+   console.log("In window.__PIXI_APP__");
+   console.log(pixiContext2);
+   console.log("In window.__PIXI_APP_2__");

+   window.parent.__PIXI_APP__ = pixiContext1;
+   window.parent.__PIXI_APP_2__ = pixiContext2;
```
