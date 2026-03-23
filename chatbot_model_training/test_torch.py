import traceback
try:
    import torch
except Exception as e:
    with open('torch_err.txt', 'w') as f:
        traceback.print_exc(file=f)
