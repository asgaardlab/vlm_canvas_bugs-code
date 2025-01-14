import os
import subprocess
from pathlib import Path
from dotenv import load_dotenv


def main():
    # Load environment variables from .env file
    dotenv_path = Path('.env')

    if dotenv_path.exists():
        load_dotenv(dotenv_path)

    else:
        print(".env file not found. Please create one before proceeding. See .env.example for an example, and this repository's README file(s) for instructions.")
        exit(1)

    # Get the external repositories path
    EXTERNAL_REPOS_PATH = os.getenv("VLM_CANVAS_BUGS_EXTERNAL_REPOS_PATH", None)

    if EXTERNAL_REPOS_PATH is None:
        str_msg_error = "Environment variable VLM_CANVAS_BUGS_EXTERNAL_REPOS_PATH is not set."
        str_msg_error += "\nPlease create .env file and set VLM_CANVAS_BUGS_EXTERNAL_REPOS_PATH environment variable."
        str_msg_error += "\nPlease set this path (relative to the root of this repository) to the folder where the 20 application repositories are cloned to."
        str_msg_error += "\nSee this repository's main README file for more instructions."
        print(str_msg_error)
        exit(1)

    os.makedirs(EXTERNAL_REPOS_PATH, exist_ok=True)

    # List of repositories to clone
    REPO_NAMES = [
        "Aidymouse-Hexfriend",
        "aldy-san-zero-neko",
        "chase-manning-react-photo-studio",
        "coderetreat-coderetreat.org",
        "dimforge-rapier.js",
        "equinor-esv-intersection",
        "getkey-ble",
        "ha-shine-wasm-tetris",
        "higlass-higlass",
        "mehanix-arcada",
        "MichaelMakesGames-reflector",
        "ourcade-ecs-dependency-injection",
        "p5aholic-playground",
        "PrefectHQ-graphs",
        "solaris-games-solaris",
        "starwards-starwards",
        "tulustul-ants-sandbox",
        "uia4w-uia-wafermap",
        "VoiceSpaceUnder5-VoiceSpace",
        "Zikoat-infinite-minesweeper"
    ]

    # Clone or update each repository
    for repo_name in REPO_NAMES:
        repo_local_dir = Path(EXTERNAL_REPOS_PATH) / repo_name
        repo_url = f"https://github.com/vlm-canvas-bugs-external-repos/{repo_name}.git"

        if repo_local_dir.exists():
            print(f"Updating {repo_name}...")
            subprocess.run(["git", "-C", str(repo_local_dir), "pull"], check=True)

        else:
            print(f"Cloning {repo_name}...")
            subprocess.run(["git", "clone", repo_url, str(repo_local_dir)], check=True)

    print(f"All repositories are up to date in {EXTERNAL_REPOS_PATH}")


if __name__ == "__main__":
    main()
