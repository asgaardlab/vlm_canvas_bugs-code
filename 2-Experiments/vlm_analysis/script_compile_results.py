import base64
import pandas as pd
from . import PromptStrategy, ModelAPI
from .utilities import load_results, make_path_to_results_dir_for_model_with_strategy


def main():

	list_model_apis = list(ModelAPI)
	list_prompt_strategies = list(PromptStrategy)
	list_results_dataframes = list()

	for model_api in list_model_apis:

		for prompt_strategy in list_prompt_strategies:

			df_results_model_with_strategy = compile_results_for_model_with_strategy(model_api, prompt_strategy)
			list_results_dataframes.append(df_results_model_with_strategy)

	df_results = pd.concat(list_results_dataframes)
	df_results.to_csv("../Data/2-Experiments/results/compiled.csv")


def compile_results_for_model_with_strategy(model_api, prompt_strategy):

	list_records = []

	path_to_results_for_model_with_strategy = make_path_to_results_dir_for_model_with_strategy(model_api, prompt_strategy)

	for path_to_results_for_app in path_to_results_for_model_with_strategy.glob("*"):

		if not path_to_results_for_app.is_dir():
			print(f"WARNING: Found a path that is not directory where only app folders should reside: \"{path_to_results_for_app}\"")
			continue

		app_name = path_to_results_for_app.name
		path_to_results_for_model_with_strategy_for_app = path_to_results_for_model_with_strategy / app_name

		for path_to_results_for_app_sample in path_to_results_for_model_with_strategy_for_app.glob("*.txt"):

			if not path_to_results_for_app_sample.is_file():
				print(f"WARNING: Skipping invalid path (does not point to a file): \"{path_to_results_for_app_sample}\"")
				continue

			sample_name = path_to_results_for_app_sample.stem
			bool_ground_truth = False if sample_name == "clean" else True

			string_results_text, dict_results_json = load_results(model_api, prompt_strategy, app_name, sample_name)

			try:
				encoded_results_text = base64.b64encode(string_results_text.encode('utf-8'))

			except Exception:
				print(f"WARNING: Failed to encode response text with base64: \"{string_results_text}\"")
				encoded_results_text = None

			record = {}
			record["TextModelAPI"] = model_api.value
			record["TextPromptStrategy"] = prompt_strategy.value
			record["TextAppName"] = app_name
			record["TextSampleName"] = sample_name
			record["BoolGroundTruth"] = bool_ground_truth
			record["BoolDidDetectVisualBug"] = dict_results_json.get("bool_did_detect_visual_bug")
			record["TextDescriptionOfVisualBug"] = dict_results_json.get("string_description_of_visual_bug")
			record["EncodedBase64Response"] = encoded_results_text

			list_records.append(record)

	df_results = pd.DataFrame.from_records(list_records)

	return df_results


if __name__ == "__main__":

	main()
