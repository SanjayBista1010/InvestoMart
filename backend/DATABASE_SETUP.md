# MongoDB Database Setup Instructions

## Prerequisites
- MongoDB installed and running
- Python packages: `pymongo`, `djongo`

## Step 1: Start MongoDB

### Windows
```bash
# Start MongoDB service
net start MongoDB

# Or if using MongoDB Community Edition
mongod --dbpath "C:\data\db"
```

### macOS/Linux
```bash
sudo systemctl start mongod
# or
brew services start mongodb-community
```

## Step 2: Drop Old Collections

```bash
# From backend directory
cd d:/Projects/DjangoReact/investomart/backend
python scripts/reset_database.py
```

When prompted, type `YES` to confirm deletion of all collections.

## Step 3: Apply Django Migrations

```bash
# Create migrations for new models
python manage.py makemigrations

# Apply migrations
python manage.py migrate
```

## Step 4: Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

## Step 5: Verify Collections

```bash
# Connect to MongoDB
mongo

# Switch to database
use django_project

# List all collections
show collections
```

You should see the new collections:
- users
- livestock
- health_records
- products
- transactions
- chatbot_sessions
- chat_messages
- dashboard_analytics

## Troubleshooting

### MongoDB not connecting
- Ensure MongoDB is running: `mongo --eval "db.adminCommand('ping')"`
- Check connection string in settings.py

### Migration errors
- Delete `data/migrations` folder (except `__init__.py`)
- Run `python manage.py makemigrations data` again

## Next Steps

After setup, you can:
1. Populate with sample data using seed scripts
2. Test API endpoints
3. Verify frontend integration
