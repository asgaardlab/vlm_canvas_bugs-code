from pathlib import Path
from git import Repo


def clone_repo_and_checkout_commit(fs, repo, repo_info):
    """
    Clones a repository and then checks out the specified commit.
    """
    repo_path = fs.path_apps / Path(repo)
    url = repo_info["url"]
    branch = repo_info["branch"]
    commit_id = repo_info["commit"]
    print(f"Cloning repository into dir: {repo_path}")
    # clone the repository (just the .git directory)
    repo = Repo.clone_from(url=url, branch=branch, to_path=repo_path, no_checkout=True)
    # checkout the specified commit hash (download the files)
    repo.git.checkout(commit_id)
