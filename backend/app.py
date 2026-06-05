from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database.models import db, ScanResult
import os  # <-- Added: Required for reading the Render PORT

print("APP FILE LOADED")

def create_app():
    print("STEP 1")
    app = Flask(__name__)

    print("STEP 2")
    app.config.from_object(Config)

    print("STEP 3")
    CORS(app)

    print("STEP 4")
    db.init_app(app)

    print("STEP 5")
    # Re-enabled: Import all route blueprints so the other dashboard buttons/modals work
    from routes.predict import predict_bp
    from routes.report import report_bp
    from routes.feedback import feedback_bp
    from routes.bulk import bulk_bp

    print("STEP 6")
    # Re-enabled: Register all route blueprints
    app.register_blueprint(predict_bp, url_prefix='/api')
    app.register_blueprint(report_bp, url_prefix='/api')
    app.register_blueprint(feedback_bp, url_prefix='/api')
    app.register_blueprint(bulk_bp, url_prefix='/api')

    @app.route('/')
    def home():
        return {"status": "PhishNet Backend Running"}

    @app.route('/api/stats', methods=['GET'])
    def stats():
        try:
            total_scans = ScanResult.query.count()
            phishing_detected = ScanResult.query.filter_by(is_phishing=True).count()

            return jsonify({
                "total_scans": total_scans,
                "phishing_detected": phishing_detected,
                "safe_detected": total_scans - phishing_detected
            })
        except Exception as e:
            return jsonify({"error": str(e)})

    print("STEP 7")
    with app.app_context():
        db.create_all()

    print("STEP 8")
    return app


app = create_app()

if __name__ == "__main__":
    # Updated: Render will assign a dynamic port (fallback to 5000 for local runs)
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)