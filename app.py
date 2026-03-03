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
            UNIQUE(user_id, level, lesson_index),
            FOREIGN KEY(user_id) REFERENCES users(id)
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
            attempted_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
        """
    )

    db.commit()
    db.close()


def load_level_data(level):
    if level not in LEVEL_ORDER:
        return []
    lesson_file = LESSONS_DIR / f"{level}.json"
    if not lesson_file.exists():
        return []
    with open(lesson_file, "r", encoding="utf-8") as file:
        return json.load(file)


def get_current_user():
    username = session.get("username")
    if not username:
        return None
    db = get_db()
    return db.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()


def get_user_progress(user_id):
    db = get_db()
    rows = db.execute(
        "SELECT level, lesson_index, score, total FROM progress WHERE user_id = ?",
        (user_id,),
    ).fetchall()

    progress_map = {}
    for row in rows:
        level = row["level"]
        progress_map.setdefault(level, {})[row["lesson_index"]] = {
            "score": row["score"],
            "total": row["total"],
        }
    return progress_map


def get_recent_attempts(user_id, limit=8):
    db = get_db()
    rows = db.execute(
        """
        SELECT level, lesson_index, score, total, percent, passed, attempted_at
        FROM quiz_attempts
        WHERE user_id = ?
        ORDER BY attempted_at DESC
        LIMIT ?
        """,
        (user_id, limit),
    ).fetchall()
    return rows


def get_daily_streak(user_id):
    db = get_db()
    rows = db.execute(
        """
        SELECT DISTINCT date(attempted_at) AS attempt_day
        FROM quiz_attempts
        WHERE user_id = ?
        ORDER BY attempt_day DESC
        """,
        (user_id,),
    ).fetchall()

    if not rows:
        return 0

    available_days = {
        datetime.strptime(row["attempt_day"], "%Y-%m-%d").date() for row in rows if row["attempt_day"]
    }

    streak = 0
    current_day = date.today()
    if current_day not in available_days:
        current_day = current_day - timedelta(days=1)
        if current_day not in available_days:
            return 0

    while current_day in available_days:
        streak += 1
        current_day -= timedelta(days=1)

    return streak


def record_attempt(user_id, level, lesson_index, score, total, percent, passed):
    db = get_db()
    db.execute(
        """
        INSERT INTO quiz_attempts (
            user_id, level, lesson_index, score, total, percent, passed, attempted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            user_id,
            level,
            lesson_index,
            score,
            total,
            percent,
            1 if passed else 0,
            datetime.now().isoformat(timespec="seconds"),
        ),
    )
    db.commit()


def level_completion_percent(level, level_data, progress_map):
    lesson_count = len(level_data)
    if lesson_count == 0:
        return 0

    completed = 0
    level_progress = progress_map.get(level, {})
    for index in range(lesson_count):
        if index in level_progress:
            completed += 1

    return int((completed / lesson_count) * 100)


def is_level_unlocked(level, completion_map):
    level_pos = LEVEL_ORDER.index(level)
    if level_pos == 0:
        return True
    prev_level = LEVEL_ORDER[level_pos - 1]
    return completion_map.get(prev_level, 0) == 100


def can_open_lesson(level, lesson_index, progress_map):
    level_progress = progress_map.get(level, {})
    if lesson_index == 0:
        return True
    return (lesson_index - 1) in level_progress


@app.route("/")
def home():
    return render_template("index.html")


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


