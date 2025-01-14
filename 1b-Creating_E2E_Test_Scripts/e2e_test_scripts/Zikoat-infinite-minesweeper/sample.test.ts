import { chromium } from "playwright";
import { PixiVisualBugsPlaywright } from "../../screenshot-collector/PixiVisualBugsPlaywright";
import { PixiVisualBugsPlaywrightDebug } from "../../screenshot-collector/debug/PixiVisualBugsPlaywrightDebug";
import { program } from "commander";

/**
 * Set APP_PORT and APP_NAME here
 */ 
const APP_NAME = "Zikoat-infinite-minesweeper"
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

    const canvas = await page.locator("canvas");

    /**
     * Additional code to interact with canvas:
     */
    await click_everywhere(page);

    // Inject client
    await sampler.injectClient();
    await page.waitForTimeout(250);

    const options = {
        strCustomSelectionLogic: `Math.random() < 0.2`,
        htmlElementCanvas: canvas
    }

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

async function click_everywhere(page: any) {
    await page.locator('canvas').click({
        position: {
          x: 630,
          y: 160
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 458,
          y: 321
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 992,
          y: 580
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 1119,
          y: 228
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 328,
          y: 582
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 299,
          y: 278
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 871,
          y: 204
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 373,
          y: 131
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 820,
          y: 594
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 518,
          y: 219
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 148,
          y: 430
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 205,
          y: 151
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 290,
          y: 247
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 798,
          y: 224
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 955,
          y: 142
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 1220,
          y: 151
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 1212,
          y: 55
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 1140,
          y: 543
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 1140,
          y: 602
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 830,
          y: 620
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 486,
          y: 142
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 752,
          y: 354
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 637,
          y: 244
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 799,
          y: 85
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 992,
          y: 212
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 745,
          y: 31
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 315,
          y: 86
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 179,
          y: 29
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 96,
          y: 275
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 217,
          y: 418
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 159,
          y: 537
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 335,
          y: 315
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 432,
          y: 212
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 426,
          y: 305
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 1108,
          y: 577
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 1192,
          y: 364
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 1219,
          y: 169
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 1094,
          y: 85
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 405,
          y: 91
        }
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').click({
        position: {
          x: 119,
          y: 220
        }
    });
    await page.waitForTimeout(100);
}