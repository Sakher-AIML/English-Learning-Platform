/* ============================================================
   EnglishPath – Single-Page Application (GitHub Pages)
   All logic runs client-side with localStorage persistence.
   ============================================================ */

/* ─── Constants ─── */
const LEVEL_ORDER = ["beginner", "intermediate", "advanced"];
const PASS_PERCENT = 70;
const XP_PER_PASS = 25;
const LEVEL_ICONS = { beginner: "🌱", intermediate: "📚", advanced: "🏆" };

/* ─── Embedded Lesson Data ─── */
const LESSONS = {
  beginner: [
    {
      title: "Basic Greetings",
      description: "Learn simple daily greetings.",
      questions: [
        { question: "Choose the correct greeting for the morning.", options: ["Good night", "Good morning", "Goodbye", "See you"], answer: "Good morning" },
        { question: "What do you say when meeting someone for the first time?", options: ["Thank you", "Nice to meet you", "Excuse me", "Good luck"], answer: "Nice to meet you" },
        { question: "Which one means farewell?", options: ["How are you?", "Hello", "Goodbye", "Welcome"], answer: "Goodbye" },
        { question: "Fill in: ___ are you?", options: ["What", "Who", "How", "When"], answer: "How" }
      ]
    },
    {
      title: "Numbers and Colors",
      description: "Recognize basic numbers and common colors.",
      questions: [
        { question: "Which is the number 7?", options: ["Seven", "Eleven", "Seventeen", "Seventy"], answer: "Seven" },
        { question: "What color is the sky on a clear day?", options: ["Blue", "Green", "Brown", "Pink"], answer: "Blue" },
        { question: "Choose the correct spelling.", options: ["Yelow", "Yallow", "Yellow", "Yelloe"], answer: "Yellow" },
        { question: "Which number comes after 9?", options: ["8", "10", "11", "12"], answer: "10" }
      ]
    },
    {
      title: "Simple Sentences",
      description: "Build very basic English sentences.",
      questions: [
        { question: "Choose the correct sentence.", options: ["She are happy.", "She is happy.", "She am happy.", "She be happy."], answer: "She is happy." },
        { question: "Fill in: I ___ a student.", options: ["is", "are", "am", "be"], answer: "am" },
        { question: "Pick the correct order.", options: ["English I learn", "I learn English", "Learn I English", "I English learn"], answer: "I learn English" },
        { question: "Which one is a question?", options: ["You like tea.", "Do you like tea?", "You do like tea.", "Like you tea."], answer: "Do you like tea?" }
      ]
    }
  ],
  intermediate: [
    {
      title: "Past Tense Basics",
      description: "Use regular and irregular verbs in the past.",
      questions: [
        { question: "Choose the past form of 'go'.", options: ["goed", "gone", "went", "goes"], answer: "went" },
        { question: "Complete: They ___ football yesterday.", options: ["play", "played", "playing", "plays"], answer: "played" },
        { question: "Which sentence is correct?", options: ["I buyed a book.", "I bought a book.", "I buying a book.", "I buys a book."], answer: "I bought a book." },
        { question: "Past tense of 'see' is:", options: ["saw", "seed", "seened", "see"], answer: "saw" }
      ]
    },
    {
      title: "Future Plans",
      description: "Practice 'will' and 'going to'.",
      questions: [
        { question: "Choose the correct sentence.", options: ["I will to study.", "I will study.", "I will studied.", "I will studying."], answer: "I will study." },
        { question: "Complete: She is ___ visit her grandmother.", options: ["go", "going to", "will", "gone to"], answer: "going to" },
        { question: "Which one shows a promise?", options: ["I will help you.", "I helping you.", "I helped you.", "I help you yesterday."], answer: "I will help you." },
        { question: "Tomorrow we ___ a movie.", options: ["watch", "watched", "will watch", "watching"], answer: "will watch" }
      ]
    },
    {
      title: "Comparatives and Superlatives",
      description: "Compare people, places, and things.",
      questions: [
        { question: "Choose the comparative form of 'fast'.", options: ["faster", "fastest", "more fast", "most fast"], answer: "faster" },
        { question: "Mount Everest is the ___ mountain in the world.", options: ["higher", "highest", "high", "more high"], answer: "highest" },
        { question: "My bag is ___ than your bag.", options: ["heavy", "heavier", "heaviest", "most heavy"], answer: "heavier" },
        { question: "Which sentence is correct?", options: ["This is the most cheap phone.", "This phone is cheaper than that one.", "This phone is cheap than that.", "This is cheaperest."], answer: "This phone is cheaper than that one." }
      ]
    }
  ],
  advanced: [
    {
      title: "Conditionals",
      description: "Use zero, first, second, and third conditionals.",
      questions: [
        { question: "If it rains, we ___ at home.", options: ["stayed", "stay", "would stay", "had stayed"], answer: "stay" },
        { question: "If I had known, I ___ you.", options: ["will call", "would call", "would have called", "called"], answer: "would have called" },
        { question: "Which is a second conditional sentence?", options: ["If I win, I will celebrate.", "If I were rich, I would travel.", "If water boils, it evaporates.", "If he had left early, he would have arrived on time."], answer: "If I were rich, I would travel." },
        { question: "Complete: If she studies, she ___ pass.", options: ["would", "had", "will", "would have"], answer: "will" }
      ]
    },
    {
      title: "Reported Speech",
      description: "Convert direct speech to reported speech.",
      questions: [
        { question: "Direct: He said, 'I am tired.' Reported:", options: ["He said that he is tired.", "He said that he was tired.", "He says he tired.", "He told he was tired."], answer: "He said that he was tired." },
        { question: "Direct: She said, 'I can swim.' Reported:", options: ["She said she could swim.", "She said she can swim.", "She said she swam.", "She says she could swim."], answer: "She said she could swim." },
        { question: "Which reporting verb is correct? 'Come here,' he ___ me.", options: ["said", "told", "spoke", "talked"], answer: "told" },
        { question: "Time expression usually changes from 'today' to:", options: ["that day", "the day", "same day", "this day"], answer: "that day" }
      ]
    },
    {
      title: "Academic Vocabulary",
      description: "Understand advanced words in formal contexts.",
      questions: [
        { question: "Choose the best synonym for 'analyze'.", options: ["ignore", "examine", "repeat", "create"], answer: "examine" },
        { question: "The results were ___ with the original hypothesis.", options: ["consistent", "casual", "optional", "uncertainly"], answer: "consistent" },
        { question: "Which word means 'brief and clear'?", options: ["complex", "concise", "vague", "lengthy"], answer: "concise" },
        { question: "The author used data to ___ the argument.", options: ["support", "doubt", "delay", "separate"], answer: "support" }
      ]
    }
  ]
};

