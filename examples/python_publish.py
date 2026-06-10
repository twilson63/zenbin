import base64
import hashlib
import json
import os
import uuid
from datetime import datetime, timezone

import requests
from cryptography.hazmat.primitives.serialization import load_pem_private_key

base_url = os.getenv('ZENBIN_BASE_URL', 'http://localhost:3000')
key_id = os.getenv('ZENBIN_KEY_ID')
private_key_pem = os.getenv('ZENBIN_PRIVATE_KEY_PEM')
subdomain = os.getenv('ZENBIN_SUBDOMAIN')

if not key_id or not private_key_pem:
    raise SystemExit('Set ZENBIN_KEY_ID and ZENBIN_PRIVATE_KEY_PEM')

private_key = load_pem_private_key(private_key_pem.encode(), password=None)
path = '/v1/pages/hello-from-python'
body_obj = {
    'html': '<!doctype html><html><body><h1>Hello from Python</h1></body></html>',
    'markdown': '# Hello from Python',
    'title': 'Hello from Python',
}
body = json.dumps(body_obj, separators=(',', ':'))
timestamp = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
nonce = uuid.uuid4().hex
content_digest = 'sha-256=:' + base64.b64encode(hashlib.sha256(body.encode()).digest()).decode() + ':'
# `path` is the full request target: pathname + query string. Publishing has no
# query, but signed GET listing requests must include the query string here.
canonical = '\n'.join(['POST', path, timestamp, nonce, content_digest])
signature = base64.urlsafe_b64encode(private_key.sign(canonical.encode())).decode().rstrip('=')

headers = {
    'Content-Type': 'application/json',
    'X-Zenbin-Key-Id': key_id,
    'X-Zenbin-Timestamp': timestamp,
    'X-Zenbin-Nonce': nonce,
    'Content-Digest': content_digest,
    'X-Zenbin-Signature': f':{signature}:',
}

if subdomain:
    headers['X-Subdomain'] = subdomain

response = requests.post(base_url + path, headers=headers, data=body)
publish_result = response.json()
print(response.status_code, publish_result)

# Provenance smoke check: verify the original publish body through ZenBin.
verify_response = requests.post(
    base_url + '/v1/verify',
    headers={'Content-Type': 'application/json'},
    data=json.dumps({
        'keyId': key_id,
        'content': body,
        'signature': publish_result['signature'],
        'contentDigest': publish_result['contentDigest'],
        'timestamp': timestamp,
        'nonce': nonce,
        'method': 'POST',
        'path': path,
    }),
)
print('verification', verify_response.json())
