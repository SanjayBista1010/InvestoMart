import pymongo
from pymongo import MongoClient
from datetime import datetime, timedelta
from decouple import config

class MongoDBManager:
    def __init__(self):
        self.mongo_uri = config('MONGO_URI', default=None)
        if not self.mongo_uri:
            print("❌ MONGO_URI missing in environment variables!")
        self.db_name = config('MONGO_DB_NAME', default='investomart')
        self.client = None
        self.db = None

    def connect(self):
        """Connect to MongoDB"""
        if self.client is None:
            print(f"🔌 [MONGO] Connecting to URI: {self.mongo_uri[:25]}... DB: {self.db_name}")
            try:
                self.client = MongoClient(self.mongo_uri)
                self.db = self.client[self.db_name]
                self.client.admin.command('ping')
                print("✅ [MONGO] Connection Successful!")
            except Exception as e:
                print(f"❌ [MONGO] Connection FAILED: {e}")
                self.client = None
                self.db = None
        return self.db

    def save_chat_message(
        self,
        user_django_id,
        user_message,
        bot_response,
        metrics=None,
        session_id=None,
        sentiment='neutral',
        intent='general',
        wall_clock_ms=0,
    ):
        print(f"💾 [MONGO] Attempting to save message... Session: {session_id}")
        self.connect()
        if not self.db:
            print("❌ [MONGO] Skipping save - No Database Connection")
            return session_id

        try:
            # Link to enterprise user_id if possible
            if user_django_id != "anonymous":
                auth_user = self.db['auth_user'].find_one({'id': user_django_id})
                mongo_user_id = str(auth_user['_id']) if auth_user else "anonymous"
            else:
                mongo_user_id = "anonymous"

            # Generate or use existing session
            if not session_id:
                latest_session = self.db['chatbot_sessions'].find_one(
                    {'user_id': mongo_user_id},
                    sort=[('started_at', pymongo.DESCENDING)]
                )
                if latest_session and (datetime.utcnow() - latest_session['last_activity']).seconds < 3600:
                    session_id = latest_session['session_id']
                else:
                    session_id = f"SESSION_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
                    title = (user_message[:30] + '...') if len(user_message) > 30 else user_message

                    self.db['chatbot_sessions'].insert_one({
                        'session_id': session_id,
                        'user_id': mongo_user_id,
                        'title': title,
                        'started_at': datetime.utcnow(),
                        'last_activity': datetime.utcnow(),
                        'total_messages': 0,
                        'total_tokens_used': 0,
                        'total_cost': 0.0,
                        'avg_response_time_ms': 0.0,
                        'error_count': 0,
                        'is_active': True,
                    })
                    print(f"🆕 [MONGO] Created new session: {title}")

            # ── Derived metrics ────────────────────────────────────────────
            m = metrics or {}
            input_tokens      = m.get('input_tokens', 0)
            output_tokens     = m.get('output_tokens', 0)
            total_tokens      = m.get('total_tokens', 0)
            ollama_ms         = m.get('total_duration_ms', 0)
            tokens_per_second = m.get('tokens_per_second', 0)
            model_name        = m.get('model', 'unknown')

            # Cost estimate: $0.03 / 1k tokens
            cost = (total_tokens / 1000) * 0.03

            # Message / word counts
            user_msg_len  = len(user_message)
            user_words    = len(user_message.split())
            bot_msg_len   = len(bot_response)
            bot_words     = len(bot_response.split())

            now = datetime.utcnow()

            # ── Save user message ──────────────────────────────────────────
            user_doc = {
                'message_id':          f"MSG_{now.strftime('%y%m%d%H%M%S%f')}",
                'session_id':          session_id,
                'role':                'user',
                'content':             user_message,
                'timestamp':           now,
                'message_length':      user_msg_len,
                'word_count':          user_words,
                'sentiment':           sentiment,
                'intent':              intent,
                'error':               False,
            }
            self.db['chat_messages'].insert_one(user_doc)

            # ── Save assistant response with full metrics ──────────────────
            assistant_doc = {
                'message_id':           f"MSG_{now.strftime('%y%m%d%H%M%S%f')}_bot",
                'session_id':           session_id,
                'role':                 'assistant',
                'content':              bot_response,
                'timestamp':            now,
                # Response timing
                'wall_clock_ms':        wall_clock_ms,       # full request→response latency
                'ollama_duration_ms':   ollama_ms,           # Ollama-only processing time
                'prompt_eval_ms':       m.get('prompt_eval_duration_ms', 0),
                'eval_ms':              m.get('eval_duration_ms', 0),
                'load_duration_ms':     m.get('load_duration_ms', 0),
                # Token usage
                'input_tokens':         input_tokens,
                'output_tokens':        output_tokens,
                'total_tokens':         total_tokens,
                'context_tokens':       input_tokens,        # tokens used for context
                'tokens_per_second':    tokens_per_second,
                # Message quality
                'message_length':       bot_msg_len,
                'word_count':           bot_words,
                'user_message_length':  user_msg_len,
                'user_word_count':      user_words,
                # Cost
                'cost_usd':             cost,
                # Classification
                'model':                model_name,
                'sentiment':            sentiment,
                'intent':               intent,
                'error':                False,
            }
            self.db['chat_messages'].insert_one(assistant_doc)

            # ── Update session aggregates (rolling avg response time) ──────
            session_doc = self.db['chatbot_sessions'].find_one({'session_id': session_id})
            prev_msgs    = session_doc.get('total_messages', 0) if session_doc else 0
            prev_avg     = session_doc.get('avg_response_time_ms', 0.0) if session_doc else 0.0
            new_turn_n   = (prev_msgs // 2) + 1  # number of completed turns after this one
            new_avg      = ((prev_avg * (new_turn_n - 1)) + wall_clock_ms) / new_turn_n

            session_start = session_doc.get('started_at', now) if session_doc else now
            session_duration_s = (now - session_start).total_seconds()

            self.db['chatbot_sessions'].update_one(
                {'session_id': session_id},
                {
                    '$inc': {
                        'total_messages':    2,
                        'total_tokens_used': total_tokens,
                        'total_cost':        cost,
                    },
                    '$set': {
                        'last_activity':        now,
                        'primary_topic':        intent,
                        'avg_response_time_ms': round(new_avg, 2),
                        'session_duration_s':   round(session_duration_s, 1),
                    }
                }
            )

            print(f"✅ [MONGO] Saved. wall_clock={wall_clock_ms}ms, tps={tokens_per_second}, session={session_id}")
            return session_id

        except Exception as e:
            print(f"❌ [MONGO] Error in save_chat_message: {e}")
            import traceback
            traceback.print_exc()
            return session_id

    # ── Error metric logger ───────────────────────────────────────────────
    def log_error_metric(self, session_id, error_type, error_msg, user_message=''):
        """Log a failed chatbot turn to chat_messages with error=True."""
        self.connect()
        if not self.db:
            return
        try:
            now = datetime.utcnow()
            self.db['chat_messages'].insert_one({
                'message_id':     f"ERR_{now.strftime('%y%m%d%H%M%S%f')}",
                'session_id':     session_id,
                'role':           'error',
                'content':        error_msg,
                'error_type':     error_type,
                'user_message':   user_message,
                'timestamp':      now,
                'error':          True,
                'wall_clock_ms':  0,
                'total_tokens':   0,
            })
            # Increment error count on the session
            self.db['chatbot_sessions'].update_one(
                {'session_id': session_id},
                {'$inc': {'error_count': 1}}
            )
        except Exception as e:
            print(f"❌ [MONGO] log_error_metric failed: {e}")

    # ── Metrics summary ───────────────────────────────────────────────────
    def get_metrics_summary(self, days=30):
        """
        Return a comprehensive metrics summary for the last `days` days.
        Used by the /api/chatbot/metrics/ endpoint.
        """
        self.connect()
        if not self.db:
            return {}

        since = datetime.utcnow() - timedelta(days=days)

        # ── Session-level stats ──────────────────────────────────────────
        sessions_cursor = self.db['chatbot_sessions'].find({'started_at': {'$gte': since}})
        sessions_list = list(sessions_cursor)
        total_sessions = len(sessions_list)
        total_session_tokens = sum(s.get('total_tokens_used', 0) for s in sessions_list)
        total_session_cost   = sum(s.get('total_cost', 0.0) for s in sessions_list)

        # ── Message-level stats (assistant messages only) ────────────────
        pipeline_base = [
            {'$match': {
                'role': 'assistant',
                'error': False,
                'timestamp': {'$gte': since},
            }}
        ]

        # Aggregate core stats
        core_stats = list(self.db['chat_messages'].aggregate(pipeline_base + [
            {'$group': {
                '_id': None,
                'total_messages':       {'$sum': 1},
                'total_tokens':         {'$sum': '$total_tokens'},
                'total_cost':           {'$sum': '$cost_usd'},
                'avg_wall_clock_ms':    {'$avg': '$wall_clock_ms'},
                'min_wall_clock_ms':    {'$min': '$wall_clock_ms'},
                'max_wall_clock_ms':    {'$max': '$wall_clock_ms'},
                'avg_ollama_ms':        {'$avg': '$ollama_duration_ms'},
                'avg_tokens_per_second':{'$avg': '$tokens_per_second'},
                'avg_output_tokens':    {'$avg': '$output_tokens'},
                'avg_bot_words':        {'$avg': '$word_count'},
                'avg_user_words':       {'$avg': '$user_word_count'},
            }}
        ]))
        stats = core_stats[0] if core_stats else {}
        stats.pop('_id', None)
        # Round floats
        for k, v in stats.items():
            if isinstance(v, float):
                stats[k] = round(v, 2)

        # Intent breakdown
        intent_pipeline = pipeline_base + [
            {'$group': {'_id': '$intent', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}},
            {'$limit': 10},
        ]
        intent_breakdown = {
            d['_id']: d['count']
            for d in self.db['chat_messages'].aggregate(intent_pipeline)
        }

        # Sentiment breakdown
        sentiment_pipeline = pipeline_base + [
            {'$group': {'_id': '$sentiment', 'count': {'$sum': 1}}},
        ]
        sentiment_breakdown = {
            d['_id']: d['count']
            for d in self.db['chat_messages'].aggregate(sentiment_pipeline)
        }

        # Daily message counts (all roles)
        daily_pipeline = [
            {'$match': {'timestamp': {'$gte': since}, 'role': 'assistant', 'error': False}},
            {'$group': {
                '_id': {
                    'year':  {'$year': '$timestamp'},
                    'month': {'$month': '$timestamp'},
                    'day':   {'$dayOfMonth': '$timestamp'},
                },
                'count': {'$sum': 1}
            }},
            {'$sort': {'_id': 1}},
        ]
        daily_counts = []
        for d in self.db['chat_messages'].aggregate(daily_pipeline):
            day_str = f"{d['_id']['year']}-{d['_id']['month']:02d}-{d['_id']['day']:02d}"
            daily_counts.append({'date': day_str, 'messages': d['count']})

        # Error rate
        total_error_docs = self.db['chat_messages'].count_documents({
            'error': True, 'timestamp': {'$gte': since}
        })
        total_assistant_docs = stats.get('total_messages', 0)
        total_turns = total_assistant_docs + total_error_docs
        error_rate_pct = round((total_error_docs / total_turns) * 100, 2) if total_turns > 0 else 0.0

        # Tokens vs Latency: bucket messages by output_tokens range, show avg latency per bucket
        token_buckets_pipeline = [
            {'$match': {
                'role': 'assistant',
                'error': False,
                'timestamp': {'$gte': since},
                'output_tokens': {'$gt': 0},
                'wall_clock_ms': {'$gt': 0},
            }},
            {'$bucket': {
                'groupBy': '$output_tokens',
                'boundaries': [0, 50, 100, 150, 200, 300, 400, 600, 800, 1200],
                'default': '1200+',
                'output': {
                    'count': {'$sum': 1},
                    'avg_latency_ms': {'$avg': '$wall_clock_ms'},
                    'avg_chars': {'$avg': '$message_length'},
                }
            }},
            {'$sort': {'_id': 1}},
        ]
        tokens_vs_latency = []
        try:
            for b in self.db['chat_messages'].aggregate(token_buckets_pipeline):
                bucket_label = str(b['_id']) if b['_id'] != '1200+' else '1200+'
                try:
                    next_boundary_map = {0:50, 50:100, 100:150, 150:200, 200:300, 300:400, 400:600, 600:800, 800:1200}
                    start = int(bucket_label)
                    end = next_boundary_map.get(start, start + 200)
                    label = f"{start}–{end} tok"
                except (ValueError, TypeError):
                    label = f"{bucket_label} tok"

                tokens_vs_latency.append({
                    'bucket': label,
                    'avg_latency_ms': round(b.get('avg_latency_ms', 0), 1),
                    'avg_chars': round(b.get('avg_chars', 0), 0),
                    'count': b.get('count', 0),
                })
        except Exception as e:
            print(f"[MONGO] tokens_vs_latency aggregation error: {e}")

        return {
            'period_days':          days,
            'total_sessions':       total_sessions,
            'total_messages':       total_assistant_docs,
            'total_errors':         total_error_docs,
            'error_rate_pct':       error_rate_pct,
            'total_tokens':         stats.get('total_tokens', total_session_tokens),
            'total_cost_usd':       round(stats.get('total_cost', total_session_cost), 4),
            # Response timing
            'avg_wall_clock_ms':    stats.get('avg_wall_clock_ms', 0),
            'min_wall_clock_ms':    stats.get('min_wall_clock_ms', 0),
            'max_wall_clock_ms':    stats.get('max_wall_clock_ms', 0),
            'avg_ollama_ms':        stats.get('avg_ollama_ms', 0),
            # Throughput
            'avg_tokens_per_second':stats.get('avg_tokens_per_second', 0),
            'avg_output_tokens':    stats.get('avg_output_tokens', 0),
            # Message quality
            'avg_bot_words':        stats.get('avg_bot_words', 0),
            'avg_user_words':       stats.get('avg_user_words', 0),
            # Classification
            'intent_breakdown':     intent_breakdown,
            'sentiment_breakdown':  sentiment_breakdown,
            'daily_counts':         daily_counts,
            # Performance correlation
            'tokens_vs_latency':    tokens_vs_latency,
        }

    # ── Existing methods (unchanged) ──────────────────────────────────────
    def get_chat_history(self, session_id, limit=6):
        """Retrieve recent chat history for context"""
        print(f"[MONGO] Fetching history for session: '{session_id}'")
        if not session_id: return []
        self.connect()
        cursor = self.db['chat_messages'].find(
            {'session_id': session_id},
            sort=[('timestamp', pymongo.DESCENDING)],
            limit=limit
        )
        messages = list(cursor)
        print(f"[MONGO] Found {len(messages)} raw messages in DB.")
        messages.reverse()
        history = []
        for msg in messages:
            role = "Assistant" if msg.get('role') == 'assistant' else "User"
            history.append(f"[{role}]: {msg.get('content')}")
        print(f"[MONGO] Successfully formatted {len(history)} history lines.")
        return history

    def get_user_sessions(self, django_user_id):
        """Fetch all sessions for a specific user"""
        self.connect()
        if not self.db: return []
        auth_user = self.db['auth_user'].find_one({'id': django_user_id})
        mongo_user_id = str(auth_user['_id']) if auth_user else "anonymous"
        if mongo_user_id == "anonymous":
            return []
        cursor = self.db['chatbot_sessions'].find(
            {'user_id': mongo_user_id},
            sort=[('last_activity', pymongo.DESCENDING)]
        )
        sessions = []
        for s in cursor:
            sessions.append({
                'session_id':    s.get('session_id'),
                'title':         s.get('title', 'Untitled Chat'),
                'last_activity': s.get('last_activity').isoformat() if s.get('last_activity') else None,
                'total_messages':s.get('total_messages', 0),
            })
        return sessions

    def update_session_title(self, session_id, new_title):
        """Update the title of a specific chat session."""
        print(f"[MONGO] Updating title for session: {session_id}")
        self.connect()
        if not self.db:
            return False
        try:
            result = self.db['chatbot_sessions'].update_one(
                {'session_id': session_id},
                {'$set': {'title': new_title}}
            )
            return result.matched_count > 0
        except Exception as e:
            print(f"❌ [MONGO] Error updating session title: {e}")
            return False

    def get_full_session_messages(self, session_id):
        """Retrieve ALL messages for a session to hydrate the UI"""
        self.connect()
        if not self.db: return []
        cursor = self.db['chat_messages'].find(
            {'session_id': session_id},
            sort=[('timestamp', pymongo.ASCENDING)]
        )
        messages = []
        for msg in cursor:
            messages.append({
                'text':      msg.get('content'),
                'sender':    'bot' if msg.get('role') == 'assistant' else 'user',
                'timestamp': msg.get('timestamp').isoformat() if msg.get('timestamp') else None,
            })
        return messages

    def get_user_investments(self, django_user_id):
        self.connect()
        auth_user = self.db['auth_user'].find_one({'id': django_user_id})
        if not auth_user: return []
        mongo_user_id = str(auth_user['_id'])
        investments_cursor = self.db['user_investments'].find({'user_id': mongo_user_id})
        investments = []
        for inv in investments_cursor:
            product = self.db['products'].find_one({'_id': inv['product_id']})
            product_name = product['name'] if product else "Unknown Product"
            investments.append({
                'product_name':     product_name,
                'quantity':         inv.get('quantity', 0),
                'purchase_price':   inv.get('purchase_price', 0),
                'current_value':    inv.get('current_value', 0),
                'total_investment': inv.get('total_investment', 0),
                'purchase_date':    inv.get('purchase_date'),
            })
        return investments


mongo_manager = MongoDBManager()
