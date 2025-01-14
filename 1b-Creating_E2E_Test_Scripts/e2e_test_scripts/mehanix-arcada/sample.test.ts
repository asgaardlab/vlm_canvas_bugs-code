import { chromium } from "playwright";
import { PixiVisualBugsPlaywright } from "../../screenshot-collector/PixiVisualBugsPlaywright";
import { PixiVisualBugsPlaywrightDebug } from "../../screenshot-collector/debug/PixiVisualBugsPlaywrightDebug";
import { program } from "commander";

/**
 * Set APP_PORT and APP_NAME here
 */ 
const APP_NAME = "mehanix-arcada"
const APP_PORT = "3000"
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

    // Inject client
    await sampler.injectClient();
    await page.waitForTimeout(250);

    /**
     * Additional code to interact with canvas:
     */
    await makeFloorPlan(page);

    // Take snapshot (overwrite)
    await sampler.takeSnapshotWithBug(snapshot_name, bug_name);    
    await page.waitForTimeout(250);

    // await page.pause();

    // End the test
    if (!isDebugMode) {
        await browser.close();
    } else {
        await page.pause();
    }
}

async function makeFloorPlan(page: any) {
    const canvas = await page.locator('canvas');

    await page.waitForTimeout(100);
    await page.getByRole('button', { name: 'New plan' }).click();
    await page.waitForTimeout(100);
    await page.getByRole('navigation').hover();
    await page.waitForTimeout(100);
    await page.locator('.mantine-UnstyledButton-root').first().hover();
    await page.waitForTimeout(100);
    await page.getByRole('menuitem', { name: 'Add furniture' }).click();
    await page.waitForTimeout(100);
    await page.getByRole('img', { name: 'Double bed' }).click();
    await page.waitForTimeout(100);
    // await page.getByRole('menuitem', { name: 'Add furniture' }).click();
    // await page.waitForTimeout(100);
    await page.getByRole('img', { name: 'Bedside table 1' }).click();
    await page.waitForTimeout(100);
    // await page.getByRole('menuitem', { name: 'Add furniture' }).click();
    // await page.waitForTimeout(100);
    await page.getByRole('img', { name: 'Large plant' }).click();
    await page.waitForTimeout(100);

    await page.getByRole('button').click();

    await page.getByRole('navigation').hover();
    await page.waitForTimeout(100);
    await page.locator('.mantine-UnstyledButton-root').first().hover();
    await page.waitForTimeout(100);
    await page.getByRole('menuitem', { name: 'Draw wall' }).click();
    await page.waitForTimeout(2500);
    await canvas.click({
        position: {
          x: 514,
          y: 156
        }
    });
    await page.waitForTimeout(100);
    await canvas.click({
        position: {
          x: 1043,
          y: 158
        }
    });
    await page.waitForTimeout(100);
    await canvas.click({
        position: {
          x: 1040,
          y: 657
        }
    });
    await page.waitForTimeout(100);
    await canvas.click({
        position: {
          x: 497,
          y: 657
        }
    });
    await page.waitForTimeout(100);
    await canvas.click({
        position: {
          x: 506,
          y: 163
        }
    });
    await page.waitForTimeout(100);// 

    await page.getByRole('navigation').hover();
    await page.waitForTimeout(100);
    await page.locator('.mantine-UnstyledButton-root').first().hover();
    await page.waitForTimeout(50);
    await page.getByRole('menuitem', { name: 'Add door' }).click();    
    await page.waitForTimeout(2500);
    await canvas.click({
        position: {
          x: 503,
          y: 525
        }
    });
    await page.waitForTimeout(100);
    // await page.locator('.mantine-UnstyledButton-root').first().click();
    // await page.waitForTimeout(100);



    await page.waitForTimeout(100);// 
    await page.getByRole('navigation').hover();
    await page.waitForTimeout(100);
    await page.locator('.mantine-UnstyledButton-root').first().hover();
    

    await page.locator('div:nth-child(3) > .mantine-UnstyledButton-root').first().click();

    //bed
    await page.mouse.click(230, 257);
    await page.mouse.move(230, 257);
    await page.waitForTimeout(100);
    await page.mouse.down();
    await page.waitForTimeout(100);
    await page.mouse.move(650, 300);
    await page.waitForTimeout(100);
    await page.mouse.up();
    await page.waitForTimeout(100);
    await page.mouse.click(650, 300);

    await page.waitForTimeout(100);

    // plant
    await page.mouse.click(202, 202);
    await page.mouse.move(202, 202);
    await page.waitForTimeout(100);
    await page.mouse.down();
    await page.waitForTimeout(100);
    await page.mouse.move(850, 600);
    await page.waitForTimeout(100);
    await page.mouse.up();
    await page.waitForTimeout(100);
    await page.mouse.click(850, 600);

    // table
    // await page.pause();
    await page.waitForTimeout(100);

    await page.mouse.click(191, 176);
    await page.mouse.click(191, 176);
    await page.mouse.move(191, 176);
    await page.waitForTimeout(100);
    await page.mouse.down();
    await page.waitForTimeout(100);
    await page.mouse.move(850, 250);
    await page.waitForTimeout(100);
    await page.mouse.up();
    await page.waitForTimeout(100);
    // await page.mouse.click(850, 300);

    await page.waitForTimeout(500);
}