from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, Tuple
from detect_problems import detect_problems

app = FastAPI()

class CodeAnalysisRequest(BaseModel):
    codetext: str

@app.post("/parse/")
async def run_analysis(request: CodeAnalysisRequest):
    promptpath = './prompt.txt'
    with open(promptpath, "r") as promptfile:
        prompt = promptfile.read()
    output = detect_problems(request.codetext, promptpath)
    return output

