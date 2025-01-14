# 1b-Creating_E2E_Test_Scripts

## Structure of this folder

```
.
├── README.md
└── e2e_test_scripts
    ├── README.md
    ├── codegen.test.ts
    ├── _example
    |    ├── sample.test.ts
    |    └── README.md
    ├── <repository_owner>-<repository_name>
    |    ├── sample.test.ts
    |    └── README.md
    └── ...
```

## Data that should be in the `../Data/1b-Creating_E2E_Test_Scripts` folder (after downloading from Zenodo)

```
Data/1a-Collecting_Canvas_Applications
└── (empty)
```

(this Data folder does not have any data in it, it is intentionally empty)


## `e2e_test_scripts`

Contains:
- The codegen script (`codegen.test.ts` ) for using Playwright Codegen features
- The template E2E test script (`_example/sample.test.ts`) as the baseline for all E2E test scripts
- Custom end-to-end (E2E) test scripts for collecting screenshots from 20 HTML5 `<canvas>` applications.
- README explaining how to create new E2E test scripts

## Running apps to create/test E2E test scripts

Details on creating E2E test scripts can be found in the `e2e_test_scripts/README.md` file.

To run the apps already included in the paper, see `6. Setting up the external repositories for the 20 <canvas> applications` in the [main README.md file of this repository](../README.md)
