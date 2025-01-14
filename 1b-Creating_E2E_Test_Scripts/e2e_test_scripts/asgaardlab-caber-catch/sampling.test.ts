import { chromium, firefox } from "playwright-core"
import { PixiVisualBugsPlaywright } from "../../screenshot-collector/PixiVisualBugsPlaywright";

const GAME_URL = "https://asgaardlab.github.io/canvas-visual-bugs-testbed/game/";
// warning: hardcoded path depends on `tsc` output
const SNAPSHOTS_PATH = `${__dirname}/../../../Data/1d-Collecting_Screenshots/__test_screenshots__/__asgaardlab-caber-catch__`;

(async () => {
    await test("clean");
})()

async function test(snapshot_name:string = "test") {
    // start browser
    const browser = await chromium.launch({ headless: false });
    // open new page with browser
    const page = await browser.newPage();
    // create exposer for current page
    // @ts-ignore This works after transpiling to JS
    const sampler = new PixiVisualBugsPlaywright(page, SNAPSHOTS_PATH);
    // open the game website
    await page.goto(GAME_URL);
    // wait for game to load
    await page.waitForLoadState("load");
    await page.waitForSelector("canvas");
    await page.waitForTimeout(1000); // 1 second
    // once game has loaded, inject the script
    await sampler.injectClient();
    // click the central button to start game
    await page.click("canvas");
    // wait for game to start up
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000); // 1 second
    // take snapshot
    await sampler.takeSnapshot(snapshot_name);
    // end the test
    await browser.close();
}