/* ═══════════════════════════════════════════
   Storage helpers (localStorage wrappers)
   ═══════════════════════════════════════════ */
function getUsers() {
  return JSON.parse(localStorage.getItem("ep_users") || "{}");
}
function saveUsers(users) {
  localStorage.setItem("ep_users", JSON.stringify(users));
}
function getCurrentUser() {
  return localStorage.getItem("ep_current_user") || null;
}
function setCurrentUser(username) {
  localStorage.setItem("ep_current_user", username);
}
function clearCurrentUser() {
  localStorage.removeItem("ep_current_user");
}

/* Per-user progress: { [username]: { [level]: { [lessonIndex]: { score, total } } } } */
function getAllProgress() {
  return JSON.parse(localStorage.getItem("ep_progress") || "{}");
}
function saveAllProgress(data) {
  localStorage.setItem("ep_progress", JSON.stringify(data));
}
function getUserProgress(username) {
  return getAllProgress()[username] || {};
}
function setLessonProgress(username, level, lessonIndex, score, total) {
  const all = getAllProgress();
  if (!all[username]) all[username] = {};
  if (!all[username][level]) all[username][level] = {};
  all[username][level][lessonIndex] = { score, total };
  saveAllProgress(all);
}

/* Per-user attempts: { [username]: [ { level, lessonIndex, score, total, percent, passed, date } ] } */
function getAllAttempts() {
  return JSON.parse(localStorage.getItem("ep_attempts") || "{}");
}
function saveAllAttempts(data) {
  localStorage.setItem("ep_attempts", JSON.stringify(data));
}
function getUserAttempts(username) {
  return (getAllAttempts()[username] || []).sort((a, b) => b.date.localeCompare(a.date));
}
function recordAttempt(username, level, lessonIndex, score, total, percent, passed) {
  const all = getAllAttempts();
  if (!all[username]) all[username] = [];
  all[username].push({
    level, lessonIndex, score, total, percent, passed,
    date: new Date().toISOString()
  });
  saveAllAttempts(all);
}

/* ═══════════════════════════════════════════
   Business logic
   ═══════════════════════════════════════════ */
function levelCompletionPercent(level, progressMap) {
  const levelData = LESSONS[level] || [];
  if (!levelData.length) return 0;
  const levelProg = progressMap[level] || {};
  let completed = 0;
  for (let i = 0; i < levelData.length; i++) {
    if (levelProg[i] !== undefined) completed++;
  }
  return Math.floor((completed / levelData.length) * 100);
}

function isLevelUnlocked(level, completionMap) {
  const pos = LEVEL_ORDER.indexOf(level);
  if (pos === 0) return true;
  const prev = LEVEL_ORDER[pos - 1];
  return completionMap[prev] === 100;
}

function canOpenLesson(level, lessonIndex, progressMap) {
  if (lessonIndex === 0) return true;
  const levelProg = progressMap[level] || {};
  return levelProg[lessonIndex - 1] !== undefined;
}

