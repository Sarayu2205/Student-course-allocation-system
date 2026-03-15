import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from routes.auth import auth_bp
from routes.courses import courses_bp
from routes.preferences import prefs_bp
from routes.allocation import alloc_bp
from routes.chat import chat_bp
from routes.notifications import notif_bp

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = Config.JWT_SECRET_KEY
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['JWT_HEADER_NAME'] = 'Authorization'
app.config['JWT_HEADER_TYPE'] = 'Bearer'

# Allow all origins in production (tighten after deploy if needed)
CORS(app, origins='*', supports_credentials=True)
JWTManager(app)

app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(courses_bp, url_prefix='/api')
app.register_blueprint(prefs_bp, url_prefix='/api')
app.register_blueprint(alloc_bp, url_prefix='/api')
app.register_blueprint(chat_bp, url_prefix='/api')
app.register_blueprint(notif_bp, url_prefix='/api')

@app.get('/api/health')
def health():
    return jsonify(status='ok')

@app.errorhandler(Exception)
def handle_error(e):
    import traceback; traceback.print_exc()
    return jsonify(error=str(e)), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
