"""Validate the authored static output without a browser or third-party packages."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import json
import re

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'dist'

class Document(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.links = []
        self.images = 0
        self.titles = 0

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, f"Duplicate id: {attrs['id']}"
            self.ids.add(attrs['id'])
        for key in ('src', 'href'):
            if attrs.get(key):
                self.links.append(attrs[key])
        if tag == 'img':
            assert 'alt' in attrs, 'Missing image alternative text'
            assert attrs.get('width') and attrs.get('height'), 'Missing image dimensions'
            self.images += 1
        if tag == 'title':
            self.titles += 1

doc = Document()
doc.feed((PUBLIC / 'index.html').read_text())
assert doc.titles == 1
for link in doc.links:
    parts = urlsplit(link)
    if not parts.scheme and not parts.netloc:
        if parts.path:
            assert (PUBLIC / parts.path.lstrip('/')).is_file(), f'Missing asset: {link}'
        if parts.fragment:
            assert parts.fragment in doc.ids, f'Missing anchor: {link}'
for sheet in PUBLIC.rglob('*.css'):
    for link in re.findall(r'url\([\"\']?([^\)\"\']+)', sheet.read_text()):
        if link.startswith('/'):
            assert (PUBLIC / link.lstrip('/')).is_file(), f'Missing font: {link}'
for asset in re.findall(r"image:'([^']+)'", (PUBLIC / 'app.js').read_text()):
    assert (PUBLIC / asset.lstrip('/')).is_file(), f'Missing project image: {asset}'
config = json.loads((ROOT / '.openai/hosting.json').read_text())
assert config['static']['directory'] == 'dist'
assert (PUBLIC / 'index.html').is_file()
print(f'Validated {len(doc.ids)} IDs, {len(doc.links)} references, {doc.images} images and local font assets.')