function getDailyStreak(username) {
  const attempts = getUserAttempts(username);
  if (!attempts.length) return 0;

  const daySet = new Set();
  attempts.forEach(a => {
    if (a.date) daySet.add(a.date.slice(0, 10));
  });

  const today = new Date();
  const fmt = d => d.toISOString().slice(0, 10);

  let cur = fmt(today);
  if (!daySet.has(cur)) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    cur = fmt(yesterday);
    if (!daySet.has(cur)) return 0;
  }

  let streak = 0;
  let d = new Date(cur + "T00:00:00");
  while (daySet.has(fmt(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function computeXP(username) {
  const progress = getUserProgress(username);
  let xp = 0;
  for (const level of LEVEL_ORDER) {
    const lvl = progress[level] || {};
    for (const idx of Object.keys(lvl)) {
      const { score, total } = lvl[idx];
      const pct = total ? Math.floor((score / total) * 100) : 0;
      if (pct >= PASS_PERCENT) xp += XP_PER_PASS;
    }
  }
  return xp;
}

/* ═══════════════════════════════════════════
   Simple password hashing (client-side)
   NOT secure – just for demo parity.
   ═══════════════════════════════════════════ */
async function hashPassword(pw) {
  const enc = new TextEncoder().encode(pw);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

/* ═══════════════════════════════════════════
   UI Helpers
   ═══════════════════════════════════════════ */
const $ = sel => document.querySelector(sel);
const app = () => $("#app");
const navEl = () => $("#mainNav");
const flashWrap = () => $("#flashWrap");
const footerLinks = () => $("#footerLinks");

function flash(msg, type = "success") {
  const wrap = flashWrap();
  wrap.style.display = "grid";
  wrap.innerHTML = `<div class="flash flash-${type}">${msg}</div>`;
  setTimeout(() => { wrap.style.display = "none"; wrap.innerHTML = ""; }, 4000);
}

function updateNav() {
  const user = getCurrentUser();
  const nav = navEl();
  const footer = footerLinks();

  if (user) {
    nav.innerHTML = `
      <a href="#" onclick="navigate('dashboard');return false">Dashboard</a>
      <a href="#" onclick="navigate('analytics');return false">Analytics</a>
      <a href="#" onclick="toggleTheme();return false" class="btn btn-icon" title="Toggle theme">🌓</a>
      <a href="#" onclick="logout();return false" class="btn btn-ghost">Logout</a>
    `;
    footer.innerHTML = `
      <a href="#" onclick="navigate('home');return false">Home</a>
      <a href="#" onclick="navigate('dashboard');return false">Dashboard</a>
      <a href="#" onclick="navigate('analytics');return false">Analytics</a>
    `;
  } else {
    nav.innerHTML = `
      <a href="#" onclick="navigate('login');return false">Login</a>
      <a href="#" onclick="navigate('register');return false">Register</a>
      <a href="#" onclick="toggleTheme();return false" class="btn btn-icon" title="Toggle theme">🌓</a>
    `;
    footer.innerHTML = `
      <a href="#" onclick="navigate('home');return false">Home</a>
      <a href="#" onclick="navigate('login');return false">Login</a>
      <a href="#" onclick="navigate('register');return false">Register</a>
    `;
  }
}

function animateProgressBars() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll(".progress-fill[data-width]").forEach(el => {
        el.style.width = el.dataset.width + "%";
      });
    });
  });
}

function staggerCards() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll(".card[data-stagger]").forEach((card, i) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(16px)";
        card.style.transition = "opacity 0.4s ease, transform 0.4s ease";
        setTimeout(() => {
          card.style.opacity = "1";
          card.style.transform = "translateY(0)";
        }, i * 80);
      });
    });
  });
}

/* ═══════════════════════════════════════════
   Theme
   ═══════════════════════════════════════════ */
function initTheme() {
  if (localStorage.getItem("ep_theme") === "light") {
    document.body.classList.add("light");
  }
}
function toggleTheme() {
  document.body.classList.toggle("light");
  localStorage.setItem("ep_theme", document.body.classList.contains("light") ? "light" : "dark");
}

/* ═══════════════════════════════════════════
   Router
   ═══════════════════════════════════════════ */
function navigate(page, params = {}) {
  window.scrollTo({ top: 0, behavior: "smooth" });
  // Hide flash
  const fw = flashWrap();
  fw.style.display = "none"; fw.innerHTML = "";

  switch (page) {
    case "home":       renderHome(); break;
    case "login":      renderLogin(); break;
    case "register":   renderRegister(); break;
    case "dashboard":  renderDashboard(); break;
    case "lesson":     renderLesson(params.level); break;
    case "exercise":   renderExercise(params.level, params.index); break;
    case "analytics":  renderAnalytics(); break;
    default:           renderHome();
  }
  updateNav();
}

