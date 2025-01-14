import { chromium } from "playwright";
import { PixiVisualBugsPlaywright } from "../../screenshot-collector/PixiVisualBugsPlaywright";
import { PixiVisualBugsPlaywrightDebug } from "../../screenshot-collector/debug/PixiVisualBugsPlaywrightDebug";
import { program } from "commander";

/**
 * Set APP_PORT and APP_NAME here
 */ 
const APP_NAME = "MichaelMakesGames-reflector"
const APP_PORT = "1234"
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
    await page.getByRole('button', { name: 'New Game' }).click();
    await page.getByRole('button', { name: 'Begin' }).click();

    // Wait for canvas to load on page
    await page.waitForSelector("canvas");
    await page.waitForTimeout(250);

    // Inject client
    await sampler.injectClient();
    await page.waitForTimeout(250);

    /**
     * Additional code to interact with canvas:
     */
    await page.getByRole('button', { name: 'Start Game' }).click();
    await page.locator('div').filter({ hasText: /^1 \/ 10$/ }).getByRole('button').nth(2).click();
    await moveAround(page);
    await page.waitForTimeout(250);


    const options = {
        strCustomSelectionLogic: `Math.random() < 0.2`,
    };

    // Take snapshot
    await sampler.takeSnapshotWithBug(snapshot_name, bug_name, options);    
    await page.waitForTimeout(250);

    // End the test
    if (!isDebugMode) {
        await browser.close();
    } else {
        await page.pause();
    }
}

async function moveAround(page: any){
    await page.locator('canvas').click({
    position: {
      x: 644,
      y: 505
    }
    });
    await page.locator('canvas').click({
    position: {
      x: 646,
      y: 451
    }
    });
    await page.locator('body').press('ArrowRight');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowDown');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowDown');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowRight');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowRight');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowRight');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowUp');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowRight');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowRight');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowUp');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowRight');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowRight');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowRight');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowUp');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowRight');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowUp');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowUp');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowLeft');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowLeft');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowUp');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowRight');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowRight');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowRight');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowUp');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowRight');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowRight');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowLeft');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowUp');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowUp');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowLeft');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowDown');
    await page.waitForTimeout(100);
    await page.locator('body').press('ArrowUp');
    await page.waitForTimeout(100);
    await page.getByRole('button', { name: 'f Activate' }).click();
    await page.waitForTimeout(100);
}
