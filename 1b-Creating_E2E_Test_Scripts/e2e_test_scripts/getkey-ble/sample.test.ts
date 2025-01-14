import { chromium } from "playwright";
import { PixiVisualBugsPlaywright } from "../../screenshot-collector/PixiVisualBugsPlaywright";
import { PixiVisualBugsPlaywrightDebug } from "../../screenshot-collector/debug/PixiVisualBugsPlaywrightDebug";
import { program } from "commander";

/**
 * Set APP_PORT and APP_NAME here
 */ 
const APP_NAME = "getkey-ble"
const APP_PORT = "8080"
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
    await editLevel(page);

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

async function editLevel(page: any) {
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 474,
          y: 256
        }
    });
    await page.waitForTimeout(100);
    await page.getByRole('button', { name: 'Delete entity' }).click();
    await page.waitForTimeout(100);
    await page.getByTitle('addBlock').click();
    await page.waitForTimeout(100);
    await page.getByLabel('Fire polygon', {exact: true}).click();
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 469,
          y: 126
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 544,
          y: 108
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 587,
          y: 262
        }
    });
    await page.waitForTimeout(100);
    await page.getByTitle('addBlock').click();
    await page.waitForTimeout(100);
    await page.getByText('Bouncy polygon').click();
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 743,
          y: 138
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 875,
          y: 138
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 859,
          y: 263
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 935,
          y: 502
        }
    });
    await page.waitForTimeout(100);
    await page.getByTitle('addBlock').click();
    await page.waitForTimeout(100);
    await page.getByText('Fire circle').click();
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 681,
          y: 105
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 649,
          y: 379
        }
    });
    await page.waitForTimeout(100);

    await page.waitForTimeout(100);
    await page.getByTitle('addBlock').click();
    await page.waitForTimeout(100);
    await page.getByText('Paint').click();
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 355,
          y: 224
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 444,
          y: 289
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 460,
          y: 187
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 400,
          y: 153
        }
    });

    await page.waitForTimeout(100);
    await page.getByTitle('addBlock').click();
    await page.waitForTimeout(100);
    await page.getByText('Ice circle').click();
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 508,
          y: 430
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 256,
          y: 174
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 370,
          y: 113
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 1149,
          y: 352
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 1004,
          y: 107
        }
    });
    await page.waitForTimeout(100);
}