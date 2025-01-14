import { chromium } from "playwright";
import { PixiVisualBugsPlaywright } from "../../screenshot-collector/PixiVisualBugsPlaywright";
import { PixiVisualBugsPlaywrightDebug } from "../../screenshot-collector/debug/PixiVisualBugsPlaywrightDebug";
import { program } from "commander";

/**
 * Set APP_PORT and APP_NAME here
 */ 
const APP_NAME = "Aidymouse-Hexfriend"
const APP_PORT = "5173"
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
    await page.waitForSelector("canvas");
    await page.waitForTimeout(250);

    /**
     * Additional code to interact with canvas:
     */
    await do_actions(page);

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

async function do_actions(page: any){
    await page.getByRole('button', { name: 'Plains' }).click();
      await page.locator('canvas').click({
        position: {
          x: 626,
          y: 256
        }
      });
      await page.locator('canvas').click({
        position: {
          x: 595,
          y: 299
        }
      });
      await page.locator('canvas').click({
        position: {
          x: 634,
          y: 311
        }
      });
      await page.locator('canvas').click({
        position: {
          x: 692,
          y: 288
        }
      });
      await page.locator('canvas').click({
        position: {
          x: 680,
          y: 356
        }
      });
      await page.locator('canvas').click({
        position: {
          x: 637,
          y: 359
        }
      });
      await page.locator('canvas').click({
        position: {
          x: 616,
          y: 347
        }
      });
      await page.getByRole('button', { name: 'Forest Hills' }).click();
      await page.locator('canvas').click({
        position: {
          x: 721,
          y: 362
        }
      });
      await page.locator('canvas').click({
        position: {
          x: 721,
          y: 325
        }
      });
      await page.locator('canvas').click({
        position: {
          x: 721,
          y: 274
        }
      });
      await page.locator('canvas').click({
        position: {
          x: 679,
          y: 255
        }
      });
      await page.getByRole('button', { name: 'Pine Tree' }).click();
      await page.locator('canvas').click({
        position: {
          x: 754,
          y: 348
        }
      });
      await page.locator('canvas').click({
        position: {
          x: 754,
          y: 294
        }
      });
      await page.locator('canvas').click({
        position: {
          x: 754,
          y: 263
        }
      });
      await page.locator('canvas').click({
        position: {
          x: 720,
          y: 224
        }
      });
      await page.locator('canvas').click({
        position: {
          x: 673,
          y: 206
        }
      });
      await page.locator('canvas').click({
        position: {
          x: 645,
          y: 218
        }
      });
      await page.locator('canvas').click({
        position: {
          x: 591,
          y: 245
        }
      });
      await page.getByRole('button', { name: 'Ice Mountains' }).click();
      await page.locator('canvas').click({
        position: {
          x: 783,
          y: 277
        }
      });
      await page.locator('canvas').click({
        position: {
          x: 798,
          y: 236
        }
      });
      await page.locator('canvas').click({
        position: {
          x: 760,
          y: 212
        }
      });
      await page.locator('canvas').click({
        position: {
          x: 721,
          y: 187
        }
      });
      await page.locator('canvas').click({
        position: {
          x: 678,
          y: 160
        }
      });
      await page.locator('canvas').click({
        position: {
          x: 643,
          y: 181
        }
      });
      await page.locator('canvas').click({
        position: {
          x: 588,
          y: 213
        }
      });
      await page.locator('#tool-button-icon').click();
      await page.getByRole('button', { name: 'Dungeon' }).click();
      await page.locator('canvas').click({
        position: {
          x: 652,
          y: 305
        }
      });
      await page.getByRole('button', { name: 'Windmill' }).click();
      await page.locator('canvas').click({
        position: {
          x: 655,
          y: 271
        }
      });
      await page.locator('#tool-button-path').click();
      await page.getByRole('button', { name: 'River' }).click();
      await page.locator('canvas').click({
        position: {
          x: 792,
          y: 403
        }
      });
      await page.locator('canvas').click({
        position: {
          x: 444,
          y: 420
        }
      });
      await page.locator('#tool-button-text').click();
      await page.locator('canvas').click({
        position: {
          x: 618,
          y: 476
        }
      });
      await page.locator('textarea').fill('hello!\n');
      await page.locator('canvas').click({
        position: {
          x: 906,
          y: 475
        }
      });
}