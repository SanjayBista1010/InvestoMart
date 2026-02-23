import os
import requests
from pymongo import MongoClient
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

# Cloudinary config
cloudinary.config(
  cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME'),
  api_key = os.getenv('CLOUDINARY_API_KEY'),
  api_secret = os.getenv('CLOUDINARY_API_SECRET')
)

# Connect DB
MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client['goatfarm']

# Unsplash source image URLs (resolves to random image matching keyword)
IMAGE_URLS = {
    'goat': 'https://source.unsplash.com/800x600/?goat,farm',
    'chicken': 'https://source.unsplash.com/800x600/?chicken,farm',
    'buffalo': 'https://source.unsplash.com/800x600/?water_buffalo,cow,farm'
}

# 1. Download images locally
print("📥 Downloading stock images...")
local_files = {}
for category, url in IMAGE_URLS.items():
    print(f"   Downloading {category} image...")
    # Follow redirects and get final image
    resp = requests.get(url, allow_redirects=True)
    if resp.status_code == 200:
        filename = f"dummy_{category}.jpg"
        with open(filename, 'wb') as f:
            f.write(resp.content)
        local_files[category] = filename
        print(f"   ✅ Saved to {filename}")
    else:
        print(f"   ❌ Failed to download {category}")

# 2. Upload to Cloudinary
print("\n☁️ Uploading to Cloudinary...")
cloudinary_urls = {}
for category, filename in local_files.items():
    if os.path.exists(filename):
        print(f"   Uploading {filename}...")
        try:
            result = cloudinary.uploader.upload(
                filename, 
                folder="investomart_dummies",
                public_id=f"dummy_{category}_{os.urandom(4).hex()}"
            )
            secure_url = result.get('secure_url')
            cloudinary_urls[category] = secure_url
            print(f"   ✅ Uploaded: {secure_url}")
        except Exception as e:
            print(f"   ❌ Upload failed for {category}: {e}")

# 3. Update MongoDB
print("\n💾 Updating MongoDB products...")
if cloudinary_urls:
    for category, url in cloudinary_urls.items():
        # Update all Nepal products of this category that don't already have an image
        result = db.products.update_many(
            {"category": category},
            {"$set": {"image_url": url, "images": [url]}}
        )
        print(f"   ✅ Linked {category} image to {result.modified_count} products")
else:
    print("❌ No images were uploaded, skipping DB update.")

# Cleanup local files
print("\n🧹 Cleaning up local files...")
for filename in local_files.values():
    if os.path.exists(filename):
        os.remove(filename)

print("🎉 Image seeding complete!")
