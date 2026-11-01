/* =========================================
   ENGLISH PATH 2.0
   SCRIPT.JS - PART 1 OF 3
========================================= */

"use strict";

/* =========================================
   1. GENERAL SETTINGS
========================================= */

const STORAGE_KEY = "english_path_progress_v1";
const TOTAL_LESSONS = 93;

const CATEGORIES = {
  foundation: {
    name: "التأسيس",
    english: "Foundation",
    total: 25
  },
  reading: {
    name: "القراءة",
    english: "Reading",
    total: 17
  },
  phonics: {
    name: "الصوتيات",
    english: "Phonics",
    total: 14
  },
  listening: {
    name: "الاستماع",
    english: "Listening",
    total: 16
  },
  conversation: {
    name: "المحادثة",
    english: "Conversation",
    total: 9
  },
  writing: {
    name: "الكتابة",
    english: "Writing",
    total: 12
  }
};

const CATEGORY_ORDER = [
  "foundation",
  "reading",
  "phonics",
  "listening",
  "conversation",
  "writing"
];

const REVIEW_INTERVALS = {
  forgotten: 1,
  hard: 3,
  good: 7,
  easy: 14
};

/* =========================================
   2. STUDY PLAN
========================================= */

const STUDY_PLAN = {
  1: [
    ["foundation", 15],
    ["foundation", 16]
  ],
  2: [
    ["foundation", 17],
    ["foundation", 18]
  ],
  3: [
    ["foundation", 19],
    ["foundation", 20]
  ],
  4: [
    ["foundation", 21],
    ["foundation", 22]
  ],
  5: [
    ["foundation", 23],
    ["foundation", 24],
    ["foundation", 25]
  ],

  6: [
    ["reading", 6],
    ["reading", 7]
  ],
  7: [
    ["reading", 8],
    ["reading", 9]
  ],
  8: [
    ["reading", 10],
    ["reading", 11],
    ["reading", 12]
  ],
  9: [
    ["reading", 13],
    ["reading", 14],
    ["reading", 15]
  ],
  10: [
    ["reading", 16],
    ["reading", 17]
  ],

  11: [
    ["phonics", 1],
    ["listening", 2]
  ],
  12: [
    ["phonics", 2],
    ["listening", 3]
  ],
  13: [
    ["phonics", 3],
    ["listening", 4]
  ],
  14: [
    ["phonics", 4],
    ["listening", 5]
  ],
  15: [
    ["phonics", 5],
    ["listening", 6]
  ],
  16: [
    ["phonics", 6],
    ["listening", 7]
  ],
  17: [
    ["phonics", 7],
    ["listening", 8]
  ],
  18: [
    ["phonics", 8],
    ["listening", 9]
  ],
  19: [
    ["phonics", 9],
    ["listening", 10]
  ],
  20: [
    ["phonics", 10],
    ["phonics", 11],
    ["phonics", 12],
    ["phonics", 13],
    ["phonics", 14],
    ["listening", 11],
    ["listening", 12],
    ["listening", 13],
    ["listening", 14],
    ["listening", 15],
    ["listening", 16]
  ],

  21: [
    ["conversation", 1],
    ["writing", 1]
  ],
  22: [
    ["conversation", 2],
    ["writing", 2]
  ],
  23: [
    ["conversation", 3],
    ["writing", 3],
    ["writing", 4]
  ],
  24: [
    ["conversation", 4],
    ["writing", 5],
    ["writing", 6]
  ],
  25: [
    ["conversation", 5],
    ["writing", 7],
    ["writing", 8]
  ],
  26: [
    ["conversation", 6],
    ["conversation", 7],
    ["writing", 9],
    ["writing", 10]
  ],
  27: [
    ["conversation", 8],
    ["conversation", 9],
    ["writing", 11],
    ["writing", 12]
  ],

  28: [
    ["special", "مراجعة شاملة للتأسيس والقراءة"]
  ],
  29: [
    ["special", "مراجعة شاملة للصوتيات والاستماع"]
  ],
  30: [
    ["special", "مراجعة المحادثة والكتابة والاختبار الشامل"]
  ]
};

/* =========================================
   3. HELPER FUNCTIONS
========================================= */

function getEl(id) {
  return document.getElementById(id);
}

