#!/usr/bin/env python3
"""
KryptoKette - Lokaler Multi-User Schul-Netzwerk-Server (Python 3)
================================================================
Dieser eigenständige Python-Server ermöglicht es Lehrkräften und Schulklassen,
die Blockchain-Simulation gemeinsam im lokalen Netzwerk (WLAN / LAN) zu spielen.

Features:
- Echtes Multi-Threading: Beliebig viele Schüler, Smartphones & Browser gleichzeitig!
- Thread-sicheres Server-Sent Events (SSE) Streaming für Live-Transaktionen
- Reines Standard-Python ohne externe Abhängigkeiten (kein pip, kein npm)
- Automatische Port- und IP-Erkennung mit Firewall-Hinweisen (z. B. für Linux Mint)
"""

import http.server
import socketserver
import socket
import json
import os
import sys
import time
import threading
import queue
import mimetypes
from urllib.parse import urlparse

DEFAULT_PORT = 8050
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PORT

# MIME Types ensure correct content headers
mimetypes.init()
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('text/html', '.html')
mimetypes.add_type('image/svg+xml', '.svg')
mimetypes.add_type('application/json', '.json')

# Authoritative In-Memory Blockchain State
STATE_LOCK = threading.Lock()

INITIAL_PARTICIPANTS = [
    {
        "id": "mia",
        "name": "Mia",
        "avatar": "👩‍💻",
        "color": "#7c3aed",
        "grade": "Klasse 8b",
        "role": "Klassensprecherin (Bot)",
        "description": "Organisiert die Klassenkasse.",
        "initialBalance": 30,
        "isHumanPlayer": False,
    },
    {
        "id": "lukas",
        "name": "Lukas",
        "avatar": "🎮",
        "color": "#059669",
        "grade": "Klasse 9a",
        "role": "Schul-Miner (Bot)",
        "description": "Schürft fleißig Blöcke.",
        "initialBalance": 40,
        "isHumanPlayer": False,
    },
    {
        "id": "sophie",
        "name": "Sophie",
        "avatar": "🎨",
        "color": "#d97706",
        "grade": "Klasse 7c",
        "role": "Künstlerin (Bot)",
        "description": "Gestaltet digitale Pixel-Sticker.",
        "initialBalance": 20,
        "isHumanPlayer": False,
    },
    {
        "id": "jonas",
        "name": "Jonas",
        "avatar": "🛹",
        "color": "#e11d48",
        "grade": "Klasse 8a",
        "role": "Sportler (Bot)",
        "description": "Verleiht Pausenspiele.",
        "initialBalance": 25,
        "isHumanPlayer": False,
    },
]

# Genesis block (#0) - strictly matching client crypto.ts
GENESIS_BLOCK = {
    "index": 0,
    "timestamp": 1714500000000,
    "transactions": [
        {
            "id": "tx-genesis-0",
            "senderId": "SYSTEM",
            "senderName": "Blockchain-Urknall",
            "recipientId": "mia",
            "recipientName": "Mia",
            "amount": 10,
            "purpose": "Start-Guthaben für Klassenkasse",
            "timestamp": 1714500000000,
            "isCoinbase": True,
        },
        {
            "id": "tx-genesis-1",
            "senderId": "SYSTEM",
            "senderName": "Blockchain-Urknall",
            "recipientId": "lukas",
            "recipientName": "Lukas",
            "amount": 10,
            "purpose": "Start-Guthaben für Hardwareshop",
            "timestamp": 1714500000000,
            "isCoinbase": True,
        },
    ],
    "previousHash": "0000000000000000000000000000000000000000000000000000000000000000",
    "hash": "008a9cc13a43cdd51d0338897383e0e16d860a72a08b415a7032cf9b667fc103",
    "nonce": 275,
    "difficulty": 2,
    "minerId": "SYSTEM",
    "minerName": "EduChain System",
    "isGenesis": True,
    "isValid": True,
}

# Historical block (#1) - strictly matching client crypto.ts
INITIAL_BLOCK_1 = {
    "index": 1,
    "timestamp": 1714503600000,
    "transactions": [
        {
            "id": "tx-seed-1",
            "senderId": "lukas",
            "senderName": "Lukas",
            "recipientId": "sophie",
            "recipientName": "Sophie",
            "amount": 4,
            "purpose": "Digitaler Pixel-Sticker für Gaming-Profil",
            "timestamp": 1714503600000 - 1200000,
        },
        {
            "id": "tx-seed-2",
            "senderId": "jonas",
            "senderName": "Jonas",
            "recipientId": "mia",
            "recipientName": "Mia",
            "amount": 5,
            "purpose": "Beitrag für den Klassen-Wandertag",
            "timestamp": 1714503600000 - 600000,
        },
        {
            "id": "tx-cb-1",
            "senderId": "SYSTEM",
            "senderName": "Netzwerk-Belohnung",
            "recipientId": "lukas",
            "recipientName": "Lukas",
            "amount": 10,
            "purpose": "Block-Belohnung für das Lösen des Rätsels",
            "timestamp": 1714503600000,
            "isCoinbase": True,
        },
    ],
    "previousHash": "008a9cc13a43cdd51d0338897383e0e16d860a72a08b415a7032cf9b667fc103",
    "hash": "008c487a0c091d8091ac455495a39f74210ad368d00de88f332faafa865d8ae2",
    "nonce": 881,
    "difficulty": 2,
    "minerId": "lukas",
    "minerName": "Lukas",
    "isValid": True,
}

