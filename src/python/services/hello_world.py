import sys
import json
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("dunzhang/stella_en_400M_v5")

def hello_world():
    return "Hello from python! This is a stub to handle ML and background processes in Python"

if __name__ == "__main__":
    result = hello_world()
    print(json.dumps({"result": result}))
    sys.stdout.flush()