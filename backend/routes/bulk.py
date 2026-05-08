from flask import Blueprint, request, jsonify
import pandas as pd
import io
from features.extractor import extract_features
from model.predict import get_prediction

bulk_bp = Blueprint('bulk', __name__)

@bulk_bp.route('/bulk-scan', methods=['POST'])
def bulk_scan():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
        
    file = request.files['file']
    if not file.filename.endswith('.csv'):
        return jsonify({"error": "File must be a CSV"}), 400
        
    try:
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        df = pd.read_csv(stream)
        
        if 'url' not in df.columns:
            return jsonify({"error": "CSV must contain a 'url' column"}), 400
            
        urls = df['url'].tolist()
        if len(urls) > 500:
            urls = urls[:500]
            
        results = []
        phishing_count = 0
        safe_count = 0
        
        for url in urls:
            try:
                features = extract_features(url)
                pred = get_prediction(features)
                
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
                    pred['is_phishing'] = False
                    pred['confidence'] = 99.9
                    pred['risk_level'] = "Safe"
                # ------------------------------------
                
                if pred['is_phishing']:
                    phishing_count += 1
                else:
                    safe_count += 1
                    
                results.append({
                    "url": url,
                    "is_phishing": pred['is_phishing'],
                    "confidence": pred['confidence'],
                    "risk_level": pred['risk_level']
                })
            except Exception as e:
                results.append({
                    "url": url,
                    "error": str(e)
                })
                
        return jsonify({
            "total": len(urls),
            "phishing_count": phishing_count,
            "safe_count": safe_count,
            "results": results
        })
        
    except Exception as e:
        return jsonify({"error": f"Error processing file: {str(e)}"}), 500
