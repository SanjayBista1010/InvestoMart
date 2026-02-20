
import os
import sys

# Add current directory to path
sys.path.append(os.getcwd())

print("🔍 Starting Import Diagnostic...")

# Try to import things one by one to see where it breaks
try:
    print("🔹 Testing django.utils.http...")
    import django.utils.http
    print(f"✅ django.utils.http imported. Has urlquote: {hasattr(django.utils.http, 'urlquote')}")
    
    # Manually try to trigger the error
    print("🔹 Attempting 'from django.utils.http import urlquote'...")
    try:
        from django.utils.http import urlquote
        print("✅ Success! (Wait, it should have failed if not patched)")
    except ImportError as e:
        print(f"❌ Failed as expected: {e}")

    print("\n🔹 Testing rest_framework...")
    import rest_framework
    print("✅ rest_framework imported.")

    print("\n🔹 Testing data.serializers...")
    try:
        import data.serializers
        print("✅ data.serializers imported.")
    except Exception as e:
        print(f"❌ data.serializers failed: {e}")
        import traceback
        traceback.print_exc()

    print("\n🔹 Testing data.views...")
    try:
        import data.views
        print("✅ data.views imported.")
    except Exception as e:
        print(f"❌ data.views failed: {e}")
        import traceback
        traceback.print_exc()

except Exception as e:
    print(f"💥 Top level failure: {e}")
    import traceback
    traceback.print_exc()