/* ═══════════════════════════════════════════
   Auth
   ═══════════════════════════════════════════ */
async function doRegister(e) {
  e.preventDefault();
  const username = e.target.username.value.trim();
  const password = e.target.password.value;

  if (username.length < 3 || password.length < 4) {
    flash("Username min 3 chars and password min 4 chars.", "error");
    return;
  }

  const users = getUsers();
  if (users[username]) {
    flash("Username already exists.", "error");
    return;
  }

  users[username] = { hash: await hashPassword(password) };
  saveUsers(users);
  flash("Account created. Please login.", "success");
  navigate("login");
}

async function doLogin(e) {
  e.preventDefault();
  const username = e.target.username.value.trim();
  const password = e.target.password.value;

  const users = getUsers();
  const user = users[username];
  if (!user || user.hash !== await hashPassword(password)) {
    flash("Invalid username or password.", "error");
    return;
  }

  setCurrentUser(username);
  navigate("dashboard");
}

function logout() {
  clearCurrentUser();
  navigate("home");
}

/* ═══════════════════════════════════════════
   VIEW: Home
   ═══════════════════════════════════════════ */
function renderHome() {
  const user = getCurrentUser();
  const ctaBtn = user
    ? `<a href="#" onclick="navigate('dashboard');return false" class="btn btn-primary">Go to Dashboard →</a>`
    : `<a href="#" onclick="navigate('register');return false" class="btn btn-primary">Get Started Free →</a>
       <a href="#" onclick="navigate('login');return false" class="btn">I have an account</a>`;

  app().innerHTML = `
    <!-- Hero -->
    <div class="card card-hero" data-stagger>
      <div class="hero">
        <div class="eyebrow">Free English Learning Platform</div>
        <h1>Master English,<br>Step by Step</h1>
        <p>Progress through structured levels — from beginner greetings to advanced grammar — with instant feedback, XP tracking, and daily streaks.</p>
        <div class="hero-actions">${ctaBtn}</div>
      </div>
      <div class="hero-panel">
        <h3>Why EnglishPath?</h3>
        <ul>
          <li>3 progressive levels (Beginner → Advanced)</li>
          <li>9 focused lessons with quizzes</li>
          <li>Instant scoring &amp; detailed feedback</li>
          <li>XP, streaks &amp; analytics dashboard</li>
          <li>Works offline — no server needed</li>
        </ul>
      </div>
    </div>

    <!-- Features -->
    <div class="feature-grid">
      <div class="card feature-card" data-stagger>
        <span class="feature-icon">📖</span>
        <h3>Structured Lessons</h3>
        <p>Nine lessons across three levels, each building on the last to ensure solid progress.</p>
      </div>
      <div class="card feature-card" data-stagger>
        <span class="feature-icon">✅</span>
        <h3>Instant Quizzes</h3>
        <p>Answer multiple-choice questions and see your results right away with detailed feedback.</p>
      </div>
      <div class="card feature-card" data-stagger>
        <span class="feature-icon">🏅</span>
        <h3>XP &amp; Streaks</h3>
        <p>Earn 25 XP per passed lesson and build daily streaks to stay motivated.</p>
      </div>
      <div class="card feature-card" data-stagger>
        <span class="feature-icon">📊</span>
        <h3>Analytics</h3>
        <p>Track accuracy, completion rates, and recent attempts on a detailed analytics page.</p>
      </div>
    </div>

    <!-- How It Works -->
    <div class="card" data-stagger style="margin-top:8px">
      <div class="section-head"><h3>How It Works</h3></div>
      <div class="steps-grid">
        <div class="card step-card" data-stagger>
          <div class="step-number">1</div>
          <h3>Create Account</h3>
          <p>Register for free in seconds — your progress saves locally.</p>
        </div>
        <div class="card step-card" data-stagger>
          <div class="step-number">2</div>
          <h3>Learn &amp; Practice</h3>
          <p>Work through lessons and answer quiz questions at your own pace.</p>
        </div>
        <div class="card step-card" data-stagger>
          <div class="step-number">3</div>
          <h3>Unlock Levels</h3>
          <p>Complete all lessons in a level to unlock the next challenge.</p>
        </div>
        <div class="card step-card" data-stagger>
          <div class="step-number">4</div>
          <h3>Track Progress</h3>
          <p>Watch your XP grow and maintain your daily streak.</p>
        </div>
      </div>
    </div>

    <!-- Testimonial -->
    <div class="card quote-card" data-stagger>
      "EnglishPath helped me go from zero to confident in just a few weeks. The structured approach really works!"
      <div class="quote-author">— Happy Learner</div>
    </div>

    <!-- CTA -->
    <div class="card cta-section" data-stagger>
      <h2>Ready to start learning?</h2>
      <p>Join EnglishPath today and take the first step toward fluency.</p>
      ${user
        ? `<a href="#" onclick="navigate('dashboard');return false" class="btn btn-primary">Open Dashboard →</a>`
        : `<a href="#" onclick="navigate('register');return false" class="btn btn-primary">Create Free Account →</a>`}
    </div>
  `;
  staggerCards();
}

