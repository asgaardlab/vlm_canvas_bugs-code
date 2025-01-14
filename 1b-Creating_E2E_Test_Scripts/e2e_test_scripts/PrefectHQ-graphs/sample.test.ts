import { chromium } from "playwright";
import { PixiVisualBugsPlaywright } from "../../screenshot-collector/PixiVisualBugsPlaywright";
import { PixiVisualBugsPlaywrightDebug } from "../../screenshot-collector/debug/PixiVisualBugsPlaywrightDebug";
import { program } from "commander";

const DEMO_URL = "http://localhost:5173"
const SNAPSHOTS_PATH = `${__dirname}/../../../Data/1d-Collecting_Screenshots/screenshots/PrefectHQ-graphs/`;

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
    // Create exposer for current page
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

    await page.getByRole('button', { name: 'components' }).click();
    await page.waitForTimeout(250);

    await page.getByRole('link', { name: 'RunGraph' }).click();
    await page.waitForTimeout(250);

    await page.getByRole('button', { name: 'small', exact: true }).click();
    await page.waitForTimeout(250);

    await page.waitForSelector("canvas");
    await page.waitForTimeout(250);

    // Inject the PixiSamplerPlaywright script into the page
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
