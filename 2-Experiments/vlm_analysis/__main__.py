import argparse
from . import PromptStrategy, ModelAPI  # defined in __init__.py
from .run import run


if __name__ == "__main__":

    parser = argparse.ArgumentParser(
        prog='python3 -m vlm_analysis',
        description='Leverage visual-language models to analyse data collected from a PixiJS application',
        epilog="For more help, visit: https://github.com/asgaardlab/canvas-visual-bugs-testbed"
    )
    parser.add_argument("string_model_api", type=ModelAPI, choices=list(ModelAPI))
    parser.add_argument("string_prompt_strategy", type=PromptStrategy, choices=list(PromptStrategy))
    parser.add_argument("string_name_of_app", type=str)
    parser.add_argument("string_name_of_snapshot", type=str)
    # read the arguments
    args = parser.parse_args()

    model_api = ModelAPI(args.string_model_api)
    prompt_strategy = PromptStrategy(args.string_prompt_strategy)
    string_name_of_app = args.string_name_of_app
    string_name_of_snapshot = args.string_name_of_snapshot

    run(
        model_api,
        prompt_strategy,
        string_name_of_app,
        string_name_of_snapshot
    )
