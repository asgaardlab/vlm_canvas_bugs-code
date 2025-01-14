from pathlib import Path
import json
import yaml


class Filesystem:

    def __init__(self, path_storage=None, path_benchmark=None):
        # define input paths
        self.path_base = Path("./chat_with_repo")
        self.path_prompts_file = self.path_base / "prompts.yaml"
        self.path_functions_dir = self.path_base / "functions"

        # define storage paths
        if path_storage:
            self.path_storage = Path(path_storage)
        else:
            self.path_storage = Path("./storage")

        self.path_sql_db = self.path_storage / "chat_with_repo.db"
        self.path_vector_store = self.path_storage / "vector_store"

        # define output benchmark paths
        if path_benchmark:
            self.path_benchmark = Path(path_benchmark)
        else:
            self.path_benchmark = Path("./benchmark")

        self.path_apps = self.path_benchmark / "apps"
        self.path_scripts = self.path_benchmark / "scripts"
        self.filename_script = "start.sh"
        self.filename_chat_logs = "chat_logs.json"
        self.filename_run_info = "run_info.json"

        # create the storage directories if they do not exist
        self.path_storage.mkdir(parents=False, exist_ok=True)
        self.path_vector_store.mkdir(parents=False, exist_ok=True)

        # create the benchmark directories if they do not exist
        self.path_benchmark.mkdir(parents=False, exist_ok=True)
        self.path_apps.mkdir(parents=False, exist_ok=True)
        self.path_scripts.mkdir(parents=False, exist_ok=True)

    def read_prompt(self, prompt_group, prompt_name):
        """
        Parameters
        ----------
        prompt_group: str
            Group name of the prompt in the prompts.yaml file.
        prompt_name: str
            Name of the prompt in the prompts.yaml file.
        """
        with open(self.path_prompts_file) as f:
            prompts = yaml.safe_load(f)
            prompt = prompts.get(prompt_group, {}).get(prompt_name)
            if prompt:
                return prompt
            else:
                raise ValueError(
                    f"Prompt '{prompt_name}' in group '{prompt_group}' not found."
                )

    def read_function(self, function_name):
        """
        Parameters
        ----------
        path_to_functions: str | Path
            Path to functions template relative to prompts directory (set on init),
            e.g. "make_scripts/ask_for_install/functions/F1.json"
        """
        functions_path = self.path_functions_dir / Path(function_name)
        with open(functions_path) as f:
            return json.load(f)

    def save_startup_script(
        self, repo: str, script: str, run_info: dict, chat_logs: dict
    ):
        """
        Save the chat logs and run info along with the generated startup script.
        If our script empty, raise a ValueError (after saving chat logs and run info).
        """
        script_dir_path = self.path_scripts / repo
        script_dir_path.mkdir(parents=True, exist_ok=True)
        script_path = script_dir_path / self.filename_script
        run_info_path = script_dir_path / self.filename_run_info
        chat_logs_path = script_dir_path / self.filename_chat_logs
        with open(chat_logs_path, "w") as f:
            json.dump(chat_logs, f)
        with open(run_info_path, "w") as f:
            json.dump(run_info, f)
        if type(script) is str and len(script) > 0:
            with open(script_path, "w") as f:
                f.write(script)
        else:
            raise ValueError("Invalid script")

    def check_for_existing_script(self, repo):
        script_path = self.path_scripts / repo / self.filename_script
        return script_path.exists()

    def check_existing_conversation(self, repo):
        chat_logs_path = self.path_scripts / repo / self.filename_chat_logs
        return chat_logs_path.exists()

    def load_conversation_history(self, repo):
        chat_logs_path = self.path_scripts / repo / self.filename_chat_logs
        with open(chat_logs_path) as f:
            return json.load(f)

    def check_existing_metadata(self, repo):
        run_info_path = self.path_scripts / repo / self.filename_run_info
        return run_info_path.exists()
