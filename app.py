from pathlib import Path
import json
import sqlite3
from datetime import date, datetime, timedelta

from flask import (
    Flask,
    flash,
    g,
    redirect,
    render_template,
    request,
    session,
    url_for,
)
from werkzeug.security import check_password_hash, generate_password_hash


app = Flask(__name__)
app.secret_key = "change_this_secret_key"

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "database.db"
LESSONS_DIR = BASE_DIR / "lessons"
VOCABULARY_DIR = BASE_DIR / "vocabulary"
QUESTION_BANK_DIR = BASE_DIR / "question_bank"
GRAMMAR_DIR = BASE_DIR / "grammar"
LEVEL_ORDER = ["beginner", "intermediate", "advanced"]
PASS_PERCENT = 70
XP_PER_PASS = 25


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(_error):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    db = sqlite3.connect(DB_PATH)
    cursor = db.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            level TEXT NOT NULL,
            lesson_index INTEGER NOT NULL,
            score INTEGER NOT NULL,
            total INTEGER NOT NULL,
            UNIQUE(user_id, level, lesson_index)
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS quiz_attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            level TEXT NOT NULL,
            lesson_index INTEGER NOT NULL,
            score INTEGER NOT NULL,
            total INTEGER NOT NULL,
            percent INTEGER NOT NULL,
            passed INTEGER NOT NULL,
            attempted_at TEXT NOT NULL
        )
        """
    )

    db.commit()
    db.close()


# -------------------- FIXED HOME ROUTE --------------------

@app.route("/")
def home():
    user = get_current_user()

    if user:
        return redirect(url_for("dashboard"))

    # Safe default values to prevent template crashes
    return render_template(
        "index.html",
        username="Guest",
        overall_completion=0,
        total_lessons=0,
        completed_lessons=0,
        total_xp=0,
        streak_days=0,
        level_cards=[],
        recent_attempts=[],
    )


# -------------------- AUTH --------------------

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")

        if len(username) < 3 or len(password) < 4:
            flash("Username min 3 chars and password min 4 chars.", "error")
            return render_template("register.html")

        db = get_db()
        try:
            db.execute(
                "INSERT INTO users (username, password_hash) VALUES (?, ?)",
                (username, generate_password_hash(password)),
            )
            db.commit()
        except sqlite3.IntegrityError:
            flash("Username already exists.", "error")
            return render_template("register.html")

        flash("Account created. Please login.", "success")
        return redirect(url_for("login"))

    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")

        db = get_db()
        user = db.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()

        if not user or not check_password_hash(user["password_hash"], password):
            flash("Invalid username or password.", "error")
            return render_template("login.html")

        session["username"] = user["username"]
        return redirect(url_for("dashboard"))

    return render_template("login.html")


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("home"))


# -------------------- DASHBOARD --------------------

@app.route("/dashboard")
def dashboard():
    user = get_current_user()
    if not user:
        return redirect(url_for("login"))

    # minimal safe dashboard
    return render_template(
        "dashboard.html",
        username=user["username"],
        overall_completion=0,
        total_lessons=0,
        completed_lessons=0,
        total_xp=0,
        streak_days=0,
        level_cards=[],
        recent_attempts=[],
    )


# -------------------- UTILS --------------------

def get_current_user():
    username = session.get("username")
    if not username:
        return None
    db = get_db()
    return db.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()


# -------------------- INIT + RUN --------------------

init_db()

import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
