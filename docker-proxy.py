#!/usr/bin/env python3
"""
Unix socket proxy: rewrites old Docker API versions (<1.40) to v1.41
so Testcontainers works with Docker Desktop 4.66+.
"""
import socket, os, re, threading, sys

PROXY_SOCK = '/tmp/docker-proxy.sock'
REAL_SOCK  = '/var/run/docker.sock'

# Rewrite /v1.XX/ where XX < 40 → /v1.41/
VERSION_RE = re.compile(rb'/v(\d+)\.(\d+)/')

def rewrite_version(data):
    def fix(m):
        if int(m.group(1)) == 1 and int(m.group(2)) < 40:
            return b'/v1.41/'
        return m.group(0)
    return VERSION_RE.sub(fix, data, count=1)

def pipe(src, dst, rewrite=False):
    try:
        while True:
            chunk = src.recv(65536)
            if not chunk:
                break
            if rewrite:
                chunk = rewrite_version(chunk)
            dst.sendall(chunk)
    except Exception:
        pass
    finally:
        try: src.close()
        except: pass
        try: dst.close()
        except: pass

def handle(client):
    real = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    real.connect(REAL_SOCK)
    threading.Thread(target=pipe, args=(client, real, True),  daemon=True).start()
    threading.Thread(target=pipe, args=(real, client, False), daemon=True).start()

if os.path.exists(PROXY_SOCK):
    os.unlink(PROXY_SOCK)

server = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
server.bind(PROXY_SOCK)
os.chmod(PROXY_SOCK, 0o666)
server.listen(50)
print(f"Docker proxy listening on {PROXY_SOCK}", flush=True)

while True:
    conn, _ = server.accept()
    threading.Thread(target=handle, args=(conn,), daemon=True).start()
