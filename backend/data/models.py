"""
Enterprise-level Django models for Investomart Platform
Maps to MongoDB collections via djongo
"""

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


# ==================== USER MODELS ====================

class User(AbstractUser):
    """Extended User model with enterprise features"""
    user_id = models.CharField(max_length=50, unique=True, db_index=True)
    
    # Profile
    phone = models.CharField(max_length=20, blank=True)
    avatar_url = models.URLField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    last_name_change = models.DateTimeField(null=True, blank=True)
    
    # Address
    street = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    
    # KYC Data
    citizenship_no = models.CharField(max_length=50, blank=True)
    pan_no = models.CharField(max_length=50, blank=True)
    temp_address = models.CharField(max_length=255, blank=True)
    perm_address = models.CharField(max_length=255, blank=True)
    citizenship_front_url = models.URLField(blank=True)
    citizenship_back_url = models.URLField(blank=True)
    pan_url = models.URLField(blank=True)
    kyc_submitted_at = models.DateTimeField(null=True, blank=True)
    email_verification_token = models.CharField(max_length=64, blank=True)
    is_email_verified = models.BooleanField(default=False)
    
    kyc_status = models.CharField(
        max_length=20,
        choices=[('pending', 'Pending'), ('verified', 'Verified'), ('rejected', 'Rejected')],
        default='pending'
    )
    
    # Preferences
    language = models.CharField(max_length=10, default='en')
    currency = models.CharField(max_length=5, default='USD')
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    push_notifications = models.BooleanField(default=True)
    
    # Status
    account_status = models.CharField(
        max_length=20,
        choices=[('active', 'Active'), ('suspended', 'Suspended'), ('closed', 'Closed')],
        default='active'
    )
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'


# ==================== LIVESTOCK MODELS ====================

class Livestock(models.Model):
    """Core livestock/animal model"""
    animal_id = models.CharField(max_length=50, unique=True, db_index=True)
    type = models.CharField(
        max_length=20,
        choices=[('goat', 'Goat'), ('chicken', 'Chicken'), ('buffalo', 'Buffalo'), 
                 ('cow', 'Cow'), ('sheep', 'Sheep')]
    )
    breed = models.CharField(max_length=100)
    sub_breed = models.CharField(max_length=100, blank=True)
    
    # Profile
    name = models.CharField(max_length=100, blank=True)
    tag_number = models.CharField(max_length=50, unique=True)
    rfid = models.CharField(max_length=50, blank=True)
    birth_date = models.DateField()
    gender = models.CharField(max_length=10, choices=[('male', 'Male'), ('female', 'Female')])
    color = models.CharField(max_length=50, blank=True)
    markings = models.TextField(blank=True)
    
    # Ownership
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='livestock')
    purchase_date = models.DateField()
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    current_value = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Physical
    current_weight = models.DecimalField(max_digits=8, decimal_places=2, help_text="Weight in kg")
    height = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    body_condition_score = models.IntegerField(null=True, blank=True)
    
    # Health
    health_status = models.CharField(
        max_length=20,
        choices=[('healthy', 'Healthy'), ('sick', 'Sick'), 
                 ('quarantine', 'Quarantine'), ('deceased', 'Deceased')],
        default='healthy'
    )
    last_checkup = models.DateField(null=True, blank=True)
    next_checkup = models.DateField(null=True, blank=True)
    
    # Location
    farm_id = models.CharField(max_length=50)
    pen_number = models.CharField(max_length=50, blank=True)
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=[('active', 'Active'), ('sold', 'Sold'), 
                 ('deceased', 'Deceased'), ('transferred', 'Transferred')],
        default='active'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'livestock'
        indexes = [
            models.Index(fields=['animal_id']),
            models.Index(fields=['owner', 'status']),
            models.Index(fields=['type', 'status']),
        ]


# ==================== HEALTH RECORDS ====================

