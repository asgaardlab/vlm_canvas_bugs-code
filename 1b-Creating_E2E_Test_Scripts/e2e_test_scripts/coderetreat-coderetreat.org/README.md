# Installation steps

**Commit SHA**: `14c0cc2f0443d19d343efdf197f56879d63920fc`

**Date**: `24 July, 2024`

## Setup Environment and Run the Application

### 1. Install Node.js (using nvm)
```bash
nvm install 20
nvm use 20
```

### 2. Install Ruby
- **Using RVM:**
  ```bash
  \curl -sSL https://get.rvm.io | bash -s stable
  source ~/.rvm/scripts/rvm
  rvm install 3.1.0  # or any version >=3.0
  rvm use 3.1.0 --default
  ```
- **Using rbenv:**
  ```bash
  brew install rbenv
  echo 'eval "$(rbenv init -)"' >> ~/.bash_profile
  source ~/.bash_profile
  rbenv install 3.1.0  # or any version >=3.0
  rbenv global 3.1.0
  ```

### 3. Install Dependencies
- Navigate to your project directory:
```bash
cd path/to/coderetreat-coderetreat.org
```
- Install Node.js dependencies:
```bash
npm install
```

### 4. Install Bundler
- Once Ruby is installed, run:
```bash
gem install bundler:2.3.16
```

### 5. Run Bundler
```bash
bundle install
```

### 6. Build the Project
If your project specifies a build script in `package.json`, run:
```bash
npm run build
```

### 7. Run the Application
Finally, start the application:
```bash
npm run serve
```

## Summary of Key Commands with Build Step
- After installing dependencies, add `npm run build` if your project has a build process defined.
- This step compiles and prepares your application for running.


# Making PIXI or __PIXI_APP__ available to global window scope (if required)

In `js/gameOfLifeJumbotron/GraphicsController.ts` around line 39

```ts
	export class GraphicsController {
	  pixiApp: PIXI.Application;
	  visibleDots: Array2d<PIXI.Graphics>;
	  gap: number;
	  radius: number;
	  fadeFactor: number | false;
	  viewport: any;

	  constructor({
	    element,
	    fps,
	    radius,
	    fadeFactor,
	    gap,
	  }: GraphicsControllerOpts) {
	    this.pixiApp = new PIXI.Application({
	      view: element,
	      resizeTo: element.parentElement!,
	      backgroundAlpha: 0.0,
	      antialias: true,
	      autoDensity: true,
	      resolution: 2,
	      autoStart: false,
	    });

+	    window.__PIXI_APP__ = this.pixiApp;
```
