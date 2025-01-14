#!/usr/bin/env bash

#
# Usage:
#   ./run_vlm_analysis.sh v0
#   ./run_vlm_analysis.sh v1
#   ./run_vlm_analysis.sh v2
#   ./run_vlm_analysis.sh v2a
#   ./run_vlm_analysis.sh v3
#   ./run_vlm_analysis.sh v3a
#   ./run_vlm_analysis.sh v4
#   ./run_vlm_analysis.sh v5
#   ./run_vlm_analysis.sh vX2a1
#   ./run_vlm_analysis.sh vX2a2
#

MODEL_API="openai:gpt-4o-2024-08-06"

# to be extra safe, filter out these app names from the analysis
# (shouldn't be in ../Data/1d-Collecting_Screenshots/screenshots anyways)
APP_NAMES_FILTER_REMOVE_EXTRANEOUS=(
    "__asgaardlab-caber-catch__"
    "_codegen"
)
APP_NAMES_FILTER_KEEP_ABLATION=(
    "chase-manning-react-photo-studio"
    "ha-shine-wasm-tetris"
    "higlass-higlass"
    "p5aholic-playground"
    "starwards-starwards"
    "VoiceSpaceUnder5-VoiceSpace"
)
SNAPSHOT_NAMES=(
    "clean"
    "bug_layout"
    "bug_state"
    "bug_rendering"
    "bug_appearance"
)

# Map short strategy name (e.g., 'v0', 'v1') to the full string
case "$1" in

    "v0")
        prompt_strategy="v0_baseline"
        ;;

    "v1")
        prompt_strategy="v1_describe_task"
        ;;

    "v2")
        prompt_strategy="v2_describe_task_and_provide_readme"
        ;;

    "v2a")
        prompt_strategy="v2a_baseline_and_provide_readme"
        ;;

    "v3")
        prompt_strategy="v3_describe_task_and_provide_readme_plus_verified_sample"
        ;;

    "v3a")
        prompt_strategy="v3a_describe_task_and_provide_readme_plus_mock_verified_sample"
        ;;

    "v4")
        prompt_strategy="v4_describe_task_and_provide_readme_plus_assets"
        ;;

    "v5")
        prompt_strategy ="v5_describe_task_and_provide_readme_plus_mock_verified_sample_plus_assets"
        ;;

    "vX2a1")
        prompt_strategy="vX2a1_ablation_study_readme_has_the_good_part"
        ;;

    "vX2a2")
        prompt_strategy="vX2a2_ablation_study_readme_has_the_bad_part"
        ;;

    *)
        echo "Error: Unknown argument '$1'."
        echo "Please use one of: v0, v1, v2, v2a, v3, v3a, v4, v5, vX2a1, vX2a2."
        exit 1
        ;;
esac


bool_poetry_is_installed=false

# 1. Check if "poetry" command is available
if command -v poetry &> /dev/null; then

    bool_poetry_is_installed=true
    echo "Poetry is installed. Installing dependencies with Poetry..."
    poetry install

else

    echo "Poetry is not installed. Falling back to venv..."

    # 2. Create a virtual environment (if not already created)
    if [ ! -d ".venv" ]; then
        python3 -m venv .venv
    fi

    # 3. Activate the virtual environment
    #    Note: Depending on your shell, you might need a slightly different command, e.g.:
    #          source .venv/bin/activate.fish  (for fish shell)
    source .venv/bin/activate

    # 4. Install dependencies using pip + requirements file
    #    Make sure you have a requirements.txt (or similar) in the current directory.
    pip install --upgrade pip
    pip install -r ../requirements.txt
fi

# Now run the analysis for each subfolder in ../Data/1d-Collecting_Screenshots/screenshots
for path_to_app_snapshots in ../Data/1d-Collecting_Screenshots/screenshots/*; do

    app_name=$(basename "$path_to_app_snapshots")

    # Skip if app_name matches filtering rules
    if [[ " ${APP_NAMES_FILTER_REMOVE_EXTRANEOUS[@]} " =~ " ${app_name} " ]]; then
        echo "Skipping '$app_name' because it is in the list of extraneous apps (not part of the study)."
        continue
    fi

    # If the prompting strategy is an ablation study, skip if app_name is not in the list of apps to keep
    if [[ "$prompt_strategy" == "vX2a1_ablation_study_readme_has_the_good_part" ]] && [[ ! " ${APP_NAMES_FILTER_KEEP_ABLATION[@]} " =~ " ${app_name} " ]]; then
        echo "Skipping '$app_name' because it is not in the list of apps to keep for the ablation study."
        continue
    fi

    if [[ "$prompt_strategy" == "vX2a2_ablation_study_readme_has_the_bad_part" ]] && [[ ! " ${APP_NAMES_FILTER_KEEP_ABLATION[@]} " =~ " ${app_name} " ]]; then
        echo "Skipping '$app_name' because it is not in the list of apps to keep for the ablation study."
        continue
    fi

    echo "Running VLM analysis for '$app_name'"
    echo -e "Prompt Strategy: '$prompt_strategy', Model: '$MODEL_API'\n"

    for snapshot_name in "${SNAPSHOT_NAMES[@]}"; do

        echo "Running analysis for snapshot '$snapshot_name'"

        if [ "$bool_poetry_is_installed" = true ]; then
            poetry run python3 -m vlm_analysis "$MODEL_API" "$prompt_strategy" "$app_name" "$snapshot_name"
        else
            python3 -m vlm_analysis "$MODEL_API" "$prompt_strategy" "$app_name" "$snapshot_name"
        fi

        echo -e "\nSleeping for 1 second...\n"
        sleep 1
    done

    echo -e "\nSleeping for 9 more seconds...\n"
    sleep 9

done
