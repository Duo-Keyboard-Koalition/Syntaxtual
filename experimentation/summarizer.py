from transformers import pipeline
import ast
import re

def summarize_python_function(function_string: str) -> dict:
  """
  Analyzes a Python function string and returns a summary using a small language model.
  
  Args:
      function_string (str): String containing a Python function definition
      
  Returns:
      dict: Summary information including function name, parameters, docstring,
            and an AI-generated summary of functionality
  """
  # Initialize the summarization model
  summarizer = pipeline(
    "summarization",
    model="facebook/bart-small",
    device=-1  # CPU
  )
  
  try:
      # Parse the function string into an AST
    tree = ast.parse(function_string)
    function_def = tree.body[0]
      
    if not isinstance(function_def, ast.FunctionDef):
      raise ValueError("Input string must contain a function definition")
        
    # Extract function name
    function_name = function_def.name
    
    # Extract parameters
    params = []
    for arg in function_def.args.args:
      param = {
        'name': arg.arg,
        'annotation': ast.unparse(arg.annotation) if arg.annotation else None
      }
      params.append(param)
        
    # Extract docstring if it exists
    docstring = ast.get_docstring(function_def)
    
    # Clean the code for better summarization
    clean_code = re.sub(r'""".*?"""', '', function_string, flags=re.DOTALL)  # Remove docstring
    clean_code = re.sub(r'#.*$', '', clean_code, flags=re.MULTILINE)  # Remove comments
    
    # Generate AI summary
    summary = summarizer(
      clean_code,
      max_length=100,
      min_length=30,
      do_sample=False
    )[0]['summary_text']
    
    return {
      'function_name': function_name,
      'parameters': params,
      'docstring': docstring,
      'ai_summary': summary
    }   
  except SyntaxError:
    return {
      'error': 'Invalid Python syntax',
      'function_name': None,
      'parameters': None,
      'docstring': None,
      'ai_summary': None
    }
  except Exception as e:
    return {
      'error': str(e),
      'function_name': None,
      'parameters': None,
      'docstring': None,
      'ai_summary': None
    }
  
