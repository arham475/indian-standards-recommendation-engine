# Indian Standards Recommendation Engine (ISAI)

An AI-driven procurement auditing platform designed to automatically analyze tender specifications and accurately map them to the relevant Bureau of Indian Standards (BIS). Built to streamline the procurement process, this engine ensures compliance, reduces manual verification time, and maintains an immutable audit trail of past recommendations.

## 🚀 Key Features

*   **AI-Powered Analysis:** Leverages natural language processing (Gemini architecture) to contextually analyze complex procurement documents.
*   **Semantic Mapping:** Maps tender requirements to a database of thousands of active BIS standards with calculated lexical and semantic match accuracy scores.
*   **Live Audit Feed:** All generated audits are instantly pushed to a cloud database and broadcasted to a live "Tender History" dashboard.
*   **Keyword Extraction:** Automatically identifies and tags critical material and testing requirements from raw text.
*   **Stateless UI / Cloud Backend:** Clean decoupling of the vanilla frontend from the Python engine, connected via RESTful API.

## 🛠 Tech Stack

*   **Frontend:** HTML5, CSS3, Vanilla JavaScript, Lucide Icons
*   **Backend:** Python 3, Flask, Flask-CORS
*   **Database:** Google Firebase (Firestore NoSQL)
*   **AI Engine:** REST API Integration (Gemini 3.8 Logic)

## ⚙️ Local Development Setup

### Prerequisites
* Python 3.x installed
* A Google Firebase account with a configured Firestore database
* `firebase-admin` and `flask` pip packages installed

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/arham475/indian-standards-recommendation-engine.git
cd indian-standards-recommendation-engine
\`\`\`

### 2. Configure the Backend (Firebase Auth)
To connect the local server to your own cloud database, you must generate a service account key.
1. Go to your Firebase Console -> Project Settings -> Service Accounts.
2. Click **Generate new private key**.
3. Rename the downloaded file exactly to `firebase-key.json`.
4. Place this file inside the `/backend` directory. *(Note: This file is included in the `.gitignore` to prevent accidental exposure of your cloud credentials).*

### 3. Run the Backend Server
Open a terminal, navigate to the backend folder, and start the Flask engine.
\`\`\`bash
cd backend
python3 app.py
\`\`\`
*The server will boot on `http://127.0.0.1:5001`. Wait for the `✅ SUCCESS: Connected to Firebase Firestore!` message.*

### 4. Launch the Frontend UI
Since the frontend uses vanilla web technologies, you can serve it using any local development server (like VS Code Live Server) or Python's built-in HTTP module:
\`\`\`bash
cd frontend
python3 -m http.server 5500
\`\`\`
Navigate to `http://127.0.0.1:5500/index.html` in your browser to access the ISAI Dashboard.

## 🗄️ Database Structure

The Firestore database utilizes a `tender_history` collection. Each document represents a single AI audit run and contains:
*   `specification_text`: The raw input query.
*   `mapped_standards`: Array of matched BIS objects (Code, Title, Match Score).
*   `timestamp`: Server-side generation time.

## 👨‍💻 Author

**Arham Jain** 
*Computer Science & Engineering*

---
*This project was originally conceptualized as a prototype for the Smart India Hackathon.*
