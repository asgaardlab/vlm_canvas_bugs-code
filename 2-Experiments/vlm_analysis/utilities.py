# from pdb import set_trace  # https://web.stanford.edu/class/physics91si/2013/handouts/Pdb_Commands.pdf
from typing import Optional, Union
import os
import base64
import json
from pathlib import Path
from dotenv import load_dotenv
# from PIL import Image
from openai import OpenAI
from . import PromptStrategy, ModelAPI


def load_prompts(
	prompt_strategy: PromptStrategy,
	string_name_of_app_for_description: Optional[str] = None,
	string_name_of_app_for_ablated_description: Optional[str] = None,
	bool_ablated_readme_has_the_good_part: Optional[bool] = None
) -> str:

	path_to_prompts = Path("./vlm_analysis/prompts")
	path_to_prompt_base = path_to_prompts / f"{prompt_strategy.value}.md"

	with open(path_to_prompt_base, "r") as f:
		string_prompt_user = f.read()

	if string_name_of_app_for_description is not None:

		string_prompt_app_description = load_original_application_README(string_name_of_app_for_description)
		string_prompt_user = f"{string_prompt_user}\n{string_prompt_app_description}"
	
	elif string_name_of_app_for_ablated_description is not None:

		string_prompt_app_description = load_ablated_application_README(
			string_name_of_app_for_ablated_description,
			bool_ablated_readme_has_the_good_part
		)
		string_prompt_user = f"{string_prompt_user}\n{string_prompt_app_description}"

	else:
		pass

	return string_prompt_user


def load_original_application_README(string_name_of_app_for_description: str) -> str:
	# Determine the root directory and the path to the .env file
	root_dir = Path.cwd().parent
	dotenv_path = root_dir / ".env"

	if dotenv_path.exists():
		load_dotenv(dotenv_path)

	else:
		print(".env file not found. Please create one before proceeding. See .env.example for an example, and this repository's README file(s) for instructions.")
		exit(1)

	relative_path_to_external_repos = os.getenv("VLM_CANVAS_BUGS_EXTERNAL_REPOS_PATH", None)

	if relative_path_to_external_repos is None:
		str_msg_error = "Environment variable VLM_CANVAS_BUGS_EXTERNAL_REPOS_PATH is not set."
		str_msg_error += "\nCannot find repository README files for applications."
		str_msg_error += "\nPlease create .env file and set VLM_CANVAS_BUGS_EXTERNAL_REPOS_PATH environment variable."
		str_msg_error += "\nPlease set this path (relative to the root of this repository) to the folder where the 20 application repositories are cloned to."
		str_msg_error += "\nSee this repository's main README file for more instructions."
		print(str_msg_error)
		exit(1)

	path_to_app_repo = Path("..") / Path(relative_path_to_external_repos) / string_name_of_app_for_description
	string_prompt_app_description = ""

	for path_to_readme in path_to_app_repo.resolve().rglob("README.md"):

		if "node_modules" in str(path_to_readme):
			continue

		print(f"Reading README for app {string_name_of_app_for_description} from path: \"{path_to_readme}\"")

		with open(path_to_readme, "r", encoding="utf-8", errors="replace") as f:
			string_readme = f.read()
			string_prompt_app_description += f"\n{string_readme}"

	string_prompt_app_description = string_prompt_app_description.strip()

	if len(string_prompt_app_description) <= 0:
		msg = f"ERROR: Missing description of app! {string_name_of_app_for_description}.\nPath to app repo: {path_to_app_repo.resolve()}"
		print(msg)
		exit(1)

	return string_prompt_app_description


def load_ablated_application_README(string_name_of_app_for_ablated_description: str, bool_ablated_readme_has_the_good_part: bool) -> str:

	if bool_ablated_readme_has_the_good_part:
		string_path_part = "informative"
	
	else:
		string_path_part = "distracting"

	path_to_ablated_readme = Path(f"../Data/2-Experiments/ablated_readmes/{string_path_part}/{string_name_of_app_for_ablated_description}/README.md")

	print(f"Reading ablated README for app {string_name_of_app_for_ablated_description} from path: \"{path_to_ablated_readme}\"")
	
	with open(path_to_ablated_readme, "r", encoding="utf-8", errors="replace") as f:
		string_ablated_readme = f.read()

	return string_ablated_readme


