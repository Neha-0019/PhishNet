import pandas as pd
import sys
import os
import time
import re
from concurrent.futures import ThreadPoolExecutor, as_completed

# Ensure we can import from backend.features
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from features.extractor import extract_features

def process_row(row):
    original_url = row['URL']
    label = row['Label']
    
    # Prepend http:// if there is no scheme, to ensure urlparse works correctly
    url_to_process = original_url
    if not re.match(r'^https?://', url_to_process):
        url_to_process = 'http://' + url_to_process
        
    try:
        features = extract_features(url_to_process)
        # We can still save the original URL in the dataset if we want
        features['URL'] = original_url
        features['Result'] = 1 if label == 'bad' else 0
        return features
    except Exception as e:
        return None

def main():
    csv_path = r'c:\Users\Neha Panbude\Desktop\PhishNet\backend\data\phishing_site_urls.csv'
    output_path = r'c:\Users\Neha Panbude\Desktop\PhishNet\backend\data\phishing_dataset.csv'
    
    print(f"Loading data from {csv_path}...")
    df = pd.read_csv(csv_path)
    
    # Let's do 1000 to save time and avoid heavy WHOIS rate limiting, but keep it balanced manually
    print("Sampling 1000 rows (stratified to ensure balance)...")
    bad_df = df[df['Label'] == 'bad'].sample(n=500, random_state=42)
    good_df = df[df['Label'] == 'good'].sample(n=500, random_state=42)
    sample_df = pd.concat([bad_df, good_df]).sample(frac=1, random_state=42) # shuffle
    
    results = []
    
    print("Starting extraction with ThreadPoolExecutor (this will take a few minutes for real SSL/Whois lookups)...")
    start_time = time.time()
    
    # 50 workers for IO-bound tasks
    with ThreadPoolExecutor(max_workers=50) as executor:
        future_to_row = {executor.submit(process_row, row): row for _, row in sample_df.iterrows()}
        
        count = 0
        for future in as_completed(future_to_row):
            result = future.result()
            if result:
                results.append(result)
            count += 1
            if count % 50 == 0:
                print(f"Processed {count}/1000 URLs...")
                
    end_time = time.time()
    print(f"Extraction completed in {end_time - start_time:.2f} seconds.")
    
    out_df = pd.DataFrame(results)
    
    # Reorder columns and format for training
    cols = [col for col in out_df.columns if col not in ['URL', 'Label', 'Result']]
    out_df = out_df[cols + ['Result']]
    
    print(f"Saving {len(out_df)} results to {output_path}...")
    out_df.to_csv(output_path, index=False)
    print("Done!")

if __name__ == "__main__":
    main()
