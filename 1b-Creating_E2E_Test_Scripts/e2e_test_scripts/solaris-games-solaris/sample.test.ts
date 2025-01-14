import { chromium } from "playwright";
import { PixiVisualBugsPlaywright } from "../../screenshot-collector/PixiVisualBugsPlaywright";
import { PixiVisualBugsPlaywrightDebug } from "../../screenshot-collector/debug/PixiVisualBugsPlaywrightDebug";
import { program } from "commander";

/**
 * Set APP_PORT and APP_NAME here
 */ 
const APP_NAME = "solaris-games-solaris"
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
    let boolIsLoggedIn = false;

    // try to login
    try {
        await page.getByPlaceholder('Email').click();
        await page.getByPlaceholder('Email').fill('fake@email.com');
        await page.getByPlaceholder('Email').press('Tab');
        await page.getByPlaceholder('Password').fill('abc123');
        await page.getByRole('button', { name: 'Login ' }).click();
        boolIsLoggedIn = true;
    } catch (err) {
        console.log("Already logged in? Not registered?")
    }

    if (!boolIsLoggedIn){
        // try to register
        try {
            await page.getByRole('button', { name: 'Register ' }).click();
            await page.locator('input[name="email"]').click();
            await page.locator('input[name="email"]').fill('fake@email.com');
            await page.locator('input[name="email"]').press('Tab');
            await page.locator('input[name="username"]').fill('fake_user');
            await page.locator('input[name="username"]').press('Tab');
            await page.locator('input[name="password"]').fill('abc123');
            await page.locator('input[name="password"]').press('Tab');
            await page.locator('input[name="passwordConfirm"]').fill('abc123');
            await page.getByLabel('Accept Privacy Policy').check();
            await page.getByRole('button', { name: ' Register' }).click();
        } catch (err) {
            console.log("Already logged in?")
        }
    }

    if (!boolIsLoggedIn){
    // try to login again
        try {
            await page.getByPlaceholder('Email').click();
            await page.getByPlaceholder('Email').fill('fake@email.com');
            await page.getByPlaceholder('Email').press('Tab');
            await page.getByPlaceholder('Password').fill('abc123');
            await page.getByRole('button', { name: 'Login ' }).click();
            boolIsLoggedIn = true;
        } catch (err) {
            console.log("Already logged in :)")
        }
    }

    console.log(`Final login status: ${boolIsLoggedIn}`)

    await page.getByText('Tutorial Learn to Play').click();
    await page.getByRole('button', { name: ' Yes' }).click();

    // Wait for canvas to load on page
    await page.waitForSelector("canvas");
    await page.waitForTimeout(250);

    /**
     * Additional code to interact with canvas:
     */
    // ...
    // ...
    // ...
    await page.getByRole('button', { name: '' }).click();
    await page.mouse.move(600, 360);
    await page.mouse.wheel(0, -420);

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