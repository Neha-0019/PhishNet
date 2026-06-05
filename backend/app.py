from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database.models import db, ScanResult
import os

print("APP FILE LOADED")

def create_app():
    print("STEP 1: Initializing Flask App")
    app = Flask(__name__)

    print("STEP 2: Loading Config")
    app.config.from_object(Config)

    print("STEP 3: Enabling CORS")
    CORS(app)

    print("STEP 4: Initializing Database connection")
    db.init_app(app)

    print("STEP 5: Importing Blueprints")
    from routes.predict import predict_bp
    from routes.report import report_bp
    from routes.feedback import feedback_bp
    from routes.bulk import bulk_bp

    print("STEP 6: Registering Blueprints")
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
            safe_detected = total_scans - phishing_detected
            
            # Hardcoded estimated model accuracy for the UI metric card
            accuracy_estimate = 88.0 
            
            from datetime import datetime, timedelta
            
            # Calculate daily scanning trends for the last 7 days
            trend_data = []
            today = datetime.utcnow().date()
            for i in range(6, -1, -1):
                target_date = today - timedelta(days=i)
                start_dt = datetime(target_date.year, target_date.month, target_date.day)
                end_dt = start_dt + timedelta(days=1)
                
                day_scans = ScanResult.query.filter(
                    ScanResult.timestamp >= start_dt, 
                    ScanResult.timestamp < end_dt
                ).all()
                
                scans_count = len(day_scans)
                phishing_count = sum(1 for s in day_scans if s.is_phishing)
                
                trend_data.append({
                    "day": target_date.strftime("%a"),
                    "scans": scans_count,
                    "phishing": phishing_count
                })
            
            return jsonify({
                "total_scans": total_scans,
                "phishing_detected": phishing_detected,
                "safe_detected": safe_detected,
                "accuracy_estimate": accuracy_estimate,
                "top_phishing_domains": [],
                "trend_data": trend_data
            })
        except Exception as e:
            return jsonify({"error": str(e)})

    print("STEP 7: Creating Database Tables")
    with app.app_context():
        db.create_all()

    print("STEP 8: App Build Successful")
    return app


app = create_app()

if __name__ == "__main__":
    # Render will assign a dynamic port (fallback to 5000 for local runs)
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)