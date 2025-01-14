import { chromium } from "playwright";
import { PixiVisualBugsPlaywright } from "../../screenshot-collector/PixiVisualBugsPlaywright";
import { PixiVisualBugsPlaywrightDebug } from "../../screenshot-collector/debug/PixiVisualBugsPlaywrightDebug";
import { program } from "commander";

/**
 * Set APP_PORT and APP_NAME here
 */ 
const APP_NAME = "starwards-starwards"
const APP_PORT = "80"
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
    await page.getByRole('button', { name: 'SOLO GAME' }).click();
    await page.waitForLoadState("load");
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'Game Master' }).click();
    await page.waitForLoadState("load");
    await page.waitForTimeout(1000);

    // Wait for canvas to load on page
    await page.waitForSelector("canvas");
    await page.waitForTimeout(250);

    const canvas = await page.locator('div').filter({ hasText: /^GM Radarzoom_inzoom_outtypeALLOBJECTSWAYPOINTS$/ }).locator('canvas')

    /**
     * Additional code to interact with canvas:
     */
    await make_a_map(page, canvas);
    await page.waitForTimeout(250);

    // Inject client
    await sampler.injectClient();
    await page.waitForTimeout(250);


    const options = {
        strCustomSelectionLogic: `o.constructor.name === "Sprite"`,
        numFramesUntilFreeze: 1,
        boolForceRenderPassBeforeSnapshot: true,
        htmlElementCanvas: canvas,
        strCustomForceRenderCall: `__PIXI_APP__.renderer.render(__PIXI_APP__.stage);`
    };

    // await page.pause();

    // Take snapshot
    await sampler.takeSnapshotWithBug(snapshot_name, bug_name, options);    
    await page.waitForTimeout(250);

    // await page.pause();

    // reset the game for next time
    await page.goto(DEMO_URL);
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'STOP GAME' }).click();
    await page.waitForTimeout(250);

    // End the test
    if (!isDebugMode) {
        await browser.close();
    } else {
        await page.pause();
    }
}

async function make_a_map(page:any, canvas:any) {
      await page.getByRole('listitem', { name: 'create' }).locator('span').click();
      await page.locator('div').filter({ hasText: /^radiusCreate Asteroid$/ }).getByRole('button').click();
      await canvas.click({
        position: {
          x: 677,
          y: 141
        }
      });
      await page.waitForTimeout(100);
      await canvas.click({
        position: {
          x: 307,
          y: 485
        }
      });
      await page.waitForTimeout(100);
      await canvas.click({
        position: {
          x: 397,
          y: 390
        }
      });
      await page.waitForTimeout(100);
      await page.locator('div').filter({ hasText: /^factionNONEGravitasRaidersshipModeldragonfly-SF22isPlayerShipCreate Ship$/ }).getByRole('button').click();
      await canvas.click({
        position: {
          x: 306,
          y: 64
        }
      });
      await page.waitForTimeout(100);
      await canvas.click({
        position: {
          x: 717,
          y: 91
        }
      });
      await page.waitForTimeout(100);
      await page.getByText('damageFactorCreate Explosion').click();
      await canvas.click({
        position: {
          x: 594,
          y: 406
        }
      });
      await page.waitForTimeout(100);
      await canvas.click({
        position: {
          x: 149,
          y: 167
        }
      });
      await page.waitForTimeout(100);
      await page.getByRole('button', { name: 'Create Waypoint' }).nth(1).click();
      await canvas.click({
        position: {
          x: 792,
          y: 406
        }
      });
      await page.waitForTimeout(100);
      await canvas.click({
        position: {
          x: 745,
          y: 38
        }
      });
      await page.waitForTimeout(100);
      await canvas.click({
        position: {
          x: 252,
          y: 558
        }
      });
      await page.waitForTimeout(100);
}