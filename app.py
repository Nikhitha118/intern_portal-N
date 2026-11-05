import sys
import os
import importlib.util

# Add server directory to sys.path so all imports inside server/ work
server_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "server")
if server_dir not in sys.path:
    sys.path.insert(0, server_dir)

spec = importlib.util.spec_from_file_location("server_app", os.path.join(server_dir, "app.py"))
server_module = importlib.util.module_from_spec(spec)
sys.modules["server_app"] = server_module
spec.loader.exec_module(server_module)

app = server_module.app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
