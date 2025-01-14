import { chromium } from "playwright";
import { PixiVisualBugsPlaywright } from "../../screenshot-collector/PixiVisualBugsPlaywright";
import { PixiVisualBugsPlaywrightDebug } from "../../screenshot-collector/debug/PixiVisualBugsPlaywrightDebug";
import { program } from "commander";

/**
 * Set APP_PORT and APP_NAME here
 */ 
const APP_NAME = "equinor-esv-intersection"
const APP_PORT = "6006"
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
    // await page.waitForSelector("canvas");
    await page.waitForTimeout(250);

    /**
     * Additional code to interact with canvas:
     */
    await page.getByRole('button', { name: 'Hide addons [A]' }).click();
    await page.waitForTimeout(250);

    // Inject client
    await sampler.injectClient();
    await page.waitForTimeout(250);

    // force a render pass to grab references
    // await page.frameLocator('iframe[title="storybook-preview-iframe"]').getByRole('button', { name: 'Geo model', exact: true }).click();
    // await page.waitForTimeout(250);
    // await page.frameLocator('iframe[title="storybook-preview-iframe"]').getByRole('button', { name: 'Geo model', exact: true }).click();
    // await page.waitForTimeout(1000);
    await page.mouse.move(400, 300);
    await page.waitForTimeout(100);
    await page.mouse.wheel(0, 10);
    await page.waitForTimeout(100);
    await page.mouse.wheel(0, -10);
    await page.waitForTimeout(250);
    // await page.pause();

    const options = {
        strCustomSelectionLogic: `o.constructor.name === "_Graphics2"`,
        boolForceRenderPassBeforeSnapshot: true,
        strCustomForceRenderCall: `__PIXI_APP__.renderer.render(__PIXI_APP__.stage);`
    }

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