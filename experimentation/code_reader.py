import ast
import json
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from intelligence import Summarizer, Categorizer, LanguageAgent, SummarizerConfig

from purpose import SmartPurposeGenerator, CodePattern

from transformers import pipeline
import ast
import re

@dataclass
class Function:
  name: str
  purpose: str  # Natural language description
  signature: str  # Human-readable function signature
  docstring: str
  body: str
  decorators: str  # Combined string of decorators
  return_type: str
  is_method: bool = False
  class_name: Optional[str] = None

@dataclass
class Class:
  name: str
  responsibility: str  # High-level purpose
  docstring: str
  methods: List[Function]
  inheritance: str  # Human-readable inheritance chain
  decorators: str

class CodeParser:
  def __init__(self, code: str):
    self.code = code
    self.tree = ast.parse(code)
    self.code_lines = code.split('\n')
  
  summarizer = pipeline(
    model="Qwen/Qwen2.5-0.5B",
    device=-1  # CPU
  )
    
  @classmethod
  def _summarize_python_function(cls, function_string: str) -> dict:
    """
    Analyzes a Python function string and returns a summary using a small language model.
    
    Args:
      function_string (str): String containing a Python function definition
      
    Returns:
      dict: Summary information including function name, parameters, docstring,
        and an AI-generated summary of functionality
    """
    # Initialize the summarization model
    
    
    # Clean the code for better summarization
    clean_code = re.sub(r'""".*?"""', '', function_string, flags=re.DOTALL)  # Remove docstring
    clean_code = re.sub(r'#.*$', '', clean_code, flags=re.MULTILINE)  # Remove comments
    prompt = f"You are given a function. Summarize it in one line. The function {clean_code} can be summarized as:"
    # Generate AI summary
    summary = cls.summarizer(
      prompt,
    )[0]

    summary = summary["generated_text"].split("can be summarized as: ")[1]
    
    return summary
    
  
  def _get_source_segment(self, node: ast.AST, body_only: bool = False) -> str:
    """Extract clean source code."""
    if body_only and isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
      body_lines = []
      for i in range(node.body[0].lineno - 1, node.end_lineno):
        if i < len(self.code_lines):
          line = self.code_lines[i]
          if line.startswith('  '):
            body_lines.append(line[2:])
          else:
            body_lines.append(line)
      return '\n'.join(body_lines)
    return '\n'.join(self.code_lines[node.lineno - 1:node.end_lineno])

  def _create_function_signature(self, node: ast.FunctionDef) -> str:
    """Create human-readable function signature."""
    params = []
    for arg in node.args.args:
      param = arg.arg
      if arg.annotation:
        param += f": {ast.unparse(arg.annotation)}"
      params.append(param)
    
    if node.args.vararg:
      params.append(f"*{node.args.vararg.arg}")
    if node.args.kwarg:
      params.append(f"**{node.args.kwarg.arg}")
    
    return f"{node.name}({', '.join(params)})"

  def _create_function_purpose(self, node: ast.FunctionDef) -> str:
    """Create natural language description of function purpose."""
    name_parts = node.name.split('_')
    verb = name_parts[0]
    subject = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
    
    params = [arg.arg for arg in node.args.args if arg.arg != 'self']
    return_type = ast.unparse(node.returns) if node.returns else 'None'

    function_body = self._get_source_segment(node)

    print("FUNCTION::")
    purpose = CodeParser._summarize_python_function(function_body)
    print(purpose)
    return f"{purpose}"

  def _parse_function(self, node: ast.FunctionDef, class_context: Optional[str] = None) -> Function:
    """Parse function into LLM-friendly format."""
    is_method = class_context is not None
    decorators = ' '.join(f"@{ast.unparse(dec)}" for dec in node.decorator_list)
    
    return Function(
      name=node.name,
      purpose=self._create_function_purpose(node),
      signature=self._create_function_signature(node),
      docstring=ast.get_docstring(node) or "",
      body=self._get_source_segment(node, body_only=True),
      decorators=decorators,
      return_type=ast.unparse(node.returns) if node.returns else "None",
      is_method=is_method,
      class_name=class_context
    )

  def _create_class_responsibility(self, node: ast.ClassDef) -> str:
    """Create natural language description of class responsibility."""
    method_names = [m.name for m in node.body if isinstance(m, ast.FunctionDef)]
    has_properties = any(isinstance(m, ast.FunctionDef) and 
                        any(d.id == 'property' for d in m.decorator_list) 
                        for m in node.body)
    
    responsibility = f"A {node.name} class"
    if node.bases:
      responsibility += f" extending {', '.join(ast.unparse(b) for b in node.bases)}"
    if has_properties:
      responsibility += " with properties"
    if method_names:
      responsibility += f" implementing {', '.join(method_names)}"
    return responsibility

  def _parse_class(self, node: ast.ClassDef) -> Class:
    """Parse class into LLM-friendly format."""
    methods = []
    for item in node.body:
      if isinstance(item, ast.FunctionDef):
        methods.append(self._parse_function(item, class_context=node.name))
    
    return Class(
      name=node.name,
      responsibility=self._create_class_responsibility(node),
      docstring=ast.get_docstring(node) or "",
      methods=methods,
      inheritance=', '.join(ast.unparse(base) for base in node.bases),
      decorators=' '.join(f"@{ast.unparse(dec)}" for dec in node.decorator_list)
    )

  def parse(self) -> Dict[str, Any]:
    """Parse code into LLM-friendly structure."""
    result = {
      'file_description': {
        'summary': "This file contains:",
        'components': []
      },
      'classes': [],
      'functions': [],
      'variables': []
    }
    
    # Gather all top-level components
    for node in ast.walk(self.tree):
      if isinstance(node, ast.ClassDef):
        class_info = self._parse_class(node)
        result['classes'].append(asdict(class_info))
        result['file_description']['components'].append(
          f"A {class_info.name} class for {class_info.responsibility}"
        )
      
      elif isinstance(node, ast.FunctionDef):
        func_info = self._parse_function(node)
        result['functions'].append(asdict(func_info))
        result['file_description']['components'].append(
          f"A function {func_info.name} that {func_info.purpose}"
        )
      
      elif isinstance(node, ast.Assign):
        for target in node.targets:
          if isinstance(target, ast.Name):
            result['variables'].append({
              'name': target.id,
              'value': ast.unparse(node.value),
              'purpose': f"Global {target.id} set to {ast.unparse(node.value)}"
            })
            result['file_description']['components'].append(
              f"A global variable {target.id}"
            )
    
    # Create relationships between components
    result['relationships'] = self._identify_relationships(result)
    
    return result

  def _identify_relationships(self, parsed_data: Dict) -> List[str]:
    """Identify and describe relationships between components."""
    relationships = []
    
    # Find class-method relationships
    for class_info in parsed_data['classes']:
      if class_info['methods']:
        relationships.append(
          f"Class {class_info['name']} contains methods: "
          f"{', '.join(m['name'] for m in class_info['methods'])}"
        )
    
    # Find variable usage in functions
    global_vars = {v['name'] for v in parsed_data['variables']}
    for func in parsed_data['functions']:
      used_vars = [v for v in global_vars if v in func['body']]
      if used_vars:
        relationships.append(
          f"Function {func['name']} uses global variables: {', '.join(used_vars)}"
        )
    
    return relationships

def parse_code_file(file_path: str) -> Dict[str, Any]:
  with open(file_path, 'r') as f:
    code = f.read()
  parser = CodeParser(code)
  return parser.parse()

# Example usage
if __name__ == "__main__":
  example_code = '''
@dataclass
class Calculator:
  """A simple calculator class."""
  
  def __init__(self, precision: int = 2):
    """Initialize calculator with given precision."""
    self.precision = precision
  
  @property
  def version(self) -> str:
    """Get calculator version."""
    return "1.0"
  
  def add(self, a: float, b: float = 0.0) -> float:
    """Add two numbers."""
    result = a + b
    return round(result, self.precision)

async def process_data(items: List[int], *, chunk_size: int = 100) -> List[float]:
  """Process data in chunks."""
  results = []
  for i in range(0, len(items), chunk_size):
    chunk = items[i:i + chunk_size]
    results.extend([x * 1.5 for x in chunk])
  return results

API_VERSION = "1.0"
DEBUG_MODE = True
  '''
  
  parser = CodeParser(example_code)
  result = parser.parse()
  with open("parsed_code.json", 'w') as f:
    f.write(json.dumps(result, indent=2))
