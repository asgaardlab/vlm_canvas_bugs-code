import { Page } from '@playwright/test'
import { PixiVisualBugsPlaywright } from "../PixiVisualBugsPlaywright";

export class PixiVisualBugsPlaywrightDebug extends PixiVisualBugsPlaywright {
    constructor(
        page:Page,
        path:string,
        pixiDevToolName:string = 'PixiVisualBugsClientDebug',
        instanceName:string = '__PIXI_VISUAL_BUGS_DEBUG__'
    ) {
        super(page, path, pixiDevToolName, instanceName);
    }

    override async injectClient() {
        // attach webgl inspector
        await this.injectScript("modules/spectorjs/spector.bundle.js");
        const code_inspect = [
            // `const canvas = document.getElementsByTagName("canvas")[0];`,
            `const __PIXI_SPECTOR__ = new SPECTOR.Spector();`,
            `window.__PIXI_SPECTOR__ = __PIXI_SPECTOR__;`,
            `__PIXI_SPECTOR__.onCapture.add((capture) => {`,
            // `var myEvent = new CustomEvent("SpectorOnCaptureEvent", { detail: { captureString: JSON.stringify(capture) } });`,
            `   __PIXI_SPECTOR__.getResultUI();`,
            `   __PIXI_SPECTOR__.resultView.display();`,
            `   __PIXI_SPECTOR__.resultView.addCapture(capture);`,
            `   __PIXI_SPECTOR__.pause();`,
            `});`,
            // `__PIXI_SPECTOR__.captureCanvas(canvas, 3500);`
        ].join('\n');
        await this.page.evaluate(code_inspect);
        await super.injectClient();
    }

    override async injectBug(numFramesUntilFreeze:number = 0) {
        // // remove the background container HARDCODED FOR TOY GAME
        // // not sure this is working as intended, changes rendering behaviour
        // // for now don't do this but if doing it can reduce commandCount from 720 to ~50
        // const code_remove = `${this.instanceName}._cor.removeChildAt(0);`;
        // await this.page.evaluate(code_remove);
        const code_capture = [
            `let canvas = document.getElementsByTagName("canvas")[0];`,
            `if (!canvas) canvas = document.getElementsByTagName("iframe")[0].contentDocument.getElementsByTagName("canvas")[0];`,
            `__PIXI_SPECTOR__.captureCanvas(canvas, 720);` // HARDCODED FOR TOY GAME
        ].join('\n');
        await this.page.evaluate(code_capture);
        await super.injectBug(numFramesUntilFreeze);
    }
}