@app.route("/dashboard")
def dashboard():
    user = get_current_user()
    if not user:
        return redirect(url_for("login"))

    progress_map = get_user_progress(user["id"])
    completion_map = {}
    level_cards = []
    level_data_map = {level: load_level_data(level) for level in LEVEL_ORDER}

    for level in LEVEL_ORDER:
        level_data = level_data_map[level]
        completion = level_completion_percent(level, level_data, progress_map)
        completion_map[level] = completion

    for level in LEVEL_ORDER:
        unlocked = is_level_unlocked(level, completion_map)
        level_cards.append(
            {
                "slug": level,
                "title": level.title(),
                "completion": completion_map[level],
                "lessons": len(level_data_map[level]),
                "unlocked": unlocked,
            }
        )

    total_lessons = sum(item["lessons"] for item in level_cards)
    completed_lessons = sum((item["completion"] * item["lessons"]) // 100 for item in level_cards)
    total_xp = 0

    for level, lessons in progress_map.items():
        for lesson in lessons.values():
            total = lesson.get("total", 0)
            score = lesson.get("score", 0)
            percent = int((score / total) * 100) if total else 0
            if percent >= PASS_PERCENT:
                total_xp += XP_PER_PASS

    overall_completion = int((completed_lessons / total_lessons) * 100) if total_lessons else 0
    streak_days = get_daily_streak(user["id"])
    recent_attempts = get_recent_attempts(user["id"])

    return render_template(
        "dashboard.html",
        username=user["username"],
        level_cards=level_cards,
        total_lessons=total_lessons,
        completed_lessons=completed_lessons,
        total_xp=total_xp,
        streak_days=streak_days,
        overall_completion=overall_completion,
        recent_attempts=recent_attempts,
    )


@app.route("/analytics")
def analytics():
    user = get_current_user()
    if not user:
        return redirect(url_for("login"))

    progress_map = get_user_progress(user["id"])
    recent_attempts = get_recent_attempts(user["id"], limit=24)
    level_data_map = {level: load_level_data(level) for level in LEVEL_ORDER}

    level_stats = []
    for level in LEVEL_ORDER:
        level_progress = progress_map.get(level, {})
        total_lessons = len(level_data_map[level])
        completion = level_completion_percent(level, level_data_map[level], progress_map)

        total_score = sum(item["score"] for item in level_progress.values())
        total_questions = sum(item["total"] for item in level_progress.values())
        accuracy = int((total_score / total_questions) * 100) if total_questions else 0

        level_stats.append(
            {
                "title": level.title(),
                "completion": completion,
                "accuracy": accuracy,
                "completed_lessons": len(level_progress),
                "total_lessons": total_lessons,
            }
        )

    attempts_count = len(recent_attempts)
    avg_recent = (
        int(sum(row["percent"] for row in recent_attempts) / attempts_count)
        if attempts_count
        else 0
    )

    return render_template(
        "analytics.html",
        username=user["username"],
        level_stats=level_stats,
        recent_attempts=recent_attempts,
        avg_recent=avg_recent,
        streak_days=get_daily_streak(user["id"]),
    )


@app.route("/lesson/<level>")
def lesson(level):
    user = get_current_user()
    if not user:
        return redirect(url_for("login"))

    if level not in LEVEL_ORDER:
        return redirect(url_for("dashboard"))

    progress_map = get_user_progress(user["id"])
    completion_map = {
        lvl: level_completion_percent(lvl, load_level_data(lvl), progress_map)
        for lvl in LEVEL_ORDER
    }

    if not is_level_unlocked(level, completion_map):
        flash("Complete the previous level first.", "error")
        return redirect(url_for("dashboard"))

    level_data = load_level_data(level)
    lessons = []
    for idx, lesson_item in enumerate(level_data):
        completed = idx in progress_map.get(level, {})
        lessons.append(
            {
                "index": idx,
                "title": lesson_item.get("title", f"Lesson {idx + 1}"),
                "description": lesson_item.get("description", ""),
                "completed": completed,
                "unlocked": can_open_lesson(level, idx, progress_map),
            }
        )

    return render_template(
        "lesson.html",
        level=level,
        level_title=level.title(),
        lessons=lessons,
    )


@app.route("/exercise/<level>/<int:lesson_index>", methods=["GET", "POST"])
def exercise(level, lesson_index):
    user = get_current_user()
    if not user:
        return redirect(url_for("login"))

    if level not in LEVEL_ORDER:
        return redirect(url_for("dashboard"))

    level_data = load_level_data(level)
    if lesson_index < 0 or lesson_index >= len(level_data):
        return redirect(url_for("lesson", level=level))

    progress_map = get_user_progress(user["id"])
    completion_map = {
        lvl: level_completion_percent(lvl, load_level_data(lvl), progress_map)
        for lvl in LEVEL_ORDER
    }

    if not is_level_unlocked(level, completion_map) or not can_open_lesson(
        level, lesson_index, progress_map
    ):
        flash("Finish the previous lesson first.", "error")
        return redirect(url_for("lesson", level=level))

    lesson_data = level_data[lesson_index]
    questions = lesson_data.get("questions", [])

    if request.method == "POST":
        score = 0
        total = len(questions)
        answered_questions = []

        for q_idx, question in enumerate(questions):
            picked = request.form.get(f"q_{q_idx}", "")
            correct_answer = question.get("answer")
            is_correct = picked == correct_answer
            if is_correct:
                score += 1

            answered_questions.append(
                {
                    "question": question.get("question", ""),
                    "options": question.get("options", []),
                    "picked": picked,
                    "answer": correct_answer,
                    "is_correct": is_correct,
                }
            )

        db = get_db()
        db.execute(
            """
            INSERT INTO progress (user_id, level, lesson_index, score, total)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(user_id, level, lesson_index)
            DO UPDATE SET score=excluded.score, total=excluded.total
            """,
            (user["id"], level, lesson_index, score, total),
        )
        percent = int((score / total) * 100) if total else 0
        passed = percent >= PASS_PERCENT
        db.commit()

        record_attempt(user["id"], level, lesson_index, score, total, percent, passed)

        if passed:
            flash(f"Great job! You scored {percent}% and passed.", "success")
        else:
            flash(
                f"You scored {percent}%. Keep practicing and try again.",
                "error",
            )

        return render_template(
            "exercise.html",
            level=level,
            level_title=level.title(),
            lesson_index=lesson_index,
            lesson_title=lesson_data.get("title", f"Lesson {lesson_index + 1}"),
            questions=questions,
            result_mode=True,
            answered_questions=answered_questions,
            score=score,
            total=total,
            percent=percent,
            passed=passed,
        )

    return render_template(
        "exercise.html",
        level=level,
        level_title=level.title(),
        lesson_index=lesson_index,
        lesson_title=lesson_data.get("title", f"Lesson {lesson_index + 1}"),
        questions=questions,
        result_mode=False,
    )


init_db()


if __name__ == "__main__":
    app.run(debug=True)