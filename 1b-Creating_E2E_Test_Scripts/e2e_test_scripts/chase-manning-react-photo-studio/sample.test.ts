import { chromium } from "playwright";
import { PixiVisualBugsPlaywright } from "../../screenshot-collector/PixiVisualBugsPlaywright";
import { PixiVisualBugsPlaywrightDebug } from "../../screenshot-collector/debug/PixiVisualBugsPlaywrightDebug";
import { program } from "commander";

const DEMO_URL = "http://localhost:3000"
const SNAPSHOTS_PATH = `${__dirname}/../snapshots/chase-manning-react-photo-studio/`;

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

    await page.waitForSelector("canvas");

    await page.waitForTimeout(250);

    await sampler.injectClient();

    await page.waitForTimeout(250);

    // draw left eye of the smiley face
    await page.mouse.move(x_start_left_eye, y_start_left_eye);
    await page.mouse.down();
    await page.mouse.move(x_end_left_eye, y_end_left_eye);
    await page.mouse.up();

    await page.waitForTimeout(250);

    // draw right eye of the smiley face
    await page.mouse.move(x_start_right_eye, y_start_right_eye);
    await page.mouse.down();
    await page.mouse.move(x_end_right_eye, y_end_right_eye);
    await page.mouse.up();

    await page.waitForTimeout(250);

    // draw smile of the smiley face
    await page.mouse.move(x_start_smile, y_start_smile);
    await page.mouse.down();
    await page.mouse.move(x_mid_smile, y_mid_smile);
    await page.mouse.move(x_end_smile, y_end_smile);
    await page.mouse.up();

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

// TODO change to Point(x,y)
const x_start_left_eye = 250;
const y_start_left_eye = 200;

const x_end_left_eye = x_start_left_eye;
const y_end_left_eye = 400;

const x_start_right_eye = 550;
const y_start_right_eye = y_start_left_eye;

const x_end_right_eye = x_start_right_eye;
const y_end_right_eye = y_end_left_eye;

const x_start_smile = 200;
const y_start_smile = 500;

const x_mid_smile = x_start_left_eye + ((x_start_right_eye - x_start_left_eye) / 2);
const y_mid_smile = 600;

const x_end_smile = 600;
const y_end_smile = y_start_smile;
