import { chromium } from "playwright";
import { PixiVisualBugsPlaywright } from "../../screenshot-collector/PixiVisualBugsPlaywright";
import { PixiVisualBugsPlaywrightDebug } from "../../screenshot-collector/debug/PixiVisualBugsPlaywrightDebug";
import { program } from "commander";

/**
 * Set APP_PORT and APP_NAME here
 */ 
const APP_NAME = "uia4w-uia-wafermap"
const APP_PORT = "8000"
const DEMO_URL = `http://localhost:${APP_PORT}/test/pages/example1.html`
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
    await page.locator('input').first().uncheck();
    await page.waitForTimeout(250);
    await page.locator('input:nth-child(4)').check();
    await page.waitForTimeout(250);
    await page.locator('input:nth-child(5)').check();
    await page.waitForTimeout(250);
    await page.locator('body').focus();
    await page.waitForTimeout(250);
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(250);

    // Inject client
    await sampler.injectClient();
    await page.waitForTimeout(250);

    // force render
    await page.locator('canvas').focus();
    await page.waitForTimeout(250);
    await page.getByRole('button', { name: 'Zoom In' }).click();
    await page.waitForTimeout(250);
    await page.getByRole('button', { name: 'Zoom Out' }).click();
    await page.waitForTimeout(250);

    const strCustomSelectionLogic = `Math.random() < 0.25`;
    const options = {
        strCustomSelectionLogic: strCustomSelectionLogic,
        boolForceRenderPassBeforeSnapshot: true
    };

    // await sampler.setCustomSelectionLogic(strCustomSelectionLogic);
    // await page.pause();

    // Take snapshot
    await sampler.takeSnapshotWithBug(snapshot_name, bug_name, options);
    // await sampler.takeSnapshotWithBug(snapshot_name, bug_name);
    await page.waitForTimeout(250);

    // End the test
    if (!isDebugMode) {
        await browser.close();
    } else {
        await page.pause();
    }
}