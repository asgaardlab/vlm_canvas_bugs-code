import { Page, ElementHandle, Locator } from '@playwright/test'
import { PixiSamplerPlaywright } from "./PixiSamplerPlaywright";

interface OptionsForTakeSnapshotWithBug {
    numFramesUntilFreeze?:number;
    htmlElementCanvas?:ElementHandle|Locator;
    strCustomSelectionLogic?:string;
    strObjectVariableNameForCustomSelectionLogic?:string;
    boolForceRenderPassBeforeSnapshot?:boolean;
    strCustomForceRenderCall?:string;
}

/**
 * Playwright API for PixiVisualBugsClient
 * 
 * - Injects the PixiVisualBugsClient into the browser context
 * 
 * - Injects the PIXI.Renderer.render method to enable sampling
 * 
 * - Injects the PIXI.Container.render method and overrides WebGL shaders to enable Just-in-Time (JiT) visual bug injection 
 * 
 * - Takes snapshots of the PixiJS application with (or without) JiT injected visual bugs
 *   - Snapshots are pairs of:
 *      - a) a screenshot of the <canvas> in Portable Network Graphics (PNG) format
 *      - b) the Canvas Objects Representation (COR) in Browser Zip Mapped References (BZMR) format
 * 
 * - Can start debuggers simultaneously in the browser context and the Playwright test context
 */
export class PixiVisualBugsPlaywright extends PixiSamplerPlaywright {
    public bugFlags:BugFlags;
    protected numFramesUntilFreeze:number;
    private _boolForceRenderPassBeforeNextSnapshot:boolean|null;
    private _strCustomForceRenderCall:string|null;

