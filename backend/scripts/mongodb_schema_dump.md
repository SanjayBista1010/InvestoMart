# MongoDB Schema Dump for database `goatfarm`

## Collection: `auth_user`
*(Based on a sample of 2 documents)*

| Field Name | Inferred Types |
| ---------- | -------------- |
| `_id` | ObjectId |
| `email` | str |
| `first_name` | str |
| `id` | int |
| `is_active` | bool |
| `last_name` | str |
| `username` | str |

## Collection: `chat_messages`
*(Based on a sample of 50 documents)*

| Field Name | Inferred Types |
| ---------- | -------------- |
| `_id` | ObjectId |
| `content` | str |
| `context_size` | int |
| `cost` | float |
| `input_tokens` | int |
| `intent` | str |
| `message_id` | str |
| `model` | str |
| `output_tokens` | int |
| `response_time_ms` | int |
| `role` | str |
| `sentiment` | str |
| `session_id` | str |
| `timestamp` | datetime |
| `total_tokens` | int |

## Collection: `chatbot_analytics`
*(Based on a sample of 0 documents)*

*Collection is empty or no documents were sampled.*

## Collection: `chatbot_sessions`
*(Based on a sample of 26 documents)*

| Field Name | Inferred Types |
| ---------- | -------------- |
| `_id` | ObjectId |
| `avg_response_time_ms` | float, int |
| `error_count` | int |
| `is_active` | bool |
| `last_activity` | datetime |
| `primary_topic` | str |
| `session_duration_s` | float |
| `session_id` | str |
| `started_at` | datetime |
| `title` | str |
| `total_cost` | float |
| `total_messages` | int |
| `total_tokens_used` | int |
| `user_id` | str |

## Collection: `dashboard_analytics`
*(Based on a sample of 50 documents)*

| Field Name | Inferred Types |
| ---------- | -------------- |
| `_id` | ObjectId |
| `buffalos_count` | int |
| `chickens_count` | int |
| `cows_count` | int |
| `created_at` | datetime |
| `current_value` | int |
| `date` | datetime |
| `eggs_count` | int |
| `goats_count` | int |
| `healthy_count` | int |
| `milk_liters` | int |
| `profit_loss` | int |
| `roi_percentage` | float |
| `sick_count` | int |
| `total_animals` | int |
| `total_invested` | int |
| `user_id` | str |

## Collection: `health_records`
*(Based on a sample of 50 documents)*

| Field Name | Inferred Types |
| ---------- | -------------- |
| `_id` | ObjectId |
| `animal_id` | str |
| `created_at` | datetime |
| `date` | datetime |
| `dose_number` | int |
| `next_due_date` | datetime |
| `notes` | str |
| `record_id` | str |
| `record_type` | str |
| `total_cost` | int |
| `vaccination_status` | str |
| `vaccine_name` | str |
| `vet_name` | str |

## Collection: `livestock`
*(Based on a sample of 50 documents)*

| Field Name | Inferred Types |
| ---------- | -------------- |
| `_id` | ObjectId |
| `age_months` | int |
| `animal_id` | str |
| `birth_date` | datetime |
| `breed` | str |
| `created_at` | datetime |
| `current_value` | int |
| `current_weight` | float, int |
| `farm_id` | str |
| `gender` | str |
| `health_status` | str |
| `last_checkup` | datetime |
| `location` | str |
| `next_checkup` | datetime |
| `origin` | str |
| `owner_id` | str |
| `pen_number` | str |
| `purchase_date` | datetime |
| `purchase_price` | int |
| `status` | str |
| `tag_number` | str |
| `type` | str |

## Collection: `price_history`
*(Based on a sample of 0 documents)*

*Collection is empty or no documents were sampled.*

## Collection: `products`
*(Based on a sample of 50 documents)*

| Field Name | Inferred Types |
| ---------- | -------------- |
| `_id` | ObjectId |
| `animal_id` | str |
| `base_price` | int |
| `category` | str |
| `created_at` | datetime |
| `current_market_price` | float |
| `current_price` | float |
| `description` | str |
| `favorites` | int |
| `featured` | bool |
| `location` | str |
| `name` | str |
| `origin` | str |
| `product_id` | str |
| `risk_level` | str |
| `roi_estimate` | int |
| `seller_id` | str |
| `status` | str |
| `title` | str |
| `views` | int |

## Collection: `recommendations`
*(Based on a sample of 0 documents)*

*Collection is empty or no documents were sampled.*

## Collection: `transactions`
*(Based on a sample of 50 documents)*

| Field Name | Inferred Types |
| ---------- | -------------- |
| `_id` | ObjectId |
| `buyer_id` | str |
| `buyer_name` | str |
| `created_at` | datetime |
| `currency` | str |
| `items` | Array[Object] |
| `payment_date` | datetime |
| `payment_method` | str |
| `platform_fee` | float |
| `product_id` | str |
| `seller_id` | str |
| `status` | str |
| `subtotal` | float |
| `tax` | float |
| `total_amount` | float |
| `transaction_id` | str |
| `type` | str |

## Collection: `user_investments`
*(Based on a sample of 0 documents)*

*Collection is empty or no documents were sampled.*

## Collection: `users`
*(Based on a sample of 4 documents)*

| Field Name | Inferred Types |
| ---------- | -------------- |
| `_id` | ObjectId |
| `account_status` | str |
| `created_at` | datetime |
| `email` | str |
| `first_name` | str |
| `kyc_status` | str |
| `last_name` | str |
| `password_hash` | str |
| `phone` | str |
| `portfolio_value` | int |
| `roles` | Array[str] |
| `total_invested` | int |
| `user_id` | str |
| `username` | str |

## Collection: `video_surveillance`
*(Based on a sample of 0 documents)*

*Collection is empty or no documents were sampled.*

