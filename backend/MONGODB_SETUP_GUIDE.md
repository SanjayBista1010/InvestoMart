# Quick Start Guide - MongoDB Setup

## Issue: MongoDB Not Found

MongoDB doesn't appear to be installed or is not in your system PATH.

## Option 1: Install MongoDB (Recommended)

### Download MongoDB Community Edition
1. Visit: https://www.mongodb.com/try/download/community
2. Select:
   - Version: Latest
   - Platform: Windows
   - Package: MSI

3. Run installer and follow these steps:
   - Choose "Complete" installation
   - ✅ Install MongoDB as a Service
   - ✅ Install MongoDB Compass (GUI tool)

### After Installation
MongoDB should start automatically as a Windows service.

## Option 2: Use Existing MongoDB

If you have MongoDB installed but it's not in PATH:

```powershell
# Find MongoDB installation
cd "C:\Program Files\MongoDB\Server\7.0\bin"  # Adjust version as needed

# Start MongoDB manually
.\mongod.exe --dbpath "C:\data\db"
```

## Verify MongoDB is Running

```powershell
# Test connection
mongo --eval "db.adminCommand('ping')"

# If using new mongosh
mongosh --eval "db.adminCommand('ping')"
```

Expected output: `{ ok: 1 }`

## Once MongoDB is Running

Run these commands in order:

```powershell
# 1. Drop old collections
cd d:/Projects/DjangoReact/investomart/backend
python scripts/reset_database.py
# Type: YES

# 2. Create migrations
python manage.py makemigrations

# 3. Apply migrations
python manage.py migrate

# 4. Restart Django server
# Stop current server (Ctrl+C) and restart:
python manage.py runserver
```

## Alternative: Use Docker MongoDB

```powershell
# Quick MongoDB with Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

---

## Need Help?

**Check if MongoDB is installed:**
```powershell
Get-Service | findstr -i "mongo"
```

**Check MongoDB port:**
```powershell
netstat -ano | findstr :27017
```

If you see output, MongoDB is running!
