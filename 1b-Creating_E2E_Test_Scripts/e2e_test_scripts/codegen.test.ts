import { chromium } from "playwright";
import { PixiVisualBugsPlaywright } from "../../screenshot-collector/PixiVisualBugsPlaywright";
import { PixiVisualBugsPlaywrightDebug } from "../../screenshot-collector/debug/PixiVisualBugsPlaywrightDebug"
import { program } from "commander";

const SNAPSHOTS_PATH = `${__dirname}/../../../Data/1d-Collecting_Screenshots/__test_screenshots__/_codegen`;

(async () => {
    program
        .usage('[OPTIONS]...')
        .option('-n, --name <value>', 'Set the app name for saving the snapshots to directory.')
        .option('-p, --port <value>', 'Set the port number that app is serving on.')
        .option('-d, --debug', 'Set if debug mode (Chrome DevTools + SpectorJS).')
        .option('-s, --https', 'Set if serving on https.')
        .parse(process.argv);
    // read args
    const options = program.opts();
    const port = options.port;
    const appName = options.name;
    const isDebugMode = options.debug || false;
    const isHttpsMode = options.https || false;
    await test(appName, port, isDebugMode, isHttpsMode);
})();

async function test(snapshotName:string, portNumber:number, isDebugMode:boolean, isHttpsMode:boolean) {
    let urlDemo;
    if (isHttpsMode) {
        urlDemo = `https://localhost:${portNumber}`;
    } else {
        urlDemo = `http://localhost:${portNumber}`;    
    }
    // Start browser
    const browser = await chromium.launch({ headless: false });
    // Open new page with browser
    const page = await browser.newPage({ ignoreHTTPSErrors: isHttpsMode && urlDemo.startsWith("https://localhost:") });
    // Create exposer for current page
    let sampler;
    if (isDebugMode) {
	   sampler = new PixiVisualBugsPlaywrightDebug(page, SNAPSHOTS_PATH);
    } else {
	   sampler = new PixiVisualBugsPlaywright(page, SNAPSHOTS_PATH);
    }
    // Open the demo URL
    await page.goto(urlDemo);
    // Wait for the page to load
    await page.waitForLoadState("load");
    await page.waitForTimeout(1000);

    // PAUSE #1: to start doing codegen to reach the canvas part of app
    await page.pause();

    await page.waitForSelector("canvas");
    await page.waitForTimeout(1000);

    // PAUSE #2: to continue doing any required codegen within the canvas app before overriding methods
    await page.pause()

    // Inject the PixiSamplerPlaywright script into the page
    await sampler.injectClient();
    // Perform any necessary interactions on the demo page here
    // e.g., Zoom in/out, pan the viewport, click a node in the graph, etc.

    // PAUSE #3: to make sure we do any more code gen within the canvas app after overriding methods
    await page.pause();

    // Take snapshot of current state
    await sampler.takeSnapshot(snapshotName);

    // End the test
    if (!isDebugMode) {
        await browser.close();
    } else {
        await page.pause();
    }
}
