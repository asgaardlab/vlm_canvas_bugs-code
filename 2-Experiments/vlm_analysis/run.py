# from pdb import set_trace  # https://web.stanford.edu/class/physics91si/2013/handouts/Pdb_Commands.pdf
from . import PromptStrategy, ModelAPI
from .utilities import (
	load_prompts,
	load_encoded_image,
	make_list_of_message_dicts_with_images,
	get_response,
	get_structured_answer,
	save_results,
	verify_response_to_clean_sample_is_correct,
	load_hardcoded_response,
	load_bugfree_baseline_image,
	verify_app_has_assets_available,
	load_assets,
	make_list_of_message_dicts_with_images_and_assets,
)


def run(
	model_api: ModelAPI,
	prompt_strategy: PromptStrategy,
	string_name_of_app: str,
	string_name_of_snapshot: str
) -> tuple[str, dict]:

	# Generate messages
	# Prompting strategy "NoContext" in the paper
	if prompt_strategy == PromptStrategy.BASELINE:
		list_of_message_dicts = make_list_of_messages_v0_baseline(string_name_of_app, string_name_of_snapshot)

	# Not used in the paper
	elif prompt_strategy == PromptStrategy.DESCRIBE_TASK:
		list_of_message_dicts = make_list_of_messages_v1_describe_task(string_name_of_app, string_name_of_snapshot)

	# Prompting strategy "README+BugDescriptions" in the paper
	elif prompt_strategy == PromptStrategy.DESCRIBE_TASK_AND_PROVIDE_README:
		list_of_message_dicts = make_list_of_messages_v2_describe_task_and_provide_readme(string_name_of_app, string_name_of_snapshot)

	# Prompting strategy "README" in the paper
	elif prompt_strategy == PromptStrategy.BASELINE_AND_PROVIDE_README:
		list_of_message_dicts = make_list_of_messages_v2a_baseline_and_provide_readme(string_name_of_app, string_name_of_snapshot)

	# Not used in the paper
	elif prompt_strategy == PromptStrategy.DESCRIBE_TASK_AND_PROVIDE_VERIFIED_SAMPLE:

		model_api_used_for_hardcoded_response = ModelAPI.OPENAI_GPT4O_2024_08_06
		prompt_strategy_used_for_hardcoded_response = PromptStrategy.DESCRIBE_TASK_AND_PROVIDE_README

		if not verify_response_to_clean_sample_is_correct(model_api, prompt_strategy_used_for_hardcoded_response, string_name_of_app):
			print(f"ERROR: Failed to perform experiment using strategy {prompt_strategy.value} on app {string_name_of_app}: Do not have verified (correct) response to bug-free screenshot.")
			return "", dict()

		list_of_message_dicts = make_list_of_messages_v3_describe_task_and_provide_verified_sample(
			string_name_of_app,
			string_name_of_snapshot,
			model_api_used_for_hardcoded_response,
			prompt_strategy_used_for_hardcoded_response,
		)
		# set_trace()

	# Prompting strategy "AllContextExceptAssets" in the paper
	elif prompt_strategy == PromptStrategy.DESCRIBE_TASK_AND_PROVIDE_MOCK_VERIFIED_SAMPLE:
		list_of_message_dicts = make_list_of_messages_v3a_describe_task_and_provide_mock_verified_sample(
			string_name_of_app,
			string_name_of_snapshot
		)

	# Not used in the paper
	elif prompt_strategy == PromptStrategy.DESCRIBE_TASK_AND_PROVIDE_ASSETS:

		if not verify_app_has_assets_available(string_name_of_app):
			print(f"ERROR: Failed to perform experiment using strategy {prompt_strategy.value} on app {string_name_of_app}: Do not have assets available.")
			return "", dict()

		list_of_message_dicts = make_list_of_messages_v4_describe_task_and_provide_readme_plus_assets(
			string_name_of_app,
			string_name_of_snapshot
		)

	# Prompting strategy "AllContext" in the paper
	elif prompt_strategy == PromptStrategy.DESCRIBE_TASK_AND_PROVIDE_COMBINED_CONTEXT:

		if not verify_app_has_assets_available(string_name_of_app):
			print(f"ERROR: Failed to perform experiment using strategy {prompt_strategy.value} on app {string_name_of_app}: Do not have assets available.")
			return "", dict()

		list_of_message_dicts = make_list_of_messages_v5_describe_task_and_provide_readme_plus_mock_verified_sample_plus_assets(
			string_name_of_app,
			string_name_of_snapshot
		)

	elif prompt_strategy == PromptStrategy.ABLATION_STUDY_README_HAS_THE_GOOD_PART:
		list_of_message_dicts = make_list_of_messages_for_ablation_experiment(
			string_name_of_app,
			string_name_of_snapshot,
			bool_ablated_readme_has_the_good_part=True
		)

	elif prompt_strategy == PromptStrategy.ABLATION_STUDY_README_HAS_THE_BAD_PART:
		list_of_message_dicts = make_list_of_messages_for_ablation_experiment(
			string_name_of_app,
			string_name_of_snapshot,
			bool_ablated_readme_has_the_good_part=False
		)

	else:
		_possible_selections = [p.value for p in PromptStrategy]
		raise ValueError(f"Invalid prompt_strategy_selected. Valid strategies to select from: {_possible_selections}")

	# Call the Model API with list of messages
	string_response_content: str = get_response(model_api, list_of_message_dicts)  # type: ignore
	# Call the Model API to extract structured output for results
	json_response_results: dict = get_structured_answer(model_api, string_response_content)
	# Save to filesystem (json_response_results -> .json, string_response_content -> .txt)
	save_results(
		model_api,
		prompt_strategy,
		string_name_of_app,
		string_name_of_snapshot,
		string_response_content,
		json_response_results
	)
	# Return results in case further processing is desired
	return string_response_content, json_response_results


