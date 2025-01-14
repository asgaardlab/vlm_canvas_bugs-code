class PixiVisualBugsClientDebug extends window.PixiVisualBugsClient {
    constructor() {
        super();
       /**
         * `_hasInjectedSyncUniforms`: Flag to check if the syncUniforms method in PixiJS's
         * ShaderSystem class has been overriden yet. (Override required for bug injection in some apps).
         * @private
         * @type {boolean}
         */
        this._hasInjectedSyncUniforms = false;
    }
    injectPixi() {
        super.injectPixi();
        // this._injectSyncUniforms();
    }
    injectWebGL() {
        super.injectWebGL();
        // this._injectDrawElements();
        // this._injectDrawArrays();
        // this._injectBindBuffer();
        // this._injectTexImage2D();
    }
    /**
     * This method overrides the PIXI.ShaderSystem.syncUniforms() method
     * to prevent any updates to uniforms on objects we are injecting bugs
     * into while overriding the WebGL shader program
     * 
     * NOTE: This should never be needed! This occurs if we try to inject bugs into
     * objects that use shaders other than those used by PIXI.Sprite
     * 
     * 
     */
    _injectSyncUniforms() {
        const visualBugger = this;
        let shaderSystemClass;

        if (this._hasInjectedSyncUniforms) {
            console.warn(`${this.constructor.name} already injected PIXI.ShaderSystem.syncUniforms`)
            return;
        }

        if (typeof PIXI !== "undefined") {
            shaderSystemClass = PIXI?.ShaderSystem;

        } else if (typeof __PIXI_APP__ !== "undefined") {
            shaderSystemClass = __PIXI_APP__?.renderer?.shader?.constructor;
        }

        if (shaderSystemClass === undefined || shaderSystemClass === null) {
            console.log("Failed to inject syncUniforms: Both PIXI and __PIXI_APP__ are null/undefined");
            return;
        }

        const syncUniforms = shaderSystemClass.prototype.syncUniforms;

        shaderSystemClass.prototype.syncUniforms = function (uniforms, ...args) {
            const shaderSystem = this;

            if (!visualBugger._isOverridingProgram) {
                // console.log(`syncUniforms bug injected (frames remaining: ${visualBugger._numFramesUntilFreeze})`);
                // If callback set, run it. Otherwise default is just do not call the originalMethod
                syncUniforms.apply(shaderSystem, [uniforms, ...args]);
                return;

            } else {                
                console.log("Prevented PixiJS call to SyncUniforms");
            }
        }
        // set flag
        this._hasInjectedSyncUniforms = true;
    }
    /**
     * Override WebGL rendering context drawElements method to ...
     */
    _injectDrawElements() {
        this._injectWebglMethod("drawElements");
    }
    /**
     * Override WebGL rendering context drawArrays method to ...
     */
    _injectDrawArrays() {
        this._injectWebglMethod("drawArrays")
    }
    /**
     * Override WebGL rendering context bindBuffer method to ...
     */
    _injectBindBuffer() {
        this._injectWebglMethod("bindBuffer");
    }
    /**
     * Override WebGL rendering context texImage2D method to ...
     */
    _injectTexImage2D() {
        this._injectWebglMethod("texImage2d");
    }
}
window.PixiVisualBugsClientDebug = PixiVisualBugsClientDebug;