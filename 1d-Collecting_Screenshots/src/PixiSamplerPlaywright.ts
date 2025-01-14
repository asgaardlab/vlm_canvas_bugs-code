import * as fs from 'fs-extra-promise';
import { Page, JSHandle, ElementHandle, Locator } from '@playwright/test'

/**
 * Playwright API for PixiSamplerClient
 * 
 * - Injects the PixiSamplerClient into the browser context
 * 
 * - Injects the PIXI.Renderer method to enable sampling of the Canvas Objects Representation (COR)
 * 
 * - Takes snapshots of the PixiJS application
 *   - Snapshots are pairs of:
 *      - a) a screenshot of the <canvas> in Portable Network Graphics (PNG) format
 *      - b) the Canvas Objects Representation (COR) in Browser Zip Mapped References (BZMR) format
 * 
 * - Can start debuggers simultaneously in the browser context and the Playwright test context
 */
export class PixiSamplerPlaywright {
    private readonly basePath:string = __dirname;
    protected snapshotsPath:string;
    protected pixiDevToolName:string;
    public instanceName:string;
    public page:Page;

    /**
     * @param {Page} page - Playwright Page object
     * @param {string} path - relative path to save snapshots
     * @param {string} pixiDevToolName - name of the PixiDevTool client class to use
     * @param {string} instanceName - name of the instance of the PixiDevTool client class
     */
    constructor (
        page:Page, 
        path:string, 
        pixiDevToolName:string = 'PixiSamplerClient', 
        instanceName:string = '__PIXI_SAMPLER__'
    ){    
        this.page = page;
        this.snapshotsPath = path;
        this.pixiDevToolName = pixiDevToolName;
        this.instanceName = instanceName;
    }
    /**
     * Inject the PixiDevTool client script into the browser context,
     * and inject flatted for sampling the COR.
     * Then, inject the PIXI.Renderer method to enable sampling.
     */
    public async injectClient() {
        // warning: hardcoded path depends on `copyfiles` output
        await this.injectScript('modules/flatted/min.js');
        if (this.pixiDevToolName !== 'PixiSamplerClient') {
            /**
             * @todo make this more dynamic
             * - check what class(es) the PixiDevTool extends
             * - inject those classes first
             * - then inject the PixiDevTool
             */
            await this.injectScript(`browser/PixiSamplerClient.js`);
        }
        /**
         * hack to make my hardcoded injectClient function work for debug versions
         * e.g., for loading in the `browser/debug/PixiVisualBugsClientDebug.js`
         */
        if (this.pixiDevToolName.includes('Debug')) {
            await this.injectScript(`browser/${this.pixiDevToolName.replace("Debug", "")}.js`);
            await this.injectScript(`browser/debug/${this.pixiDevToolName}.js`);
        } else {
            await this.injectScript(`browser/${this.pixiDevToolName}.js`);
        }
        await this.injectPixi();
    }
    /**
     * Inject a JavaScript file into the browser context
     * @param relativePath - relative path to the script file from the current file
     */
    protected async injectScript(relativePath: string) {
        const scriptPath = `${this.basePath}/${relativePath}`;
        await this.page.addScriptTag({ 'path': scriptPath });
    }
    /**
     * Instantiate the PixiDevTool (default - PixiSamplerClient) and inject PIXI.Renderer
     */
    protected async injectPixi() {
        const code = [
            `const ${this.instanceName} = new window.${this.pixiDevToolName}();`,
            `window.${this.instanceName} = ${this.instanceName};`,
            `${this.instanceName}.injectPixi();`
        ].join('\n');
        await this.page.evaluate(code);
    }
    /**
     * Take a snapshot of the current state of the PixiJS application.
     * Snapshots include a PNG image of the canvas and a JSON file of the COR.
     * Depending how app is implemented, may not interrupt the application rendering loop 
     * ...but does freeze the animations during the snapshot.
     * @param name - name of the snapshot
     */
    public async takeSnapshot(strSnapshotName:string, htmlElementCanvas?:ElementHandle | Locator) {
        // grab reference to the htmlElementCanvas if one not provided
        if (htmlElementCanvas === undefined) {            
            htmlElementCanvas = await this.getCanvasHandle(); 
        }
        const strPathWriteImageTo:string = `${this.snapshotsPath}/${strSnapshotName}.png`;
        const strPathWriteBzmrTo:string = `${this.snapshotsPath}/${strSnapshotName}.bzmr`;
        // stop animations
        await this.preSnapshot();
        // take screenshot
        await htmlElementCanvas.screenshot({ path: strPathWriteImageTo });
        // grab reference to COR
        const jsHandleCorBzmr:JSHandle = await this.getCorBrowserZipMappedReferences();
        // read the COR
        const strCorBzmr:string = await jsHandleCorBzmr.jsonValue();
        // re-start animations
        await this.postSnapshot();
        // save the COR
        await this.saveCorBrowserZipMappedReferences(strPathWriteBzmrTo, strCorBzmr);
    }
    /**
     * Pre-snapshot logic.
     * Override this method to implement custom pre-snapshot logic.
     * Default behavior is to freeze the renderer.
     */
    protected async preSnapshot(){
        // stop animations
        await this.freezeRenderer();
    }
    /**
     * Post-snapshot logic.
     * Override this method to implement custom post-snapshot logic.
     * Default behavior is to unfreeze the renderer.
     */
    protected async postSnapshot(){
        // re-start animations
        await this.unfreezeRenderer();
    }
    /**
     * Freeze the renderer to stop new frames from being shown on the <canvas>.
     */
    private async freezeRenderer() {
        const code = `${this.instanceName}.freeze();`
        await this.page.evaluate(code);
    }
    /**
     * Unfreeze the renderer to allow new frames to be shown on the <canvas>.
     */
    private async unfreezeRenderer() {
        const code = `${this.instanceName}.unfreeze();`
        await this.page.evaluate(code);
    }
    /**
     * Get a Playwright reference to the <canvas> element within the browser context.
    */
    public async getCanvasHandle(): Promise<ElementHandle> {
        const code = `${this.instanceName}.canvas`
        return await this.page.evaluateHandle(code);
    }
    /**
     * Get a Playwright reference to the COR within the browser context.
     * Serializes the COR in the browser context...
     * ...and returns the output to the test context.
     */
    private async getCorBrowserZipMappedReferences(): Promise<JSHandle> {
        // serialize the Scene Graph
        const code = `${this.instanceName}.serialize();`
        return await this.page.evaluateHandle(code);
    }
    /**
     * Save the Canvas Objects Representation (COR) in Browser Zip Mapped References (BZMR) format as a .bzmr file
     * @param strPathWriteBzmrTo - path to save the BZMR file
     * @param strCorBzmr - string containing COR Browser Zip Mapped References
     */
    private async saveCorBrowserZipMappedReferences(strPathWriteBzmrTo:string, strCorBzmr:string) {
        await fs.writeFileAsync(strPathWriteBzmrTo, strCorBzmr);
    }
    /**
     * This will pause both the node-executed code and the browser-executed code.
     * Playwright browser must be launched with `headless: false` and `devtools: true` to work.
     * e.g., `const browser = await chromium.launch({ headless: false, devtools: true });`
     */
    public async startDebuggers() {
        await this.startClientDebugger();
        await this.page.pause();
    }
    /** 
     * This will pause the execution of the browser-executed code.
     * Playwright browser must be launched with `headless: false` and `devtools: true` to work.
     * e.g., `const browser = await chromium.launch({ headless: false, devtools: true });`
    */
    private async startClientDebugger() {
        const code = `debugger;`
        await this.page.evaluate(code);
    }
}