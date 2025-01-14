import { chromium } from "playwright";
import { PixiVisualBugsPlaywright } from "../../screenshot-collector/PixiVisualBugsPlaywright";
import { PixiVisualBugsPlaywrightDebug } from "../../screenshot-collector/debug/PixiVisualBugsPlaywrightDebug";
import { program } from "commander";

/**
 * Set APP_PORT and APP_NAME here
 */ 
const APP_NAME = "VoiceSpaceUnder5-VoiceSpace"
const APP_PORT = "3000"
const DEMO_URL = `https://localhost:${APP_PORT}`
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
    const browser = await chromium.launch({ headless: false, args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
    const context = await browser.newContext();
    await context.grantPermissions(['microphone']);
    // Open new page with browser
    const page = await browser.newPage({ ignoreHTTPSErrors: true });

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
    await page.getByRole('button', { name: '새로운 음성 미팅 시작하기' }).click();
    await page.getByRole('button', { name: 'right-circle' }).click();
    await page.getByRole('button', { name: 'right-circle' }).click();
    await page.getByRole('button', { name: '입장하기' }).click();

    // Wait for canvas to load on page
    await page.waitForSelector("canvas");
    await page.waitForTimeout(250);

    /**
     * Additional code to interact with canvas:
     */
    await page.keyboard.down("D");
    await page.waitForTimeout(2000);
    await page.keyboard.up("D");
    await page.keyboard.down("S");

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