function todayKey() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(dateString, days) {
  const date = new Date(dateString + "T12:00:00");

  date.setDate(date.getDate() + days);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString + "T12:00:00");

  return date.toLocaleDateString("ar", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return entities[char];
  });
}

function lessonKey(category, number) {
  return `${category}:${number}`;
}

function getLessonName(category, number) {
  const categoryName = CATEGORIES[category]?.name || category;

  return `${categoryName} - الدرس ${number}`;
}

/* =========================================
   4. DEFAULT DATA
========================================= */

function createDefaultData() {
  return {
    completed: [],
    reviews: [],
    special: [],
    vocabulary: [],
    activity: {},
    achievements: [],
    settings: {
      startDate: todayKey()
    }
  };
}

/* =========================================
   5. LOAD AND SAVE DATA
========================================= */

function loadData() {
  const defaults = createDefaultData();

  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return defaults;
    }

    const parsed = JSON.parse(saved);

    if (!parsed || typeof parsed !== "object") {
      return defaults;
    }

    return {
      ...defaults,
      ...parsed,

      completed: Array.isArray(parsed.completed)
        ? parsed.completed
        : [],

      reviews: Array.isArray(parsed.reviews)
        ? parsed.reviews
        : [],

      special: Array.isArray(parsed.special)
        ? parsed.special
        : [],

      vocabulary: Array.isArray(parsed.vocabulary)
        ? parsed.vocabulary
        : [],

      activity:
        parsed.activity &&
        typeof parsed.activity === "object"
          ? parsed.activity
          : {},

      achievements: Array.isArray(parsed.achievements)
        ? parsed.achievements
        : [],

      settings: {
        ...defaults.settings,
        ...(parsed.settings || {})
      }
    };

  } catch (error) {
    console.error("تعذر تحميل البيانات:", error);
    return defaults;
  }
}

let appData = loadData();

function saveData() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(appData)
    );

    return true;

  } catch (error) {
    console.error("تعذر حفظ البيانات:", error);
    alert("تعذر حفظ البيانات. تحقق من مساحة التخزين في المتصفح.");

    return false;
  }
}

/* =========================================
   6. BASIC DATA HELPERS
========================================= */

function isLessonCompleted(category, number) {
  const key = lessonKey(category, number);

  return appData.completed.includes(key);
}

function getCompletedCount() {
  return appData.completed.length;
}

function getRemainingCount() {
  return Math.max(
    0,
    TOTAL_LESSONS - getCompletedCount()
  );
}

function getCategoryCompletedCount(category) {
  return appData.completed.filter(key =>
    key.startsWith(category + ":")
  ).length;
}

function getProgressPercentage() {
  return Math.min(
    100,
    Math.round(
      (getCompletedCount() / TOTAL_LESSONS) * 100
    )
  );
}

/* =========================================
   7. ACTIVITY TRACKING
========================================= */

function recordActivity() {
  const key = todayKey();

  if (!appData.activity[key]) {
    appData.activity[key] = 0;
  }

  appData.activity[key]++;

  saveData();
}

function getCurrentStreak() {
  let streak = 0;
  let date = new Date();

  const today = todayKey();

  if (!appData.activity[today]) {
    date.setDate(date.getDate() - 1);
  }

  while (true) {
    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");

    if (!appData.activity[key]) {
      break;
    }

    streak++;
    date.setDate(date.getDate() - 1);
  }

  return streak;
}

/* =========================================
   8. CURRENT PLAN DAY
========================================= */

function getPlanDay() {
  const selector = getEl("daySelect");

  if (selector) {
    const selected = Number(selector.value);

    if (selected >= 1 && selected <= 30) {
      return selected;
    }
  }

  const startDate = appData.settings.startDate || todayKey();

  const start = new Date(startDate + "T12:00:00");
  const today = new Date(todayKey() + "T12:00:00");

  const difference = Math.floor(
    (today - start) / 86400000
  );

  return Math.max(1, Math.min(30, difference + 1));
}

/* =========================================
   END OF PART 1
   CONTINUE WITH PART 2 BELOW
========================================= */
/* =========================================
   ENGLISH PATH 2.0
   SCRIPT.JS - PART 2 OF 3
========================================= */

/* =========================================
   9. DAILY TASKS
========================================= */

function getDayTasks(day) {
  return STUDY_PLAN[day] || [];
}

