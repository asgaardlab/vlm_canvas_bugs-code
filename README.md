# Replication package for the paper "Exploring the Capabilities of VLMs to Detect Visual Bugs in HTML5 `<canvas>` Applications" 
> "Exploring the Capabilities of VLMs to Detect Visual Bugs in HTML5 `<canvas>` Applications" 
>
> by Finlay Macklon and Cor-Paul Bezemer

- Paper pre-print: `...`
- Data on Zenodo: [bit.ly/vlm_canvas_bugs-data](https://bit.ly/vlm_canvas_bugs-data)
- Repositories containing `<canvas>` applications: [vlm_canvas_bugs-external_repos](https://github.com/vlm_canvas_bugs-external_repos?tab=repositories) GitHub account

## How to use this replication package

### 1. Prerequisites

- Python3 (v3.10+) and the Python package-management system (`pip`)
- Poetry
- NodeJS (v20) and Node Package Manager (`npm`)
    - multiple versions required for running the 20 `<canvas>` applications, use node version manager (`nvm`)
- Node Version Manager
- SQLite

#### Python3 (^3.10) and Python package-management system (`pip`)

Download and install the latest version of Python from [this link](https://www.python.org/downloads/).

After installing Python, ensure Python's package manager (`pip`) is installed by running the command:

`python3 -m pip install --upgrade pip`

#### Poetry

Project dependencies are managed using Poetry, which creates a virtual environment to isolate dependencies from system Python.

Visit the following link to find instructions on installing Poetry: https://python-poetry.org/docs/#installing-with-the-official-installer

#### Node Version Manager (`nvm`)
Using the instructions found at [this link](https://github.com/nvm-sh/nvm) install Node Version Manager (nvm)

#### NodeJS and Node Package Manager (`npm`)
Use nvm to install NodeJS, which should come bundled with Node Package Manager (npm)

#### SQLite

Install SQLite: https://www.sqlite.org/download.html

### 2. Cloning this repository

First, navigate in your terminal to the parent folder you want this repository to reside.

Then, run:
```bash
git clone https://github.com/asgaardlab/vlm_canvas_bugs-code
```

### 3. Downloading the data and placing it in the `Data` folder

First, download the data from: [bit.ly/vlm_canvas_bugs-data](https://bit.ly/vlm_canvas_bugs-data)

Then, unzip and copy the downloaded data into the `./Data/` folder of this repository on your machine.

Afterwards, the local copy of the repository should look like:

```
.
├── README.md
├── package.json
├── pyproject.toml
├── ...
├── 1a-Collecting_Canvas_Applications
├── 1b-Creating_E2E_Test_Scripts
├── 1c-Injecting_Visual_Bugs
├── 1d-Collecting_Screenshots
├── 2-Experiments
├── 3-Results
└── Data
    ├── 1a-Collecting_Canvas_Applications
    ├── 1b-Creating_E2E_Test_Scripts
    ├── 1c-Injecting_Visual_Bugs
    ├── 1d-Collecting_Screenshots
    ├── 2-Experiments
    └── 3-Results
```

### 4. Installing dependencies

Before running the following commands, ensure your terminal is located in the root directory of this repository (`vlm_canvas_bugs-code`).

#### NodeJS

Run:

```bash
nvm use 20  # optional: if using Node Version Manager, make sure to set node version in use to v20
npm install
```

#### Python 

##### Installing Python dependencies - Option 1 (Recommended): Poetry

> [!NOTE]
> This installation method enables the use of the scripts in `2-Experiments` like `run_vlm_analysis_v*.sh`

Run:

```bash
poetry install
```

Then, when running any python scripts, use `poetry run python3 ...` instead of just `python3 ...`

**Using the virtual environment generated by Poetry as a kernelspec for Jupyter Notebooks**

After running `poetry install`, which installs Python code dependencies and creates a virtual environment named something like "vlm_canvas_bugs-code-py3.10", configure the virtual environment as a kernelspec for the Jupyter Notebooks. This is required to use the installed dependencies in the Jupyter Notebooks.

1. First, ensure that the virtual environment is not currently active in your terminal (run deactivate to exit the virtual environment and return to regular terminal)

2. To install, run `pip install ipykernel` from your terminal, which installs ipykernel as a dependency for your default Python

3. In your terminal, run `python3 -m ipykernel install --user --name=<name_of_poetry_virtual_env> `to install the kernelspec for Jupyter

4. Now, when selecting a kernel in Jupyter Lab, you should be able to select the `name_of_poetry_virtual_env` as the kernel

    - When selecting in VSCode: `Select Kernel --> Python Environments --> <name_of_poetry_virtual_env>`

##### Installing Python dependencies - Option 2: requirements.txt

> [!WARNING]
> This installation method is not recommended, but is OK if just using the Python code directly (e.g., in the Jupyter notebooks).
> The scripts in `2-Experiments/` like `run_vlm_analysis_v*.sh` would need to be adjusted to work without poetry.

Run:

```bash
pip install -r requirements.txt
```

##### Note: Installing per-jupyter notebook

If you just want to run code in (one of) the jupyter notebooks, each notebook has a cell with `!pip install ...` for installing requirements into the active kernel.

Note that this will not install all the Python dependencies required for this replication package.


### 5. Creating a `.env` file

Begin by copying the `.env.example` and renaming it to `.env`

Then, fill in the variables list like `<your_*_api_key>` to enable running the code with GitHub API and OpenAI API.

Note that running code with OpenAI API costs money and is charged by OpenAI to the billing account associated with your API key.

### 6. Setting up the external repositories for the 20 `<canvas>` applications

Run the Python script named `setup_external_repos.py` to clone the required repositories for the 20 HTML5 `<canvas>` applications. (You must set up the `.env` file first as described in previous step). By default, the repositories will be cloned into a folder called `vlm_canvas_bugs-external_repos` in the same parent folder as this repository.

Make sure to clone these repositories into a location outside of this repository, to help, e.g., avoid issues that can be caused by the application's `package.json` being in a subdirectory of this repository's `package.json`.

From the `vlm_canvas_bugs-code` folder:

```bash
poetry run python3 setup_external_repos.py
```

(or if not using poetry, run `python3 setup_external_repos.py` within your virtual environment)

Alternatively, you can clone them one-by-one from the  [vlm_canvas_bugs-external_repos](https://github.com/vlm_canvas_bugs-external_repos?tab=repositories) GitHub account. If not using the provided Python script, make sure the destination parent folder of the repositories matches the relative path set for the `VLM_CANVAS_BUGS_EXTERNAL_REPOS_PATH` environment variable in `.env`. 

### 7. Running the code

Run the code at any step to either:
    (a) Collect new data, and/or
    (b) Re-run the analysis and experiments with the existing data

#### Collecting new screenshots

To collect new screenshots (at step `1d-Collecting-Screenshots`), either:
- Write new E2E test scripts for existing apps (`1b-Creating_E2E_Test_Scripts`)
- Instrument new `<canvas>` applications (built with PixiJS) and write E2E test script(s) for new apps (`1b-Creating_E2E_Test_Scripts`)
- Write new shaders (`1c-Injecting_Visual_Bugs`)

When creating new E2E test scripts, ensure to update the `package.json` to include the test scripts as npm scripts (called using NodeJS).

Run the npm scripts from the root directory (`vlm_canvas_bugs-code`).

See [1d-Collecting_Screenshots/README.md](1d-Collecting_Screenshots/README.md) for more details, including how to run the npm scripts.

#### Running the experiments

To run the experiments, you must have your terminal in the `2-Experiments` directory before running the bash scripts or Python module.

Running visual analysis (the experiments in our paper) costs money and is charged by OpenAI to the account associated with the OpenAI API key used.
Running all prompting strategies in our code over all 100 screenshots (8x100) cost less than $4.50 United States Dollars (USD).

See [2-Experiments/README.md](2-Experiments/README.md) for more details.

##### Mapping from variable names used here to ones in the paper:

| Prompting strategy name in paper | Bash script name      	| Variable name in code                                                | Enumerable name in code                      |
|-----------------------------------|-----------------------	|----------------------------------------------------------------------|---------------------------------------------|
| *NoContext*                       | run_vlm_analysis_v0.sh	| "v0_baseline"                                                          | BASELINE                                    |
| (not used in paper)               | run_vlm_analysis_v1.sh	| "v1_describe_task"                                                     | DESCRIBE_TASK                               |
| *README+BugDescriptions*          | run_vlm_analysis_v2.sh	| "v2_describe_task_and_provide_readme"                                  | DESCRIBE_TASK_AND_PROVIDE_README            |
| *README*                          | run_vlm_analysis_v2a.sh	| "v2a_baseline_and_provide_readme"                                      | BASELINE_AND_PROVIDE_README                 |
| (not used in paper)               | run_vlm_analysis_v3.sh	| "v3_describe_task_and_provide_readme_plus_verified_sample"             | DESCRIBE_TASK_AND_PROVIDE_VERIFIED_SAMPLE   |
| *AllContextExceptAssets*          | run_vlm_analysis_v3a.sh	| "v3a_describe_task_and_provide_readme_plus_mock_verified_sample"       | DESCRIBE_TASK_AND_PROVIDE_MOCK_VERIFIED_SAMPLE |
| (not used in paper)               | run_vlm_analysis_v4.sh	| "v4_describe_task_and_provide_readme_plus_assets"                      | DESCRIBE_TASK_AND_PROVIDE_ASSETS            |
| *AllContext*                      | run_vlm_analysis_v5.sh	| "v5_describe_task_and_provide_readme_plus_mock_verified_sample_plus_assets" | DESCRIBE_TASK_AND_PROVIDE_COMBINED_CONTEXT  |


## Code structure of this repository

```
.
├── README.md
├── 1a-Collecting_Canvas_Applications
├── 1b-Creating_E2E_Test_Scripts
├── 1c-Injecting_Visual_Bugs
├── 1d-Collecting_Screenshots
├── 2-Experiments
├── 3-Results
└── Data
```

### `1a-Collecting_Canvas_Applications`

See [1a-Collecting_Canvas_Applications/README.md](1a-Collecting_Canvas_Applications/README.md) for more details.

### `1b-Creating_E2E_Test_Scripts`

See [1b-Creating_E2E_Test_Scripts/README.md](1b-Creating_E2E_Test_Scripts/README.md) for more details.

### `1c-Injecting_Visual_Bugs`

See [1c-Injecting_Visual_Bugs/README.md](1c-Injecting_Visual_Bugs/README.md) for more details.

### `1d-Collecting_Screenshots`

See [1d-Collecting_Screenshots/README.md](1d-Collecting_Screenshots/README.md) for more details.

### `2-Experiments`

See [2-Experiments/README.md](2-Experiments/README.md) for more details.

### `3-Results`

See [3-Results/README.md](3-Results/README.md) for more details.

### `Data`

This folder will contain the data downloaded from Zenodo after it is copied there by the user.

Data folder structure:
```
.
└── Data
    ├── 1a-Collecting_Canvas_Applications
    ├── 1b-Creating_E2E_Test_Scripts
    ├── 1c-Injecting_Visual_Bugs
    ├── 1d-Collecting_Screenshots
    ├── 2-Experiments
    └── 3-Results
```
