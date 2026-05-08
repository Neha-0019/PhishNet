from flask import Blueprint, request, jsonify
from datetime import datetime
import json
import hashlib
from features.extractor import extract_features
from model.predict import get_prediction
from database.models import db, ScanResult
import redis
from config import Config

predict_bp = Blueprint('predict', __name__)

# Initialize Redis (optional)
redis_client = None
try:
    redis_client = redis.from_url(Config.REDIS_URL)
    redis_client.ping()
except Exception:
    redis_client = None

@predict_bp.route('/predict', methods=['POST'])
def predict():
    data = request.json
    url = data.get('url')
    if not url:
        return jsonify({"error": "URL is required"}), 400
        
    url_hash = hashlib.md5(url.encode()).hexdigest()
    
    # Check cache
    if redis_client:
        cached_result = redis_client.get(f"url_scan:{url_hash}")
        if cached_result:
            return jsonify(json.loads(cached_result))
            
    # Extract features
    try:
        features = extract_features(url)
    except Exception as e:
        return jsonify({"error": f"Feature extraction failed: {str(e)}"}), 500
        
    # Get prediction
    try:
        prediction = get_prediction(features)
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500
        
    # --- Heuristic Allowlist Override ---
    from urllib.parse import urlparse
    parsed = urlparse(url)
    domain_name = parsed.netloc.split(':')[0].replace('www.', '')
    
    allowlist = [
        'amazon.in', 'amazon.com', 'google.com', 'youtube.com', 
        'github.com', 'microsoft.com', 'apple.com', 'facebook.com', 
        'instagram.com', 'twitter.com', 'linkedin.com', 'netflix.com'
    ]
    
    if domain_name in allowlist:
        prediction['is_phishing'] = False
        prediction['confidence'] = 99.9
        prediction['risk_level'] = "Safe"
        prediction['top_features'].insert(0, {
            'feature': 'trusted_allowlist_override', 
            'value': 1.0, 
            'impact': -1.0
        })
    # ------------------------------------
        
    # Save to database
    scan_result = ScanResult(
        url=url,
        is_phishing=prediction['is_phishing'],
        confidence=prediction['confidence'],
        risk_level=prediction['risk_level'],
        features_json=json.dumps(features),
        shap_json=json.dumps(prediction['top_features']),
        timestamp=datetime.utcnow()
    )
    db.session.add(scan_result)
    db.session.commit()
    
    response_data = {
        "url": url,
        "is_phishing": prediction['is_phishing'],
        "confidence": prediction['confidence'],
        "label": "Phishing" if prediction['is_phishing'] else "Safe",
        "risk_level": prediction['risk_level'],
        "top_features": prediction['top_features'],
        "scan_id": scan_result.id,
        "timestamp": scan_result.timestamp.isoformat()
    }
    
    # Cache for 1 hour
    if redis_client:
        redis_client.setex(f"url_scan:{url_hash}", 3600, json.dumps(response_data))
        
    return jsonify(response_data)