/* ═══════════════════════════════════════════
   VIEW: Register
   ═══════════════════════════════════════════ */
function renderRegister() {
  app().innerHTML = `
    <div class="card form-card" data-stagger>
      <div class="eyebrow">Create Account</div>
      <h2>Register</h2>
      <form id="regForm">
        <label for="username">Username</label>
        <input type="text" id="username" name="username" placeholder="Choose a username" required>
        <label for="password">Password</label>
        <input type="password" id="password" name="password" placeholder="Create a password" required>
        <button type="submit" class="btn btn-primary" style="margin-top:8px">Create Account</button>
      </form>
      <div class="divider">or</div>
      <p class="small text-center">Already have an account? <a href="#" onclick="navigate('login');return false">Login here</a></p>
    </div>
  `;
  $("#regForm").addEventListener("submit", doRegister);
  staggerCards();
}

/* ═══════════════════════════════════════════
   VIEW: Login
   ═══════════════════════════════════════════ */
function renderLogin() {
  app().innerHTML = `
    <div class="card form-card" data-stagger>
      <div class="eyebrow">Welcome Back</div>
      <h2>Login</h2>
      <form id="loginForm">
        <label for="username">Username</label>
        <input type="text" id="username" name="username" placeholder="Enter your username" required>
        <label for="password">Password</label>
        <input type="password" id="password" name="password" placeholder="Enter your password" required>
        <button type="submit" class="btn btn-primary" style="margin-top:8px">Sign In</button>
      </form>
      <div class="divider">or</div>
      <p class="small text-center">Don't have an account? <a href="#" onclick="navigate('register');return false">Register here</a></p>
    </div>
  `;
  $("#loginForm").addEventListener("submit", doLogin);
  staggerCards();
}

/* ═══════════════════════════════════════════
   VIEW: Dashboard
   ═══════════════════════════════════════════ */
