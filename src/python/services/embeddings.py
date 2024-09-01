import sys
import json
import os
import numpy as np
import faiss
from openai import OpenAI

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OpenAI API key not found in environment variables")
client = OpenAI(api_key=OPENAI_API_KEY)

# Get the notes directory from command-line arguments
NOTES_DIR = sys.argv[1]


def get_embedding(text):
    response = client.embeddings.create(model="text-embedding-ada-002", input=text)
    return response.data[0].embedding


def compute_and_store_embedding(note_id, content):
    embedding = get_embedding(content)

    # Save the embedding
    embedding_path = os.path.join(NOTES_DIR, f"{note_id}.embedding.json")
    with open(embedding_path, "w") as f:
        json.dump({"embedding": embedding}, f)


def find_similar_notes(query_embedding, top_k=5):
    # Load all embeddings
    embeddings = []
    note_ids = []
    for filename in os.listdir(NOTES_DIR):
        if filename.endswith(".embedding.json"):
            note_id = filename.split(".")[0]
            with open(os.path.join(NOTES_DIR, filename), "r") as f:
                data = json.load(f)
                embeddings.append(data["embedding"])
                note_ids.append(note_id)

    if not embeddings:
        return []

    # Convert to numpy array
    embeddings_array = np.array(embeddings).astype("float32")

    # Create FAISS index
    dimension = len(embeddings[0])
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings_array)

    # Perform similarity search
    distances, indices = index.search(
        np.array([query_embedding]).astype("float32"), top_k
    )

    # Return similar note IDs
    return [note_ids[i] for i in indices[0]]


if __name__ == "__main__":
    action = sys.argv[2]
    if action == "compute":
        note_id = sys.argv[3]
        content = sys.argv[4]
        compute_and_store_embedding(note_id, content)
        print(json.dumps({"success": True}))
    elif action == "find_similar":
        query = sys.argv[3]
        query_embedding = get_embedding(query)
        similar_notes = find_similar_notes(query_embedding)
        print(json.dumps({"similar_notes": similar_notes}))
