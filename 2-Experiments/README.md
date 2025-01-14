# vlm_analysis

## Structure of this folder

```
.
├── README.md
├── vlm_analysis
└── run_vlm_analysis.sh
```

## Data that should be in the `../Data/2-Experiments` folder (after downloading from Zenodo)

```
Data/2-Experiments
├── RESULTS_RUN_0
├── RESULTS_RUN_1
├── RESULTS_RUN_2
├── RESULTS_RUN_3
├── RESULTS_RUN_4
├── ablated_readmes
├── ABLATION_RESULTS_RUN_1
├── ABLATION_RESULTS_RUN_2
├── ABLATION_RESULTS_RUN_3
└── ABLATION_RESULTS_RUN_4
```

## Usage

### Collecting snapshots

See [`../1d-Collecting_Screenshots/README.md`](../1d-Collecting_Screenshots/README.md) for info on screenshot collection.

### Running visual analysis

Running visual analysis (the experiments in our paper) costs money and is charged by OpenAI to the account associated with the OpenAI API key used.
Running all prompting strategies in our code over all 100 screenshots (8x100) cost less than $4.50 United States Dollars (USD).

1. First, ensure you have collected screenshot(s) from a `<canvas>` application

2. Then, open a terminal at the root directory (`vlm_canvas_bugs-code/`)

