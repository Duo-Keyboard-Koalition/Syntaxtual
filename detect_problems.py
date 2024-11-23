'''
test.py:

- Given a code text file
    -  identify all wierd components
    - Give individual suggestions

'''

import re
import cohere
from typing import Dict, Tuple


API_KEY = "cVurtDQVujXudCscLNy6d4VgK703O2xGSvOePEPB"  # Replace with your Cohere API key
co = cohere.Client(API_KEY)

def generate_text(prompt, model="command-xlarge-nightly"):
    """
    Generate text using a Cohere model.
    :param prompt: The input prompt for text generation.
    :param model: The Cohere model to use.
    :return: Generated text.
    """
    response = co.generate(
        model=model,
        prompt=prompt,
        max_tokens=100,  # Adjust max tokens as needed
        temperature=0.7,  # Adjust creativity level
    )
    return response.generations[0].text

def classify_text(inputs, labels, model="embed-xlarge"):
    """
    Classify text using Cohere's classification model.
    :param inputs: List of text inputs to classify.
    :param labels: List of possible labels.
    :param model: The Cohere embedding model to use.
    :return: Classification results.
    """
    response = co.classify(
        inputs=inputs,
        examples=[{"text": label, "label": label} for label in labels],
        model=model,
    )
    return [(classification.input, classification.prediction) for classification in response.classifications]

def detect_problems(codepath: str, promptpath: str) -> Dict[Tuple[int, int], str]:
    '''
    Returns a dict, keys are code line numbers (start, finish), value is llm output for problem detected + solution
    '''
    

    outputtext = generate_text(f'${prompt} \n \n \n ${codetext}')

    def parse_output(outputtext: str) -> Dict[Tuple[int, int], str]:
        """
        Parse a Python string to detect lines starting with "Line x to Line y",
        and store (x, y) as the key and text until '*' as the value in a dictionary.
        """
        result = {}
        
        pattern = re.compile(r".*?Line (\d+): (.*?```.*?```)", re.DOTALL)
        
        for match in pattern.finditer(outputtext):
            start_line, content = match.groups()
            
            start_line = int(start_line)
            
            content = content.strip()
            
            # Add the content as the dictionary value, with the key being the line range (start, end)
            result[start_line] = content

        return result
    
    return parse_output(outputtext)

if __name__ == '__main__':
    codepath = './codeExample.py'
    promptpath = './prompt.txt'
    with open(promptpath, "r") as promptfile:
        prompt = promptfile.read()
    with open(codepath, "r") as codefile:
        codetext = codefile.read()
    print(detect_problems(codetext, prompt))

        



