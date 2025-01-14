/**
 * PixiVisualBugsClient - extends the PixiSamplerClient class.
 * 
 * This class is responsible for injecting bugs into the <canvas> of a PixiJS application.
 * 
 * Bug injection is performed in a just-in-time (JiT) manner, where the bug is injected into the
 * <canvas> for only a specified number of frames, and then the bug is removed. 
 * 
 * Additionally, the bug does not affect the Canvas Objects Representation (COR) or any image assets, 
 * keeping them as reliable sources of ground truth from which to build visual oracles.
 * 
 * Any object that is injected with a visual bug (for a particular sample) is marked using the following property:
 * `object.__injected_by_pixi_visual_bugger__ = true;`
 * Which enables simple checking of which objects have bugs injected when performing analysis on snapshots.
 * 
 * @todo Add support for injecting bugs into the CanvasRenderingContext2D of a PixiJS application.
 */
class PixiVisualBugsClient extends window.PixiSamplerClient {
    constructor() {
        super();
        /** 
         * `_renderer`: Renderer instance used by PixiJS.
         * Reference is set in `this.preCallRenderMethod()`.
         * @private 
         * @type {PIXI.Renderer} 
        */
        this._renderer = null;
        /** 
         * `_gl`: WebGL rendering context instance used by PixiJS.
         * Reference is set in `this.preCallRenderMethod()`.
         * @private 
         * @type {WebGLRenderingContext | WebGL2RenderingContext} 
        */
        this._gl = null;
        /**
         * `_hasInjectedContainerRender`: Flag to check if the render method in PixiJS's
         * Container class has been overriden yet. Override require for bug injection.
         * @private
         * @type {boolean}
         */
        this._hasInjectedContainerRender = false;
        /** 
         * `_hasInjectedWebgl`: Flag to check if WebGL has been injected yet.
         * This flag is set to true in `this.injectWebGL()`.
         * @private
         * @type {boolean}
         */
        this._hasInjectedWebgl = false;
        /** 
         * `_isSettingBugToInject`: Flag to check if currently setting the active bug.
         * This flag is set to true in this.injectBug before setting `this._activeBug`.
         * This flag is set to false in this.injectBug after setting `this._activeBug`.
         * @private
         * @type {boolean}
         */
        this._isSettingBugToInject = false;
        /**
         * `_isOverridingProgram`: Flag to check if currently overriding the program.
         * This flag is set to true in the PIXI.Container.render() override when
         * the selected object is being rendered.
         * When `_isOverridingProgram=true`, the WebGL `useProgram` method is overriden 
         * to force PixiJS to use the buggy program
         */
        this._isOverridingProgram = false;
        /**
         * `_functionForCorSelectionCriteria`: Function to run on every PixiJS candidate object
         * that may be selected for injecting the visual bug(s) into. Should return true
         * if the candidate is selected, and return false if it is rejected.
         * Defaults to a built-in naive check.
         */
        this._functionForCorSelectionCriteria = this._naiveCheckObjectBugCandidate;
        /**
         * `_listOfCorNodesToInject`: Array containing list of references to objects for
         * which the bug will be injected
         * @private
         * @type {Array[PIXI.Container]}
        */
        this._listOfCorNodesToInject = Array();
        /** 
         * `_enumValidBugNames`: Valid bug names that can be injected
         * @private
         * @type {Object}
         */
        this._enumValidBugNames = {
            appearance: 'appearance',
            layout: 'layout',
            rendering: 'rendering',
            state: 'state',
            none: 'none'
        };
        /** 
         * `_activeBug`: Name of the bug selected to be injected
         * @private
         * @type {string}
         */
        this._activeBug = 'none';
        /** 
         * `_numFramesUntilFreeze`: Number of frames to render until freezing the renderer
         * * n>0 | freeze after rendering n frames
         * * n=0 | freezing on the current frame
         * * n=-1 | not freezing
         * @private
         * @type {number}
         */
        this._numFramesUntilFreeze = -1;
        /**
         * `_shaderSourcesForBug`: Source code strings for overwriting GLSL shaders.
         * @private
         * @type {Object}
         */
        this._shaderSourcesForBug = {
            none: {
                vertex: window.vertexSourceDefault,
                fragment: window.fragmentSourceDefault
            },
            appearance: {
                vertex: window.vertexSourceBugAppearance,
                fragment: window.fragmentSourceBugAppearance
            },
            layout: {
                vertex: window.vertexSourceBugLayout,
                fragment: window.fragmentSourceBugLayout
            },
            rendering: {
                vertex: window.vertexSourceBugRendering,
                fragment: window.fragmentSourceBugRendering
            },
            state: {
                vertex: window.vertexSourceBugState,
                fragment: window.fragmentSourceBugState
            }
        };
    }
    /**
     * Return the current number of frames until the renderer is frozen.
     */
    get numFramesUntilFreeze() {
        return this._numFramesUntilFreeze;
    }
    /**
     * Returns true if the WebGLRenderingContext has been injected with custom prototype overrides.
     */
    get hasWebglReference(){
        return !(this._gl === null);
    }
    /**
     * Dynamically override the PIXI.Renderer.render() method to include bug injecting code.
     * Also override the PIXI.Container.render() method to include the bug injecting code.
     */
    injectPixi() {
        super.injectPixi();
        this._injectContainerRender();
        // this._injectSyncUniforms();
    }
    /**
     * Dynamically override WebGL methods to include the bug injecting code.
     */
    injectWebGL() {
        // make sure we already have the reference to PIXI's `gl` instance
        if (this._gl === null) {
            console.error(`Reference to PIXI's instance of WebGLRenderingContext not yet set in ${this.constructor.name}.`);
            return;
        }
        // make sure we haven't already injected the code
        if (this._hasInjectedWebgl) {
            console.warn(`${this.constructor.name} already injected PIXI's WebGLRenderingContext`);
            return;
        }
        // inject WebGL methods
        this._injectUseProgram();
        // mark as injected
        this._hasInjectedWebgl = true;
    }
    /**
     * Just-in-time (JiT) injecting of a bug into the WebGLRenderingContext.
     * The WebGLRenderingContext must already be injected with custom prototype methods.
     * @param {string} name - the name of the bug to inject
     * @param {number} numFramesUntilFreeze - number of frames with bug until the renderer is frozen
     */
    injectBug(name, numFramesUntilFreeze = 0) {
        const isValidBugName = Object.values(this._enumValidBugNames).includes(name);
        if (!this._hasInjectedPixi) {
            console.error("injectBug method failed: PixiJS Renderer class has not been overriden yet through this.injectPixi()")
            return;
        }
        if (!this._hasInjectedContainerRender) {
            console.error("injectBug method failed: PixiJS Container class has not been overriden yet through this.injectPixi() --> this._injectContainerRender()")
            return;
        }
        // TODO try to inject Pixi etc. if they failed to be injected on init?
        if (!this._hasInjectedWebgl) {
            console.warn("injectBug method calling this.injectWebGL(): WebGL not injected upon initialization");
            this.injectWebGL();
        }
        if (!this._hasInjectedWebgl) {
            console.error("injectBug method failed: WebGL methods have not been overriden yet through this.injectWebGL()")
            return;
        }
        if (!isValidBugName) {
            console.error("injectBug method failed: Requires a valid bug name argument");
            return;
        }
        this._isSettingBugToInject = true;
        this._activeBug = name;  
        this._numFramesUntilFreeze = numFramesUntilFreeze;
    }
    /**
     * Method called immediately after the original PIXI.Renderer.render() is called.
     * Overwrites the preCallRenderMethod to include the bug injecting code.
     * @param {PixiVisualBugsClient} visualBugger - the PixiVisualBugsClient instance
     * @param {PIXI.Renderer} renderer - the renderer instance
     */
    _preCallRenderMethod(visualBugger, renderer) {
        // copy reference to Renderer
        visualBugger._renderer = renderer;
        // copy reference to WebGLRenderingContext
        visualBugger._gl = renderer.state.gl;
        /**
         * Starting render pass so we can now mark as finished setting active bug to inject.
         * (If a bug is currently being set as ready to inject).
         * The frames from now until `_numFramesUntilFreeze` will now render with bug injected.
         */
        if (visualBugger._isSettingBugToInject) {
            // pre-select which objects we will inject bugs into
            visualBugger._selectCorNodesToInjectBugInto();
            visualBugger._isSettingBugToInject = false;
        } else if (visualBugger._numFramesUntilFreeze === 0) {
            // always ensure to turn off the bug flags after done freezing
            visualBugger._activeBug = visualBugger._enumValidBugNames.none;
            visualBugger._clearCorNodesToInjectBugInto();
            visualBugger._numFramesUntilFreeze = -1;
        } else if (visualBugger._numFramesUntilFreeze > 0) {
            console.log(`${this._activeBug} bug injected - numFramesUntilFreeze=${this._numFramesUntilFreeze}`);
            // decrement the number of frames until freeze
            visualBugger._numFramesUntilFreeze--;
        }
    }
    /**
     * Method called immediately after the original PIXI.Renderer.render() is called.
     * Overwrites the postCallRenderMethod to include the bug injecting code.
     * @param {PixiVisualBugsClient} visualBugger - the PixiVisualBugsClient instance
     * @param {PIXI.Renderer} renderer - the renderer instance
    */
    _postCallRenderMethod(visualBugger, renderer) {
        // check if we need to begin a freeze
        if (!visualBugger._isSettingBugToInject && visualBugger._numFramesUntilFreeze === 0) {
            console.log(`${this._activeBug} bug injected - freezing now`);
            visualBugger.freeze();
        } 
    }
    /**
     * Reset the list of objects to inject the bug into to an empty array
     */
    _clearCorNodesToInjectBugInto() {
        this._listOfCorNodesToInject = Array();
    }
    /**
     * Select a list of nodes to inject the visual bug into
     */
    _selectCorNodesToInjectBugInto() {
        this._clearCorNodesToInjectBugInto();
        const listOfCandidates = this._getListOfCorCandidatesForBugInjection();
        // apply heuristics to select object(s)
        for (let idx in listOfCandidates) {
            const candidate = listOfCandidates[idx];
            candidate.getBounds();
            // can add a line like `Math.random() > 0.25` to select a random number of these
            if (
                !this._checkObjectIsInsideCanvasBounds(candidate)
                ||
                !this._applyCorSelectionCriteria(candidate)
            ) {
                continue;
            };
            // set list of object to inject
            this._listOfCorNodesToInject.push(candidate);
        }
    }
    /**
     * Get a list of all nodes that are leafs of the COR
     */
    _getListOfCorCandidatesForBugInjection() {
        if (!this._cor) {
            return Array();
        }
        return this._mapAllLeafs(this._cor).flat(Infinity);
    }
    /**
     * Find all nodes that are leafs from the current node, including the current node itself
     */
    _mapAllLeafs(node, num_times_recursed=0) {
        if (!node.children || node.children.length == 0) {
            if (num_times_recursed == 0){
                return [node];

            }
            return node;

        } else {
            return node.children.map(c => this._mapAllLeafs(c, num_times_recursed+1));

        }
    }
    /**
     * Check if a given object has _bounds defined within the canvas
     * 
     * Probably a bug here - not clear if _bounds update if e.g. panning occurs on canvas
     */
    _checkObjectIsInsideCanvasBounds(container) {
        return (
            container?._bounds !== undefined
            && container?._bounds !== null
            && typeof container?._bounds?.minX === 'number'
            && typeof container?._bounds?.maxX === 'number'
            && typeof container?._bounds?.minY === 'number'
            && typeof container?._bounds?.maxY === 'number'
            && isFinite(container?._bounds?.minX)
            && isFinite(container?._bounds?.maxX)
            && isFinite(container?._bounds?.minY)
            && isFinite(container?._bounds?.maxY)
            && container?._bounds?.minX > 0
            && container?._bounds?.maxX < this._renderer.width
            && container?._bounds?.minY > 0
            && container?._bounds?.maxY < this._renderer.height
        )
    }
    /**
     * Set custom logic for obj selection in bug injection
     */
    setFunctionForCorSelectionCriteria(customFunction) {
        this._functionForCorSelectionCriteria = customFunction;
    }
    /**
     * Reset custom logic for obj selection in bug injection
     */
    setFunctionForCorSelectionCriteriaToDefault() {
        this._functionForCorSelectionCriteria = this._naiveCheckObjectBugCandidate;
    }
    /**
     * Check if a container matches criteria for what object should be bugged
     * 
     * TODO should maybe include a check for what kind of shader the object needs
     * if it is one that doesn't match default, then just skip that object
     * 
     * Otherwise have to extend bug injection to multiple shader types, to prevent WebGL errors
     */
    _applyCorSelectionCriteria(container) {
        return this._functionForCorSelectionCriteria(container);
    }
    /**
     * Naive default way to select objects.
     * Determine if the container has a bounding box area that is 
     * (>=10% width & >=2% height) OR (>=2% width & >=10% height) 
     * of the viewable area of the canvas 
     */
    _naiveCheckObjectBugCandidate(container) {
        return (
            (
                (((container?._bounds?.maxX - container?._bounds?.minX) / this._renderer.width) >= 0.10)
                &&
                (((container?._bounds?.maxY - container?._bounds?.minY) / this._renderer.height) >= 0.02)
            )
            ||
            (
                (((container?._bounds?.maxX - container?._bounds?.minX) / this._renderer.width) >= 0.02)
                &&
                (((container?._bounds?.maxY - container?._bounds?.minY) / this._renderer.height) >= 0.10)
            )
        )
    }
    /**
     * Inject the PIXI.Container._render() method to include bug injecting code.
     * Enables selection of which object to inject the visual bug into.
     */
    _injectContainerRender() {
        const visualBugger = this;
        let containerClass;

        if (this._hasInjectedContainerRender) {
            console.warn(`${this.constructor.name} already injected PIXI.Container`)
            return;
        }

        if (typeof PIXI !== "undefined"){
            console.info("Using PixiJS Container class definition at PIXI.Container")
            containerClass = PIXI.Container;

        } else if (typeof __PIXI_APP__ !== "undefined"){
            console.info("Using PixiJS Container class definition at __PIXI_APP__.stage.constructor")
            containerClass = __PIXI_APP__.stage.constructor;

        } else {
            console.error("Could not find reference to PixiJS Container class definition");
            return;
        }

        const containerRender = containerClass.prototype.render;

        containerClass.prototype.render = function (renderer, ...args) {
            const container = this;
            let programOriginal, locationsOriginal;

            if (
                visualBugger._activeBug === visualBugger._enumValidBugNames.none
                || visualBugger._isSettingBugToInject
                || visualBugger._listOfCorNodesToInject.indexOf(container) === -1
            ) {
                // render this object normally
                containerRender.apply(container, [renderer, ...args]);
                return;
            };
            // update reference to renderer
            // visualBugger._renderer = renderer;
            // mark as injected
            container.__injected_by_pixi_visual_bugger__ = true;
            // TODO add saving the ground truth into the PixiVisualBugsPlaywright API and this file.
            console.log(`Injecting ${visualBugger._activeBug} bug into object of type ${container.constructor.name}`);
            // console.debug(container);
            visualBugger._renderer.batch.setObjectRenderer(renderer.plugins["batch"]);
            // flush batcher so we can target this object
            visualBugger._renderer.batch.flush();
            // set the buggy program
            [programOriginal, locationsOriginal] = visualBugger._activateBuggyProgram();
            // render this object
            containerRender.apply(container, [renderer, ...args]);
            visualBugger._renderer.batch.flush();
            // reset the program
            visualBugger._deactivateBuggyProgram(programOriginal, locationsOriginal);
        };

        // set flag to is injected
        visualBugger._hasInjectedContainerRender = true;
    }
    /**
     * Activate a buggy shader program.
     */
    _activateBuggyProgram() {
        if (this._isOverridingProgram) {
            console.warn("Already overriding the default program with the buggy program");
            return;
        } else {
            console.info("Activating buggy program");
        }
        const gl = this._gl;
        const CONTEXT_UID = this._renderer.CONTEXT_UID;
        const programBuggy = this._createProgram(gl);
        const programOriginal = this._renderer.shader.program.glPrograms[CONTEXT_UID].program;
        const uniformData = this._renderer.shader.program.glPrograms[CONTEXT_UID].uniformData;
        const locationsOriginal = {};
        /**
         * Set the new buggy program for PixiJS
         * @todo find a way to not need to tell PixiJS which program we are using
         */
        this._renderer.shader.program.glPrograms[CONTEXT_UID].program = programBuggy;
        /**
         * Set the new buggy program for WebGLRenderingContext
         */
        gl.useProgram(programBuggy);
        this._isOverridingProgram = true;
        /**
         *  Update PixiJS with the program and locations we are now using this render pass
         */ 
        for (const [key, uniformDataObject] of Object.entries(uniformData)) {
            const locationOriginal = uniformDataObject.location;
            const valueOriginal = gl.getUniform(programOriginal, locationOriginal);
            const locationBuggy = gl.getUniformLocation(programBuggy, key);
            /**
             * Set the new program locations for PixiJS in:
             * renderer.shader.program.glPrograms[1].uniformData
             * .{'projectionMatrix', 'translationMatrix', 'tint', 'uSamplers'}.location
             * 
             * @todo find a way to not need to tell PixiJS which program locations we are using
             */
            locationsOriginal[key] = locationOriginal;
            uniformData[key].location = locationBuggy;
            /**
             * Set the original uniforms on the new locations in WebGL
             */
            if (key === "projectionMatrix" || key === "translationMatrix") {
                gl.uniformMatrix3fv(locationBuggy, false, valueOriginal);

            } else if (key === "tint") {
                gl.uniform4fv(locationBuggy, valueOriginal);

            } else if (key === "uClampFrame") {
                gl.uniform4fv(locationBuggy, valueOriginal);
                console.warn("Set uniform location for unusued uniform uClampFrame in buggy shader");
                
            } else if (key === "uClampOffset") {
                gl.uniform2fv(locationBuggy, valueOriginal);
                console.warn("Set uniform location for unusued uniform uClampOffset in buggy shader");

            } else if (key === "uColor") {
                gl.uniform4fv(locationBuggy, valueOriginal);
                console.warn("Set uniform location for unusued uniform uColor in buggy shader");

            } else if (key === "uMapCoord") {
                gl.uniform2fv(locationBuggy, valueOriginal);
                console.warn("Set uniform location for unusued uniform uMapCoord in buggy shader");

            } else if (key === "uSampler") {
                gl.uniform1i(locationBuggy, valueOriginal)
                console.warn("Set uniform location for unusued uniform uSampler in buggy shader");

            } else if (key === "uTransform") {
                gl.uniformMatrix3fv(locationBuggy, false, valueOriginal);
                console.warn("Set uniform location for unusued uniform uTransform in buggy shader");


            } else if (key === "uSamplers") {
                /**
                 * For some reason have to manually set this?
                 * Following does not work: 
                 * `gl.uniform1iv(locationBuggy, valueOriginal)`
                 * as `valueOriginal` is undefined for some reason.
                 */
                const uSamplerValues = new Int32Array(16);
                for (let i = 0; i < 16; i++)
                {
                    uSamplerValues[i] = i;
                }
                gl.uniform1iv(locationBuggy, uSamplerValues);
            }
        }
        return [programOriginal, locationsOriginal];
    }
    /**
     * Deactivate a buggy shader program.
     * 
     * TODO fix
     * definitely doing something wrong
     * maybe the order of useProgram() and getting the uniforms
     * also am I properly resetting the glPrograms stuff?
     * Probably want to keep reference/copy to original UniformData and pass that
     * instead of just grabbing it from Pixi as the CONTEXT_UID may change between activating and deactivating
     * 
     * IGNORE for now
     * fix later
     */
    _deactivateBuggyProgram(programOriginal, locationsOriginal) {
        if (!this._isOverridingProgram) {
            console.warn("Failed to deactivate buggy program: Not currently overriding the default program with the buggy program");
            return;
        } else {
            console.info("Deactivating buggy program");
        }
        const CONTEXT_UID = this._renderer.CONTEXT_UID;
        this._renderer.shader.program.glPrograms[CONTEXT_UID].program = programOriginal;
        this._isOverridingProgram = false;
        this._gl.useProgram(programOriginal);
        const uniformData = this._renderer.shader.program.glPrograms[CONTEXT_UID].uniformData;
        for (const [key, location] of Object.entries(locationsOriginal)) {
            try {
                uniformData[key].location = location;    
            } catch (err) {
                console.error(`Failed to re-set uniformData locations for original program: ${err}`)
            }
            
        }
    }
    _createProgram(gl) {
        let keyShaderSources, vertexShaderCode, fragmentShaderCode, vertexShader, fragmentShader, program;

        vertexShaderCode = this._shaderSourcesForBug[this._activeBug].vertex;
        fragmentShaderCode = this._shaderSourcesForBug[this._activeBug].fragment;
        vertexShader = this._createShader(gl, vertexShaderCode, gl.VERTEX_SHADER);
        fragmentShader = this._createShader(gl, fragmentShaderCode, gl.FRAGMENT_SHADER);
        program = gl.createProgram();

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.bindAttribLocation(program, 3, "aVertexPosition");
        gl.bindAttribLocation(program, 1, "aTextureCoord");
        gl.bindAttribLocation(program, 0, "aColor");
        gl.bindAttribLocation(program, 2, "aTextureId");
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(`Link failed: ${gl.getProgramInfoLog(program)}`);
            console.error(`vs info-log: ${gl.getShaderInfoLog(vertexShader)}`);
            console.error(`fs info-log: ${gl.getShaderInfoLog(fragmentShader)}`);;
        }

