# Test cases

## Directory structure

### Original test cases for toy game
- `asgaardlab-caber-catch/inject-bug.test.ts`
- `asgaardlab-caber-catch/sampling.test.ts`

### Codegen new test cases
- `codegen.test.ts`

### New test cases for apps in dataset
- `<app_name>/sample.test.ts`

## Creating new test cases

1. Copy the `_example` directory, rename to `<app_name>`
2. In `<app_name>/sample.test.ts`, fill in the following lines as follows:
```
-- const APP_NAME = "__none"
-- const APP_PORT = "XXXX"

++ const APP_NAME = "<app_name>"
++ const APP_PORT = "<app_port>"
```
3. In `<app_name>/sample.test.ts`, fill in the *"Additional code to reach part of app with canvas"*
	- Can use `codegen.test.ts` to help generate this code programatically
	- Run `APP_NAME=<app_name> APP_PORT=<app_port> npm run test:codegen`
	- When Playwright pauses, use the record button in the UI to record actions on the page as Playwright code
		- May require adjustments
4. In `<app_name>/sample.test.ts`, fill in the *"Additional code to interact with canvas"*
	- Similar to previous step (step 3)
5. In `<app_name>/README.md` fill in the *Commit SHA* and *Date* to track which exact version of the repository we used
6. In `<app_name>/README.md` fill in the steps to:
	- a) Run the application development server
	- b) Expose PIXI to the global window object

## Debugging test cases

To debug, edit the `package.json` script named *"test:sample:clean"* or *"test:sample:bug"* to include the `--debug` flag
	- TODO make it easier to do this without hardcoding in `package.json`

