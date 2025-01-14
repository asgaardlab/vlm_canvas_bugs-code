# Installation steps

**Commit SHA**: `e78f5ad23ec3bc5149f5a9857f41d6cc5e5c1be8`

**Date**: `July 17, 2024`

```
nvm use 14
npm i
npm run start
```

# Making PIXI or __PIXI_APP__ available to global window scope (if required)

*Must install dependencies first*

- File: `./node_modules/@inlet/react-pixi/dist/react-pixi.es.dev.js`
- Modified Line (around line 22840):
  - Where Stage class is defined and PixiJS Application is instantiated
  - `window.__PIXI_APP__ = this.app`
