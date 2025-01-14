import { chromium } from "playwright";
import { PixiVisualBugsPlaywright } from "../../screenshot-collector/PixiVisualBugsPlaywright";
import { PixiVisualBugsPlaywrightDebug } from "../../screenshot-collector/debug/PixiVisualBugsPlaywrightDebug";
import { program } from "commander";

/**
 * Set APP_PORT and APP_NAME here
 */ 
const APP_NAME = "ha-shine-wasm-tetris"
const APP_PORT = "8080"
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
    try {
        await page.frameLocator('#webpack-dev-server-client-overlay').getByLabel('Dismiss').click();   
    } catch {
        console.log("no overlay")
    }
    

    // Wait for canvas to load on page
    await page.waitForSelector("canvas");
    await page.waitForTimeout(250);

    /**
     * Additional code to interact with canvas:
     */
    await page.getByText('Your browser does not support').click({
    position: {
      x: 415,
      y: 296
    }
    });
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('ArrowLeft');
    await page.waitForTimeout(250);
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('ArrowLeft');
    await page.waitForTimeout(250);
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('ArrowRight');
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('x')
    await page.waitForTimeout(250);
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('ArrowRight');
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('Space')
    await page.waitForTimeout(250);
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('ArrowLeft');
    await page.waitForTimeout(250);
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('ArrowRight');
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('x')
    await page.waitForTimeout(250);
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('ArrowRight');
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('x')
    await page.waitForTimeout(250);
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('ArrowDown');
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('c')
    await page.waitForTimeout(250);
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('ArrowDown');
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('Space')
    await page.waitForTimeout(250);
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('ArrowLeft');
    await page.waitForTimeout(250);
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('ArrowLeft');
    await page.waitForTimeout(250);
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('ArrowRight');
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('c')
    await page.waitForTimeout(250);
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('ArrowRight');
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('z')
    await page.waitForTimeout(250);
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('ArrowRight');
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('z')
    await page.waitForTimeout(250);
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('ArrowRight');
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('Space')
    await page.waitForTimeout(250);
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('ArrowLeft');
    await page.waitForTimeout(250);
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('ArrowLeft');
    await page.waitForTimeout(250);
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('ArrowUp');
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('x')
    await page.waitForTimeout(250);
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('ArrowRight');
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('c')
    await page.waitForTimeout(250);
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('ArrowRight');
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('x')
    await page.waitForTimeout(250);
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('ArrowUp');
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('Space')
    await page.waitForTimeout(250);
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('ArrowLeft');
    await page.waitForTimeout(250);
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('ArrowLeft');
    await page.waitForTimeout(250);
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('ArrowLeft');
    await page.waitForTimeout(250);
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('ArrowLeft');
    await page.waitForTimeout(250);
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('ArrowLeft');
    await page.waitForTimeout(250);
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('ArrowRight');
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('z')
    await page.waitForTimeout(250);
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('ArrowRight');
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('x')
    await page.waitForTimeout(250);
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('ArrowRight');
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('Space')
    await page.waitForTimeout(250);
    await page.getByText('Your browser does not support canvas Rust + WebAssembly + PixiJS').press('ArrowRight');

    // Inject client
    await sampler.injectClient();
    await page.waitForTimeout(250);

    // Take snapshot
    await sampler.takeSnapshotWithBug(snapshot_name, bug_name);    
    await page.waitForTimeout(250);

    // End the test
    if (!isDebugMode) {
        await browser.close();
    } else {
        await page.pause();
    }
}