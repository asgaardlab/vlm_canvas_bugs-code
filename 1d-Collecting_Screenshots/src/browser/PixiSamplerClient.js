/**
 * PixiSamplerClient - a client-side class for sampling PixiJS.
 * 
 * This class is used to capture the Canvas Objects Representation (COR) in use by the PIXI.Render instance, 
 * coupled with a screenshot of the <canvas> element used by the PIXI.Renderer.
 * 
 * This class is intended to be extended by other classes that require tracking of the rendering context.
 */
class PixiSamplerClient {
	constructor() {
		/** 
		 * `_hasInjectedPixi`: Flag to check if PixiJS has been injected yet.
		 * @private
		 * @type {boolean}
		 */
		this._hasInjectedPixi = false;
		/** 
		 * `_isFreezingRenderer`: Flag to check if the renderer is frozen.
		 * @private
		 * @type {boolean}
		 */
		this._isFreezingRenderer = false;
		/**
		 * `_canvas`: Reference to the canvas used by PIXI.Renderer.
		 * @private
		 * @type {HTMLCanvasElement}
		 */
		this._canvas = null;
		/**
		 * `_cor`: Reference to the <canvas> objects representation (COR).
		 * In PixiJS, this is the scene graph.
		 * @private
		 * @type {Object}
		 */
		this._cor = {};
		/**
		 * `_corPollBzmr`: Canvas Objects Representation (COR) polled and converted
		 * into Browser Zip Mapped References (BZMR) format using the Flatted library
		 * @private
		 * @type {Object}
		 */
		this._corPollBzmr = {}; 
		//this._resolution = 1; 
	}
	/**
	 * Check if PixiJS has been injected with tracking code
	 * @returns {boolean} - true if PixiJS has been injected
	 */
	get hasInjectedPixi() {
		return this._hasInjectedPixi;
	}
	/**
	 * Check if the Pixi Renderer is currently being frozen
	 * @returns {boolean} - true if the renderer is being frozen
	 */
	get isFreezingRenderer() {
		return this._isFreezingRenderer;
	}
	/**
	 * Return a reference to the canvas used by PIXI.Renderer
	 * @returns {HTMLCanvasElement} - the canvas element
	 */
	get canvas() {
		return this._canvas;
	}
	/**
	 * Inject PixiJS with tracking code
	 */
	injectPixi() {
		let rendererClass;

		// make sure we haven't already injected the code
		if (this._hasInjectedPixi === true) {
			console.warn(`${this.constructor.name} already injected PIXI.Renderer`);
			return;
		}

		// inject the client devtool code into the PIXI rendering function
		if (typeof __PIXI_APP__ !== "undefined"){
			console.info("__PIXI_APP__ found in global scope");
			rendererClass = __PIXI_APP__.renderer.constructor;

		} else if (typeof PIXI !== "undefined"){
			console.info("PIXI found in global scope");
			rendererClass = PIXI.Renderer;

		} else {
			console.error("Neither PIXI nor __PIXI_APP__ found in global scope");
			return;
		}

		this._injectPixiRenderer(rendererClass);
		// mark as injected
		this._hasInjectedPixi = true;
	}
	/**
	* Freeze the renderer and poll the Canvas Objects Representation (COR) in Browser Zip Mapped References (BZMR) format
	*/
	freeze() {
		this._isFreezingRenderer = true;
		this._corPollBzmr = this._corPoll();
	}
	/**
	 * Return the Canvas Objects Representation (COR) in Browser Zip Mapped References (BZMR) format, set when freezing renderer
	 */
	serialize() {
		return this._corPollBzmr;
	}
	/**
	 * Unfreeze the renderer and clear the the Canvas Objects Representation (COR) in Browser Zip Mapped References (BZMR) format
	 */
	unfreeze() {
		this._corPollBzmr = Object();
		this._isFreezingRenderer = false;
	}
	/**
	 * Poll the Canvas Objects Representation (COR) and return the COR in a Browser Zip Mapped References (BZMR)
	 */
	_corPoll() {
		// @todo consider trying this: Make sure all the nodes have their _bounds property set
		// this._cor.getBounds();
		// Poll the COR
		const corPoll = Object.freeze(Object.assign({}, this._cor));

		// Get the assets
		// img._texture.baseTexture.resource.source. (is there also source.toDataURL ?)
		// txt._texture.baseTexture.resource.source.toDataURL("image/png")

		// Convert the COR into Browser Zip Mapped References (BZMR) format
		const corPollBzmr = Flatted.stringify(corPoll);
		return corPollBzmr;
	}
	/**
	 * Dynamically override the Pixi Renderer.render method
	 */
	_injectPixiRenderer(rendererClass) {
		const sampler = this;
		// grab original rendering function that PIXI uses
		const renderMethod = rendererClass.prototype.render;
		// inject the tracking code into the rendering function
		rendererClass.prototype.render = function (stage, ...args) {
			// use a distinct reference to the Renderer object
			// (to reduce confusion with PixiSampler's this)
			const renderer = this;
			// prevent rendering when freezing animations
			if (sampler._isFreezingRenderer)
				return;
			// set sampler._cor and sampler._canvas
			sampler._copyReferencesFromRenderer(renderer, stage);
			// Custom PixiDevTool pre-render pass logic
			sampler._preCallRenderMethod(sampler, renderer);
			// apply the original rendering function
			renderMethod.apply(renderer, [stage, ...args]);
			// Custom PixiDevTool post-render pass logic
			sampler._postCallRenderMethod(sampler, renderer);
		};
	}
	/**
	 * Copy references from the PIXI.Renderer to the PixiSampler instance
	 */
	_copyReferencesFromRenderer(renderer, stage) {
		// copy reference to the <canvas> objects representation (COR)
		this._cor = stage;
		// copy reference to the canvas
		this._canvas = renderer.view;
		// copy the resolution of the renderer
		//sampler.resolution = renderer.resolution;
	}
	/**
	 * Method called immediately before the original PIXI.Renderer.render() is called.
	 * Override this method in extending classes to include custom logic.
	 * @param {PixiSamplerClient} sampler - the sampler instance
	 * @param {PIXI.Renderer} renderer - the renderer instance
	 */
	_preCallRenderMethod(sampler, renderer) {
		// empty function to be overridden by extending classes
	}
	/**
	 * Method called immediately after the original PIXI.Renderer.render() is called.
	 * Override this method in extending classes to include custom logic.
	 * @param {PixiSamplerClient} sampler - the sampler instance
	 * @param {PIXI.Renderer} renderer - the renderer instance
	 */
	_postCallRenderMethod(sampler, renderer) {
		// empty function to be overridden by extending classes
	}
}
window.PixiSamplerClient = PixiSamplerClient;