function renderDashboard() {
  const username = getCurrentUser();
  if (!username) { navigate("login"); return; }

  const progressMap = getUserProgress(username);
  const completionMap = {};
  LEVEL_ORDER.forEach(lvl => {
    completionMap[lvl] = levelCompletionPercent(lvl, progressMap);
  });

  const totalLessons = LEVEL_ORDER.reduce((s, l) => s + LESSONS[l].length, 0);
  const completedLessons = LEVEL_ORDER.reduce((s, l) => {
    return s + Math.floor((completionMap[l] * LESSONS[l].length) / 100);
  }, 0);
  const totalXP = computeXP(username);
  const streakDays = getDailyStreak(username);
  const overallCompletion = totalLessons ? Math.floor((completedLessons / totalLessons) * 100) : 0;
  const recentAttempts = getUserAttempts(username).slice(0, 8);

  let levelCardsHTML = "";
  LEVEL_ORDER.forEach(level => {
    const unlocked = isLevelUnlocked(level, completionMap);
    const comp = completionMap[level];
    const count = LESSONS[level].length;
    const icon = LEVEL_ICONS[level];
    const lockedClass = unlocked ? "" : "locked";
    const click = unlocked ? `onclick="navigate('lesson',{level:'${level}'});return false"` : "";

    levelCardsHTML += `
      <div class="card level-card ${lockedClass}" data-stagger>
        <div class="level-header">
          <span class="level-icon">${icon}</span>
          <div>
            <h3>${level.charAt(0).toUpperCase() + level.slice(1)}</h3>
            <p class="level-meta">${count} lessons</p>
          </div>
        </div>
        <div class="progress-line${comp === 100 ? ' progress-success' : ''}">
          <span class="progress-fill" data-width="${comp}"></span>
        </div>
        <p class="text-muted" style="font-size:0.88rem;margin:4px 0 10px">${comp}% complete</p>
        ${unlocked
          ? `<a href="#" ${click} class="btn btn-primary" style="width:100%">${comp === 100 ? "Review Lessons" : "Continue"} →</a>`
          : `<span class="text-muted" style="font-size:0.88rem">Complete the previous level to unlock</span>`}
      </div>
    `;
  });

  let recentHTML = "";
  if (recentAttempts.length) {
    recentHTML = `
      <div class="card" data-stagger>
        <div class="section-head"><h3>Recent Attempts</h3></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Level</th><th>Lesson</th><th>Score</th><th>Result</th><th>Date</th></tr></thead>
            <tbody>
              ${recentAttempts.map(a => {
                const lessonTitle = (LESSONS[a.level] && LESSONS[a.level][a.lessonIndex])
                  ? LESSONS[a.level][a.lessonIndex].title
                  : `Lesson ${+a.lessonIndex + 1}`;
                const badge = a.passed
                  ? `<span class="badge">Passed</span>`
                  : `<span class="badge badge-danger">Failed</span>`;
                const dateStr = a.date ? new Date(a.date).toLocaleDateString() : "";
                return `<tr>
                  <td>${a.level.charAt(0).toUpperCase() + a.level.slice(1)}</td>
                  <td>${lessonTitle}</td>
                  <td>${a.score}/${a.total} (${a.percent}%)</td>
                  <td>${badge}</td>
                  <td>${dateStr}</td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  app().innerHTML = `
    <!-- Welcome -->
    <div class="card welcome-card" data-stagger>
      <div>
        <h2>Welcome back, ${username}!</h2>
        <p>Keep up the great work. Your learning journey continues here.</p>
      </div>
      <div class="welcome-avatar">${username.charAt(0).toUpperCase()}</div>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="card stat-card" data-stagger>
        <span class="stat-icon">📖</span>
        <span class="stat-label">Lessons</span>
        <p class="stat-value text-primary">${completedLessons} / ${totalLessons}</p>
      </div>
      <div class="card stat-card" data-stagger>
        <span class="stat-icon">⭐</span>
        <span class="stat-label">Total XP</span>
        <p class="stat-value text-success">${totalXP}</p>
      </div>
      <div class="card stat-card" data-stagger>
        <span class="stat-icon">🔥</span>
        <span class="stat-label">Day Streak</span>
        <p class="stat-value text-warning">${streakDays}</p>
      </div>
      <div class="card stat-card" data-stagger>
        <span class="stat-icon">📈</span>
        <span class="stat-label">Overall</span>
        <p class="stat-value text-accent">${overallCompletion}%</p>
      </div>
    </div>

    <!-- Overall Progress -->
    <div class="card" data-stagger>
      <div class="section-head"><h3>Overall Progress</h3><span class="text-muted">${overallCompletion}%</span></div>
      <div class="progress-line progress-accent">
        <span class="progress-fill" data-width="${overallCompletion}"></span>
      </div>
    </div>

    <!-- Level Cards -->
    <div class="section-head" style="margin-top:8px"><h3>Your Levels</h3></div>
    <div class="level-grid">${levelCardsHTML}</div>

    ${recentHTML}
  `;
  staggerCards();
  animateProgressBars();
}

/* ═══════════════════════════════════════════
   VIEW: Lesson List
   ═══════════════════════════════════════════ */
function renderLesson(level) {
  const username = getCurrentUser();
  if (!username) { navigate("login"); return; }
  if (!LEVEL_ORDER.includes(level)) { navigate("dashboard"); return; }

  const progressMap = getUserProgress(username);
  const completionMap = {};
  LEVEL_ORDER.forEach(lvl => { completionMap[lvl] = levelCompletionPercent(lvl, progressMap); });

  if (!isLevelUnlocked(level, completionMap)) {
    flash("Complete the previous level first.", "error");
    navigate("dashboard");
    return;
  }

  const levelData = LESSONS[level];
  let listHTML = "";
  levelData.forEach((lesson, idx) => {
    const completed = (progressMap[level] || {})[idx] !== undefined;
    const unlocked = canOpenLesson(level, idx, progressMap);
    const lockedClass = unlocked ? "" : "locked";
    const completedClass = completed ? "completed-lesson" : "";

    const statusBadge = completed
      ? `<span class="badge">Completed</span>`
      : unlocked ? `<span class="badge badge-primary">Available</span>` : `<span class="badge badge-danger">Locked</span>`;

    const actionBtn = unlocked
      ? `<a href="#" onclick="navigate('exercise',{level:'${level}',index:${idx}});return false" class="btn btn-primary btn-sm">${completed ? "Review" : "Start"} →</a>`
      : "";

    listHTML += `
      <div class="card lesson-item ${lockedClass} ${completedClass}" data-stagger>
        <div class="lesson-info">
          <div class="lesson-number">${idx + 1}</div>
          <div>
            <h3>${lesson.title}</h3>
            <p>${lesson.description}</p>
          </div>
        </div>
        <div class="lesson-actions">
          ${statusBadge}
          ${actionBtn}
        </div>
      </div>
    `;
  });

  const comp = completionMap[level];
  app().innerHTML = `
    <div class="card" data-stagger>
      <a href="#" onclick="navigate('dashboard');return false" class="text-muted" style="font-size:0.88rem">← Back to Dashboard</a>
      <h2 style="margin-top:12px">${level.charAt(0).toUpperCase() + level.slice(1)} Level</h2>
      <p class="text-muted">${levelData.length} lessons · ${comp}% complete</p>
      <div class="progress-line${comp === 100 ? ' progress-success' : ''}">
        <span class="progress-fill" data-width="${comp}"></span>
      </div>
    </div>
    <div class="lesson-list">${listHTML}</div>
  `;
  staggerCards();
  animateProgressBars();
}

/* ═══════════════════════════════════════════
   VIEW: Exercise (Quiz)
   ═══════════════════════════════════════════ */
function renderExercise(level, lessonIndex) {
  const username = getCurrentUser();
  if (!username) { navigate("login"); return; }
  if (!LEVEL_ORDER.includes(level)) { navigate("dashboard"); return; }

  const levelData = LESSONS[level];
  if (lessonIndex < 0 || lessonIndex >= levelData.length) {
    navigate("lesson", { level });
    return;
  }

  const progressMap = getUserProgress(username);
  const completionMap = {};
  LEVEL_ORDER.forEach(lvl => { completionMap[lvl] = levelCompletionPercent(lvl, progressMap); });

  if (!isLevelUnlocked(level, completionMap) || !canOpenLesson(level, lessonIndex, progressMap)) {
    flash("Finish the previous lesson first.", "error");
    navigate("lesson", { level });
    return;
  }

  const lesson = levelData[lessonIndex];
  const questions = lesson.questions || [];

  let questionsHTML = "";
  questions.forEach((q, qi) => {
    let optionsHTML = "";
    q.options.forEach((opt, oi) => {
      optionsHTML += `
        <label class="option-line">
          <input type="radio" name="q_${qi}" value="${opt.replace(/"/g, '&quot;')}">
          ${opt}
        </label>
      `;
    });
    questionsHTML += `
      <div class="question-block">
        <p><strong>Q${qi + 1}.</strong> ${q.question}</p>
        ${optionsHTML}
      </div>
    `;
  });

  app().innerHTML = `
    <div class="card" data-stagger>
      <a href="#" onclick="navigate('lesson',{level:'${level}'});return false" class="text-muted" style="font-size:0.88rem">← Back to ${level.charAt(0).toUpperCase() + level.slice(1)}</a>
      <h2 style="margin-top:12px">${lesson.title}</h2>
      <p class="text-muted">${level.charAt(0).toUpperCase() + level.slice(1)} · Lesson ${lessonIndex + 1} of ${levelData.length}</p>
      <div class="quiz-meta">
        <div class="progress-line">
          <span class="progress-fill" data-width="${Math.round(((lessonIndex + 1) / levelData.length) * 100)}"></span>
        </div>
      </div>
      <form id="quizForm">
        ${questionsHTML}
        <button type="submit" class="btn btn-success" style="margin-top:18px;width:100%">Submit Answers</button>
      </form>
      <div id="resultArea"></div>
    </div>
  `;

  $("#quizForm").addEventListener("submit", (e) => {
    e.preventDefault();
    submitQuiz(level, lessonIndex);
  });

  staggerCards();
  animateProgressBars();
}

function submitQuiz(level, lessonIndex) {
  const username = getCurrentUser();
  const lesson = LESSONS[level][lessonIndex];
  const questions = lesson.questions;
  let score = 0;
  const total = questions.length;

  // Disable form
  const form = $("#quizForm");
  form.querySelectorAll("input, button").forEach(el => el.disabled = true);

  // Grade each question
  questions.forEach((q, qi) => {
    const picked = form.querySelector(`input[name="q_${qi}"]:checked`);
    const pickedVal = picked ? picked.value : "";
    const isCorrect = pickedVal === q.answer;
    if (isCorrect) score++;

    // Highlight options
    form.querySelectorAll(`input[name="q_${qi}"]`).forEach(radio => {
      const line = radio.closest(".option-line");
      if (radio.value === q.answer) {
        line.classList.add("correct-option");
      } else if (radio.checked && !isCorrect) {
        line.classList.add("wrong-option");
      }
    });
  });

  const percent = total ? Math.floor((score / total) * 100) : 0;
  const passed = percent >= PASS_PERCENT;

  // Save progress
  setLessonProgress(username, level, lessonIndex, score, total);
  recordAttempt(username, level, lessonIndex, score, total, percent, passed);

  // Show result banner
  const resultArea = $("#resultArea");
  if (passed) {
    resultArea.innerHTML = `
      <div class="result-banner result-pass">
        <h3>🎉 Great job! ${percent}%</h3>
        <p>You scored ${score}/${total} and passed this lesson!</p>
      </div>
      <div style="display:flex;gap:12px;margin-top:14px;flex-wrap:wrap">
        <a href="#" onclick="navigate('lesson',{level:'${level}'});return false" class="btn btn-primary">Back to Lessons →</a>
        <a href="#" onclick="navigate('dashboard');return false" class="btn">Dashboard</a>
      </div>
    `;
  } else {
    resultArea.innerHTML = `
      <div class="result-banner result-fail">
        <h3>Keep Practicing! ${percent}%</h3>
        <p>You scored ${score}/${total}. You need ${PASS_PERCENT}% to pass.</p>
      </div>
      <div style="display:flex;gap:12px;margin-top:14px;flex-wrap:wrap">
        <a href="#" onclick="navigate('exercise',{level:'${level}',index:${lessonIndex}});return false" class="btn btn-primary">Try Again →</a>
        <a href="#" onclick="navigate('lesson',{level:'${level}'});return false" class="btn">Back to Lessons</a>
      </div>
    `;
  }

  resultArea.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* ═══════════════════════════════════════════
   VIEW: Analytics
   ═══════════════════════════════════════════ */
function renderAnalytics() {
  const username = getCurrentUser();
  if (!username) { navigate("login"); return; }

  const progressMap = getUserProgress(username);
  const recentAttempts = getUserAttempts(username).slice(0, 24);
  const streakDays = getDailyStreak(username);

  // Level stats
  let levelStatsHTML = "";
  LEVEL_ORDER.forEach(level => {
    const levelProg = progressMap[level] || {};
    const totalLessons = LESSONS[level].length;
    const completion = levelCompletionPercent(level, progressMap);
    let totalScore = 0, totalQuestions = 0;
    Object.values(levelProg).forEach(p => { totalScore += p.score; totalQuestions += p.total; });
    const accuracy = totalQuestions ? Math.floor((totalScore / totalQuestions) * 100) : 0;

    levelStatsHTML += `
      <div class="card" data-stagger>
        <div class="level-header">
          <span class="level-icon">${LEVEL_ICONS[level]}</span>
          <div>
            <h3>${level.charAt(0).toUpperCase() + level.slice(1)}</h3>
            <p class="text-muted" style="margin:0;font-size:0.88rem">${Object.keys(levelProg).length}/${totalLessons} lessons · ${accuracy}% accuracy</p>
          </div>
        </div>
        <div class="progress-line${completion === 100 ? ' progress-success' : ''}">
          <span class="progress-fill" data-width="${completion}"></span>
        </div>
        <p class="text-muted" style="font-size:0.85rem;margin:4px 0 0">${completion}% complete</p>
      </div>
    `;
  });

  const attemptsCount = recentAttempts.length;
  const avgRecent = attemptsCount
    ? Math.floor(recentAttempts.reduce((s, a) => s + a.percent, 0) / attemptsCount)
    : 0;

  let recentTableHTML = "";
  if (attemptsCount) {
    recentTableHTML = `
      <div class="card" data-stagger>
        <div class="section-head"><h3>Recent Attempts</h3></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Level</th><th>Lesson</th><th>Score</th><th>Result</th><th>Date</th></tr></thead>
            <tbody>
              ${recentAttempts.map(a => {
                const lessonTitle = (LESSONS[a.level] && LESSONS[a.level][a.lessonIndex])
                  ? LESSONS[a.level][a.lessonIndex].title
                  : `Lesson ${+a.lessonIndex + 1}`;
                const badge = a.passed
                  ? `<span class="badge">Passed</span>`
                  : `<span class="badge badge-danger">Failed</span>`;
                const dateStr = a.date ? new Date(a.date).toLocaleDateString() : "";
                return `<tr>
                  <td>${a.level.charAt(0).toUpperCase() + a.level.slice(1)}</td>
                  <td>${lessonTitle}</td>
                  <td>${a.score}/${a.total} (${a.percent}%)</td>
                  <td>${badge}</td>
                  <td>${dateStr}</td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  app().innerHTML = `
    <div class="card" data-stagger>
      <a href="#" onclick="navigate('dashboard');return false" class="text-muted" style="font-size:0.88rem">← Back to Dashboard</a>
      <h2 style="margin-top:12px">Analytics</h2>
      <p class="text-muted">Detailed breakdown of your learning progress.</p>
    </div>

    <div class="stats-grid">
      <div class="card stat-card" data-stagger>
        <span class="stat-icon">🔥</span>
        <span class="stat-label">Day Streak</span>
        <p class="stat-value text-warning">${streakDays}</p>
      </div>
      <div class="card stat-card" data-stagger>
        <span class="stat-icon">📝</span>
        <span class="stat-label">Total Attempts</span>
        <p class="stat-value text-primary">${attemptsCount}</p>
      </div>
      <div class="card stat-card" data-stagger>
        <span class="stat-icon">🎯</span>
        <span class="stat-label">Avg Score (Recent)</span>
        <p class="stat-value text-success">${avgRecent}%</p>
      </div>
      <div class="card stat-card" data-stagger>
        <span class="stat-icon">⭐</span>
        <span class="stat-label">Total XP</span>
        <p class="stat-value text-accent">${computeXP(username)}</p>
      </div>
    </div>

    <div class="section-head" style="margin-top:8px"><h3>Level Breakdown</h3></div>
    <div class="level-grid">${levelStatsHTML}</div>

    ${recentTableHTML}
  `;
  staggerCards();
  animateProgressBars();
}

/* ═══════════════════════════════════════════
   Boot
   ═══════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  navigate("home");
});
