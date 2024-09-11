import sys
import json
import os
from typing import Dict, List
import numpy as np
import faiss
from openai import OpenAI

# Provided through from fileSystem.ts through pythonBridge.ts
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OpenAI API key not found in environment variables")
client = OpenAI(api_key=OPENAI_API_KEY)

# Get the notes directory from command-line arguments
NOTES_DIR = sys.argv[1]


def get_embedding(text: str) -> List[float]:
    response = client.embeddings.create(model="text-embedding-ada-002", input=text)
    return response.data[0].embedding


def compute_and_store_embedding(embedding_path: str, note_content: str) -> None:
    embedding = get_embedding(note_content)
    with open(embedding_path, "w") as f:
        json.dump({"embedding": embedding}, f)

def find_similar_notes(query_embedding: List[float], top_k: int = 5) -> List[str]:
    embeddings: List[List[float]] = []
    note_ids: List[str] = []
    for filename in os.listdir(NOTES_DIR):
        if filename.endswith(".embedding.json"):
            note_id = filename.split(".")[0]
            with open(os.path.join(NOTES_DIR, filename), "r") as f:
                data: Dict[str, List[float]] = json.load(f)
                embeddings.append(data["embedding"])
                note_ids.append(note_id)

    if not embeddings:
        return []

    embeddings_array = np.array(embeddings).astype("float32")

    dimension = len(embeddings[0])
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings_array)

    distances, indices = index.search(
        np.array([query_embedding]).astype("float32"), top_k
    )

    return [note_ids[i] for i in indices[0]]


if __name__ == "__main__":
    action = sys.argv[2]
    if action == "compute":
        embedding_path = sys.argv[3]
        print(f"embedding path {embedding_path}")
        note_content = sys.argv[4]
        print(f"note content {note_content}")
        compute_and_store_embedding(embedding_path, note_content)
        print(json.dumps({"success": True}))
    # elif action == "find_similar":
    #     query = sys.argv[3]
    #     query_embedding = get_embedding(query)
    #     similar_notes = find_similar_notes(query_embedding)
    #     print(json.dumps({"similar_notes": similar_notes}))
