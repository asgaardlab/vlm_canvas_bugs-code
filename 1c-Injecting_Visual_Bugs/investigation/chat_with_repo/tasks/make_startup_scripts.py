from argparse import ArgumentParser
from chat_with_repo.filesystem import Filesystem
from chat_with_repo.index import make_index
from chat_with_repo.chat.open_ai import chat_completion_request
from chat_with_repo.chat.utils import parse_response_json, parse_response_script

url_github_root = "https://github.com/"


# TODO replace print statements and saving messages to DB with logging
def make_startup_scripts(fs, projects_list_path, overwrite_vectors=False):
    projects = fs.load_projects_list(projects_list_path)
    for repo in projects:
        try:
            make_script_for_repo(fs, repo, overwrite_vectors)
        except Exception as e:
            print(f"Exception: {e}")
            continue
    return


def make_script_for_repo(fs, repo, overwrite_vectors=False):
    if fs.check_for_existing_script(repo):
        print(f"\nFound existing startup script for {repo}")
        return
    print(f"\nMaking startup script for {repo}")
    # convert repo text to embeddings and put in queryable vector DB
    # TODO play with this parameter
    top_k = 5
    retrieval_engine = make_index(fs, repo, overwrite=overwrite_vectors).as_retriever(
        similarity_top_k=top_k
    )
    # chain completion requests
    script_text, run_info, message_tracking = chain_completion_requests(
        fs, repo, retrieval_engine
    )
    # save the startup script
    fs.save_startup_script(repo, script_text, run_info, message_tracking)


def chain_completion_requests(fs, repo, retrieval_engine):
    message_tracking = ask_for_installation_steps(fs, repo, retrieval_engine)
    message_tracking = ask_for_bash_script(fs, repo, message_tracking)
    message_tracking = ask_for_json_file(fs, repo, message_tracking)
    script_text = parse_response_script(
        message_tracking["ask_for_bash_script"]["response"]
    )
    run_info = parse_response_json(message_tracking["ask_for_json_file"]["response"])
    return script_text, run_info, message_tracking


def ask_for_installation_steps(fs, repo, retrieval_engine, message_tracking=None):
    if message_tracking is None:
        message_tracking = dict()
    prompt_system = fs.read_prompt("make_startup_scripts", "prompt_system")
    prompt_user = fs.read_prompt(
        "make_startup_scripts", "prompt_for_installation_steps"
    )
    query = fs.read_prompt("make_startup_scripts", "query_repository_files")
    functions = fs.read_function("query_repo_files.json")
    documents = retrieval_engine.retrieve(query)
    documents_str = "\n".join([doc.text for doc in documents])
    messages = [
        {"role": "system", "content": prompt_system},
        {"role": "user", "content": prompt_user.format(url_github_root, repo)},
        # mocking an LLM function call
        {
            "role": "function",
            "name": "query_repository_files",
            "content": documents_str,
        },
    ]
    response = chat_completion_request(messages, functions=functions)
    message_tracking["ask_for_installation_steps"] = {
        "messages": messages,
        "response": response,
    }
    return message_tracking


def ask_for_bash_script(fs, repo, message_tracking):
    """
    Must be called in a chain of completions. See chain_completion_requests()
    """
    prompt_system = fs.read_prompt("make_startup_scripts", "prompt_system")
    prompt_user_past = fs.read_prompt(
        "make_startup_scripts", "prompt_for_installation_steps"
    )
    response_assistant_past = message_tracking["ask_for_installation_steps"]["response"]
    prompt_user_now = fs.read_prompt("make_startup_scripts", "prompt_make_script")
    messages = [
        {"role": "system", "content": prompt_system},
        {"role": "user", "content": prompt_user_past.format(url_github_root, repo)},
        {"role": "assistant", "content": response_assistant_past},
        {"role": "user", "content": prompt_user_now.format(url_github_root, repo)},
    ]
    response = chat_completion_request(messages)
    message_tracking["ask_for_bash_script"] = {
        "messages": messages,
        "response": response,
    }
    return message_tracking


def ask_for_json_file(fs, repo, message_tracking):
    """
    Must be called in a chain of completions. See chain_completion_requests()
    """
    prompt_system = fs.read_prompt("make_startup_scripts", "prompt_system")
    prompt_user_past = fs.read_prompt("make_startup_scripts", "prompt_fake_initial")
    response_assistant_past = message_tracking["ask_for_bash_script"]["response"]
    prompt_user_now = fs.read_prompt("make_startup_scripts", "prompt_make_json")
    # to save context window we are going to reset the message list
    messages = [
        {"role": "system", "content": prompt_system},
        {"role": "user", "content": prompt_user_past.format(url_github_root, repo)},
        {"role": "assistant", "content": response_assistant_past},
        {"role": "user", "content": prompt_user_now},
    ]
    response = chat_completion_request(messages)
    message_tracking["ask_for_json_file"] = {"messages": messages, "response": response}
    return message_tracking


if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("--storage_dir", type=str, default="./storage")
    parser.add_argument("--benchmark_dir", type=str, default="./benchmark")
    parser.add_argument(
        "--projects_list_path", type=str, default="./benchmark/projects.json"
    )
    parser.add_argument("--overwrite_vectors", action="store_true")
    args = parser.parse_args()
    fs = Filesystem(args["storage_dir"], args["benchmark_dir"])
    make_startup_scripts(fs, args["projects_list_path"], args["overwrite_vectors"])
