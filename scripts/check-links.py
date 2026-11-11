#!/usr/bin/env python3
"""Check mentor source URLs. A 404 is a failure. Timeouts are reported, not fatal."""
import json
import urllib.request
from pathlib import Path

root = Path(__file__).resolve().parents[1]
data = json.loads((root / 'shared/mentorRefresh.json').read_text())
urls = set()
for profile in data.values():
    for product in profile.get('products', []):
        urls.add(product['url'])
    for source in profile.get('sources', []):
        urls.add(source['url'])
    for play in profile.get('plays', []):
        if play.get('sourceUrl'):
            urls.add(play['sourceUrl'])

bad = []
for url in sorted(urls):
    if 'idohodl.com' in url:
        bad.append((url, 'dead domain should not be linked'))
        continue
    req = urllib.request.Request(url, method='GET', headers={'User-Agent': 'CreatorPlaybooksLinkCheck/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=12) as res:
            if res.status >= 400:
                bad.append((url, str(res.status)))
            else:
                print(res.status, url)
    except Exception as exc:
        msg = str(exc)
        if '404' in msg:
            bad.append((url, msg[:120]))
        else:
            print('WARN', type(exc).__name__, url)

print('---')
print('checked', len(urls), 'failed', len(bad))
for url, why in bad:
    print('FAIL', why, url)
raise SystemExit(1 if bad else 0)
