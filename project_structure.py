import os

# ===== CONFIGURATION =====
ROOT_DIR = "."  # Change if script is not in project root
OUTPUT_FILE = "project_structure.txt"

IGNORE_DIRS = {
    "node_modules",
    "venv",
    "env",
    "__pycache__",
    ".git",
    ".idea",
    ".vscode",
    "dist",
    "build",
    ".next",
}

IGNORE_FILES = {
    ".DS_Store",
}

# =========================

def save_structure(root_dir, file_handle, prefix=""):
    items = sorted(os.listdir(root_dir))

    for index, item in enumerate(items):
        path = os.path.join(root_dir, item)

        if item in IGNORE_DIRS or item in IGNORE_FILES:
            continue

        connector = "└── " if index == len(items) - 1 else "├── "
        file_handle.write(prefix + connector + item + "\n")

        if os.path.isdir(path):
            extension = "    " if index == len(items) - 1 else "│   "
            save_structure(path, file_handle, prefix + extension)


def main():
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        project_name = os.path.basename(os.path.abspath(ROOT_DIR))
        f.write(project_name + "\n")
        save_structure(ROOT_DIR, f)

    print(f"✅ Project structure saved to '{OUTPUT_FILE}'")


if __name__ == "__main__":
    main()
