from flask import Flask, request, jsonify, Response, send_from_directory
import sqlite3
import os

app = Flask(__name__)
DataBase = "database.db"

latest_item = {}

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return response

@app.route('/', methods=["GET"])
def index():
    return send_from_directory('.', 'index.html')

@app.route('/getItemInfo', methods=["POST"])
def getItemInfo():
    global latest_item
    body = request.json

    if not body or "nfc" not in body:
        return Response("Invalid request body", status=400)

    nfc_id = body["nfc"]

    conn = sqlite3.connect(DataBase)
    cursor = conn.cursor()

    try:
        cursor.execute('SELECT name, price FROM item_info WHERE nfcID = ?', (nfc_id,))
        qr = cursor.fetchone()
        if qr:
            data = {"name": qr[0], "price": qr[1]}
            latest_item = data
            print(f"[INFO] NFC: {nfc_id} → {data}")
            return jsonify(data)
        else:
            return Response("Item not found", status=404)
    except Exception as e:
        print("[ERROR]", e)
        return Response("Server error", status=500)
    finally:
        conn.close()

@app.route('/latestItem', methods=["GET"])
def latest_item_route():
    global latest_item
    if latest_item:
        result = latest_item
        latest_item = {}
        return jsonify(result)
    else:
        return Response("No data", status=404)


@app.route('/images/<filename>')
def serve_image(filename):
    return send_from_directory('images', filename)

if __name__ == "__main__":
    app.run(port=8720, host='0.0.0.0')