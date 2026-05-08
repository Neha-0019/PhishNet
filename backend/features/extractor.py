import re
import socket
import whois
from urllib.parse import urlparse
from datetime import datetime
import ssl

def extract_features(url):
    features = {}
    
    # 1. url_length
    features['url_length'] = len(url)
    
    # 2. has_ip_address
    ip_pattern = re.compile(
        r'(([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5]))'
    )
    features['has_ip_address'] = 1 if ip_pattern.search(url) else 0
    
    # 3. has_at_symbol
    features['has_at_symbol'] = 1 if '@' in url else 0
    
    # 4. num_dots
    features['num_dots'] = url.count('.')
    
    # 5. num_hyphens
    parsed_url = urlparse(url)
    domain = parsed_url.netloc
    features['num_hyphens'] = domain.count('-')
    
    # 6. num_subdomains
    # A rough estimate based on dots in domain.
    features['num_subdomains'] = max(0, domain.count('.') - 1)
    
    # 7. is_https
    features['is_https'] = 1 if parsed_url.scheme == 'https' else 0
    
    # 8. has_port
    features['has_port'] = 1 if ':' in domain else 0
    
    # 9. url_depth
    path = parsed_url.path
    features['url_depth'] = max(0, path.count('/'))
    
    # 10. has_double_slash_redirect
    features['has_double_slash_redirect'] = 1 if url.rfind('//') > 6 else 0
    
    # 11. domain_length
    features['domain_length'] = len(domain)
    
    # 12. has_suspicious_keywords
    suspicious_keywords = ['login', 'secure', 'account', 'update', 'verify', 'banking']
    features['has_suspicious_keywords'] = 1 if any(k in url.lower() for k in suspicious_keywords) else 0
    
    # 13. path_length
    features['path_length'] = len(path)
    
    # 14. query_length
    features['query_length'] = len(parsed_url.query)
    
    # 15. num_special_chars
    special_chars = ['@', '%', '=', '&', '?']
    features['num_special_chars'] = sum(url.count(c) for c in special_chars)
    
    # 16. tld_in_path
    common_tlds = ['.com', '.org', '.net', '.info']
    features['tld_in_path'] = 1 if any(tld in path for tld in common_tlds) else 0
    
    # 17. domain_age_days
    domain_age = -1
    try:
        domain_name = domain.split(':')[0] if ':' in domain else domain
        # Disable whois in tests/fast mode if needed, but here it's as requested
        w = whois.whois(domain_name)
        if w.creation_date:
            creation_date = w.creation_date
            if type(creation_date) is list:
                creation_date = creation_date[0]
            age = (datetime.now() - creation_date).days
            domain_age = age if age > 0 else -1
    except Exception:
        pass
    features['domain_age_days'] = domain_age
    
    # 18. is_shortened_url
    shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly']
    features['is_shortened_url'] = 1 if any(s in domain.lower() for s in shorteners) else 0
    
    # 19. num_digits_in_domain
    features['num_digits_in_domain'] = sum(c.isdigit() for c in domain)
    
    # 20. has_valid_ssl
    has_valid_ssl = 0
    if features['is_https']:
        try:
            hostname = domain.split(':')[0]
            ctx = ssl.create_default_context()
            with ctx.wrap_socket(socket.socket(), server_hostname=hostname) as s:
                s.settimeout(2.0)
                s.connect((hostname, 443))
                has_valid_ssl = 1
        except Exception:
            pass
    features['has_valid_ssl'] = has_valid_ssl
    
    return features
