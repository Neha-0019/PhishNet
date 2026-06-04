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
    from routes.predict import predict_bp

    print("STEP 6")
    from routes.report import report_bp

    print("STEP 7")
    from routes.feedback import feedback_bp

    print("STEP 8")
    from routes.bulk import bulk_bp

    print("STEP 9")
    
    app.register_blueprint(predict_bp, url_prefix='/api')
    app.register_blueprint(report_bp, url_prefix='/api')
    app.register_blueprint(feedback_bp, url_prefix='/api')
    app.register_blueprint(bulk_bp, url_prefix='/api')
    
    @app.route('/api/stats', methods=['GET'])
    def stats():
        total_scans = ScanResult.query.count()
        phishing_detected = ScanResult.query.filter_by(is_phishing=True).count()
        safe_detected = total_scans - phishing_detected
        
        accuracy_estimate = 88.0 
        
        from datetime import datetime, timedelta
        
        trend_data = []
        today = datetime.utcnow().date()
        for i in range(6, -1, -1):
            target_date = today - timedelta(days=i)
            start_dt = datetime(target_date.year, target_date.month, target_date.day)
            end_dt = start_dt + timedelta(days=1)
            
            day_scans = ScanResult.query.filter(ScanResult.timestamp >= start_dt, ScanResult.timestamp < end_dt).all()
            
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

    print("STEP 10")
    with app.app_context():
        db.create_all()

    print("STEP 11")
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
