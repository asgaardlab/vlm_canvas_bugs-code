# Collecting HTML5 Canvas Applications built with PixiJS v6 and v7

This folder contains code for collecting PixiJS (v6, v7) web apps

- `Collecting_Data.ipynb` contains the code for crawling the GitHub Dependency Graph, crawling additional data, and then filtering the data

- The semi-automated version filtering, manual version filtering, and manual stratified sampling was performed in the workbook in the data folder path `Data/1a-Collecting_Canvas_Applications/Manual_Filtering-PixiJS_Dependents.xlsx`


## Structure of this folder

```
.
├── README.md
└── Collecting_Data.ipynb
```

## Data that should be in the `../Data/1a-Collecting_Canvas_Applications` folder (after downloading from Zenodo)

```
Data/1a-Collecting_Canvas_Applications
├── README.md
├── Manual_Filtering-PixiJS_Dependents.xlsx
└── Collecting_PixiJS_Dependents/
    ├── pixijs_dependents.db
    ├── dependents_to_crawl.csv
    ├── pixijs_dependents/
    |       ├── dependents_<pixijs_package_name>.csv
    |       └── ...
    └── extra_wide_version_search/
            ├── matches.csv
            ├── missing_version.csv
            └── has_match.csv
```