def load_hardcoded_response(
	string_name_of_app_for_description: str,
	model_api_used_for_hardcoded_response: ModelAPI,
	prompt_strategy_used_for_hardcoded_response: PromptStrategy,
	string_name_of_snapshot_for_hardcoded_response: str
) -> str:

	path_to_results = make_path_to_results_dir_for_model_with_strategy_on_app(
		model_api_used_for_hardcoded_response,
		prompt_strategy_used_for_hardcoded_response,
		string_name_of_app_for_description
	)
	path_to_hardcoded_response_baseline = path_to_results / "clean.txt"

	print(f"Reading verified response to bug-free snapshot for app {string_name_of_app_for_description} from path: \"{path_to_hardcoded_response_baseline}\"")

	try:
		with open(path_to_hardcoded_response_baseline, "r") as f:
			string_response_hardcoded = f.read()

	except Exception as err:
		print(f"Failed to read verified response at \"{path_to_hardcoded_response_baseline}\"")
		raise err

	return string_response_hardcoded


def load_encoded_image(string_name_of_app: str, string_name_of_snapshot: str) -> str:

	path_to_screenshots = Path("../Data/1d-Collecting_Screenshots/screenshots")
	path_to_image_screenshot = path_to_screenshots / string_name_of_app / f"{string_name_of_snapshot}.png"

	print(f"Path to screenshot={path_to_image_screenshot}")

	# load screenshot as base64 string
	base64_image = load_and_encode_image(path_to_image_screenshot)

	return base64_image


def load_bugfree_baseline_image(string_name_of_app: str) -> str:
	# duplicated hardcoded path!
	path_to_screenshots = Path("../Data/1d-Collecting_Screenshots/screenshots")
	path_to_image_screenshot_baseline = path_to_screenshots / string_name_of_app / "clean.png"
	base64_image_baseline = load_and_encode_image(path_to_image_screenshot_baseline)

	return base64_image_baseline


def load_and_encode_image(path_to_image) -> str:
	with open(path_to_image, "rb") as image_file:
		return base64.b64encode(image_file.read()).decode('utf-8')


def load_assets(string_name_of_app: str) -> list[str]:
	path_to_assets = Path("../Data/1d-Collecting_Screenshots/assets/")
	path_to_assets_for_app = path_to_assets / string_name_of_app

	list_of_encoded_assets = []

	for path_to_image in path_to_assets_for_app.rglob("*.png"):

		try:
			encoded_image = load_and_encode_image(path_to_image)
			list_of_encoded_assets.append(encoded_image)
			print(f"Successfully loaded image asset at: \"{path_to_image}\"")

		except Exception:
			print(f"ERROR: Failed to load image asset at: \"{path_to_image}\"")
			pass

	return list_of_encoded_assets


def make_list_of_message_dicts_with_images(list_of_tuples_of_prompts_and_base64_images: list[tuple[str, str, Union[str, None]]]) -> list[dict]:

	list_of_message_dicts = []

	for string_role, string_prompt, base64_screenshot_canvas in list_of_tuples_of_prompts_and_base64_images:

		content: Union[list[dict], dict] = dict()

		text_content = {
			"type": "text",
			"text": string_prompt
		}

		if base64_screenshot_canvas is not None:
			image_content = {
				"type": "image_url",
				"image_url": {
					"url": f"data:image/jpeg;base64,{base64_screenshot_canvas}"
				}
			}
			content = [
				text_content,
				image_content
			]

		else:
			content = text_content

		message_dict = {
			"role": string_role,
			"content": content
		}

		list_of_message_dicts.append(message_dict)

	return list_of_message_dicts


def make_list_of_message_dicts_with_images_and_assets(
	list_of_tuples_of_prompts_and_base64_images: list[tuple[str, str, Union[str, None]]],
	list_of_encoded_assets: list[str]
) -> list[dict]:

	list_of_message_dicts = make_list_of_message_dicts_with_images(list_of_tuples_of_prompts_and_base64_images)

	# update the list of messages to include oracles in the first user request
	for string_encoded_asset in list_of_encoded_assets:

		content_asset = {
			"type": "image_url",
			"image_url": {
				"url": f"data:image/jpeg;base64,{string_encoded_asset}"
			}
		}

		list_of_message_dicts[0]["content"].append(
			content_asset
		)

	# set_trace()

	return list_of_message_dicts


def make_list_of_message_dicts_text_only(list_of_tuples_of_prompts: list[tuple[str, str]]) -> list[dict]:

	list_of_message_dicts = []

	for string_role, string_prompt in list_of_tuples_of_prompts:

		message_dict = {
			"role": string_role,
			"content": string_prompt
		}

		list_of_message_dicts.append(message_dict)

	return list_of_message_dicts


