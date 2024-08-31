import sys
import json

def hello_world():
    return "Hello from python! This is a stub to handle ML and background processes in Python"

if __name__ == "__main__":
    result = hello_world()
    print(json.dumps({"result": result}))
    sys.stdout.flush()