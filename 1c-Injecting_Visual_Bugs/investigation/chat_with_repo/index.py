import pandas as pd
from pathlib import Path
import faiss
from llama_index.core import (
    Settings,
    VectorStoreIndex,
    SimpleDirectoryReader,
    StorageContext,
    load_index_from_storage,
)
from llama_index.core.callbacks import CallbackManager
from llama_index.core.callbacks import LlamaDebugHandler
from llama_index.callbacks.wandb import WandbCallbackHandler
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.vector_stores.faiss import FaissVectorStore


# Global settings
Settings.llm = None
Settings.embed_model = OpenAIEmbedding(embed_batch_size=10)
Settings.chunk_size = 1024
# ... other settings
# Settings.node_parser =
# Settings.num_output =
# Settings.context_window =
llama_debug = LlamaDebugHandler(print_trace_on_end=True)
run_args = {"project": "canvas_benchmark", "group": "make_embeddings"}
wandb_callback = WandbCallbackHandler(run_args=run_args)
Settings.callback_manager = CallbackManager([llama_debug, wandb_callback])


def make_index(fs, repo, overwrite=False):
    vectors_path = fs.path_vector_store / Path(repo)
    if vectors_path.exists() and not overwrite:
        print(f"Found existing embeddings for {repo}")
        vector_store = FaissVectorStore.from_persist_dir(vectors_path)
        storage_context = StorageContext.from_defaults(
            vector_store=vector_store, persist_dir=vectors_path
        )
        # load index
        index = load_index_from_storage(storage_context=storage_context)
    else:
        print(f"Getting new embeddings for {repo}")
        repo_path = fs.path_apps / Path(repo)
        index = convert_repo_text_to_vectors(repo_path)
        index.storage_context.persist(vectors_path)
    return index


def convert_repo_text_to_vectors(repo_path):
    # we only want code and text files, not image and video files
    valid_extensions = make_list_of_valid_extensions()
    print(f"Including: {valid_extensions}")
    documents = SimpleDirectoryReader(
        input_dir=repo_path,
        exclude_hidden=True,
        recursive=True,
        required_exts=[f".{e}" for e in valid_extensions],
    ).load_data()
    # dimensions of text-ada-embedding-002
    d = 1536
    faiss_index = faiss.IndexFlatL2(d)
    vector_store = FaissVectorStore(faiss_index=faiss_index)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    index = VectorStoreIndex.from_documents(
        documents=documents,
        storage_context=storage_context,
        show_progress=True,
    )
    return index


def make_list_of_valid_extensions():
    url_code_extensions = "https://raw.githubusercontent.com/dyne/file-extension-list/master/data/categories/code.csv"
    url_text_extensions = "https://raw.githubusercontent.com/dyne/file-extension-list/master/data/categories/text.csv"
    text_extensions = pd.read_csv(url_code_extensions, header=None)[0].values.tolist()
    text_extensions += pd.read_csv(url_text_extensions, header=None)[0].values.tolist()
    list_of_extensions = list(set(text_extensions))
    return list_of_extensions
