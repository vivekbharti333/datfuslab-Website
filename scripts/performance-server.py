"""Local-only preview with production-like compression and cache headers."""
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import unquote, urlsplit
import argparse, gzip, mimetypes, time

parser = argparse.ArgumentParser()
parser.add_argument('--port', type=int, default=8765)
parser.add_argument('--html-latency-ms', type=int, default=350)
args = parser.parse_args()
root = Path.cwd().resolve()

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        name = unquote(urlsplit(self.path).path).lstrip('/') or 'index.html'
        path = (root / name).resolve()
        if not path.is_relative_to(root):
            self.send_error(403); return
        if not path.is_file() and not path.suffix:
            path = path.with_suffix('.html')
        if not path.is_file():
            self.send_error(404); return
        data = path.read_bytes()
        content_type = mimetypes.guess_type(str(path))[0] or 'application/octet-stream'
        if path.suffix == '.html':
            time.sleep(args.html_latency_ms / 1000)
        compress = path.suffix in ('.html', '.css', '.js', '.json', '.svg', '.xml') and 'gzip' in self.headers.get('Accept-Encoding', '')
        if compress: data = gzip.compress(data)
        self.send_response(200)
        self.send_header('Content-Type', content_type)
        self.send_header('Cache-Control', 'no-cache' if path.suffix == '.html' else 'public, max-age=31536000')
        if compress: self.send_header('Content-Encoding', 'gzip')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers(); self.wfile.write(data)
    def log_message(self, *_): pass

print(f'Preview: http://127.0.0.1:{args.port}; HTML latency: {args.html_latency_ms}ms', flush=True)
ThreadingHTTPServer(('127.0.0.1', args.port), Handler).serve_forever()
