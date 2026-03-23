import torch
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
from torch.optim import AdamW
from tokenizers import Tokenizer
from tqdm.auto import tqdm
import os
import random
import csv
import math
import time
from model import GPTConfig, SimpleLLM

# ─── CONFIG ────────────────────────────────────────────────────────────────────
MAX_SAMPLES   = 1_200_000 # Use 1.2M rows — trains on the entire combined rich CSV dataset!
MAX_LENGTH    = 128       # Token sequence length
BATCH_SIZE    = 32        # Larger batches = faster training
NUM_EPOCHS    = 20        # Increased to 20 for better convergence on dummy data
LEARNING_RATE = 5e-4
SAVE_EVERY    = 2        # Save checkpoint every N epochs
SEED          = 42
# ───────────────────────────────────────────────────────────────────────────────

random.seed(SEED)


class LivestockDataset(Dataset):
    def __init__(self, tokenized_texts, max_length, pad_id=0):
        self.input_ids = []
        for text in tokenized_texts:
            if len(text) > max_length:
                seq = text[:max_length]
            else:
                seq = text + [pad_id] * (max_length - len(text))
            self.input_ids.append(torch.tensor(seq, dtype=torch.long))

    def __len__(self):
        return len(self.input_ids)

    def __getitem__(self, idx):
        return self.input_ids[idx]


