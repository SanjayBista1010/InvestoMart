import sys
import types

# --- PATCHES FOR PYTHON 3.13 COMPATIBILITY ---
# 1. Patch cgi module
try:
    import cgi
except ImportError:
    cgi = types.ModuleType('cgi')
    def parse_header(line):
        if not line: return '', {}
        parts = [p.strip() for p in line.split(';')]
        key = parts[0]
        params = {k.strip(): v.strip().strip('"') for p in parts[1:] if '=' in p for k, v in [p.split('=', 1)]}
        return key, params
    cgi.parse_header = parse_header
    sys.modules['cgi'] = cgi

# 2. Patch django.utils.http for urlquote/urlunquote
try:
    import django.utils.http
    if not hasattr(django.utils.http, 'urlquote'):
        from urllib.parse import quote as urlquote
        django.utils.http.urlquote = urlquote
    if not hasattr(django.utils.http, 'urlunquote'):
        from urllib.parse import unquote as urlunquote
        django.utils.http.urlunquote = urlunquote
    if not hasattr(django.utils.http, 'parse_header_parameters'):
        def parse_header_parameters(line):
            if not line: return '', {}
            parts = [p.strip() for p in line.split(';')]
            key = parts[0]
            params = {k.strip(): v.strip().strip('"') for p in parts[1:] if '=' in p for k, v in [p.split('=', 1)]}
            return key, params
        django.utils.http.parse_header_parameters = parse_header_parameters
except (ImportError, AttributeError):
    # This might happen if Django is not yet in path, we'll try again in settings/manage
    pass
# ---------------------------------------------
