# Dummy cgi module for Python 3.13 compatibility with older Django versions
import re
from urllib.parse import parse_qsl

def parse_header(line):
    """
    Simplified version of cgi.parse_header.
    Works with both strings and bytes.
    """
    if isinstance(line, bytes):
        line = line.decode('iso-8859-1')
    
    if not line:
        return '', {}
    
    parts = [p.strip() for p in line.split(';')]
    key = parts[0].lower()
    params = {}
    for part in parts[1:]:
        if '=' in part:
            k, v = part.split('=', 1)
            params[k.strip().lower()] = v.strip().strip('"')
    return key, params

def valid_boundary(s, _vb_pattern=re.compile('^[ -~]{0,200}[!-~]$')):
    """
    Matches the pattern used in Python's legacy cgi module.
    """
    if isinstance(s, bytes):
        s = s.decode('ascii', errors='replace')
    return _vb_pattern.match(s) is not None

class FieldStorage:
    """Dummy class to satisfy some imports if necessary."""
    pass
