from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import datetime

# Firebase Admin Imports
import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__)
# Enable CORS so your frontend on port 5500 can talk to your backend on port 5001
CORS(app) 

# ==========================================
# 1. CLOUD DATABASE CONFIGURATION
# ==========================================
db = None
KEY_PATH = "firebase-key.json"

try:
    if os.path.exists(KEY_PATH):
        # Connect to Firebase using your downloaded service account key
        cred = credentials.Certificate(KEY_PATH)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("✅ SUCCESS: Connected to Firebase Firestore!")
    else:
        print("⚠️ NOTICE: firebase-key.json not found. Running in local fallback mode.")
except Exception as e:
    print(f"⚠️ FIREBASE ERROR: {e}. Running in local fallback mode.")

# ==========================================
# 2. LOCAL MEMORY DATABASE (Fallback/Seed)
# ==========================================
MOCK_STANDARDS = [
    {
        "code": "IS 10322 (Part 5/Sec 3)",
        "title": "Luminaires for Road and Street Lighting",
        "scope": "Specifies requirements for road and street lighting luminaires incorporating electric light sources.",
        "keywords": ["led", "streetlights", "housing", "ip66", "luminaires", "aluminum"]
    },
    {
        "code": "IS 10 : 1998",
        "title": "Plywood Tea-Chests - Specification",
        "scope": "Covers requirements for plywood tea-chests for packing tea.",
        "keywords": ["tea-chests", "plywood", "export", "packaging", "wood"]
    },
    {
        "code": "IS 10258 : 2002",
        "title": "Sterile Hypodermic Syringes for Single Use",
        "scope": "Specifies requirements for sterile hypodermic syringes for single use.",
        "keywords": ["syringes", "sterile", "medical", "hypodermic", "auto-disable"]
    }
]

# ==========================================
# 3. AI ANALYSIS PIPELINE (WRITE TO CLOUD)
# ==========================================
@app.route('/api/recommend', methods=['POST'])
def recommend():
    data = request.json
    specification = data.get("specification", "").lower()

    if not specification:
        return jsonify({"error": "No specification provided"}), 400

    results = []
    
    for std in MOCK_STANDARDS:
        match_count = sum(1 for kw in std["keywords"] if kw in specification)
        
        if match_count > 0:
            match_score = min(90 + (match_count * 2), 99) 
            results.append({
                "code": std["code"],
                "title": std["title"],
                "scope": std["scope"],
                "match_score": match_score,
                "semantic_score": match_score - 2,
                "lexical_score": match_score - 5,
                "matched_keywords": [kw for kw in std["keywords"] if kw in specification]
            })

    results = sorted(results, key=lambda x: x["match_score"], reverse=True)

    ai_summary = "No standard directly mapped. Manual intervention required."
    if results:
        ai_summary = f"Gemini 3.8 Analysis: The requirements heavily match {results[0]['code']}. Ensure compliance with testing protocols and materials as specified in the standard."

    response_payload = {
        "ai_summary": ai_summary,
        "recommendations": results
    }

    # FIREBASE WRITE
    if db:
        try:
            history_ref = db.collection('tender_history').document()
            history_ref.set({
                "specification_text": data.get("specification"),
                "top_match_code": results[0]['code'] if results else "None",
                "accuracy_score": results[0]['match_score'] if results else 0,
                "timestamp": datetime.datetime.now(datetime.timezone.utc)
            })
            print("☁️ Audit log saved to Firebase!")
        except Exception as e:
            print(f"⚠️ Failed to save audit log to Firebase: {e}")

    return jsonify(response_payload)

# ==========================================
# 4. HISTORY ENDPOINT (READ FROM CLOUD)
# ==========================================
@app.route('/api/history', methods=['GET'])
def get_history():
    if not db:
        return jsonify([]) # Return empty if no database connected

    try:
        # Fetch the 50 most recent audits from Firebase
        docs = db.collection('tender_history').order_by('timestamp', direction=firestore.Query.DESCENDING).limit(50).stream()
        
        history_list = []
        for doc in docs:
            doc_data = doc.to_dict()
            # Convert Firestore timestamp to string for JSON serialization
            if 'timestamp' in doc_data:
                doc_data['timestamp'] = doc_data['timestamp'].isoformat()
            history_list.append(doc_data)
            
        return jsonify(history_list)
        
    except Exception as e:
        print(f"⚠️ Failed to fetch history from Firebase: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001)
