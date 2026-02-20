import os
import sys

# Ensure the backend directory is in the path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    import cgi
    print(f"Imported cgi from: f{cgi.__file__}")
    
    # Test valid_boundary
    boundary = "---WebKitFormBoundary7MA4YWxkTrZu0gW"
    is_valid = cgi.valid_boundary(boundary)
    print(f"valid_boundary('{boundary}'): {is_valid}")
    assert is_valid == True, "valid_boundary failed for valid boundary"
    
    # Test parse_header
    content_type = "multipart/form-data; boundary=---WebKitFormBoundary7MA4YWxkTrZu0gW"
    key, params = cgi.parse_header(content_type)
    print(f"parse_header('{content_type}'): key='{key}', params={params}")
    assert key == "multipart/form-data", f"parse_header key mismatch: {key}"
    assert params.get('boundary') == "---WebKitFormBoundary7MA4YWxkTrZu0gW", f"parse_header boundary mismatch: {params.get('boundary')}"
    
    print("\nSUCCESS: cgi shim is working correctly.")
except Exception as e:
    print(f"\nFAILURE: {e}")
    sys.exit(1)