# Prompting strategy "NoContext" in the paper
def make_list_of_messages_v0_baseline(string_name_of_app, string_name_of_snapshot):
	"""Run the experiment with the following approach: V0 - Simple prompt"""

	string_prompt_user = load_prompts(
		PromptStrategy.BASELINE
	)

	base64_screenshot = load_encoded_image(
		string_name_of_app,
		string_name_of_snapshot
	)

	list_of_tuples_of_prompts_and_base64_images = [
		("user", string_prompt_user, base64_screenshot)
	]

	return make_list_of_message_dicts_with_images(list_of_tuples_of_prompts_and_base64_images)


# Not used in the paper
def make_list_of_messages_v1_describe_task(string_name_of_app, string_name_of_snapshot):
	"""Run the experiment with the following approach: V1 - Describe the task"""

	string_prompt_user = load_prompts(
		PromptStrategy.DESCRIBE_TASK,
	)

	base64_screenshot = load_encoded_image(
		string_name_of_app,
		string_name_of_snapshot
	)

	list_of_tuples_of_prompts_and_base64_images = [
		("user", string_prompt_user, base64_screenshot)
	]

	return make_list_of_message_dicts_with_images(list_of_tuples_of_prompts_and_base64_images)


# Prompting strategy "README+BugDescriptions" in the paper
def make_list_of_messages_v2_describe_task_and_provide_readme(string_name_of_app, string_name_of_snapshot):
	"""Run the experiment with the following approach: V2 - Describe the task and provide readme"""

	string_prompt_user = load_prompts(
		PromptStrategy.DESCRIBE_TASK_AND_PROVIDE_README,
		string_name_of_app_for_description=string_name_of_app
	)

	base64_screenshot = load_encoded_image(
		string_name_of_app,
		string_name_of_snapshot
	)

	list_of_tuples_of_prompts_and_base64_images = [
		("user", string_prompt_user, base64_screenshot)
	]

	return make_list_of_message_dicts_with_images(list_of_tuples_of_prompts_and_base64_images)


# Prompting strategy "README" in the paper
def make_list_of_messages_v2a_baseline_and_provide_readme(string_name_of_app, string_name_of_snapshot):
	"""Run the experiment with the following approach: V2a - Simple prompt and provide readme"""

	string_prompt_user = load_prompts(
		PromptStrategy.BASELINE_AND_PROVIDE_README,
		string_name_of_app_for_description=string_name_of_app
	)

	base64_screenshot = load_encoded_image(
		string_name_of_app,
		string_name_of_snapshot
	)

	list_of_tuples_of_prompts_and_base64_images = [
		("user", string_prompt_user, base64_screenshot)
	]

	return make_list_of_message_dicts_with_images(list_of_tuples_of_prompts_and_base64_images)


# Not used in the paper
def make_list_of_messages_v3_describe_task_and_provide_verified_sample(
	string_name_of_app: str,
	string_name_of_snapshot: str,
	model_api_used_for_hardcoded_response: ModelAPI,
	prompt_strategy_used_for_hardcoded_response: PromptStrategy
):
	"""Run the experiment with the following approach: V3 - Describe the task and provide a baseline"""

	string_prompt_user_follow_up = "Here is another screenshot from the same application. Is there is a visual bug in this screenshot?"

	string_prompt_user = load_prompts(
		PromptStrategy.DESCRIBE_TASK_AND_PROVIDE_VERIFIED_SAMPLE,
		string_name_of_app_for_description=string_name_of_app,
	)

	string_hardcoded_response_baseline = load_hardcoded_response(
		string_name_of_app,
		model_api_used_for_hardcoded_response,
		prompt_strategy_used_for_hardcoded_response,
		"clean"
	)

	base64_screenshot = load_encoded_image(string_name_of_app, string_name_of_snapshot)
	base64_screenshot_baseline = load_bugfree_baseline_image(string_name_of_app)

	list_of_tuples_of_prompts_and_base64_images = [
		("user", string_prompt_user, base64_screenshot_baseline),
		("assistant", string_hardcoded_response_baseline, None),
		("user", string_prompt_user_follow_up, base64_screenshot)
	]

	return make_list_of_message_dicts_with_images(list_of_tuples_of_prompts_and_base64_images)