        // clean up unused objects after linking
        gl.detachShader(program, vertexShader);
        gl.detachShader(program, fragmentShader);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        return program;
    }
    _createShader(gl, sourceCode, type) {
        // Compiles either a shader of type gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
        const shader = gl.createShader(type);
        gl.shaderSource(shader, sourceCode);
        gl.compileShader(shader);
        return shader;
    }
    /**
     * Generic wrapper for overridings WebGl methods when bug is active.
     */
    _injectWebglMethod(methodName, callback=null){
        const glPrototype = Object.getPrototypeOf(this._gl);
        const visualBugger = this;
        const originalMethod = glPrototype[methodName];

        glPrototype[methodName] = function(...args) {
            const gl = this;

            if (
                visualBugger._activeBug !== visualBugger._enumValidBugNames.none
                && !visualBugger._isSettingBugToInject
            ) {

                // console.log(`[${visualBugger.constructor.name}] (${methodName}) ${visualBugger._activeBug} bug injected - numFramesUntilFreeze=${visualBugger._numFramesUntilFreeze}`);

                // If callback set, run it. Otherwise default is just do not call the originalMethod
                if (callback !== null) {
                    callback(gl, originalMethod, args);
                }

            } else {
                originalMethod.apply(gl, args);
            }
        }
    }
    /**
     * This is additional code to try to make sure that any calls to reset the program
     * that is in use while we are injecting a bug is rejected.
     * Probably this code is never called but keeping it to be safe.
     * @todo  review: `if (!Object.keys(uniformData).includes("tint")) {`
     */
    _injectUseProgram() {
        const visualBugger = this;
        const callback = function(gl, f, args) {
            const programOriginal = args[0];
            const CONTEXT_UID = visualBugger._renderer.CONTEXT_UID;
            const uniformData = visualBugger._renderer.shader.program.glPrograms[CONTEXT_UID].uniformData;
            if (!visualBugger._isOverridingProgram) {
                // make sure to reset the program and program locations for PixiJS
                // ...
                // (maybe do this at another point in the code)
                f.apply(gl, [programOriginal, ...args]);
                return;
            } else {
                // OFF: render tilingsprites/anything with non-default shader normally
                // if (!Object.keys(uniformData).includes("tint")) {
                //     f.apply(gl, [programOriginal, ...args]);
                //     return;
                // }
                // don't let Pixi override the program we set
                console.log(`[${visualBugger.constructor.name}] (useProgram) Bug injected - Prevented additional useProgram call while overriding program.`);
                return;
            }
        }
        this._injectWebglMethod("useProgram", callback);
    }
}

window.PixiVisualBugsClient = PixiVisualBugsClient;