def get_response(model_api: ModelAPI, list_of_message_dicts: list[dict], **kwargs) -> Union[str, dict[str, Union[bool, str]]]:

	if "openai" in model_api.value:
		return get_response_openai(model_api, list_of_message_dicts, **kwargs)

	print(f"WARNING - Failed to get_response: model_api=${model_api} did not match any known specs! Valid model names: {list(ModelAPI)}")

	return ""


def get_response_openai(model_api: ModelAPI, list_of_message_dicts: list[dict], dict_structured_outputs_response_format: Optional[dict] = None) -> Union[str, dict[str, Union[bool, str]]]:
	# Get response from OpenAI API
	client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

	model_name = model_api.value.split(":")[1]

	response_content: Union[str, dict] = ""

	if dict_structured_outputs_response_format is not None:
		chat_completion = client.beta.chat.completions.parse(
			messages=list_of_message_dicts,
			model=model_name,
			response_format=dict_structured_outputs_response_format
		)
		# print(chat_completion)
		response_content = extract_response_structured_output_openai(chat_completion)
		return response_content

	chat_completion = client.chat.completions.create(
		messages=list_of_message_dicts,
		model=model_name
	)
	response_content = extract_response_text_openai(chat_completion)

	return response_content


def extract_response_text_openai(chat_completion) -> str:
	# parse the message
	try:
		string_response_content = chat_completion.choices[0].message.content

	except Exception as e:
		print("Caught error while grabbing response message content: ", e)
		string_response_content = str(chat_completion)

	# print("Response:\n", string_response_content)

	return string_response_content


def extract_response_structured_output_openai(chat_completion) -> dict:
	# parse the message
	try:
		dict_structured_output = chat_completion.choices[0].message.content

	except Exception as e:
		print("Caught error while grabbing response message content: ", e)
		dict_structured_output = dict()

	# print("Response:\n", dict_structured_output)

	return dict_structured_output


def get_structured_answer(model_api: ModelAPI, string_response_content: str) -> dict[str, Union[bool, str]]:
	"""
	https://openai.com/index/introducing-structured-outputs-in-the-api/
	https://platform.openai.com/docs/guides/structured-outputs/introduction?context=ex4
	"""
	STRING_PROMPT_EXTRACT_ANSWER = "The following message describes what was observed in a screenshot from an HTML5 Canvas application.\n"
	STRING_PROMPT_EXTRACT_ANSWER += "Please fill in the provided JSON schema by determining if the above message"
	STRING_PROMPT_EXTRACT_ANSWER += " indicates whether or not there is a visual bug (`bool_did_detect_visual_bug`),"
	STRING_PROMPT_EXTRACT_ANSWER += " and if so, please provide a summarized description of the detected visual bug"
	STRING_PROMPT_EXTRACT_ANSWER += " (`string_description_of_visual_bug`) based on the following message. If there is no"
	STRING_PROMPT_EXTRACT_ANSWER += " visual bug, please fill the `string_description_of_visual_bug` field with an empty string."
	# STRING_PROMPT_EXTRACT_ANSWER += "\nTo be clear, `bool_did_detect_visual_bug` should be set to `true` if there is a bug described."

	list_of_tuples_of_prompts = [
		("system", STRING_PROMPT_EXTRACT_ANSWER),
		("user", string_response_content),
	]

	list_of_message_dicts = make_list_of_message_dicts_text_only(list_of_tuples_of_prompts)

	dict_response_format = {
		"type": "json_schema",
		"json_schema": {
			"name": "answer_extraction_response",
			"strict": True,
			"schema": {
				"type": "object",
				"properties": {
					"bool_did_detect_visual_bug": {"type": "boolean"},
					"string_description_of_visual_bug": {"type": "string"}
				},
				"required": ["bool_did_detect_visual_bug", "string_description_of_visual_bug"],
				"additionalProperties": False
			}
		}
	}

	dict_structured_output: dict[str, Union[bool, str]] = get_response(
		model_api,
		list_of_message_dicts,
		dict_structured_outputs_response_format=dict_response_format
	)  # type: ignore

	return dict_structured_output


