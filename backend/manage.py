import sys
import types
import os

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

# 2. Patch django.utils.http for urlquote
try:
    import django.utils.http
    if not hasattr(django.utils.http, 'urlquote'):
        from urllib.parse import quote as urlquote
        django.utils.http.urlquote = urlquote
    if not hasattr(django.utils.http, 'urlunquote'):
        from urllib.parse import unquote as urlunquote
        django.utils.http.urlunquote = urlunquote
    if not hasattr(django.utils.http, 'parse_header_parameters'):
        # Surrogate for parse_header_parameters if missing
        def parse_header_parameters(line):
            if not line: return '', {}
            parts = [p.strip() for p in line.split(';')]
            key = parts[0]
            params = {k.strip(): v.strip().strip('"') for p in parts[1:] if '=' in p for k, v in [p.split('=', 1)]}
            return key, params
        django.utils.http.parse_header_parameters = parse_header_parameters
except (ImportError, AttributeError):
    pass
# ---------------------------------------------


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'investomart.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