state = {
    "chain": [GENESIS_BLOCK, INITIAL_BLOCK_1],
    "mempool": [
        {
            "id": "tx-init-1",
            "senderId": "sophie",
            "senderName": "Sophie",
            "recipientId": "jonas",
            "recipientName": "Jonas",
            "amount": 3,
            "purpose": "Hausaufgaben-Zusammenfassung Physik",
            "timestamp": int(time.time() * 1000) - 120000,
            "isAutoGenerated": True,
        }
    ],
    "participants": list(INITIAL_PARTICIPANTS),
}

# Connected SSE Client Queues (Thread-safe pub/sub architecture)
sse_queues = []
sse_lock = threading.Lock()

def broadcast_event(event_type, data):
    """Pushes an event payload to all currently connected client queues."""
    payload = f"event: {event_type}\ndata: {json.dumps(data)}\n\n".encode('utf-8')
    with sse_lock:
        for q in list(sse_queues):
            try:
                q.put_nowait(payload)
            except Exception:
                pass

# Determine static files directory (docs or dist) relative to this script's directory
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
docs_path = os.path.join(SCRIPT_DIR, "docs")
dist_path = os.path.join(SCRIPT_DIR, "dist")

if os.path.exists(docs_path) and os.path.exists(os.path.join(docs_path, "index.html")):
    STATIC_DIR = docs_path
elif os.path.exists(dist_path) and os.path.exists(os.path.join(dist_path, "index.html")):
    STATIC_DIR = dist_path
elif os.path.exists(os.path.join(SCRIPT_DIR, "index.html")):
    STATIC_DIR = SCRIPT_DIR
else:
    STATIC_DIR = docs_path if os.path.exists(docs_path) else SCRIPT_DIR

def get_all_local_ips():
    """Detects available LAN / WLAN IP addresses to help teachers and students connect."""
    ips = []
    # Primary route detection
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0.1)
        s.connect(("8.8.8.8", 80))
        primary = s.getsockname()[0]
        s.close()
        if primary and primary != "127.0.0.1":
            ips.append(primary)
    except Exception:
        pass

    # Secondary host-by-name detection
    try:
        hostname = socket.gethostname()
        for addr in socket.gethostbyname_ex(hostname)[2]:
            if addr not in ips and not addr.startswith("127."):
                ips.append(addr)
    except Exception:
        pass

    return ips if ips else ["127.0.0.1"]

class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    """
    Multi-threaded HTTP Server:
    Handles each incoming browser/phone connection in its own independent thread.
    Prevents persistent SSE connections from blocking new HTTP requests.
    """
    daemon_threads = True
    allow_reuse_address = True

class BlockchainRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_DIR, **kwargs)

    def log_message(self, format, *args):
        # Silence routine static asset logs to keep terminal clear for classroom monitoring
        if "GET /assets/" not in format % args and "GET /api/events" not in format % args:
            super().log_message(format, *args)

    def do_GET(self):
        parsed = urlparse(self.path)

        if parsed.path == "/api/state":
            with STATE_LOCK:
                data = json.dumps(state)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(data.encode('utf-8'))
            return

        if parsed.path == "/api/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')
            return

        if parsed.path == "/api/events":
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream")
            self.send_header("Cache-Control", "no-cache, no-transform")
            self.send_header("Connection", "keep-alive")
            self.send_header("X-Accel-Buffering", "no")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            # Create a dedicated message queue for this client connection
            client_queue = queue.Queue(maxsize=100)
            with sse_lock:
                sse_queues.append(client_queue)

            # Send initial state immediately
            with STATE_LOCK:
                init_payload = f"event: init\ndata: {json.dumps(state)}\n\n".encode('utf-8')

            try:
                self.wfile.write(init_payload)
                self.wfile.flush()

                # Stream events from the queue with 15s keepalive ping
                while True:
                    try:
                        msg = client_queue.get(timeout=15)
                        self.wfile.write(msg)
                        self.wfile.flush()
                    except queue.Empty:
                        # Send lightweight comment ping to keep mobile connections open
                        self.wfile.write(b": ping\n\n")
                        self.wfile.flush()
            except (ConnectionResetError, BrokenPipeError, ConnectionAbortedError):
                pass
            except Exception:
                pass
            finally:
                with sse_lock:
                    if client_queue in sse_queues:
                        sse_queues.remove(client_queue)
            return

        # Fallback to SPA routing (if file not found, serve index.html)
        file_path = os.path.join(STATIC_DIR, parsed.path.lstrip("/"))
        if not os.path.exists(file_path) and not parsed.path.startswith("/api/"):
            self.path = "/index.html"

        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else "{}"
        
        try:
            req_data = json.loads(body)
        except Exception:
            req_data = {}

        if parsed.path == "/api/join":
            player = req_data
            if not player.get("name"):
                self.send_error(400, "Name erforderlich")
                return

            with STATE_LOCK:
                existing = next((p for p in state["participants"] if p["id"] == player.get("id")), None)
                if existing:
                    existing.update(player)
                else:
                    state["participants"].append(player)
                current_participants = list(state["participants"])

            broadcast_event("participant_joined", {"player": player, "participants": current_participants})
            print(f"👋 [Schul-Netzwerk] Neuer Teilnehmer beigetreten: {player.get('name')} ({player.get('grade', 'Gast')})")

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "participant": player}).encode('utf-8'))
            return

        if parsed.path == "/api/transactions":
            tx = req_data
            with STATE_LOCK:
                state["mempool"].insert(0, tx)
                current_mempool = list(state["mempool"])

            broadcast_event("transaction_added", {"transaction": tx, "mempool": current_mempool})
            print(f"💸 [Schul-Netzwerk] Überweisung: {tx.get('senderName')} ➔ {tx.get('recipientName')} ({tx.get('amount')} EDC)")

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "transaction": tx}).encode('utf-8'))
            return

        if parsed.path == "/api/mine":
            new_block = req_data
            with STATE_LOCK:
                state["chain"].append(new_block)
                # Remove mined transactions from mempool
                mined_ids = {t["id"] for t in new_block.get("transactions", [])}
                state["mempool"] = [t for t in state["mempool"] if t["id"] not in mined_ids]
                current_chain = list(state["chain"])
                current_mempool = list(state["mempool"])

            broadcast_event("block_mined", {"block": new_block, "chain": current_chain, "mempool": current_mempool})
            print(f"⛏️ [Schul-Netzwerk] Block #{new_block.get('index')} geschürft von {new_block.get('minerName')} (+10 EDC Belohnung!)")

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "block": new_block}).encode('utf-8'))
            return

        if parsed.path == "/api/reset":
            with STATE_LOCK:
                state["chain"] = [GENESIS_BLOCK, INITIAL_BLOCK_1]
                state["mempool"] = [
                    {
                        "id": "tx-init-1",
                        "senderId": "sophie",
                        "senderName": "Sophie",
                        "recipientId": "jonas",
                        "recipientName": "Jonas",
                        "amount": 3,
                        "purpose": "Hausaufgaben-Zusammenfassung Physik",
                        "timestamp": int(time.time() * 1000) - 120000,
                        "isAutoGenerated": True,
                    }
                ]
                current_chain = list(state["chain"])
                current_mempool = list(state["mempool"])

            broadcast_event("chain_reset", {"chain": current_chain, "mempool": current_mempool})
            print("🔄 [Schul-Netzwerk] Blockchain wurde auf den Anfangszustand zurückgesetzt.")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
            return

        self.send_error(404, "Endpoint not found")

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        # Prevent browser caching so Chromium / Firefox / Mobile never serve stale cached apps
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

def run_server():
    all_ips = get_all_local_ips()
    primary_ip = all_ips[0]
    target_port = PORT
    httpd = None

    # Automatic port collision detection & graceful fallback
    while httpd is None:
        try:
            httpd = ThreadingHTTPServer(("0.0.0.0", target_port), BlockchainRequestHandler)
        except OSError as e:
            print(f"⚠️ Port {target_port} wird bereits belegt ({e})!")
            print(f"   Weiche automatisch auf Port {target_port + 1} aus...")
            target_port += 1

    print("=" * 72)
    print("🎓 KRYPTOKETTE - LOKALER SCHUL-NETZWERK-SERVER (MULTI-THREADED)")
    print("=" * 72)
    print("📡 Status: Server läuft im lokalen Netzwerk!")
    print("👥 Gleichzeitige Verbindungen: Unbegrenzt (Chromium, Firefox, Smartphones)")
    print("-" * 72)
    print("👉 URL für Schüler & Smartphones (an die Tafel schreiben):")
    for ip in all_ips:
        print(f"   http://{ip}:{target_port}")
    print("=" * 72)
    print("💡 HINWEIS FÜR LINUX MINT / UBUNTU (falls Smartphones nicht laden):")
    print("   Falls andere Geräte im WLAN die Seite nicht aufrufen können,")
    print(f"   gib den Port kurz in der Linux-Firewall frei:")
    print(f"   sudo ufw allow {target_port}/tcp")
    print("=" * 72)
    print("Server aktiv. Zum Beenden Strg + C drücken.\n")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server beendet.")
    finally:
        httpd.server_close()

if __name__ == "__main__":
    run_server()
