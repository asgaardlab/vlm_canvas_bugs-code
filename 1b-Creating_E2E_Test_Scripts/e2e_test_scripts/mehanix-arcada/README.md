# Installation steps

**Commit SHA**: `6b4fb10ea0a1beaa7994480a688e1410cebfb661`

**Date**: `July 30, 2024`


This guide outlines the steps to set up and run the Mehanix-Arcada application.

## Steps to Set Up Your Development Environment with Docker

**Prerequisities: nodejs, npm, yarn, docker**

1. **Clone the Original Setup Repository**:
   - Clone the arcada-setup repository using the following command:
     ```bash
     git clone https://github.com/perguth/arcada-setup
     ```

2. **Update the Submodule Configuration**:
   - Update the `.gitmodules` file to point to your own private GitHub repository for arcada:
     ```plaintext
     [submodule "mehanix-arcada"]
         path = path/to/mehanix-arcada
         url = https://github.com/user9237590463948/mehanix-arcada
     ```

3. **Fork the Repository**:
   - Create a private fork of the original repository from GitHub:
     - Original: `https://github.com/perguth/arcada-setup`
     - Your Fork: `https://github.com/user92375904639498/mehanix-arcada-setup`

4. **Run the Application**:
   - Navigate to your local version of the forked repository and execute the following command to start the application:
     ```bash
     npm start
     ```
   - If you didn't have `docker-compose`, run the following command to start the services defined in the `docker-compose.yml` file:
     ```bash
     docker compose up --build
     ```

---

*NOTE: May need to update the git submodule folder contents manually to include your changes to private fork. Do like this:*
```
cd frontend
git pull
cd ..
```

---

# Making PIXI or __PIXI_APP__ available to global window scope (if required)

(Makes sense to just update the `./mehanix-arcada-setup/frontend/` files instead of the main repo and syncing it across)

In `src/editor/EditorRoot.tsx` around Line 33:

```
	export function EditorRoot() {
	    const ref = useRef<HTMLDivElement>(null);
	    const state = useStore();
	    const {classes} = useStyles();
	    useEffect(() => {
	        
	        // On first render create our application
	        const app = new Application({
	            view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
	            resolution: window.devicePixelRatio || 1,
	            autoDensity: true,
	            backgroundColor: 0xebebeb,
	            antialias: true,
	            resizeTo: window
	        });

+	        (window as any).__PIXI_APP__ = app;

```