3. Then, if using the poetry installation, activate the venv with `poetry shell` (or prepend `poetry run` to all `python3` commands)

	- Otherwise:
		- Activate your virtual environment as required (probably `source ./venv/bin/activate`) 
		- (or don't activate one if you installed dependencies into your system Python)

4. Next, move into the `2-Experiments` directory by running:

	`cd 2-Experiments`

5. Finally, you can run either:

A. Analyse an individual screenshot with a specific prompting strategy. For example:
```bash
poetry shell
python3 -m vlm_analysis <name_of_model_api> <name_of_prompt_strategy> <name_of_application> <name_of_snapshot>
```

B. (Only if you used poetry to setup the venv) Use the `run_vlm_analysis.sh` bash script to run `vlm_analysis` with a specific prompting strategy on all screenshots. Supply the prompting strategy as a command line argument ([see Table in Section "Mapping from variable names used here to ones in the paper" of this README](#Mapping-from-variable-names-used-here-to-ones-in-the-paper)). For example:

```bash
# make sure to make the script executable if you have not already
chmod +x run_vlm_analysis.sh
# run analysis with prompting strategy "NoContext" (originally named "v0_baseline") for all screenshots
./run_vlm_analysis.sh v0
```

> [!NOTE]
> To compile results from `vlm_analysis` into a single DataFrame/CSV, you can use the `script_compile_results` Python script.
> First, ensure your terminal is in the `./2-Experiments` directory.
> Then, run `poetry run python3 -m vlm_analysis.script_compile_results`

### Arguments

#### `<name_of_snapshot>`

Included in this replication package are:

- `clean` (bug-free screenshot)
- `bug_state` (*State* bug-injected screenshot)
- `bug_layout` (*Layout* bug-injected screenshot)
- `bug_rendering` (*Rendering* bug-injected screenshot)
- `bug_appearance` (*Appearance* bug-injected screenshot)

#### `<name_of_application>`

To see the full list of applications, check the repositories that are available at the path set in the VLM_CANVAS_BUGS_EXTERNAL_REPOS_PATH environment variable (within the `.env` file).

If you ran the `setup_external_repos.py` script, you will have the following applications available:
- "Aidymouse-Hexfriend",
- "aldy-san-zero-neko",
- "chase-manning-react-photo-studio",
- "coderetreat-coderetreat.org",
- "dimforge-rapier.js",
- "equinor-esv-intersection",
- "getkey-ble",
- "ha-shine-wasm-tetris",
- "higlass-higlass",
- "mehanix-arcada",
- "MichaelMakesGames-reflector",
- "ourcade-ecs-dependency-injection",
- "p5aholic-playground",
- "PrefectHQ-graphs",
- "solaris-games-solaris",
- "starwards-starwards",
- "tulustul-ants-sandbox",
- "uia4w-uia-wafermap",
- "VoiceSpaceUnder5-VoiceSpace",
- "Zikoat-infinite-minesweeper"

#### `<name_of_model_api>`

For this implementation, the only valid `<name_of_model_api>` is `"openai:gpt-4o-2024-08-06"`.

#### `<name_of_prompt_strategy>`

Pick from:
- `"v0_baseline"`
- `"v1_describe_task"`
- `"v2_describe_task_and_provide_readme"`
- `"v2a_baseline_and_provide_readme"`
- `"v3_describe_task_and_provide_readme_plus_verified_sample"`
- `"v3a_describe_task_and_provide_readme_plus_mock_verified_sample"`
- `"v4_describe_task_and_provide_readme_plus_assets"`
- `"v5_describe_task_and_provide_readme_plus_mock_verified_sample_plus_assets"`
- `"vX2a1_ablation_study_readme_has_the_good_part"`
- `"vX2a2_ablation_study_readme_has_the_bad_part"`

##### Mapping from variable names used here to ones in the paper:

| Prompting strategy name in paper | Bash script argument      	| Variable name in code                                                | Enumerable name in code                      |
|-----------------------------------|-----------------------	|----------------------------------------------------------------------|---------------------------------------------|
| *NoContext*                       | `v0`	| "v0_baseline"                                                          | BASELINE                                    |
| (not used in paper)               | `v1`	| "v1_describe_task"                                                     | DESCRIBE_TASK                               |
| *README+BugDescriptions*          | `v2`	| "v2_describe_task_and_provide_readme"                                  | DESCRIBE_TASK_AND_PROVIDE_README            |
| *README*                          | `v2a`	| "v2a_baseline_and_provide_readme"                                      | BASELINE_AND_PROVIDE_README                 |
| (not used in paper)               | `v3`	| "v3_describe_task_and_provide_readme_plus_verified_sample"             | DESCRIBE_TASK_AND_PROVIDE_VERIFIED_SAMPLE   |
| *AllContextExceptAssets*          | `v3a`	| "v3a_describe_task_and_provide_readme_plus_mock_verified_sample"       | DESCRIBE_TASK_AND_PROVIDE_MOCK_VERIFIED_SAMPLE |
| (not used in paper)               | `v4`	| "v4_describe_task_and_provide_readme_plus_assets"                      | DESCRIBE_TASK_AND_PROVIDE_ASSETS            |
| *AllContext*                      | `v5`	| "v5_describe_task_and_provide_readme_plus_mock_verified_sample_plus_assets" | DESCRIBE_TASK_AND_PROVIDE_COMBINED_CONTEXT  |
| *README(Good)* (for ablation study)   | `vX2a1`	| "vX2a1_ablation_study_readme_has_the_good_part" 				| ABLATION_STUDY_README_HAS_THE_GOOD_PART  |
| *README(Bad)*  (for ablation study)  	| `vX2a2`	| "vX2a2_ablation_study_readme_has_the_bad_part" 				| ABLATION_STUDY_README_HAS_THE_BAD_PART  |


#### Examples

The following examples are run assuming you collected snapshots for the app `ourcade-ecs-dependency-injection`; a simple Breakthrough/Brick Breaker clone.

Remember to first:
- Activate the virtual environment with `poetry shell` (or prepend `poetry run` to the `python3` commands)
- Navigate to the `./2-Experiments` directory (e.g., by running `cd 2-Experiments`) before running these commands

##### Clean (no bugs injected)
`python3 -m vlm_analysis "openai:gpt-4o-2024-08-06" "v0_baseline" "ourcade-ecs-dependency-injection" "clean"`


##### State bug injected
`python3 -m vlm_analysis "openai:gpt-4o-2024-08-06" "v0_baseline" "ourcade-ecs-dependency-injection" "bug_state"`


##### Layout bug injected
`python3 -m vlm_analysis "openai:gpt-4o-2024-08-06" "v0_baseline" "ourcade-ecs-dependency-injection" "bug_layout"`


##### Rendering bug injected
`python3 -m vlm_analysis "openai:gpt-4o-2024-08-06" "v0_baseline" "ourcade-ecs-dependency-injection" "bug_rendering"`


##### Appearance bug injected
`python3 -m vlm_analysis "openai:gpt-4o-2024-08-06" "v0_baseline" "ourcade-ecs-dependency-injection" "bug_appearance"`


## Testing

To test the code for `vlm_analysis`, we can first collect and parse snapshots for the toy game `asgaardlab-caber-catch` using npm scripts named like `test:self:sampling` and `test:self:bug_injecting:*`.

Then, we can run the `vlm_analysis` module on these screenshots and manually inspect the results.

`python3 -m vlm_analysis "openai:gpt-4o-2024-08-06" "v0_baseline" "../__test_screenshots__/__asgaardlab-caber-catch__" "clean"`

`python3 -m vlm_analysis "openai:gpt-4o-2024-08-06" "v0_baseline" "../__test_screenshots__/__asgaardlab-caber-catch__" "bug_layout"`

`python3 -m vlm_analysis "openai:gpt-4o-2024-08-06" "v0_baseline" "../__test_screenshots__/__asgaardlab-caber-catch__" "bug_state"`

`python3 -m vlm_analysis "openai:gpt-4o-2024-08-06" "v0_baseline" "../__test_screenshots__/__asgaardlab-caber-catch__" "bug_rendering"`

`python3 -m vlm_analysis "openai:gpt-4o-2024-08-06" "v0_baseline" "../__test_screenshots__/__asgaardlab-caber-catch__" "bug_appearance"`
