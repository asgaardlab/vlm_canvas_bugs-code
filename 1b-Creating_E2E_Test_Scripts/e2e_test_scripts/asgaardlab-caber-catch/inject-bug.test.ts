import { chromium, firefox } from "playwright-core"
import { PixiVisualBugsPlaywright } from "../../screenshot-collector/PixiVisualBugsPlaywright";
import { PixiVisualBugsPlaywrightDebug } from "../../screenshot-collector/debug/PixiVisualBugsPlaywrightDebug";
import { program } from "commander";

const GAME_URL = "https://asgaardlab.github.io/canvas-visual-bugs-testbed/game/";
// warning: hardcoded path depends on `tsc` output
const SNAPSHOTS_PATH = `${__dirname}/../../../Data/1d-Collecting_Screenshots/__test_screenshots__/__asgaardlab-caber-catch__`;

(async () => {
    // set up args
    program
        .usage('[OPTIONS]...')
        .option('-d, --debug', 'Set if debug mode (Chrome DevTools + SpectorJS).')
        .option('-b, --bug-name <value>', 'Sets which bug to inject.', 'useProgram')
        .parse(process.argv);
    // read args
    const options = program.opts();
    const isDebugMode = options.debug;
    const bugName = options.bugName;
    // set bug flag
    const snapshotName = `bug_${bugName}`;
    await test(snapshotName, bugName, isDebugMode);
})()

async function test(snapshotName:string="test", bugName:string="none", isDebugMode:boolean=false) {
    // start browser
    const browser = await chromium.launch({ headless: false, devtools: isDebugMode });
    // const browser = await chromium.launch({ headless: false, devtools: false });
    // const browser = await firefox.launch({ headless: false, devtools: false });
    // open new page with browser
    const page = await browser.newPage();
    // create exposer for current page
    let visualBugger;
    if (!isDebugMode) {
        visualBugger = new PixiVisualBugsPlaywright(page, SNAPSHOTS_PATH);
    } else {
        visualBugger = new PixiVisualBugsPlaywrightDebug(page, SNAPSHOTS_PATH);
    }
    // open the game website
    await page.goto(GAME_URL);
    // wait for game to load
    const waitTimeLoad = 1 * 1000 // n * 1000 ms = n seconds
    await page.waitForLoadState("load");
    await page.waitForSelector("canvas");
    await page.waitForTimeout(waitTimeLoad);
    // once game has loaded, inject the script
    await visualBugger.injectClient();
    // click the central button to start game
    await page.click("canvas");
    // wait for game to start up
    const waitTimeStartUp = 2 * 1000; // n * 1000 ms = n seconds
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(waitTimeStartUp);
    // take snapshot with bug rendered instantly (single frame)
    await visualBugger.takeSnapshotWithBug(snapshotName, bugName);
    // optionally keep open for debugging purposes
    if (!isDebugMode) {
        await browser.close();
    }
}
