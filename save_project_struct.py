# save_project.py
import os

# Save project structure to a file
with open('project_structure.txt', 'w', encoding='utf-8') as f:
    for root, dirs, files in os.walk('.'):
        # Skip __pycache__ folders
        if '__pycache__' in root:
            continue
        
        # Calculate depth for indentation
        depth = root.count(os.sep)
        indent = '    ' * depth
        
        # Write folder name
        f.write(f'{indent}{os.path.basename(root)}/\n')
        
        # Write files in this folder
        sub_indent = '    ' * (depth + 1)
        for file in files:
            if not file.endswith('.pyc'):  # Skip .pyc files
                f.write(f'{sub_indent}{file}\n')