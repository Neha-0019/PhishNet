import os
import joblib
import pandas as pd
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'phishnet_model.pkl')
EXPLAINER_PATH = os.path.join(os.path.dirname(__file__), 'phishnet_explainer.pkl')

pipeline = None
explainer = None

def load_models():
    global pipeline, explainer
    if os.path.exists(MODEL_PATH):
        pipeline = joblib.load(MODEL_PATH)
    if os.path.exists(EXPLAINER_PATH):
        explainer = joblib.load(EXPLAINER_PATH)

def get_prediction(features_dict):
    if pipeline is None:
        load_models()
    
    if pipeline is None:
        raise Exception("Model not trained yet.")
        
    feature_names = [
        'url_length', 'has_ip_address', 'has_at_symbol', 'num_dots', 'num_hyphens', 
        'num_subdomains', 'is_https', 'has_port', 'url_depth', 'has_double_slash_redirect',
        'domain_length', 'has_suspicious_keywords', 'path_length', 'query_length', 
        'num_special_chars', 'tld_in_path', 'domain_age_days', 'is_shortened_url', 
        'num_digits_in_domain', 'has_valid_ssl'
    ]
    
    X_test = pd.DataFrame([[features_dict.get(f, 0) for f in feature_names]], columns=feature_names)
    
    proba = pipeline.predict_proba(X_test)[0]
    phishing_prob = proba[1]
    
    raw_phish_score = phishing_prob * 100
    is_phishing = phishing_prob > 0.5
    
    if raw_phish_score > 75:
        risk_level = "Dangerous"
    elif raw_phish_score > 40:
        risk_level = "Suspicious"
    else:
        risk_level = "Safe"
        
    # Show confidence in the *chosen* prediction
    confidence = raw_phish_score if is_phishing else (1 - phishing_prob) * 100
        
    top_features = []
    if explainer is not None:
        try:
            X_test_scaled = pipeline.named_steps['scaler'].transform(X_test)
            shap_values = explainer.shap_values(X_test_scaled)
            
            if isinstance(shap_values, list):
                shap_vals = shap_values[1][0]
            elif len(shap_values.shape) == 3: # multi-class array format
                shap_vals = shap_values[..., 1][0]
            else:
                shap_vals = shap_values[0]
                
            feature_impacts = []
            for i, feat_name in enumerate(feature_names):
                feature_impacts.append({
                    'feature': feat_name,
                    'value': float(X_test.iloc[0, i]),
                    'impact': float(shap_vals[i])
                })
                
            feature_impacts.sort(key=lambda x: abs(x['impact']), reverse=True)
            top_features = feature_impacts[:5]
        except Exception as e:
            print(f"SHAP explanation failed: {e}")

    return {
        "is_phishing": bool(is_phishing),
        "confidence": round(confidence, 2),
        "risk_level": risk_level,
        "top_features": top_features
    }
