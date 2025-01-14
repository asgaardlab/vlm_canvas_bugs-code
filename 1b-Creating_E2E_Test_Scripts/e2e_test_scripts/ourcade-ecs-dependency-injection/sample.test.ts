import { chromium } from "playwright";
import { PixiVisualBugsPlaywright } from "../../screenshot-collector/PixiVisualBugsPlaywright";
import { PixiVisualBugsPlaywrightDebug } from "../../screenshot-collector/debug/PixiVisualBugsPlaywrightDebug";
import { program } from "commander";

/**
 * Set APP_PORT and APP_NAME here
 */ 
const APP_NAME = "ourcade-ecs-dependency-injection"
const APP_PORT = "3000"
const DEMO_URL = `http://localhost:${APP_PORT}/pixi.html`
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
     */
    // await page.locator('canvas').focus();
    // await page.mouse.click(633, 371);
    // await page.locator('canvas').click({
    //     position: {
    //       x: 400,
    //       y: 300
    //     }
    // });
    // await page.locator('canvas').focus();
    // await page.waitForTimeout(1000);
    await page.keyboard.type(" ");
    await page.locator('body').dispatchEvent("keypress", { key: " " })
    await page.locator('canvas').press(" ");
    await page.waitForTimeout(50);
    await page.locator('canvas').press(" ");
    await page.waitForTimeout(50);
    await page.locator('canvas').press(" ");
    await page.waitForTimeout(50);
    await page.waitForTimeout(3000);
    await page.locator('canvas').press(" ");
    await page.keyboard.down("ArrowRight");
    await page.waitForTimeout(50);
    await page.keyboard.up("ArrowRight");
    await page.locator('canvas').press(" ");
    await page.keyboard.down("ArrowLeft");
    await page.waitForTimeout(100);
    await page.keyboard.up("ArrowLeft");
    await page.waitForTimeout(100);
    await page.locator('canvas').press(" ");
    await page.keyboard.down("ArrowRight");
    await page.waitForTimeout(100);
    await page.keyboard.up("ArrowRight");
    await page.waitForTimeout(100);
    await page.locator('canvas').press(" ");
    await page.keyboard.down("ArrowLeft");
    await page.waitForTimeout(150);
    await page.keyboard.up("ArrowLeft");
    await page.waitForTimeout(100);
    await page.locator('canvas').press(" ");
    await page.locator('canvas').press("ArrowRight");
    await page.waitForTimeout(100);

    // Inject client
    await sampler.injectClient();
    await page.waitForTimeout(250);

    // const options = {
    //     strCustomSelectionLogic: `Math.random() < 0.2`,
    // }

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