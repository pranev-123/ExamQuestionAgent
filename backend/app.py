import os
import sys
from pathlib import Path
from flask import Flask
from flask_cors import CORS

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.config import SECRET_KEY
from backend.routes import bp


def create_app() -> Flask:
    app = Flask(__name__)
    app.secret_key = SECRET_KEY
    CORS(app, resources={r"/*": {"origins": "*"}})
    app.register_blueprint(bp)
    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host="0.0.0.0", port=5000)