function renderTasks() {
  const container = getEl("todayTasks");
  const planContainer = getEl("planList");

  const day = getPlanDay();
  const tasks = getDayTasks(day);

  if (container) {
    if (!tasks.length) {
      container.innerHTML =
        '<p class="empty-state">لا توجد مهام لهذا اليوم.</p>';
    } else {
      container.innerHTML = tasks.map(task => {
        const [category, number] = task;

        if (category === "special") {
          const completed = appData.special.includes(number);

          return `
            <label class="task-item">
              <input
                type="checkbox"
                data-special="${escapeHTML(number)}"
                ${completed ? "checked" : ""}
              >
              <span>${escapeHTML(number)}</span>
            </label>
          `;
        }

        const key = lessonKey(category, number);
        const completed = isLessonCompleted(category, number);

        return `
          <label class="task-item ${completed ? "completed" : ""}">
            <input
              type="checkbox"
              data-lesson="${escapeHTML(key)}"
              ${completed ? "checked" : ""}
            >
            <span>${escapeHTML(getLessonName(category, number))}</span>
          </label>
        `;
      }).join("");
    }
  }

  if (planContainer) {
    renderPlanList();
  }
}

function renderPlanList() {
  const container = getEl("planList");

  if (!container) return;

  container.innerHTML = Object.keys(STUDY_PLAN).map(day => {
    const tasks = STUDY_PLAN[day];

    const completedTasks = tasks.filter(task => {
      const [category, number] = task;

      if (category === "special") {
        return appData.special.includes(number);
      }

      return isLessonCompleted(category, number);
    }).length;

    const percentage = tasks.length
      ? Math.round((completedTasks / tasks.length) * 100)
      : 0;

    return `
      <div class="plan-day">
        <div class="plan-day-header">
          <strong>اليوم ${day}</strong>
          <span>${completedTasks} / ${tasks.length}</span>
        </div>

        <div class="progress-track">
          <div
            class="progress-fill"
            style="width:${percentage}%"
          ></div>
        </div>

        <button
          type="button"
          class="small-btn"
          data-go-day="${day}"
        >
          عرض المهام
        </button>
      </div>
    `;
  }).join("");
}

/* =========================================
   10. REVIEW SYSTEM
========================================= */

function addInitialReviews(category, number) {
  const key = lessonKey(category, number);

  const exists = appData.reviews.some(review =>
    review.lesson === key
  );

  if (exists) return;

  const today = todayKey();

  appData.reviews.push({
    id: key,
    lesson: key,
    dueDate: addDays(today, 3),
    interval: 3,
    status: "good",
    createdAt: today
  });

  appData.reviews.push({
    id: key + "_second",
    lesson: key,
    dueDate: addDays(today, 7),
    interval: 7,
    status: "good",
    createdAt: today,
    stage: 2
  });
}

function getDueReviews() {
  const today = todayKey();

  return appData.reviews.filter(review =>
    review.dueDate <= today
  );
}

function getFutureReviews() {
  const today = todayKey();

  return appData.reviews.filter(review =>
    review.dueDate > today
  );
}

function renderTodayReviews() {
  const container = getEl("todayReviews");

  if (!container) return;

  const due = getDueReviews();

  if (!due.length) {
    container.innerHTML =
      '<p class="empty-state">رائع! لا توجد مراجعات مستحقة اليوم.</p>';
    return;
  }

  container.innerHTML = due.map(review => {
    return `
      <div class="review-item">
        <span>${escapeHTML(review.lesson)}</span>
        <span class="review-date">
          ${escapeHTML(formatDate(review.dueDate))}
        </span>
      </div>
    `;
  }).join("");
}

