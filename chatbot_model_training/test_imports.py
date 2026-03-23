import traceback
lines = [
    'import torch',
    'import torch.nn.functional as F',
    'from torch.utils.data import Dataset, DataLoader',
    'from torch.optim import AdamW',
    'from tokenizers import Tokenizer',
    'from tqdm.auto import tqdm',
    'import os',
    'from model import GPTConfig, SimpleLLM'
]
for line in lines:
    try:
        exec(line)
        print(f"OK: {line}")
    except Exception as e:
        print(f"ERROR on {line}: {e}")
        break