# Prompting strategy "AllContextExceptAssets" in the paper
def make_list_of_messages_v3a_describe_task_and_provide_mock_verified_sample(string_name_of_app: str, string_name_of_snapshot: str):

	string_hardcoded_response_baseline = "This screenshot is free of any visual bugs as defined in the provided set of categories."
	string_prompt_user_follow_up = "Here is another screenshot from the same application. Is there is a visual bug in this screenshot?"

	string_prompt_user = load_prompts(
		PromptStrategy.DESCRIBE_TASK_AND_PROVIDE_VERIFIED_SAMPLE,
		string_name_of_app_for_description=string_name_of_app,
	)

	base64_screenshot = load_encoded_image(string_name_of_app, string_name_of_snapshot)
	base64_screenshot_baseline = load_bugfree_baseline_image(string_name_of_app)

	list_of_tuples_of_prompts_and_base64_images = [
		("user", string_prompt_user, base64_screenshot_baseline),
		("assistant", string_hardcoded_response_baseline, None),
		("user", string_prompt_user_follow_up, base64_screenshot)
	]

	return make_list_of_message_dicts_with_images(list_of_tuples_of_prompts_and_base64_images)


# Not used in the paper
def make_list_of_messages_v4_describe_task_and_provide_readme_plus_assets(string_name_of_app, string_name_of_snapshot):
	"""Run the experiment with the following approach: V2 - Describe the task and provide readme"""

	string_prompt_user = load_prompts(
		PromptStrategy.DESCRIBE_TASK_AND_PROVIDE_README,
		string_name_of_app_for_description=string_name_of_app
	)
	list_of_encoded_assets = load_assets(string_name_of_app)

	base64_screenshot = load_encoded_image(
		string_name_of_app,
		string_name_of_snapshot
	)

	list_of_tuples_of_prompts_and_base64_images = [
		("user", string_prompt_user, base64_screenshot)
	]

	return make_list_of_message_dicts_with_images_and_assets(list_of_tuples_of_prompts_and_base64_images, list_of_encoded_assets)


# Prompting strategy "AllContext" in the paper
def make_list_of_messages_v5_describe_task_and_provide_readme_plus_mock_verified_sample_plus_assets(string_name_of_app: str, string_name_of_snapshot: str):

	string_hardcoded_response_baseline = "This screenshot is free of any visual bugs as defined in the provided set of categories."
	string_prompt_user_follow_up = "Here is another screenshot from the same application. Is there is a visual bug in this screenshot?"

	string_prompt_user = load_prompts(
		PromptStrategy.DESCRIBE_TASK_AND_PROVIDE_VERIFIED_SAMPLE,
		string_name_of_app_for_description=string_name_of_app,
	)
	list_of_encoded_assets = load_assets(string_name_of_app)

	base64_screenshot = load_encoded_image(string_name_of_app, string_name_of_snapshot)
	base64_screenshot_baseline = load_bugfree_baseline_image(string_name_of_app)

	list_of_tuples_of_prompts_and_base64_images = [
		("user", string_prompt_user, base64_screenshot_baseline),
		("assistant", string_hardcoded_response_baseline, None),
		("user", string_prompt_user_follow_up, base64_screenshot)
	]

	return make_list_of_message_dicts_with_images_and_assets(list_of_tuples_of_prompts_and_base64_images, list_of_encoded_assets)


# Ablation study of prompting strategy "README" in the paper
def make_list_of_messages_for_ablation_experiment(
	string_name_of_app: str,
	string_name_of_snapshot: str,
	bool_ablated_readme_has_the_good_part: bool = True
):
	"""Run the ablation experiment with the following approach: V2a - Simple prompt and provide readme"""

	APPS_INCLUDED_IN_ABLATION_STUDY = [
		"chase-manning-react-photo-studio",
		"ha-shine-wasm-tetris",
		"higlass-higlass",
		"p5aholic-playground",
		"starwards-starwards",
		"VoiceSpaceUnder5-VoiceSpace"
	]

	if string_name_of_app not in APPS_INCLUDED_IN_ABLATION_STUDY:
		print(f"ERROR: Failed to perform ablation experiment on app {string_name_of_app}: App not included in ablation study.")
		exit(1)

	string_prompt_user = load_prompts(
		PromptStrategy.BASELINE_AND_PROVIDE_README,
		string_name_of_app_for_ablated_description=string_name_of_app,
		bool_ablated_readme_has_the_good_part=bool_ablated_readme_has_the_good_part
	)

	base64_screenshot = load_encoded_image(
		string_name_of_app,
		string_name_of_snapshot
	)

	list_of_tuples_of_prompts_and_base64_images = [
		("user", string_prompt_user, base64_screenshot)
	]

	return make_list_of_message_dicts_with_images(list_of_tuples_of_prompts_and_base64_images)