function renderReviews() {
  const container = getEl("reviewList");
  const dueTotal = getEl("reviewDueTotal");
  const futureTotal = getEl("reviewFutureTotal");

  const due = getDueReviews();
  const future = getFutureReviews();

  if (dueTotal) {
    dueTotal.textContent = due.length;
  }

  if (futureTotal) {
    futureTotal.textContent = future.length;
  }

  if (!container) return;

  if (!appData.reviews.length) {
    container.innerHTML =
      '<p class="empty-state">ستظهر مراجعاتك هنا بعد إكمال الدروس.</p>';
    return;
  }

  const sorted = [...appData.reviews].sort((a, b) =>
    a.dueDate.localeCompare(b.dueDate)
  );

  container.innerHTML = sorted.map(review => {
    const isDue = review.dueDate <= todayKey();

    return `
      <div class="review-card ${isDue ? "review-due" : ""}">
        <div class="review-card-info">
          <strong>${escapeHTML(review.lesson)}</strong>
          <small>
            ${isDue ? "مستحقة للمراجعة" : "موعد المراجعة"}
            : ${escapeHTML(formatDate(review.dueDate))}
          </small>
        </div>

        ${
          isDue
            ? `
              <div class="review-actions">
                <button data-rate="forgotten" data-review="${escapeHTML(review.id)}">
                  نسيت
                </button>
                <button data-rate="hard" data-review="${escapeHTML(review.id)}">
                  صعب
                </button>
                <button data-rate="good" data-review="${escapeHTML(review.id)}">
                  جيد
                </button>
                <button data-rate="easy" data-review="${escapeHTML(review.id)}">
                  سهل
                </button>
              </div>
            `
            : ""
        }
      </div>
    `;
  }).join("");
}

function rateReview(reviewId, rating) {
  const review = appData.reviews.find(item =>
    item.id === reviewId
  );

  if (!review) return;

  const interval = REVIEW_INTERVALS[rating];

  if (!interval) return;

  review.status = rating;
  review.interval = interval;
  review.dueDate = addDays(todayKey(), interval);

  saveData();
  renderReviews();
  renderTodayReviews();
  updateDashboardNumbers();
}

/* =========================================
   11. VOCABULARY SYSTEM
========================================= */

function renderVocabulary() {
  const container = getEl("vocabularyList");
  const count = getEl("vocabularyCount");
  const statisticsCount = getEl("statisticsVocabularyCount");
  const searchInput = getEl("vocabularySearch");

  const search = searchInput
    ? searchInput.value.trim().toLowerCase()
    : "";

  const words = appData.vocabulary.filter(item => {
    const word = String(item.word || "").toLowerCase();
    const meaning = String(item.meaning || "").toLowerCase();

    return word.includes(search) || meaning.includes(search);
  });

  if (count) {
    count.textContent = appData.vocabulary.length;
  }

  if (statisticsCount) {
    statisticsCount.textContent = appData.vocabulary.length;
  }

  if (!container) return;

  if (!words.length) {
    container.innerHTML =
      '<p class="empty-state">لا توجد كلمات هنا بعد.</p>';
    return;
  }

  container.innerHTML = words.map(item => `
    <div class="vocabulary-card">
      <div class="vocabulary-info">
        <strong>${escapeHTML(item.word)}</strong>
        <span>${escapeHTML(item.meaning)}</span>

        ${
          item.example
            ? `<small>${escapeHTML(item.example)}</small>`
            : ""
        }
      </div>

      <div class="vocabulary-actions">
        <button
          type="button"
          data-speak="${escapeHTML(item.word)}"
          title="استمع إلى النطق"
        >
          🔊
        </button>

        <button
          type="button"
          data-delete-word="${escapeHTML(item.id)}"
          title="حذف الكلمة"
        >
          🗑️
        </button>
      </div>
    </div>
  `).join("");
}

function addVocabularyWord(word, meaning, example) {
  const cleanWord = word.trim();
  const cleanMeaning = meaning.trim();

  if (!cleanWord || !cleanMeaning) {
    alert("يرجى كتابة الكلمة ومعناها.");
    return false;
  }

  const exists = appData.vocabulary.some(item =>
    item.word.toLowerCase() === cleanWord.toLowerCase()
  );

  if (exists) {
    alert("هذه الكلمة موجودة بالفعل في قائمتك.");
    return false;
  }

  appData.vocabulary.push({
    id: String(Date.now()) + Math.random().toString(16).slice(2),
    word: cleanWord,
    meaning: cleanMeaning,
    example: example.trim(),
    createdAt: todayKey()
  });

  saveData();
  renderVocabulary();
  updateDashboardNumbers();
  checkAchievements();

  return true;
}

function deleteVocabularyWord(id) {
  appData.vocabulary = appData.vocabulary.filter(item =>
    String(item.id) !== String(id)
  );

  saveData();
  renderVocabulary();
  updateDashboardNumbers();
}

