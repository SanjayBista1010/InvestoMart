import pandas as pd
import os
import glob
from tokenizers import Tokenizer
from tokenizers.models import WordLevel
from tokenizers.trainers import WordLevelTrainer
from tokenizers.pre_tokenizers import Whitespace

def format_row(row):
    # Formats the tabular data into a sequence the LLM can learn context from.
    # We use special token tags to define the structure.
    return f"<animal>{row['animal']}</animal> <breed>{row['breed']}</breed> <category>{row['category']}</category> <question>{row['question']}</question> <answer>{row['answer']}</answer>"

def prepare_data():
    print("Loading dataset chunks...")
    
    csv_files = ['data/livestock_rich_paragraphs.csv', 'data/general_everyday_chat.csv']
    if not os.path.exists(csv_files[0]) or not os.path.exists(csv_files[1]):
        print("Required dataset CSV files not found in data/ directory.")
        return None
        
    dfs = []
    for file in csv_files:
        print(f"Reading {file}...")
        dfs.append(pd.read_csv(file))
        
    df = pd.concat(dfs, ignore_index=True)
    
    # Fill NaN values to prevent errors
    df = df.fillna("Unknown")
    
    print("Formatting dataset to text corpus...")
    formatted_texts = df.apply(format_row, axis=1).tolist()
    
    # Write to a single text corpus file for the tokenizer
    corpus_path = 'data/corpus.txt'
    with open(corpus_path, 'w', encoding='utf-8') as f:
        for text in formatted_texts:
            f.write(text + "\n")
            
    print(f"Corpus generated with {len(formatted_texts)} examples.")
    return corpus_path

def train_tokenizer(corpus_path):
    print("Training WordLevel Tokenizer from scratch...")
    tokenizer = Tokenizer(WordLevel(unk_token="<unk>"))
    tokenizer.pre_tokenizer = Whitespace()
    
    # We define special tokens including our custom structural tags
    special_tokens = [
        "<s>", "<pad>", "</s>", "<unk>", "<mask>",
        "<animal>", "</animal>", "<breed>", "</breed>", 
        "<category>", "</category>", "<question>", "</question>", 
        "<answer>", "</answer>"
    ]
    
    trainer = WordLevelTrainer(
        vocab_size=10000,
        min_frequency=1,
        special_tokens=special_tokens
    )
    
    tokenizer.train(files=[corpus_path], trainer=trainer)
    
    # Save the tokenizer files
    os.makedirs('tokenizer', exist_ok=True)
    tokenizer.save("tokenizer/tokenizer.json")
    print("Tokenizer trained and saved to tokenizer/ !!")

if __name__ == "__main__":
    corpus_path = prepare_data()
    if corpus_path:
        train_tokenizer(corpus_path)