class HealthRecord(models.Model):
    """Medical records for livestock"""
    record_id = models.CharField(max_length=50, unique=True, db_index=True)
    animal = models.ForeignKey(Livestock, on_delete=models.CASCADE, related_name='health_records')
    
    record_type = models.CharField(
        max_length=20,
        choices=[('vaccination', 'Vaccination'), ('treatment', 'Treatment'),
                 ('checkup', 'Checkup'), ('surgery', 'Surgery'), ('test', 'Test')]
    )
    date = models.DateField(db_index=True)
    
    # Veterinarian
    vet_name = models.CharField(max_length=100)
    vet_license = models.CharField(max_length=50, blank=True)
    vet_contact = models.CharField(max_length=50, blank=True)
    
    # Vaccination fields
    vaccine_name = models.CharField(max_length=100, blank=True)
    dose_number = models.IntegerField(null=True, blank=True)
    batch_number = models.CharField(max_length=50, blank=True)
    next_due_date = models.DateField(null=True, blank=True)
    vaccination_status = models.CharField(
        max_length=20,
        choices=[('completed', 'Completed'), ('due_soon', 'Due Soon'),
                 ('overdue', 'Overdue'), ('assigned', 'Assigned')],
        blank=True
    )
    
    # Treatment fields
    diagnosis = models.TextField(blank=True)
    symptoms = models.TextField(blank=True)
    procedure = models.TextField(blank=True)
    outcome = models.TextField(blank=True)
    
    # Cost
    consultation_cost = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    medication_cost = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    procedure_cost = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total_cost = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    
    # Follow-up
    follow_up_required = models.BooleanField(default=False)
    follow_up_date = models.DateField(null=True, blank=True)
    
    notes = models.TextField(blank=True)
    performed_by = models.CharField(max_length=100)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'health_records'
        indexes = [
            models.Index(fields=['animal', 'date']),
            models.Index(fields=['record_type']),
        ]


# ==================== PRODUCTS (FOR SALE) ====================

class Product(models.Model):
    """Livestock products for sale"""
    product_id = models.CharField(max_length=50, unique=True, db_index=True)
    animal = models.ForeignKey(Livestock, on_delete=models.CASCADE, null=True, blank=True)
    
    # Listing
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=50)
    tags = models.TextField(blank=True, help_text="Comma-separated tags")
    image_url = models.URLField(max_length=500, blank=True, null=True)
    
    # Pricing
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    current_price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=5, default='USD')
    price_per_share = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_shares = models.IntegerField(default=1)
    shares_sold = models.IntegerField(default=0)
    
    # Seller
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')
    farm_id = models.CharField(max_length=50, blank=True)
    seller_verified = models.BooleanField(default=False)
    
    # Investment
    roi_estimate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    risk_level = models.CharField(
        max_length=10,
        choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')],
        default='medium'
    )
    
    # Availability
    status = models.CharField(
        max_length=20,
        choices=[('active', 'Active'), ('sold', 'Sold'), 
                 ('reserved', 'Reserved'), ('delisted', 'Delisted')],
        default='active'
    )
    quantity = models.IntegerField(default=1)
    location = models.CharField(max_length=100)
    
    # Analytics
    views = models.IntegerField(default=0)
    favorites = models.IntegerField(default=0)
    
    featured = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products'
        indexes = [
            models.Index(fields=['product_id']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['seller']),
        ]


# ==================== TRANSACTIONS ====================

