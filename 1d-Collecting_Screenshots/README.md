# PixiJS Screenshot Collector

Framework for collecting bug-injected and bug-free screenshots paired with their Canvas Object Representation (COR) from PixiJS apps

## Features

- Collect screenshots from a [PixiJS](https://github.com/pixijs/pixijs) application

	- Each screenshot is paired with its associated Canvas Objects Representation (COR) from the same state

- Supports automated test scripts written with [Playwright](https://playwright.dev/) in [TypeScript](https://www.typescriptlang.org/)

- Inject bugs into apps while collecting snapshots by overriding the default PixiJS shader for WebGL with a bug-injected shader while rendering frames


## Building

To build the app, first open a new terminal at the root directory (`vlm_canvas_bugs-code`). Then, run:

```bash
npm run build
```

Then you should have a `dist` folder, which will contain the built package that is ready to be used (including end-to-end tests defined in `1b-Creating_E2E_Test_Scripts/e2e_test_scripts`).


## Usage

Collect snapshots by instrumenting automated end-to-end (e2e) test scripts

### Collecting snapshots

- Instrument your test code to capture snapshots, which are pairs of (Screenshot, Canvas Object Represenation)

- Sampling API requires reference to Playwright browser `Page` instance

- Sampling API requires call to inject into the `Page` instance before samples can be collected

- The client-side code of PixiSnapshotCollector requires that either `PIXI` or `__PIXI_APP__` be available in the global scope of the browser in which the client code executes

	- `PIXI` would be from something like `import * as PIXI from "pixi.js"` and made available through `window.PIXI = PIXI;`

	- `__PIXI_APP__` could be set like `window.__PIXI_APP__ = app;` assuming that `app = new PIXI.Application`

__Importing:__

```ts 
// replace with actual path to the PixiVisualBugsPlaywright.js file in the "dist/screenshot-collector" folder (after building)
import { PixiVisualBugsPlaywright } from '../../dist/screenshot-collector/PixiVisualBugsPlaywright'
```

__Instantiating:__

```ts
/** @param {playwright.Page} page: Playwright browser page where PixiJS app is running */
const pathToSaveSnapshots = 'test/screenshots';
const pixiVisualBugsPlaywright = new PixiVisualBugsPlaywright(page, pathToSaveSnapshots);
```

__Injecting:__

```ts
await pixiVisualBugsPlaywright.injectClient();
```

__Sampling:__

```ts
/**
 * Without a bug
 */
const nameOfSnapshot = "my_snapshot";
await pixiVisualBugsPlaywright.takeSnapshot(nameOfSnapshot);
```

```ts
/**
 * With a bug
 * Pick from "state", "layout", "rendering", "appearance"
 */
const nameOfSnapshotWithBug = "my_snapshot_with_bug";
const nameOfBugType = "state";
const options = {
    numFramesUntilFreeze:                         undefined, // Number of frames to render with the bug injected before freezing the renderer
    htmlElementCanvas:                            undefined, // Playwright handle to canvas element
    strCustomSelectionLogic:                      undefined, // JavaScript boolean statement for selecting objects
    strObjectVariableNameForCustomSelectionLogic: undefined, // Name of object variable in custom selection logic
    boolForceRenderPassBeforeSnapshot:            undefined, // Whether to force a render pass while taking a snapshot with bug
    strCustomForceRenderCall:                     undefined  // Custom JavaScript code to call in browser context to force a render pass
}; 

await pixiVisualBugsPlaywright.takeSnapshotWithBug(nameOfSnapshotWithBug, nameOfBugType, options);
```

## Examples

See [`../1b-Creating_E2E_Test_Scripts/e2e_test_scripts/`](../1b-Creating_E2E_Test_Scripts/e2e_test_scripts/) directory for a set of example test scripts (across multiple PixiJS apps) containing snapshot calls.

### To run an example:

1. First follow the instructions in the `$NAME_OF_APP/README.md` file to set up and run the PixiJS application

2. Once running the app, open a new terminal tab/window, navigate to the root directory (`vlm_canvas_bugs-code`), and run `npm run build`

3. Next, in the same terminal tab/window, enter the command `npm run test:sample:$TYPE_OF_SAMPLE:$NAME_OF_APP` from the root directory of this repository.
	- `$TYPE_OF_SAMPLE` could be:
		- `clean`: Normal snapshot without any bugs
		- `bug-state`: State bug
		- `bug-layout`: Layout bug
		- `bug-rendering`: Rendering bug
		- `bug-appearance`: Appearance bug

4. Then, to parse the snapshot into a clean, consistent format, enter the command `npm run test:parse:$TYPE_OF_SAMPLE:$NAME_OF_APP`

Or, collect all samples for an app using `npm run test:sample_all:$NAME_OF_APP`

And parse all samples for an app using `npm run test:parse_all:$NAME_OF_APP`

A couple quick examples:

#### Collect a single snapshot for an app

`npm run test:sample:bug-rendering:prefecthq-graphs`

#### Parse a single snapshot for an app

`npm run test:parse:bug-rendering:prefecthq-graphs`

#### Collect all snapshots for an app

`npm run test:sample_all:prefecthq-graphs`

#### Parse all snapshots for an app

`npm run test:parse_all:prefecthq-graphs`


### Testing snapshot collection

Test the snapshot collection by collecting snapshots for `asgaardlab-caber-catch` (toy game for testing)

> `npm run test:self:sampling` 
>
> `npm-run-all --serial "test:self:bug_injecting:*"`
>
> `npm-run-all --serial "test:self:parsing:*"`


## TODO

- [ ] Add simple performance counter utilizing window.performance.memory (log with #objects in scene graph)?
