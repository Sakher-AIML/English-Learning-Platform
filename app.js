/* EnglishPath — client-side application logic for GitHub Pages deployment */
/* NOTE: This is a static demo application. User data (including passwords) is stored
   in browser localStorage and is NOT secure. Do not use real or sensitive credentials.
   For a production deployment, replace the auth layer with a proper back-end service. */
"use strict";

const APP = (() => {
    const PASS_PERCENT = 70;
    const XP_PER_PASS = 25;
    const LEVEL_ORDER = ["beginner", "intermediate", "advanced"];

    /* ── Storage helpers ── */
    function getUsers() {
        return JSON.parse(localStorage.getItem("ep_users") || "{}");
    }
    function saveUsers(u) {
        localStorage.setItem("ep_users", JSON.stringify(u));
    }
    function getCurrentUser() {
        return sessionStorage.getItem("ep_current_user") || null;
    }
    function setCurrentUser(u) {
        sessionStorage.setItem("ep_current_user", u);
    }
    function clearCurrentUser() {
        sessionStorage.removeItem("ep_current_user");
    }

    /* ── Auth ── */
    function register(username, password) {
        if (username.length < 3 || password.length < 4) {
            return { ok: false, error: "Username min 3 chars and password min 4 chars." };
        }
        const users = getUsers();
        if (users[username]) {
            return { ok: false, error: "Username already exists." };
        }
        users[username] = { password };
        saveUsers(users);
        return { ok: true };
    }

    function login(username, password) {
        const users = getUsers();
        const user = users[username];
        if (!user || user.password !== password) {
            return { ok: false, error: "Invalid username or password." };
        }
        setCurrentUser(username);
        return { ok: true };
    }

    function logout() {
        clearCurrentUser();
        window.location.href = "index.html";
    }

    function requireLogin() {
        if (!getCurrentUser()) {
            window.location.href = "login.html";
            return false;
        }
        return true;
    }

    /* ── Progress ── */
    function getProgress(username) {
        return JSON.parse(localStorage.getItem("ep_progress_" + username) || "{}");
    }
    function saveProgressItem(username, level, lessonIndex, score, total) {
        const p = getProgress(username);
        if (!p[level]) p[level] = {};
        p[level][String(lessonIndex)] = { score, total };
        localStorage.setItem("ep_progress_" + username, JSON.stringify(p));
    }
    function getAttempts(username) {
        return JSON.parse(localStorage.getItem("ep_attempts_" + username) || "[]");
    }
    function recordAttempt(username, level, lessonIndex, score, total, percent, passed) {
        const attempts = getAttempts(username);
        const now = new Date();
        const pad = (n) => String(n).padStart(2, "0");
        const ts = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate()) +
            " " + pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
        attempts.unshift({ level, lesson_index: lessonIndex, score, total, percent, passed, attempted_at: ts });
        localStorage.setItem("ep_attempts_" + username, JSON.stringify(attempts));
    }

    function levelCompletionPercent(level, levelData, progress) {
        const count = levelData.length;
        if (!count) return 0;
        const lp = progress[level] || {};
        const completed = Object.keys(lp).length;
        return Math.round((completed / count) * 100);
    }
    function isLevelUnlocked(level, completionMap) {
        const idx = LEVEL_ORDER.indexOf(level);
        if (idx === 0) return true;
        return completionMap[LEVEL_ORDER[idx - 1]] === 100;
    }
    function canOpenLesson(level, lessonIndex, progress) {
        if (lessonIndex === 0) return true;
        const lp = progress[level] || {};
        return String(lessonIndex - 1) in lp;
    }
    function getDailyStreak(username) {
        const attempts = getAttempts(username);
        const days = new Set(attempts.map((a) => a.attempted_at.slice(0, 10)));
        if (!days.size) return 0;
        const pad = (n) => String(n).padStart(2, "0");
        const fmt = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
        let streak = 0;
        const cur = new Date();
        if (!days.has(fmt(cur))) {
            cur.setDate(cur.getDate() - 1);
            if (!days.has(fmt(cur))) return 0;
        }
        while (days.has(fmt(cur))) {
            streak++;
            cur.setDate(cur.getDate() - 1);
        }
        return streak;
    }
    function getTotalXP(progress) {
        let xp = 0;
        Object.values(progress).forEach((lp) => {
            Object.values(lp).forEach((item) => {
                const pct = item.total ? Math.round((item.score / item.total) * 100) : 0;
                if (pct >= PASS_PERCENT) xp += XP_PER_PASS;
            });
        });
        return xp;
    }

    /* ── Lesson data cache ── */
    const cache = {};
    async function loadLevelData(level) {
        if (cache[level]) return cache[level];
        try {
            const res = await fetch(level + ".json");
            if (!res.ok) throw new Error("not found");
            const data = await res.json();
            cache[level] = data;
            return data;
        } catch (_) {
            return [];
        }
    }

    /* ── Flash messages ── */
    function showFlash(message, type) {
        type = type || "success";
        let wrap = document.querySelector(".flash-wrap");
        if (!wrap) {
            wrap = document.createElement("div");
            wrap.className = "flash-wrap";
            const container = document.querySelector(".container");
            if (container) container.prepend(wrap);
        }
        const div = document.createElement("div");
        div.className = "flash flash-" + type;
        div.textContent = message;
        wrap.appendChild(div);
        setTimeout(function () {
            div.style.transition = "opacity 0.5s ease, transform 0.5s ease";
            div.style.opacity = "0";
            div.style.transform = "translateY(-8px)";
            setTimeout(function () { div.remove(); }, 500);
        }, 5000);
    }

    /* ── Navigation ── */
    function updateNav() {
        const user = getCurrentUser();
        const navOut = document.getElementById("nav-logged-out");
        const navIn = document.getElementById("nav-logged-in");
        const footOut = document.getElementById("footer-logged-out");
        const footIn = document.getElementById("footer-logged-in");
        if (user) {
            if (navOut) navOut.style.display = "none";
            if (navIn) navIn.style.display = "contents";
            if (footOut) footOut.style.display = "none";
            if (footIn) footIn.style.display = "contents";
        }
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", function (e) {
                e.preventDefault();
                logout();
            });
        }
    }

    /* ── URL parameters ── */
    function getParams() {
        return Object.fromEntries(new URLSearchParams(window.location.search));
    }

    /* ── Animate progress bars and cards (called after dynamic render) ── */
    function animatePage() {
        document.querySelectorAll(".progress-fill[data-progress]").forEach(function (bar) {
            const val = parseInt(bar.dataset.progress || "0", 10);
            bar.style.width = Math.max(0, Math.min(val, 100)) + "%";
        });
        const cards = document.querySelectorAll(".feature-card, .stat-card, .level-card, .step-card, .lesson-item");
        cards.forEach(function (card, i) {
            card.style.opacity = "0";
            card.style.transform = "translateY(16px)";
            card.style.transition = "opacity 0.4s ease " + (i * 0.06) + "s, transform 0.4s ease " + (i * 0.06) + "s";
        });
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                cards.forEach(function (card) {
                    card.style.opacity = "1";
                    card.style.transform = "translateY(0)";
                });
            });
        });
    }

    return {
        PASS_PERCENT,
        XP_PER_PASS,
        LEVEL_ORDER,
        getCurrentUser,
        register,
        login,
        logout,
        requireLogin,
        getProgress,
        saveProgressItem,
        getAttempts,
        recordAttempt,
        levelCompletionPercent,
        isLevelUnlocked,
        canOpenLesson,
        getDailyStreak,
        getTotalXP,
        loadLevelData,
        showFlash,
        updateNav,
        getParams,
        animatePage,
    };
})();