class Transaction(models.Model):
    """Financial transactions"""
    transaction_id = models.CharField(max_length=50, unique=True, db_index=True)
    
    type = models.CharField(
        max_length=20,
        choices=[('purchase', 'Purchase'), ('sale', 'Sale'), 
                 ('dividend', 'Dividend'), ('fee', 'Fee'), ('refund', 'Refund')]
    )
    category = models.CharField(max_length=50, default='livestock')
    
    status = models.CharField(
        max_length=20,
        choices=[('pending', 'Pending'), ('processing', 'Processing'),
                 ('completed', 'Completed'), ('failed', 'Failed'),
                 ('cancelled', 'Cancelled'), ('refunded', 'Refunded')],
        default='pending'
    )
    
    buyer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='purchases')
    seller = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sales')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Financial
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=5, default='USD')
    
    # Payment
    payment_method = models.CharField(max_length=50)
    payment_provider = models.CharField(max_length=50, blank=True)
    payment_reference = models.CharField(max_length=100, blank=True)
    payment_date = models.DateTimeField(null=True, blank=True)
    
    # Invoice
    invoice_number = models.CharField(max_length=50, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'transactions'
        indexes = [
            models.Index(fields=['transaction_id']),
            models.Index(fields=['buyer', 'created_at']),
            models.Index(fields=['seller', 'created_at']),
            models.Index(fields=['status']),
        ]


# ==================== CHATBOT MODELS ====================

class ChatbotSession(models.Model):
    """Chatbot conversation sessions with analytics"""
    session_id = models.CharField(max_length=50, unique=True, db_index=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='chat_sessions')
    
    # Metadata
    title = models.CharField(max_length=200, default='New chat')
    auto_generated_title = models.BooleanField(default=False)
    started_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    device = models.CharField(max_length=100, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    # Analytics Summary
    total_messages = models.IntegerField(default=0)
    total_tokens_used = models.IntegerField(default=0)
    total_cost = models.DecimalField(max_digits=10, decimal_places=6, default=0)
    avg_response_time_ms = models.IntegerField(default=0)
    
    # Sentiment & Context
    primary_topic = models.CharField(max_length=100, blank=True)
    sentiment = models.CharField(
        max_length=20,
        choices=[('positive', 'Positive'), ('neutral', 'Neutral'), ('negative', 'Negative')],
        blank=True
    )
    user_satisfaction = models.IntegerField(null=True, blank=True, help_text="1-5 rating")
    feedback = models.TextField(blank=True)
    
    ended_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'chatbot_sessions'
        indexes = [
            models.Index(fields=['session_id']),
            models.Index(fields=['user', 'started_at']),
        ]


class ChatMessage(models.Model):
    """Individual chat messages with token tracking"""
    message_id = models.CharField(max_length=50, unique=True, db_index=True)
    session = models.ForeignKey(ChatbotSession, on_delete=models.CASCADE, related_name='messages')
    
    role = models.CharField(
        max_length=20,
        choices=[('user', 'User'), ('assistant', 'Assistant'), ('system', 'System')]
    )
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Token Tracking
    input_tokens = models.IntegerField(default=0)
    output_tokens = models.IntegerField(default=0)
    total_tokens = models.IntegerField(default=0)
    
    # Performance
    model = models.CharField(max_length=50, blank=True)
    response_time_ms = models.IntegerField(default=0, help_text="Response time in milliseconds")
    cost = models.DecimalField(max_digits=10, decimal_places=6, default=0)
    
    # Features
    embeddings_used = models.BooleanField(default=False)
    cached = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'chat_messages'
        indexes = [
            models.Index(fields=['session', 'timestamp']),
        ]


# ==================== ANALYTICS ====================

class DashboardAnalytics(models.Model):
    """Daily/periodic dashboard metrics"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField(db_index=True)
    
    # Livestock Stats
    total_animals = models.IntegerField(default=0)
    goats_count = models.IntegerField(default=0)
    chickens_count = models.IntegerField(default=0)
    buffalos_count = models.IntegerField(default=0)
    cows_count = models.IntegerField(default=0)
    
    # Health
    healthy_count = models.IntegerField(default=0)
    sick_count = models.IntegerField(default=0)
    quarantine_count = models.IntegerField(default=0)
    
    # Financial
    total_invested = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    current_value = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    profit_loss = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    roi_percentage = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    
    # Production
    milk_liters = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    eggs_count = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'dashboard_analytics'
        indexes = [
            models.Index(fields=['user', 'date']),
        ]