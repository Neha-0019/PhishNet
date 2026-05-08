import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, confusion_matrix
import shap
import joblib
import os

def train_model():
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'phishing_dataset.csv')
    if not os.path.exists(data_path):
        print(f"Dataset not found at {data_path}. Creating a dummy dataset for demonstration...")
        # Create a dummy dataset with 20 features + 'Result'
        np.random.seed(42)
        X_dummy = np.random.rand(100, 20)
        y_dummy = np.random.randint(0, 2, 100)
        columns = [
            'url_length', 'has_ip_address', 'has_at_symbol', 'num_dots', 'num_hyphens', 
            'num_subdomains', 'is_https', 'has_port', 'url_depth', 'has_double_slash_redirect',
            'domain_length', 'has_suspicious_keywords', 'path_length', 'query_length', 
            'num_special_chars', 'tld_in_path', 'domain_age_days', 'is_shortened_url', 
            'num_digits_in_domain', 'has_valid_ssl'
        ]
        df = pd.DataFrame(X_dummy, columns=columns)
        df['Result'] = y_dummy
        df.to_csv(data_path, index=False)
        
    df = pd.read_csv(data_path)
    X = df.drop('Result', axis=1)
    y = df['Result']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Base models
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    xgb = XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42)
    svc = SVC(probability=True, random_state=42)
    
    ensemble = VotingClassifier(
        estimators=[('rf', rf), ('xgb', xgb), ('svc', svc)],
        voting='soft'
    )
    
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('classifier', ensemble)
    ])
    
    print("Training model...")
    pipeline.fit(X_train, y_train)
    
    y_pred = pipeline.predict(X_test)
    print("Classification Report:")
    print(classification_report(y_test, y_pred))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    
    model_path = os.path.join(os.path.dirname(__file__), 'phishnet_model.pkl')
    joblib.dump(pipeline, model_path)
    print(f"Model saved to {model_path}")
    
    # Compute SHAP explainer
    print("Computing SHAP explainer...")
    X_train_scaled = pipeline.named_steps['scaler'].transform(X_train)
    rf.fit(X_train_scaled, y_train)
    explainer = shap.TreeExplainer(rf)
    explainer_path = os.path.join(os.path.dirname(__file__), 'phishnet_explainer.pkl')
    joblib.dump(explainer, explainer_path)
    print(f"SHAP explainer saved to {explainer_path}")

if __name__ == '__main__':
    train_model()