def save_results(model_api: ModelAPI, prompt_strategy: PromptStrategy, string_name_of_app: str, string_name_of_snapshot: str, string_response_content: str, json_response_results: dict):

	path_to_results_out = make_path_to_results_dir_for_model_with_strategy_on_app(model_api, prompt_strategy, string_name_of_app)

	path_results_out_message_content = path_to_results_out / f"{string_name_of_snapshot}.txt"
	path_results_out_json = path_to_results_out / f"{string_name_of_snapshot}.json"

	try:
		with open(path_results_out_message_content, "w") as f:
			f.write(string_response_content)

	except Exception as e:
		# set_trace()
		print("Caught error while writing response content TXT to file: ", e)

	try:
		string_response_results = json.dumps(json_response_results)

		with open(path_results_out_json, "w") as f:
			f.write(string_response_results)

	except Exception as e:
		print("Caught error while writing response results JSON to file: ", e)


def load_results(model_api: ModelAPI, prompt_strategy: PromptStrategy, string_name_of_app: str, string_name_of_snapshot: str):

	path_to_results = make_path_to_results_dir_for_model_with_strategy_on_app(model_api, prompt_strategy, string_name_of_app)

	path_results_text = path_to_results / f"{string_name_of_snapshot}.txt"
	path_results_json = path_to_results / f"{string_name_of_snapshot}.json"

	try:
		with open(path_results_text, "r") as file:
			string_response_content = file.read()

	except Exception as e:
		# set_trace()
		print(f"Caught error while reading results TXT from file \"{path_results_text}\": ", e)
		string_response_content = ""

	try:

		with open(path_results_json, "r") as file:
			string_response_results = file.read()

		# Messed up when writing the save_results function and didn't save the JSON correctly
		# so gotta do this awkward loading
		json_response_results = json.loads(string_response_results)
		dict_response_results = json.loads(json_response_results)

	except Exception as e:
		print(f"Caught error while reading results JSON to file: \"{path_results_json}\"", e)
		dict_response_results = dict()

	return string_response_content, dict_response_results


def make_path_to_results_dir_for_model_with_strategy_on_app(model_api: ModelAPI, prompt_strategy: PromptStrategy, string_name_of_app: str):

	# for the __test_screenshots__
	if "../__test_screenshots__/" in string_name_of_app:
		string_name_of_app = string_name_of_app.split("../__test_screenshots__/")[1]

	path_to_results_dir_model_api_prompt_strategy = make_path_to_results_dir_for_model_with_strategy(model_api, prompt_strategy)
	path_to_results_dir_model_api_prompt_strategy_app = path_to_results_dir_model_api_prompt_strategy / string_name_of_app
	# Ensure path exists
	path_to_results_dir_model_api_prompt_strategy_app.mkdir(parents=False, exist_ok=True)

	return path_to_results_dir_model_api_prompt_strategy_app


def make_path_to_results_dir_for_model_with_strategy(model_api: ModelAPI, prompt_strategy: PromptStrategy):
	# Base path for results
	path_to_results_dir = Path("../Data/2-Experiments/results")
	# Construct paths
	path_to_results_dir_model_api = path_to_results_dir / model_api.value.replace(":", "-")
	path_to_results_dir_model_api_prompt_strategy = path_to_results_dir_model_api / prompt_strategy.value
	# Ensure paths exist
	path_to_results_dir.mkdir(parents=False, exist_ok=True)
	path_to_results_dir_model_api.mkdir(parents=False, exist_ok=True)
	path_to_results_dir_model_api_prompt_strategy.mkdir(parents=False, exist_ok=True)

	return path_to_results_dir_model_api_prompt_strategy


def verify_response_to_clean_sample_is_correct(model_api: ModelAPI, prompt_strategy: PromptStrategy, string_name_of_app: str):

	try:
		_, dict_response_results = load_results(model_api, prompt_strategy, string_name_of_app, "clean")
		bool_did_detect_visual_bug = dict_response_results.get("bool_did_detect_visual_bug", None)
		bool_expected = False

		return (bool_did_detect_visual_bug == bool_expected)

	except Exception as err:
		print(f"Caught exception while verifying clean sample response: {err}")


def verify_app_has_assets_available(string_name_of_app: str) -> bool:
	# Duplicated hardcoded path!
	path_to_assets = Path("../Data/1d-Collecting_Screenshots/assets/")
	path_to_assets_for_app = path_to_assets / string_name_of_app

	try:
		number_of_assets = len(list(path_to_assets_for_app.rglob("*.png")))
		return (number_of_assets > 0)

	except Exception:
		return False
