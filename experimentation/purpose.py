import ast
from typing import Dict, List, Optional, Set
from dataclasses import dataclass
import re
from collections import defaultdict
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import numpy as np

@dataclass
class CodePattern:
  pattern: str
  template: str
  examples: Set[str]

class SmartPurposeGenerator:
  def __init__(self, use_local_model: bool = True):
    self.patterns = self._initialize_patterns()
    self.cache = {}
    
    if use_local_model:
      # Initialize a small model for local inference
      self.tokenizer = AutoTokenizer.from_pretrained('Qwen/Qwen2.5-0.5B')
      self.model = AutoModelForCausalLM.from_pretrained('Qwen/Qwen2.5-0.5B')
      self.model.eval()  # Set to evaluation mode
    else:
      self.tokenizer = None
      self.model = None
    
    # Initialize common code pattern matchers
    self.crud_patterns = {
      'create': r'(new|create|add|insert|build)',
      'read': r'(get|fetch|retrieve|find|search|query)',
      'update': r'(update|modify|change|set|edit)',
      'delete': r'(delete|remove|clear|drop)'
    }
  
  def _initialize_patterns(self) -> Dict[str, CodePattern]:
    """Initialize common code patterns with examples."""
    return {
      'validator': CodePattern(
        pattern=r'(is_|valid|check|verify)',
        template="Validates {subject} by checking {conditions}",
        examples={'is_valid_email', 'check_password', 'verify_token'}
      ),
      'transformer': CodePattern(
        pattern=r'(transform|convert|parse|format)',
        template="Transforms {input_type} into {output_type}",
        examples={'convert_to_json', 'parse_datetime', 'format_string'}
      ),
      'calculator': CodePattern(
        pattern=r'(calc|compute|sum|average)',
        template="Calculates {result} based on {inputs}",
        examples={'calculate_total', 'compute_average', 'sum_values'}
      ),
      'handler': CodePattern(
        pattern=r'(handle|process|manage)',
        template="Handles {event} by {action}",
        examples={'handle_click', 'process_payment', 'manage_state'}
      )
    }

  def _analyze_function_calls(self, node: ast.FunctionDef) -> List[str]:
    """Extract function calls and their context."""
    calls = []
    for child in ast.walk(node):
      if isinstance(child, ast.Call):
        if isinstance(child.func, ast.Name):
          calls.append(child.func.id)
        elif isinstance(child.func, ast.Attribute):
          calls.append(child.func.attr)
    return calls

  def _analyze_data_flow(self, node: ast.FunctionDef) -> Dict[str, List[str]]:
    """Analyze how data flows through the function."""
    flow = {
      'inputs': [arg.arg for arg in node.args.args if arg.arg != 'self'],
      'outputs': [],
      'transformations': []
    }
    
    # Find return values
    for child in ast.walk(node):
      if isinstance(child, ast.Return):
        if isinstance(child.value, ast.Name):
          flow['outputs'].append(child.value.id)
        elif isinstance(child.value, ast.Call):
          if isinstance(child.value.func, ast.Name):
            flow['transformations'].append(child.value.func.id)
    
    return flow

  def _get_docstring_summary(self, node: ast.FunctionDef) -> Optional[str]:
    """Extract and clean the first line of docstring."""
    docstring = ast.get_docstring(node)
    if docstring:
      # Take first line and clean it
      summary = docstring.split('\n')[0].strip()
      # Remove common docstring patterns
      summary = re.sub(r'^(This |A function to |Function that )', '', summary)
      return summary
    return None

  def _identify_crud_operation(self, name: str, body: str) -> Optional[str]:
    """Identify if function is a CRUD operation."""
    for operation, pattern in self.crud_patterns.items():
      if re.match(pattern, name.lower()):
        return operation
    return None

  def _generate_with_model(self, 
                          function_text: str, 
                          max_length: int = 50) -> str:
    """Generate purpose using small LLM."""
    print("FUNCTION TEXT:")
    print(function_text)
    prompt = f"# Python function explanation:\n{function_text}\n# This function's detailed purpose is to"
    
    inputs = self.tokenizer(prompt, return_tensors='pt')
    with torch.no_grad():
      outputs = self.model.generate(
        inputs['input_ids'],
        max_length=max_length,
        num_return_sequences=1,
        temperature=0.7,
        do_sample=True,
        pad_token_id=self.tokenizer.eos_token_id
      )
    
    summary = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
    # Clean up and extract the relevant part
    summary = summary.split("# This function's purpose is to")[1].strip()
    return summary

  def _analyze_complexity(self, node: ast.FunctionDef) -> Dict[str, any]:
    """Analyze function complexity and patterns."""
    analysis = {
      'has_loops': False,
      'has_conditionals': False,
      'has_error_handling': False,
      'complexity_score': 0
    }
    
    for child in ast.walk(node):
      if isinstance(child, (ast.For, ast.While)):
        analysis['has_loops'] = True
      elif isinstance(child, ast.If):
        analysis['has_conditionals'] = True
      elif isinstance(child, ast.Try):
        analysis['has_error_handling'] = True
      
      analysis['complexity_score'] += 1
    
    return analysis

  def generate_purpose(self, node: ast.FunctionDef) -> str:
    """Generate intelligent purpose description for a function."""
    # Check cache first
    cache_key = ast.dump(node)
    if cache_key in self.cache:
      return self.cache[cache_key]
    
    # Get basic function information
    name = node.name
    docstring = self._get_docstring_summary(node)
    data_flow = self._analyze_data_flow(node)
    complexity = self._analyze_complexity(node)
    
    # Try pattern matching first
    for pattern_name, pattern in self.patterns.items():
      if re.match(pattern.pattern, name):
        purpose = pattern.template.format(
          subject=name.split('_')[-1],
          conditions=', '.join(data_flow['inputs']),
          input_type=data_flow['inputs'][0] if data_flow['inputs'] else 'input',
          output_type=data_flow['outputs'][0] if data_flow['outputs'] else 'output',
          result=name.split('_')[-1],
          inputs=', '.join(data_flow['inputs']),
          event=name.split('_')[-1],
          action=data_flow['transformations'][0] if data_flow['transformations'] else 'processing'
        )
        self.cache[cache_key] = purpose
        return purpose
    
    # Check if it's a CRUD operation
    crud_op = self._identify_crud_operation(name, ast.unparse(node))
    if crud_op:
      subject = ' '.join(name.split('_')[1:]) if '_' in name else 'data'
      purpose = f"{crud_op.title()}s {subject} in the system"
      self.cache[cache_key] = purpose
      return purpose
    
    # If we have a clear docstring, use it
    if docstring:
      self.cache[cache_key] = docstring
      return docstring
    
    # Use small LLM for complex functions
    if complexity['complexity_score'] > 5 or complexity['has_loops']:
      try:
        purpose = self._generate_with_model(ast.unparse(node))
        self.cache[cache_key] = purpose
        return purpose
      except Exception as e:
        print(f"Error generating purpose with model: {e}")
    
    # Fallback to simple but informative description
    function_type = 'method' if 'self' in [arg.arg for arg in node.args.args] else 'function'
    args_desc = ', '.join(data_flow['inputs']) if data_flow['inputs'] else 'no inputs'
    returns_desc = ', '.join(data_flow['outputs']) if data_flow['outputs'] else 'None'
    
    purpose = f"A {function_type} that takes {args_desc} and returns {returns_desc}"
    if complexity['has_loops']:
      purpose += " using iteration"
    if complexity['has_error_handling']:
      purpose += " with error handling"
    
    self.cache[cache_key] = purpose
    return purpose

# Example usage
if __name__ == "__main__":
  code = """
def process_user_data(user_list: List[Dict], batch_size: int = 100) -> List[Dict]:
  '''Transform raw user data into processed records.'''
  results = []
  for i in range(0, len(user_list), batch_size):
    batch = user_list[i:i + batch_size]
    try:
      processed = [transform_user(user) for user in batch]
      results.extend(processed)
    except ValidationError:
      continue
  return results
  """
  
  tree = ast.parse(code)
  function_node = tree.body[0]
  
  generator = SmartPurposeGenerator(use_local_model=True)
  purpose = generator.generate_purpose(function_node)
  print(f"Generated purpose: {purpose}")