def main():
    print("=" * 60)
    print("  Livestock Chatbot LLM - Training Script")
    print("=" * 60)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # ── 1. Load tokenizer ────────────────────────────────────────────────
    tokenizer_path = "tokenizer/tokenizer.json"
    if not os.path.exists(tokenizer_path):
        raise FileNotFoundError(
            "Tokenizer not found! Run dataset_prep.py first:\n"
            "  python dataset_prep.py"
        )
    tokenizer = Tokenizer.from_file(tokenizer_path)
    pad_token_id = tokenizer.token_to_id("<pad>") or 0
    vocab_size   = tokenizer.get_vocab_size()
    print(f"Tokenizer loaded. Vocab size: {vocab_size}")

    # ── 2. Load corpus ───────────────────────────────────────────────────
    corpus_path = "data/corpus.txt"
    if not os.path.exists(corpus_path):
        raise FileNotFoundError(
            "Corpus not found! Run dataset_prep.py first:\n"
            "  python dataset_prep.py"
        )

    with open(corpus_path, "r", encoding="utf-8") as f:
        all_lines = [l.strip() for l in f if l.strip()]

    total_lines = len(all_lines)
    print(f"Total corpus lines: {total_lines:,}")

    # Sample a manageable subset for training
    if total_lines > MAX_SAMPLES:
        lines = random.sample(all_lines, MAX_SAMPLES)
        print(f"Sampled {MAX_SAMPLES:,} lines for training.")
    else:
        lines = all_lines
        print(f"Using all {total_lines:,} lines.")

    # ── 3. Tokenize ──────────────────────────────────────────────────────
    print("Tokenizing corpus (this may take a minute)...")
    eos_token = "</s>"
    encoded_texts = [
        tokenizer.encode(line + " " + eos_token).ids
        for line in tqdm(lines, desc="Tokenizing")
    ]

    # ── 4. Build dataset & dataloader ────────────────────────────────────
    dataset   = LivestockDataset(encoded_texts, MAX_LENGTH, pad_id=pad_token_id)
    dataloader = DataLoader(
        dataset,
        batch_size=BATCH_SIZE,
        shuffle=True,
        num_workers=0,   # Keep 0 for Windows compatibility
        pin_memory=(device.type == "cuda"),
    )
    print(f"Dataset: {len(dataset):,} samples | {len(dataloader):,} batches/epoch")

    # ── 5. Model ─────────────────────────────────────────────────────────
    config = GPTConfig(
        vocab_size=vocab_size,
        hidden_size=256,
        num_hidden_layers=4,
        num_attention_heads=4,
        intermediate_size=512,
        hidden_dropout_prob=0.1,
        max_position_embeddings=MAX_LENGTH,
    )

    # Resume from checkpoint if available
    os.makedirs("weights", exist_ok=True)
    checkpoint_path = "weights/checkpoint_latest.pt"
    start_epoch = 0
    model = SimpleLLM(config).to(device)

    if os.path.exists(checkpoint_path):
        print(f"Resuming from checkpoint: {checkpoint_path}")
        ckpt = torch.load(checkpoint_path, map_location=device)
        model.load_state_dict(ckpt["model_state"])
        start_epoch = ckpt.get("epoch", 0)
        print(f"Resuming from epoch {start_epoch + 1}")
    else:
        print("Starting fresh training run.")

    total_params = sum(p.numel() for p in model.parameters())
    print(f"Model parameters: {total_params:,}")

    # ── 6. Optimizer ─────────────────────────────────────────────────────
    optimizer = AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=0.01)

    # Linear warmup + cosine decay scheduler
    total_steps = NUM_EPOCHS * len(dataloader)
    warmup_steps = min(500, total_steps // 10)

    def lr_lambda(current_step):
        if current_step < warmup_steps:
            return float(current_step) / float(max(1, warmup_steps))
        progress = float(current_step - warmup_steps) / float(max(1, total_steps - warmup_steps))
        return max(0.05, 0.5 * (1.0 + torch.cos(torch.tensor(3.14159 * progress)).item()))

    scheduler = torch.optim.lr_scheduler.LambdaLR(optimizer, lr_lambda)

    # ── 6.5 Init CSV Logging ─────────────────────────────────────────────
    csv_file_path = "weights/training_metrics.csv"
    write_header = not os.path.exists(csv_file_path) or start_epoch == 0
    if start_epoch == 0 and os.path.exists(csv_file_path):
        # overwrite if starting fresh
        csv_file = open(csv_file_path, mode='w', newline='')
        write_header = True
    else:
        csv_file = open(csv_file_path, mode='a', newline='')
    
    csv_writer = csv.writer(csv_file)
    if write_header:
        csv_writer.writerow([
            "Epoch", "Global_Step", "Loss", "Perplexity", 
            "Learning_Rate", "Batch_Time_sec", "Tokens_Per_Sec", "Total_Time_Elapsed_sec"
        ])
    
    global_step = start_epoch * len(dataloader)
    start_time = time.time()

    # ── 7. Training loop ─────────────────────────────────────────────────
    print("\nStarting training...")
    print(f"  Epochs : {NUM_EPOCHS}")
    print(f"  Batches/epoch: {len(dataloader):,}")
    print(f"  Batch size: {BATCH_SIZE}")
    print("-" * 60)

    model.train()
    best_loss = float("inf")

    for epoch in range(start_epoch, NUM_EPOCHS):
        epoch_loss = 0.0
        bar = tqdm(dataloader, desc=f"Epoch {epoch+1}/{NUM_EPOCHS}")

        for batch_input_ids in bar:
            step_start_time = time.time()
            input_ids = batch_input_ids.to(device)
            labels    = input_ids.clone()

            optimizer.zero_grad()

            logits = model(input_ids)

            # Next-token prediction: shift by one
            shift_logits = logits[..., :-1, :].contiguous()
            shift_labels = labels[..., 1:].contiguous()

            loss = F.cross_entropy(
                shift_logits.view(-1, shift_logits.size(-1)),
                shift_labels.view(-1),
                ignore_index=pad_token_id,
            )

            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            scheduler.step()

            epoch_loss += loss.item()
            current_lr = scheduler.get_last_lr()[0]
            
            # Metrics calculations
            step_time = time.time() - step_start_time
            tokens_in_batch = input_ids.numel()
            tokens_per_sec = tokens_in_batch / step_time if step_time > 0 else 0
            perplexity = math.exp(loss.item()) if loss.item() < 20 else float('inf')
            global_step += 1
            total_elapsed = time.time() - start_time
            
            # Log to CSV
            csv_writer.writerow([
                epoch + 1,
                global_step,
                round(loss.item(), 4),
                round(perplexity, 4),
                f"{current_lr:.6e}",
                round(step_time, 4),
                round(tokens_per_sec, 2),
                round(total_elapsed, 2)
            ])
            csv_file.flush()

            bar.set_postfix(loss=f"{loss.item():.4f}", lr=f"{current_lr:.2e}")

        avg_loss = epoch_loss / len(dataloader)
        print(f"Epoch {epoch+1}/{NUM_EPOCHS}  avg_loss={avg_loss:.4f}")

        # Save checkpoint periodically
        if (epoch + 1) % SAVE_EVERY == 0:
            torch.save(
                {"epoch": epoch + 1, "model_state": model.state_dict()},
                checkpoint_path,
            )
            print(f"  ✓ Checkpoint saved to {checkpoint_path}")

        # Save best model
        if avg_loss < best_loss:
            best_loss = avg_loss
            torch.save(model.state_dict(), "weights/simple_llm_best.pt")
            print(f"  ✓ Best model updated (loss={best_loss:.4f})")

    # ── 8. Final save ────────────────────────────────────────────────────
    torch.save(model.state_dict(), "weights/simple_llm_final.pt")
    csv_file.close()
    print("\n" + "=" * 60)
    print(f"  Training complete!")
    print(f"  Final loss : {best_loss:.4f}")
    print(f"  Weights saved to: weights/simple_llm_final.pt")
    print("=" * 60)


if __name__ == "__main__":
    main()
