from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
import os
from dotenv import load_dotenv
from flask_bcrypt import Bcrypt

load_dotenv()
app = Flask(__name__)
# IMPORTANT: This allows your Vercel URL to talk to this backend
CORS(app)
bcrypt = Bcrypt(app)

DB_URL = os.getenv("DATABASE_URL")

def get_db_connection():
    try:
        return psycopg2.connect(DB_URL)
    except Exception as e:
        print(f"DATABASE_CONNECTION_ERROR: {e}")
        return None

# --- RENDER HEALTH CHECK (Fixes the 404) ---
@app.route('/')
def home():
    return jsonify({
        "status": "Neural_Mainframe_Online",
        "message": "System is operational and ready for sync."
    }), 200

# --- AUTH ROUTES ---
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    uname = data.get('username')
    hashed_pw = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("INSERT INTO users (username, password) VALUES (%s, %s) RETURNING id", (uname, hashed_pw))
        user_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"user_id": user_id, "username": uname}), 201
    except:
        return jsonify({"error": "IDENTITY_EXISTS"}), 400

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    uname = data.get('username')
    pw = data.get('password')
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, username, password FROM users WHERE username = %s", (uname,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    if user and bcrypt.check_password_hash(user[2], pw):
        return jsonify({"user_id": user[0], "username": user[1]}), 200
    return jsonify({"error": "INVALID_CREDENTIALS"}), 401

# --- DATA ROUTES ---
@app.route('/add-log', methods=['POST'])
def add_log():
    data = request.json
    uid = data.get('user_id')
    sub = data.get('subject').upper()
    hrs = data.get('hours')
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("INSERT INTO study_logs (user_id, subject, hours_studied) VALUES (%s, %s, %s)", (uid, sub, hrs))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "UPLOAD_SUCCESS"}), 201
    except:
        return jsonify({"error": "WRITE_FAILURE"}), 500

@app.route('/get-data/<int:user_id>', methods=['GET'])
def get_data(user_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT SUM(hours_studied), COUNT(DISTINCT log_date) FROM study_logs WHERE user_id = %s", (user_id,))
    stats = cur.fetchone()
    total_h = float(stats[0] or 0)
    days = stats[1] or 1 
    eff_calc = (total_h / (days * 8)) * 100
    efficiency = round(min(eff_calc, 100), 1)
    cur.execute("SELECT subject, SUM(hours_studied) FROM study_logs WHERE user_id = %s GROUP BY subject", (user_id,))
    chart = [{"name": r[0], "value": float(r[1])} for r in cur.fetchall()]
    cur.execute("SELECT id, subject, hours_studied, log_date FROM study_logs WHERE user_id = %s ORDER BY log_date DESC LIMIT 8", (user_id,))
    hist = [{"id": r[0], "subject": r[1], "hours": float(r[2]), "date": str(r[3])} for r in cur.fetchall()]
    cur.close()
    conn.close()
    return jsonify({"total_hours": total_h, "streak": stats[1] or 0, "efficiency": efficiency, "chartData": chart, "history": hist})

if __name__ == '__main__':
    # Use the port Render gives us, or default to 5000 for local testing
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)