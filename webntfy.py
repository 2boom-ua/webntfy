#!/usr/bin/python3
# -*- coding: utf-8 -*-
# Copyright: 2boom 2024

from flask import Flask, render_template, jsonify, request
from datetime import datetime, timedelta
import sqlite3
import os

app = Flask(__name__)
DB_FILE = os.path.join(os.path.dirname(os.path.realpath(__file__)), "messages.db")

MAX_DAYS = 30

def toHTMLFormat(message: str) -> str:
    """Converts Markdown-like syntax to HTML format."""
    message = ''.join(f"<b>{part}</b>" if i % 2 else part for i, part in enumerate(message.split('**')))
    message = ''.join(f"<i>{part}</i>" if i % 2 else part for i, part in enumerate(message.split('*')))
    message = ''.join(f"<u>{part}</u>" if i % 2 else part for i, part in enumerate(message.split('__')))
    message = ''.join(f"<s>{part}</s>" if i % 2 else part for i, part in enumerate(message.split('~~')))
    return message.replace("\n", "<br>")


def init_db():
    """Initialize the SQLite database and create the messages table."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            time TEXT NOT NULL,
            text TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


def get_messages():
    """Retrieve all messages from the database."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT id, time, text FROM messages ORDER BY id ASC")
    messages = [{"id": row[0], "time": row[1], "text": row[2]} for row in cursor.fetchall()]
    conn.close()
    return messages


def add_message(text):
    """Add a new message to the database."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    cursor.execute(
        "INSERT INTO messages (time, text, created_at) VALUES (?, ?, ?)", 
        (now, toHTMLFormat(text), now)
    )
    conn.commit()
    conn.close()


def delete_message(message_id):
    """Delete a message from the database."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM messages WHERE id = ?", (message_id,))
    conn.commit()
    conn.close()


def truncate_messages():
    """Ensure only messages from the last month are retained."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    one_month_ago = datetime.now() - timedelta(days=MAX_DAYS)
    cursor.execute(
        "DELETE FROM messages WHERE created_at < ?", 
        (one_month_ago.strftime('%Y-%m-%d %H:%M:%S'),)
    )
    conn.commit()
    conn.close()


def get_last_message_id():
    """Fetch the ID of the last message in the database."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM messages ORDER BY id DESC LIMIT 1")
    last_message = cursor.fetchone()
    conn.close()
    if last_message:
        return last_message[0]
    return None


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    try:
        conn = sqlite3.connect(DB_FILE)
        conn.cursor().execute("SELECT 1")
        conn.close()
        return jsonify({"status": "healthy"}), 200
    except sqlite3.Error as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 500


@app.route('/maxdays', methods=['POST'])
def max_days():
    """Update the MAX_DAYS value."""
    global MAX_DAYS
    try:
        data = request.get_json()
        new_max_days = int(data.get("max_days", MAX_DAYS))
        if new_max_days <= 0:
            return jsonify({"status": "error", "message": "MAX_DAYS must be greater than 0."}), 400
        MAX_DAYS = new_max_days
        return jsonify({"status": "success", "message": f"MAX_DAYS updated to {MAX_DAYS}."}), 200
    except (ValueError, TypeError):
        return jsonify({"status": "error", "message": "Invalid input. MAX_DAYS must be an integer."}), 400


@app.route('/deletelast', methods=['DELETE'])
def delete_last_message():
    """Delete the last message from the database."""
    last_id = get_last_message_id()
    if last_id is not None:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM messages WHERE id = ?", (last_id,))
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": "Last message deleted."}), 200
    return jsonify({"status": "error", "message": "No messages to delete."}), 400

   
@app.route('/deleteall', methods=['DELETE'])
def delete_all_messages():
    """Delete all messages from the database."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM messages")
    conn.commit()
    conn.close()
    return jsonify({"status": "success", "message": "All messages have been deleted."})


@app.route('/')
def index():
    """Serve the main HTML page."""
    return render_template('index.html')


@app.route('/messages', methods=['GET', 'POST', 'DELETE'])
def messages_endpoint():
    if request.method == 'POST':
        data = request.get_json()
        if 'message' in data:
            add_message(data['message'])
            truncate_messages()
            return jsonify({"status": "success", "message": "Message added!"}), 200
        return jsonify({"status": "error", "message": "No message provided!"}), 400

    if request.method == 'DELETE':
        data = request.json
        message_id = data.get('id')
        if message_id is not None:
            delete_message(message_id)
            return jsonify({"status": "success", "message": "Message deleted!"}), 200
        return jsonify({"status": "error", "message": "Invalid ID!"}), 400

    return jsonify({"messages": get_messages()})


if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5511)
