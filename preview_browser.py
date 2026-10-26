"""Serve the browser edition locally; no third-party Python packages needed."""
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import threading
import webbrowser

root = Path(__file__).resolve().parent / 'web'
for port in range(8080, 8090):
    try:
        server = ThreadingHTTPServer(('127.0.0.1', port), partial(SimpleHTTPRequestHandler, directory=str(root)))
        break
    except OSError:
        continue
else:
    raise SystemExit('Ports 8080–8089 are busy. Close an earlier preview and retry.')
url = f'http://127.0.0.1:{port}'
print(f'SnapStudio: {url}\nKeep this window open. Press Ctrl+C to stop.', flush=True)
threading.Timer(1, lambda: webbrowser.open(url)).start()
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
