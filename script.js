document.addEventListener("DOMContentLoaded", () => {
    /* ── Theme Toggle ── */
    const savedTheme = localStorage.getItem("englishpath_theme");
    if (savedTheme === "light") {
        document.body.classList.add("light");
    }

    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            document.body.classList.toggle("light");
            const activeTheme = document.body.classList.contains("light") ? "light" : "dark";
            localStorage.setItem("englishpath_theme", activeTheme);
            themeToggle.textContent = activeTheme === "light" ? "☀️" : "🌓";
        });
        // Set initial icon
        themeToggle.textContent = document.body.classList.contains("light") ? "☀️" : "🌓";
    }

    /* ── Animated Progress Bars ── */
    const animateProgressBars = () => {
        document.querySelectorAll(".progress-fill[data-progress]").forEach((bar) => {
            const value = Number.parseInt(bar.dataset.progress || "0", 10);
            const width = Math.max(0, Math.min(value, 100));
            const rect = bar.getBoundingClientRect();
            if (rect.top < window.innerHeight + 100) {
                requestAnimationFrame(() => {
                    bar.style.width = `${width}%`;
                });
            }
        });
    };

    animateProgressBars();

    // Re-trigger on scroll (for bars below the fold)
    let scrollTicking = false;
    window.addEventListener("scroll", () => {
        if (!scrollTicking) {
            requestAnimationFrame(() => {
                animateProgressBars();
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    });

    /* ── Stagger Card Animations ── */
    const cards = document.querySelectorAll(".feature-card, .stat-card, .level-card, .step-card, .lesson-item");
    cards.forEach((card, index) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(16px)";
        card.style.transition = `opacity 0.4s ease ${index * 0.06}s, transform 0.4s ease ${index * 0.06}s`;
    });
    // Double-RAF ensures the browser paints opacity:0 BEFORE we set opacity:1,
    // otherwise both get batched and cards stay invisible.
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            cards.forEach((card) => {
                card.style.opacity = "1";
                card.style.transform = "translateY(0)";
            });
        });
    });

    /* ── Lesson Search with count ── */
    const lessonSearch = document.getElementById("lessonSearch");
    if (lessonSearch) {
        lessonSearch.addEventListener("input", () => {
            const term = lessonSearch.value.trim().toLowerCase();
            let visibleCount = 0;
            document.querySelectorAll(".lesson-item[data-lesson-title]").forEach((item) => {
                const title = item.dataset.lessonTitle || "";
                const desc = item.dataset.lessonDesc || "";
                const visible = title.includes(term) || desc.includes(term);
                item.style.display = visible ? "flex" : "none";
                if (visible) visibleCount++;
            });
        });
    }

    /* ── Auto-dismiss flash messages ── */
    document.querySelectorAll(".flash").forEach((flash) => {
        setTimeout(() => {
            flash.style.transition = "opacity 0.5s ease, transform 0.5s ease";
            flash.style.opacity = "0";
            flash.style.transform = "translateY(-8px)";
            setTimeout(() => flash.remove(), 500);
        }, 6000);
    });

    /* ── Quiz Form Logic ── */
    const quizForm = document.getElementById("quizForm");
    if (!quizForm) return;

    const progressFill = document.getElementById("quizProgressFill");
    const progressText = document.getElementById("quizProgressText");

    const updateQuizProgress = () => {
        const groups = new Set();
        const checked = new Set();
        quizForm.querySelectorAll("input[type='radio']").forEach((input) => {
            groups.add(input.name);
            if (input.checked) checked.add(input.name);
        });

        const total = groups.size;
        const done = checked.size;
        const percent = total ? Math.round((done / total) * 100) : 0;

        if (progressFill) {
            progressFill.style.width = `${percent}%`;
            progressFill.dataset.progress = percent;
        }
        if (progressText) {
            progressText.textContent = `${done} of ${total} answered`;
        }
    };

    // Highlight selected option
    quizForm.querySelectorAll("input[type='radio']").forEach((input) => {
        input.addEventListener("change", () => {
            // Remove highlight from siblings
            const name = input.name;
            quizForm.querySelectorAll(`input[name='${name}']`).forEach((sibling) => {
                sibling.closest(".option-line").style.borderColor = "transparent";
                sibling.closest(".option-line").style.background = "";
            });
            // Add highlight to selected
            const label = input.closest(".option-line");
            if (label) {
                label.style.borderColor = "rgba(85, 163, 255, 0.4)";
                label.style.background = "rgba(85, 163, 255, 0.06)";
            }
            updateQuizProgress();
        });
    });
    updateQuizProgress();

    // Validate before submit
    quizForm.addEventListener("submit", (event) => {
        const requiredGroups = new Set();
        const checkedGroups = new Set();

        quizForm.querySelectorAll("input[type='radio']").forEach((input) => {
            requiredGroups.add(input.name);
            if (input.checked) checkedGroups.add(input.name);
        });

        if (requiredGroups.size !== checkedGroups.size) {
            event.preventDefault();
            const remaining = requiredGroups.size - checkedGroups.size;
            alert(`Please answer all questions before submitting. ${remaining} question${remaining > 1 ? 's' : ''} remaining.`);
        }
    });

});