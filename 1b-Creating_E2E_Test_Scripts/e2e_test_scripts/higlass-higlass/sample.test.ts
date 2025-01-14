import { chromium } from "playwright";
import { PixiVisualBugsPlaywright } from "../../screenshot-collector/PixiVisualBugsPlaywright";
import { PixiVisualBugsPlaywrightDebug } from "../../screenshot-collector/debug/PixiVisualBugsPlaywrightDebug";
import { program } from "commander";

/**
 * Set APP_PORT and APP_NAME here
 */ 
const APP_NAME = "higlass-higlass"
const APP_PORT = "5173"
const DEMO_URL = `http://localhost:${APP_PORT}/examples.html`
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
    await page.waitForTimeout(1500);

    // Wait for canvas to load on page
    await page.waitForSelector("canvas");
    await page.waitForTimeout(250);

    // const canvas = page.locator("canvas");

    /**
     * Additional code to interact with canvas:
     */
    // ...
    // ...
    await page.waitForTimeout(250);
 
    // await page.locator('div:nth-child(4) > ._draggable-div_cizw2_22 > ._bottom-draggable-handle_cizw2_14 > ._bottom-draggable-handle-grabber_cizw2_28').dragTo(target);
    // await page.locator('div:nth-child(4) > ._draggable-div_cizw2_22 > ._bottom-draggable-handle_cizw2_14 > ._bottom-draggable-handle-grabber_cizw2_28').mouse.move(0, 400);
    // await page.locator('div:nth-child(4) > ._draggable-div_cizw2_22 > ._bottom-draggable-handle_cizw2_14 > ._bottom-draggable-handle-grabber_cizw2_28').mouse.up();
    // await page.waitForTimeout(100);

    // Inject client
    await sampler.injectClient();
    await page.waitForTimeout(250);

    // force render pass
    // await page.evaluate(`__PIXI_APP__.stage.render()`);
    const target = await page.locator('div').filter({ hasText: /^Configure trackAdd seriesClose track$/ }).first();
    // const target = await page.locator('._center-track_fiu64_1');
    // await target.dragTo(target, {
    //   sourcePosition: { x: 300, y: 100 },
    //   targetPosition: { x: 300, y: 200 },
    // })
    await target.hover();
    await page.mouse.wheel(0, -100);

    await page.waitForTimeout(1000);

    await target.hover();
    await page.mouse.wheel(0, -100);

    await page.waitForTimeout(1000);

    const options = {
        boolForceRenderPassBeforeSnapshot: true
    }

    await sampler.takeSnapshotWithBug(snapshot_name, bug_name, options); 
    await page.waitForTimeout(250);

    // End the test
    if (!isDebugMode) {
        await browser.close();
    } else {
        await page.pause();
    }
}