# Injecting Visual Bugs into HTML5 `<canvas>` Applications

This folder contains code for injecting visual bugs into PixiJS (v6, v7) web apps

## Structure of this folder

```
.
├── README.md
├── investigation
    └── ...
└── shaders
    └── ...
```

## Data that should be in the `../Data/1c-Injecting_Visual_Bugs` folder (after downloading from Zenodo)

```
Data/1a-Collecting_Canvas_Applications
├── README.md
└── understanding_pixi
    ├── callGraph.json
    ├── files.txt
    ├── pixijs_webgl_paths.json
    ├── webgl_usages_in_pixijs.json
    └── webgl_usages_in_pixijs.csv
```

## `shaders` Folder

This folder contains the default PixiJS shader (`default.js`) and each of the bug-injected shaders:
- `bug_state.js`
- `bug_rendering.js`
- `bug_layout.js`
- `bug_appearance.js`

The `shaders` folder also contains a README file explaining how I injected the visual bugs into the shaders.
There are also one or two suggestions for how to inject new *Appearance* visual bugs.

## `investigation` Folder

This folder contains code used to better understand how PixiJS operates, particularly with respect to WebGL.
This investigation assisted in finding out how to inject visual bugs (using WebGL shaders).