function speakWord(word) {
  if (!("speechSynthesis" in window)) {
    alert("ميزة النطق غير مدعومة في هذا المتصفح.");
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(word);

  utterance.lang = "en-US";
  utterance.rate = 0.85;

  window.speechSynthesis.speak(utterance);
}

/* =========================================
   END OF PART 2
   CONTINUE WITH PART 3 BELOW
========================================= */
/* =========================================
   ENGLISH PATH 2.0
   SCRIPT.JS - PART 3 OF 3
========================================= */

/* =========================================
   12. DASHBOARD AND STATISTICS
========================================= */

function updateDashboardNumbers() {
  const completed = getCompletedCount();
  const remaining = getRemainingCount();
  const percentage = getProgressPercentage();

  const completedEl = getEl("completedCount");
  const remainingEl = getEl("remainingCount");
  const progressEl = getEl("progressPercentage");
  const progressBar = getEl("mainProgress");

  if (completedEl) completedEl.textContent = completed;
  if (remainingEl) remainingEl.textContent = remaining;
  if (progressEl) progressEl.textContent = percentage + "%";

  if (progressBar) {
    progressBar.style.width = percentage + "%";
  }

  const streak = getCurrentStreak();
  const streakEl = getEl("bestStreak");

  if (streakEl) {
    streakEl.textContent = streak;
  }
}

function renderOverview() {
  updateDashboardNumbers();

  const due = getDueReviews();
  const todayReviews = getEl("todayReviews");

  if (todayReviews) {
    renderTodayReviews();
  }

  const tasks = getEl("todayTasks");

  if (tasks) {
    renderTasks();
  }
}

function renderCategoryStats() {
  const container = getEl("categoryStats");

  if (!container) return;

  container.innerHTML = CATEGORY_ORDER.map(category => {
    const info = CATEGORIES[category];

    const completed = getCategoryCompletedCount(category);

    const percentage = Math.round(
      (completed / info.total) * 100
    );

    return `
      <div class="category-stat">
        <div class="category-stat-header">
          <strong>${escapeHTML(info.name)}</strong>
          <span>${completed} / ${info.total}</span>
        </div>

        <div class="progress-track">
          <div
            class="progress-fill"
            style="width:${percentage}%"
          ></div>
        </div>

        <small>${percentage}% مكتمل</small>
      </div>
    `;
  }).join("");
}

/* =========================================
   13. ACHIEVEMENTS
========================================= */

const ACHIEVEMENT_RULES = [
  {
    id: "first",
    title: "أول خطوة",
    description: "أكملت أول درس.",
    icon: "🌱",
    condition: () => getCompletedCount() >= 1
  },
  {
    id: "five",
    title: "بداية قوية",
    description: "أكملت 5 دروس.",
    icon: "⭐",
    condition: () => getCompletedCount() >= 5
  },
  {
    id: "ten",
    title: "متعلم نشيط",
    description: "أكملت 10 دروس.",
    icon: "🏅",
    condition: () => getCompletedCount() >= 10
  },
  {
    id: "twentyfive",
    title: "إنجاز مميز",
    description: "أكملت 25 درساً.",
    icon: "🏆",
    condition: () => getCompletedCount() >= 25
  },
  {
    id: "fortyseven",
    title: "نصف الطريق",
    description: "أكملت 47 درساً.",
    icon: "🚀",
    condition: () => getCompletedCount() >= 47
  },
  {
    id: "ninetythree",
    title: "بطل اللغة",
    description: "أكملت جميع الدروس الـ93.",
    icon: "👑",
    condition: () => getCompletedCount() >= 93
  },
  {
    id: "vocabulary20",
    title: "جامع الكلمات",
    description: "أضفت 20 كلمة إلى قاموسك.",
    icon: "📚",
    condition: () => appData.vocabulary.length >= 20
  },
  {
    id: "streak7",
    title: "الاستمرارية",
    description: "حافظت على سلسلة دراسة لمدة 7 أيام.",
    icon: "🔥",
    condition: () => getCurrentStreak() >= 7
  }
];

function checkAchievements() {
  ACHIEVEMENT_RULES.forEach(rule => {
    if (
      rule.condition() &&
      !appData.achievements.includes(rule.id)
    ) {
      appData.achievements.push(rule.id);
    }
  });

  saveData();
}

function renderAchievements() {
  checkAchievements();

  const container = getEl("achievementsList");
  const count = getEl("achievementCount");

  if (count) {
    count.textContent = appData.achievements.length;
  }

  if (!container) return;

  container.innerHTML = ACHIEVEMENT_RULES.map(rule => {
    const unlocked = appData.achievements.includes(rule.id);

    return `
      <div class="achievement-card ${unlocked ? "unlocked" : "locked"}">
        <div class="achievement-icon">
          ${rule.icon}
        </div>

        <div class="achievement-info">
          <strong>${escapeHTML(rule.title)}</strong>
          <small>${escapeHTML(rule.description)}</small>
        </div>

        <span>${unlocked ? "✓" : "🔒"}</span>
      </div>
    `;
  }).join("");
}

/* =========================================
   14. ACTIVITY CALENDAR
========================================= */

function renderActivityCalendar() {
  const container = getEl("activityCalendar");

  if (!container) return;

  const today = new Date();
  const days = [];

  for (let i = 27; i >= 0; i--) {
    const date = new Date(today);

    date.setDate(today.getDate() - i);

    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");

    days.push({
      key,
      count: Number(appData.activity[key] || 0),
      label: date.toLocaleDateString("ar", {
        day: "numeric",
        month: "short"
      })
    });
  }

  container.innerHTML = days.map(day => {
    const level = day.count === 0
      ? 0
      : day.count <= 2
        ? 1
        : day.count <= 4
          ? 2
          : 3;

    return `
      <div
        class="activity-day level-${level}"
        title="${escapeHTML(day.label)}: ${day.count} نشاط"
      ></div>
    `;
  }).join("");
}

/* =========================================
   15. COMPLETE OR UNCOMPLETE LESSON
========================================= */

function setLessonCompleted(category, number, completed) {
  const key = lessonKey(category, number);

  if (completed) {
    if (!appData.completed.includes(key)) {
      appData.completed.push(key);

      addInitialReviews(category, number);
      recordActivity();
    }
  } else {
    appData.completed = appData.completed.filter(item =>
      item !== key
    );
  }

  checkAchievements();
  saveData();
  renderAll();
}

function setSpecialCompleted(name, completed) {
  if (completed) {
    if (!appData.special.includes(name)) {
      appData.special.push(name);
      recordActivity();
    }
  } else {
    appData.special = appData.special.filter(item =>
      item !== name
    );
  }

  saveData();
  renderAll();
}

/* =========================================
   16. NAVIGATION
========================================= */

function showSection(sectionId) {
  if (!sectionId) return;

  document.querySelectorAll(".page-section").forEach(section => {
    section.classList.toggle(
      "active",
      section.id === sectionId
    );
  });

  document.querySelectorAll(".nav-btn").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.section === sectionId
    );
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/* =========================================
   17. EXPORT AND IMPORT
========================================= */

function exportData() {
  const content = JSON.stringify(appData, null, 2);

  const blob = new Blob(
    [content],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "english-path-backup.json";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function importData(file) {
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(event) {
    try {
      const imported = JSON.parse(event.target.result);

      if (
        !imported ||
        typeof imported !== "object" ||
        !Array.isArray(imported.completed) ||
        !Array.isArray(imported.reviews)
      ) {
        throw new Error("Invalid backup");
      }

      const defaults = createDefaultData();

      appData = {
        ...defaults,
        ...imported,

        completed: Array.isArray(imported.completed)
          ? imported.completed
          : [],

        reviews: Array.isArray(imported.reviews)
          ? imported.reviews
          : [],

        special: Array.isArray(imported.special)
          ? imported.special
          : [],

        vocabulary: Array.isArray(imported.vocabulary)
          ? imported.vocabulary
          : [],

        activity:
          imported.activity &&
          typeof imported.activity === "object"
            ? imported.activity
            : {},

        achievements: Array.isArray(imported.achievements)
          ? imported.achievements
          : [],

        settings: {
          ...defaults.settings,
          ...(imported.settings || {})
        }
      };

      saveData();
      renderAll();

      alert("تم استيراد بياناتك بنجاح.");

    } catch (error) {
      console.error(error);
      alert("ملف النسخة الاحتياطية غير صالح.");
    }
  };

  reader.readAsText(file);
}

/* =========================================
   18. RESET APPLICATION
========================================= */

function resetApplication() {
  const confirmed = confirm(
    "هل أنت متأكد من إعادة ضبط التطبيق؟ سيتم حذف تقدمك ومفرداتك ومراجعاتك من هذا الجهاز."
  );

  if (!confirmed) return;

  localStorage.removeItem(STORAGE_KEY);

  appData = createDefaultData();

  saveData();
  renderAll();

  alert("تمت إعادة ضبط التطبيق.");
}

/* =========================================
   19. EVENT LISTENERS
========================================= */

// Navigation
document.addEventListener("click", function(event) {
  const navButton = event.target.closest(".nav-btn[data-section]");

  if (navButton) {
    showSection(navButton.dataset.section);
    return;
  }

  const goButton = event.target.closest("[data-go]");

  if (goButton) {
    showSection(goButton.dataset.go);
    return;
  }

  const dayButton = event.target.closest("[data-go-day]");

  if (dayButton) {
    const selector = getEl("daySelect");

    if (selector) {
      selector.value = dayButton.dataset.goDay;
      renderTasks();
    }

    showSection("plan");
    return;
  }

  const speakButton = event.target.closest("[data-speak]");

  if (speakButton) {
    speakWord(speakButton.dataset.speak);
    return;
  }

  const deleteButton = event.target.closest("[data-delete-word]");

  if (deleteButton) {
    const confirmed = confirm("هل تريد حذف هذه الكلمة؟");

    if (confirmed) {
      deleteVocabularyWord(deleteButton.dataset.deleteWord);
    }

    return;
  }

  const reviewButton = event.target.closest("[data-rate]");

  if (reviewButton) {
    rateReview(
      reviewButton.dataset.review,
      reviewButton.dataset.rate
    );
  }
});

// Lesson checkboxes
document.addEventListener("change", function(event) {
  const lessonCheckbox = event.target.closest("[data-lesson]");

  if (lessonCheckbox) {
    const parts = lessonCheckbox.dataset.lesson.split(":");

    if (parts.length === 2) {
      setLessonCompleted(
        parts[0],
        Number(parts[1]),
        lessonCheckbox.checked
      );
    }

    return;
  }

  const specialCheckbox = event.target.closest("[data-special]");

  if (specialCheckbox) {
    setSpecialCompleted(
      specialCheckbox.dataset.special,
      specialCheckbox.checked
    );

    return;
  }

  if (event.target.id === "daySelect") {
    renderTasks();
  }
});

// Vocabulary form
const vocabularyForm = getEl("vocabularyForm");

if (vocabularyForm) {
  vocabularyForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const word = getEl("wordInput");
    const meaning = getEl("meaningInput");
    const example = getEl("exampleInput");

    if (!word || !meaning) return;

    const added = addVocabularyWord(
      word.value,
      meaning.value,
      example ? example.value : ""
    );

    if (added) {
      vocabularyForm.reset();
    }
  });
}

// Vocabulary search
const vocabularySearch = getEl("vocabularySearch");

if (vocabularySearch) {
  vocabularySearch.addEventListener("input", renderVocabulary);
}

// Export
const exportButton = getEl("exportBtn");

if (exportButton) {
  exportButton.addEventListener("click", exportData);
}

// Import
const importButton = getEl("importBtn");
const importFile = getEl("importFile");

if (importButton && importFile) {
  importButton.addEventListener("click", function() {
    importFile.click();
  });

  importFile.addEventListener("change", function() {
    const file = importFile.files && importFile.files[0];

    if (file) {
      importData(file);
    }

    importFile.value = "";
  });
}

// Reset
const resetButton = getEl("resetBtn");

if (resetButton) {
  resetButton.addEventListener("click", resetApplication);
}

/* =========================================
   20. RENDER ALL APPLICATION
========================================= */

function renderAll() {
  renderOverview();
  renderTasks();
  renderTodayReviews();
  renderReviews();
  renderVocabulary();
  renderCategoryStats();
  renderAchievements();
  renderActivityCalendar();
  updateDashboardNumbers();
}

/* =========================================
   21. START APPLICATION
========================================= */

renderAll();

// Register service worker when available
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker.register("./service-worker.js")
      .catch(error => {
        console.warn("Service Worker registration failed:", error);
      });
  });
}

/* =========================================
   END OF SCRIPT.JS
========================================= */
