import { chromium } from "playwright";
import { PixiVisualBugsPlaywright } from "../../screenshot-collector/PixiVisualBugsPlaywright";
import { PixiVisualBugsPlaywrightDebug } from "../../screenshot-collector/debug/PixiVisualBugsPlaywrightDebug";
import { program } from "commander";

/**
 * Set APP_PORT and APP_NAME here
 */ 
const APP_NAME = "p5aholic-playground"
const APP_PORT = "3000"
const DEMO_URL = `http://localhost:${APP_PORT}`
const SNAPSHOTS_PATH = `${__dirname}/../../../Data/1d-Collecting_Screenshots/screenshots/${APP_NAME}/`;

(async () => {
    program
        .usage('[OPTIONS]...')
        .option('-b, --bug <value>', 'Set the bug to inject in the snapshot.')
        .option('-n, --name <value>', 'Set the name of the snapshot.')
        .option('-d, --debug', 'Set if debug mode (Chrome DevTools + SpectorJS).')
        .parse(process.argv);
    const options = program.opts();
    const bugName = options.bug;
    const snapshotName = options.name;
    const isDebugMode = options.debug;
    await test(snapshotName, bugName, isDebugMode);
})();

async function test(snapshot_name = "test", bug_name = "none", isDebugMode = false) {
    // Start browser
    const browser = await chromium.launch({ headless: false });
    // Open new page with browser
    const page = await browser.newPage();

    let sampler;
    // Create sampler for current page
    if (!isDebugMode){
        sampler = new PixiVisualBugsPlaywright(page, SNAPSHOTS_PATH);
    } else {
        sampler = new PixiVisualBugsPlaywrightDebug(page, SNAPSHOTS_PATH);
    }

    // Open the demo URL
    await page.goto(DEMO_URL);
    // Wait for the page to load
    await page.waitForLoadState("load");
    await page.waitForTimeout(1000);

    /**
     * Additional code to reach part of app with canvas:
     */
    // ...
    // ...
    // ...

    // Wait for canvas to load on page
    await page.waitForSelector("canvas");
    await page.waitForTimeout(250);

    /**
     * Additional code to interact with canvas:
     * 
     * https://playwright.dev/docs/api/class-mouse
     */
    await make_particles(page, 200, 200, 400);
    await make_particles(page, 300, 300, 500);
    await make_particles(page, 600, 400, 200);

    // Inject client
    await sampler.injectClient();
    await page.waitForTimeout(250);

    /**
     * All of the Sprites (except the pointer) are in a ParticleContainer
     * 
     * https://api.pixijs.io/@pixi/particle-container/src/ParticleContainer.ts.html#199
     * https://api.pixijs.io/@pixi/particle-container/src/ParticleContainer.ts.html#218
     * 
     * It uses the particle renderer plugin.
     * Not sure yet how to individually render the particles that the particle 
     * render would render (while preventing that renderer from working - as it will 
     * overwrite our injected bugs).
     * 
     * Instead, just inject the pointer with bugs for now.
     */
    const options = {
        // numFramesUntilFreeze: 5,
        // strCustomSelectionLogic: `o.parent.constructor.name === "Container" || Math.random() > 0.5`,
        strCustomSelectionLogic: `true`,
        // boolForceRenderPassBeforeSnapshot: true,
        // strCustomForceRenderCall: `${sampler.instanceName}._cor.children[1].children.map(c => c.render(${sampler.instanceName}._renderer));`,
    };

    // await page.pause();

    // Take snapshot
    await sampler.takeSnapshotWithBug(snapshot_name, bug_name, options);
    await page.waitForTimeout(250);

    // await page.pause();

    // End the test
    if (!isDebugMode) {
        await browser.close();
    } else {
        await page.pause();
    }
}

async function make_particles(page: any, x_start: number, y_start: number, length=400) {
    await page.mouse.move(x_start, y_start);
    await page.mouse.down();
    await page.mouse.move(x_start+length, y_start);
    await page.mouse.move(x_start+length, y_start+length);
    await page.mouse.move(x_start, y_start+length);
    await page.mouse.move(x_start, y_start);
    await page.mouse.up();
    await page.waitForTimeout(100);
}