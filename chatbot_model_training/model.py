import torch
import torch.nn as nn
import torch.nn.functional as F

class AttentionHead(nn.Module):
    def __init__(self, embed_dim, head_dim):
        super().__init__()
        self.q = nn.Linear(embed_dim, head_dim)
        self.k = nn.Linear(embed_dim, head_dim)
        self.v = nn.Linear(embed_dim, head_dim)
        
    def forward(self, hidden_state):
        attn_outputs = self._attention(
            self.q(hidden_state),
            self.k(hidden_state),
            self.v(hidden_state)
        )
        return attn_outputs
        
    def _attention(self, query, key, value):
        # Scaled dot-product attention
        attn_scores = torch.matmul(query, key.transpose(-2, -1)) / (key.size(-1) ** 0.5)
        
        # Create causal mask (lower triangular)
        seq_length = query.size(1)
        causal_mask = torch.triu(torch.ones(seq_length, seq_length), diagonal=1).bool()
        causal_mask = causal_mask.to(query.device)
        
        # Apply causal mask by setting masked positions to -inf
        attn_scores = attn_scores.masked_fill(causal_mask, -1e10)
        
        # Apply softmax to get attention weights
        attn_weights = F.softmax(attn_scores, dim=-1)
        
        # Apply attention weights to values
        return torch.matmul(attn_weights, value)

class MultiHeadAttention(nn.Module):
    def __init__(self, config):
        super().__init__()
        embed_dim = config.hidden_size
        num_heads = config.num_attention_heads
        head_dim = embed_dim // num_heads
        
        self.heads = nn.ModuleList(
            [AttentionHead(embed_dim, head_dim) for _ in range(num_heads)]
        )
        self.output_linear = nn.Linear(embed_dim, embed_dim)
        
    def forward(self, hidden_states):
        head_outputs = [head(hidden_states) for head in self.heads]
        concatenated = torch.cat(head_outputs, dim=-1)
        return self.output_linear(concatenated)

class FeedForward(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.linear1 = nn.Linear(config.hidden_size, config.intermediate_size)
        self.linear2 = nn.Linear(config.intermediate_size, config.hidden_size)
        self.activation = nn.GELU()
        self.dropout = nn.Dropout(config.hidden_dropout_prob)
        
    def forward(self, x):
        x = self.linear1(x)
        x = self.activation(x)
        x = self.dropout(x)
        x = self.linear2(x)
        return x

class TransformerBlock(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.attention = MultiHeadAttention(config)
        self.layer_norm1 = nn.LayerNorm(config.hidden_size)
        self.layer_norm2 = nn.LayerNorm(config.hidden_size)
        self.feed_forward = FeedForward(config)
        self.dropout = nn.Dropout(config.hidden_dropout_prob)
        
    def forward(self, x):
        # Self-attention with residual connection and layer norm
        residual = x
        x = self.layer_norm1(x)
        x = self.attention(x)
        x = self.dropout(x)
        x = x + residual
        
        # Feed-forward with residual connection and layer norm
        residual = x
        x = self.layer_norm2(x)
        x = self.feed_forward(x)
        x = self.dropout(x)
        x = x + residual
        
        return x

class GPTConfig:
    def __init__(
        self,
        vocab_size=30000,
        hidden_size=256,
        num_hidden_layers=4,
        num_attention_heads=4,
        intermediate_size=512,
        hidden_dropout_prob=0.1,
        max_position_embeddings=128,
    ):
        self.vocab_size = vocab_size
        self.hidden_size = hidden_size
        self.num_hidden_layers = num_hidden_layers
        self.num_attention_heads = num_attention_heads
        self.intermediate_size = intermediate_size
        self.hidden_dropout_prob = hidden_dropout_prob
        self.max_position_embeddings = max_position_embeddings

class SimpleLLM(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.config = config
        
        # Token embeddings
        self.token_embeddings = nn.Embedding(config.vocab_size, config.hidden_size)
        
        # Position embeddings
        self.position_embeddings = nn.Embedding(
            config.max_position_embeddings, config.hidden_size
        )
        
        # Transformer blocks
        self.transformer_blocks = nn.ModuleList(
            [TransformerBlock(config) for _ in range(config.num_hidden_layers)]
        )
        
        # Layer norm
        self.layer_norm = nn.LayerNorm(config.hidden_size)
        
        # Output head
        self.output = nn.Linear(config.hidden_size, config.vocab_size, bias=False)
        
        # Initialize weights
        self.apply(self._init_weights)
        
    def _init_weights(self, module):
        if isinstance(module, (nn.Linear, nn.Embedding)):
            module.weight.data.normal_(mean=0.0, std=0.02)
            if isinstance(module, nn.Linear) and module.bias is not None:
                module.bias.data.zero_()
        elif isinstance(module, nn.LayerNorm):
            module.bias.data.zero_()
            module.weight.data.fill_(1.0)
        
    def forward(self, input_ids):
        batch_size, seq_length = input_ids.size()
        
        # Get token embeddings
        token_embeds = self.token_embeddings(input_ids)
        
        # Create position IDs and embeddings
        position_ids = torch.arange(seq_length, dtype=torch.long, device=input_ids.device)
        position_ids = position_ids.unsqueeze(0).expand(batch_size, -1)
        position_embeds = self.position_embeddings(position_ids)
        
        # Combine token and position embeddings
        x = token_embeds + position_embeds
        
        # Pass through transformer blocks
        for block in self.transformer_blocks:
            x = block(x)
        
        # Apply final layer norm
        x = self.layer_norm(x)
        
        # Get logits
        logits = self.output(x)
        
        return logits
