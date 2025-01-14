from enum import Enum


class PromptStrategy(Enum):
	# Prompting strategy "NoContext" in the paper
	BASELINE = "v0_baseline"
	# Not used in the paper
	DESCRIBE_TASK = "v1_describe_task"
	# Prompting strategy "README+BugDescriptions" in the paper
	DESCRIBE_TASK_AND_PROVIDE_README = "v2_describe_task_and_provide_readme"
	# Prompting strategy "README" in the paper
	BASELINE_AND_PROVIDE_README = "v2a_baseline_and_provide_readme"
	# Not used in the paper
	DESCRIBE_TASK_AND_PROVIDE_VERIFIED_SAMPLE = "v3_describe_task_and_provide_readme_plus_verified_sample"
	# Prompting strategy "AllContextExceptAssets" in the paper
	DESCRIBE_TASK_AND_PROVIDE_MOCK_VERIFIED_SAMPLE = "v3a_describe_task_and_provide_readme_plus_mock_verified_sample"
	# Not used in the paper
	DESCRIBE_TASK_AND_PROVIDE_ASSETS = "v4_describe_task_and_provide_readme_plus_assets"
	# Prompting strategy "AllContext" in the paper
	DESCRIBE_TASK_AND_PROVIDE_COMBINED_CONTEXT = "v5_describe_task_and_provide_readme_plus_mock_verified_sample_plus_assets"
	# Ablation study part 1
	ABLATION_STUDY_README_HAS_THE_GOOD_PART = "vX2a1_ablation_study_readme_has_the_good_part"
	# Ablation study part 2
	ABLATION_STUDY_README_HAS_THE_BAD_PART = "vX2a2_ablation_study_readme_has_the_bad_part"


class ModelAPI(Enum):
	"""Define tuples of strings defining which API provider & model to use"""
	# OpenAI GPT Models
	# https://platform.openai.com/docs/models/gpt-4o

	# chatgpt-4o-latest - Not recommended for research
	# OPENAI_CHATGPT_LATEST = "openai:chatgpt-4o-latest"

	# gpt-4o - Points to one of the GPT-4o snapshots below
	# OPENAI_GPT4O = "openai:gpt-4o"

	# gpt-4o-2024-08-06 - Structured outputs available
	OPENAI_GPT4O_2024_08_06 = "openai:gpt-4o-2024-08-06"

	# gpt-4o-2024-05-13 - Original GPT-4o
	# OPENAI_GPT4O_2024_05_13 = "openai:gpt-4o-2024-05-13"

	# Google Gemini Models
	# https://ai.google.dev/gemini-api/docs/models/gemini

	# gemini-1.5-pro-001 - Stable version of Gemini 1.5 Pro
	# GOOGLE_GEMINI_1_POINT_5_PRO = "google:gemini-1.5-pro-001"

	# gemini-1.5-flash-001 - Stable version of Gemini 1.5 Flash
	# GOOGLE_GEMINI_1_POINT_5_FLASH = "google:gemini-1.5-flash-001"