    /**
     * @param page - Playwright Page object
     * @param path - relative path to save snapshots
     * @param pixiDevToolName - name of the PixiDevTool client class to use
     * @param instanceName - name of the instance of the PixiDevTool client class
     */
    constructor(
        page:Page, 
        path:string,
        pixiDevToolName:string = 'PixiVisualBugsClient',
        instanceName:string = '__PIXI_VISUAL_BUGS__'
    ){
        super(page, path, pixiDevToolName, instanceName);
        this.bugFlags = new BugFlags();
        this.numFramesUntilFreeze = -1;
        this._boolForceRenderPassBeforeNextSnapshot = null;
        this._strCustomForceRenderCall = null;
    }
    /**
     * Inject the PixiVisualBugsClient script into the browser context,
     * and inject flatted for sampling the scene graph.
     * Then, inject the PIXI.Renderer method to enable sampling.
     * Finally, inject WebGLRenderingContext methods to enable JiT visual bug injecting.
     */
    override async injectClient() {
        await this.injectScript('browser/shaders/default.js');
        await this.injectScript('browser/shaders/bugAppearance.js');
        await this.injectScript('browser/shaders/bugLayout.js');
        await this.injectScript('browser/shaders/bugRendering.js');
        await this.injectScript('browser/shaders/bugState.js');
        await super.injectClient();
        /**
         * Check if we have a reference to Pixi's WebGL instance before injecting 
         * the Webgl methods.
         * Once we have injected Pixi's methods, the reference to WebGLRenderingContext
         * (or WebGL2RenderingContext) instance is set at beginning of next render pass.
         */
        let hasWebglReference = false;
        const codeHasWebglReference = `${this.instanceName}.hasWebglReference;`;
        let retryCount = 0;
        const maxRetries = 5;
        const oneFrame = 1;
        const framesPerSecond = 60; // hardcoded!
        const timeout = oneFrame / framesPerSecond;
        const timeoutMs = timeout * 1000;
        while (!hasWebglReference && (retryCount < maxRetries)) {
            await this.page.waitForTimeout(timeoutMs);
            hasWebglReference = await this.page.evaluate(codeHasWebglReference);
            retryCount++;
        }
        await this.injectWebGL();
    }
    /**
     * Inject the WebGLRenderingContext method to enable JiT visual bug injecting.
     */
    private async injectWebGL() {
        const code = `${this.instanceName}.injectWebGL();`
        await this.page.evaluate(code);
    }
    /**
     * Take a snapshot of the current state of the PixiJS application with the specified bug injected.
     * Similar to super.takeSnapshot(), but with bug injection logic.
     * @param snapshotName - name of the snapshot
     * @param bugName - name of the bug to inject
     * @param options.numFramesUntilFreeze: number of frames to render with the bug injected before freezing the renderer
     * @param options.htmlElementCanvas: playwright handle to canvas element
     * @param options.strCustomSelectionLogic: javascript boolean statement for selecting objects
     * @param options.strObjectVariableNameForCustomSelectionLogic: name of object variable in custom selection logic
     * @param options.boolForceRenderPassBeforeSnapshot: Whether to force a render pass while taking a snapshot with bug
     * @param options.strCustomForceRenderCall: Custom JavaScript code to call in browser context to force a render pass
     * }
     */
    public async takeSnapshotWithBug(snapshotName:string, bugName:string, options?:OptionsForTakeSnapshotWithBug){

        let {
            numFramesUntilFreeze,
            htmlElementCanvas,
            strCustomSelectionLogic,
            strObjectVariableNameForCustomSelectionLogic,
            boolForceRenderPassBeforeSnapshot,
            strCustomForceRenderCall
        } = options || {};

        // grab reference to the canvas if one not provided
        if (typeof htmlElementCanvas === "undefined") {            
            htmlElementCanvas = await this.getCanvasHandle(); 
        }

        // set default num frames until freeze
        if (typeof numFramesUntilFreeze === "undefined") {
            numFramesUntilFreeze = 0;
        }

        let boolDidSetCustomLogic = false;
        // set the selection logic if provided
        if (typeof strCustomSelectionLogic === "string") {

            if (typeof strObjectVariableNameForCustomSelectionLogic === "undefined") {
                strObjectVariableNameForCustomSelectionLogic = "o";
            }

            this.setCustomSelectionLogic(
                strCustomSelectionLogic,
                strObjectVariableNameForCustomSelectionLogic
            );
            boolDidSetCustomLogic = true;
        }

        // force the renderer to render to ensure we have necessary references before snapshotting
        if (typeof boolForceRenderPassBeforeSnapshot === "boolean") {
            this._boolForceRenderPassBeforeNextSnapshot = boolForceRenderPassBeforeSnapshot;

            if (typeof strCustomForceRenderCall === "string") {
                this._strCustomForceRenderCall = strCustomForceRenderCall;
            }
        }

        this.bugFlags.setActiveBug(bugName);
        /** TODO validate that 
         * numFramesUntilFreeze === 0 
         * whenever 
         * boolForceRenderPassBeforeSnapshot === true
         * (and/or vice versa)
         * 
         * Alternatively force renders numFramesUntilFreeze times and let these be set together
         */
        this.numFramesUntilFreeze = numFramesUntilFreeze;
        await this.takeSnapshot(snapshotName, htmlElementCanvas);
        this.bugFlags.setNoBug();

        // clear the selection logic if it was provided
        if (boolDidSetCustomLogic) {
            this.clearCustomSelectionLogic();
        }
    }
    /**
     * This method is called inside this.takeSnapshot(), immediately before taking the snapshot.
     * Freeze the renderer after injecting the selected bug.
     * If no bug (or an invalid bug) is selected, default back to the superclass method.
     */
    override async preSnapshot(){
        const boolForceRenderPassBeforeSnapshot = this._boolForceRenderPassBeforeNextSnapshot || false;
        const activeBug = this.bugFlags.getActiveBug();
        const isValidName = this.bugFlags.checkValidBugName(activeBug);

        if (activeBug === 'none') {
            console.error('No bug selected, proceeding with snapshot without bugs.');
            await super.preSnapshot();

        } else if (!isValidName) {
            /* 
             * Redundant check: this is checked when the value is set
             */
            console.error('Invalid bug name supplied, proceeding with snapshot without bugs.');
            await super.preSnapshot();

        } else {
            let numFramesUntilFreeze:number = this.numFramesUntilFreeze;
            let isFreezingRenderer:boolean = false;
            const codeNumFrames = `${this.instanceName}.numFramesUntilFreeze;`;
            const codeIsFreezing = `${this.instanceName}.isFreezingRenderer;`;
            let retryCount = 0;
            const maxRetries = 5;
            let timeout, timeoutMs;

            // inject the selected bug and stop animations
            await this.injectBug(this.numFramesUntilFreeze);

            // wait for the sampler to freeze the renderer
            while (!isFreezingRenderer && (retryCount < maxRetries)) {

                /** if set by user, then force a render pass every frame before freezing
                 *  required for apps that only render on data updates or user interaction
                 */
                if (boolForceRenderPassBeforeSnapshot) {
                    await this._forceRenderPass();
                }

                if (numFramesUntilFreeze === 0) {
                    timeout = (1 / 60) / 2; // wait ~half-a-frame, assuming 60fps

                } else {
                    timeout = (numFramesUntilFreeze / 60); // [seconds], assuming 60fps
                }

                timeoutMs = timeout * 1000;
                // console.log(`(Attempt ${retryCount}): Waiting ${numFramesUntilFreezeRemaining} frames (${timeout} seconds) until freeze.`)
                await this.page.waitForTimeout(timeoutMs);
                isFreezingRenderer = await this.page.evaluate(codeIsFreezing);
                numFramesUntilFreeze = await this.page.evaluate(codeNumFrames);
                retryCount++;
            }
        }
        // reset the boolean for forcing render passes - even if no bug injected
        this._boolForceRenderPassBeforeNextSnapshot = null;
        this._strCustomForceRenderCall = null;
    }
    /**
     * Seed the selected bug into the application by activating the WebGL method override. 
     * @param numFramesUntilFreeze - number of frames to wait with bug injected before freezing the renderer.
     */
    protected async injectBug(numFramesUntilFreeze:number = 0) {
        const bugName = this.bugFlags.getActiveBug()
        const code = `${this.instanceName}.injectBug("${bugName}", ${numFramesUntilFreeze});`
        await this.page.evaluate(code);
    }
    /**
     * Set custom logic for selecting objects to inject the bug into
     */
    public async setCustomSelectionLogic(strCustomSelectionLogic:string, strVariableNameContainer?:string) {
        if (typeof strVariableNameContainer === "undefined") {
            strVariableNameContainer = "o";
        }
        let code = `var functionCustomLogic = (${strVariableNameContainer}) => { return (${strCustomSelectionLogic}) };`;
        code += `\n${this.instanceName}.setFunctionForCorSelectionCriteria(functionCustomLogic);`;
        await this.page.evaluate(code);
    }
    /**
     * Clear custom logic for selecting objects to inject the bug into
     */
    public async clearCustomSelectionLogic() {
        const code = `${this.instanceName}.setFunctionForCorSelectionCriteriaToDefault();`;
        await this.page.evaluate(code);
    }
    /**
     * Force the PIXI renderer to render a frame after we inject the bug
     * Required for applications that only render new frames on user interaction
     * i.e., those that don't use the PIXI.Ticker
     */
    private async _forceRenderPass() {
        let code;

        if (typeof this._strCustomForceRenderCall === "string") {
            code = this._strCustomForceRenderCall;

        } else {
            code = `${this.instanceName}._renderer.render(${this.instanceName}._cor);`;
        }

        await this.page.evaluate(code);
    }
}
/**
 * Class to manage the state of which visual bug can be injected into the WebGLRenderingContext.
 * - Valid bug names are defined in the this.validBugNames array.
 * - The active bug is set with setActiveBug(bug:string) and retrieved with getActiveBug().
 * - Convenience methods are provided to set specific bugs.
 */
class BugFlags {
    private validBugNames: Array<string> = [
        'appearance',
        'layout',
        'rendering', 
        'state', 
        'none'
    ];
    private activeBug: string;
    constructor() {
        this.activeBug = 'none';
    }
    public getActiveBug(){
        return this.activeBug;
    }
    public setActiveBug(bug: string) {
        if (this.checkValidBugName(bug)) {
            this.activeBug = bug;
        } else {
            console.error('Invalid bug name.');
        }
    }
    public checkValidBugName(bug: string) {
        return this.validBugNames.includes(bug);
    }
    /*
     * Convenience methods to set specific bugs
     */
    public setAppearanceBug() {
        this.setActiveBug('appearance');
    }
    public setLayoutBug() {
        this.setActiveBug('layout');
    }
    public setRenderingBug() {
        this.setActiveBug('rendering');
    }
    public setStateBug() {
        this.setActiveBug('state');
    }
    public setNoBug() {
        this.setActiveBug('none');
    }
}
