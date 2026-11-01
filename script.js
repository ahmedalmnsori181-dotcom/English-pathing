
/* =========================================
   ENGLISH PATH 2.0
   Main application engine
   Preserves old progress and storage key
========================================= */

"use strict";

const STORAGE_KEY = "english_path_progress_v1";
const TOTAL_LESSONS = 93;

const categories = [
  { id: "foundation", name: "التأسيس من الصفر", count: 25 },
  { id: "reading", name: "القراءة", count: 17 },
  { id: "phonics", name: "الصوتيات", count: 14 },
  { id: "listening", name: "الاستماع", count: 16 },
  { id: "conversation", name: "المحادثة", count: 9 },
  { id: "writing", name: "الكتابة", count: 12 }
];

const categoryMap = Object.fromEntries(
  categories.map(category => [category.id, category])
);

const intervals = {
  forgotten: 1,
  hard: 3,
  good: 7,
  easy: 14
};

const ratingNames = {
  forgotten: "لم أتذكر",
  hard: "صعب",
  good: "جيد",
  easy: "سهل"
};

/* =========================================
   DATA AND STORAGE
========================================= */

function emptyData() {
  return {
    completed: {},
    reviews: {},
    special: {},
    vocabulary: [],
    activity: {},
    achievements: []
  };
}

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return emptyData();

    const parsed = JSON.parse(saved);

    return {
      ...emptyData(),
      ...parsed,
      completed: parsed.completed || {},
      reviews: parsed.reviews || {},
      special: parsed.special || {},
      vocabulary: Array.isArray(parsed.vocabulary)
        ? parsed.vocabulary
        : [],
      activity: parsed.activity || {},
      achievements: Array.isArray(parsed.achievements)
        ? parsed.achievements
        : []
    };
  } catch (error) {
    console.error("Could not load saved progress:", error);
    return emptyData();
  }
}

let data = loadData();

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function lessonKey(category, number) {
  return `${category}:${number}`;
}

/* =========================================
   DATE HELPERS
========================================= */

function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + days);
  return dateKey(date);
}

function formatDate(value) {
  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("ar", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function today() {
  return dateKey();
}

/* =========================================
   ACTIVITY TRACKING
========================================= */

function recordActivity() {
  const key = today();
  data.activity[key] = (data.activity[key] || 0) + 1;
}

function getStreak() {
  let streak = 0;
  let cursor = new Date();

  if (!data.activity[today()]) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const key = dateKey(cursor);

    if (!data.activity[key]) break;

    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getBestStreak() {
  const dates = Object.keys(data.activity)
    .filter(key => data.activity[key] > 0)
    .sort();

  let best = 0;
  let current = 0;
  let previous = null;

  dates.forEach(key => {
    if (previous && addDays(previous, 1) === key) {
      current++;
    } else {
      current = 1;
    }

    best = Math.max(best, current);
    previous = key;
  });

  return best;
}

/* =========================================
   STUDY PLAN - 30 DAYS
========================================= */

const plan = {};

function setDay(day, tasks) {
  plan[day] = tasks;
}

function task(category, numbers) {
  return numbers.map(number => ({
    category,
    number,
    key: lessonKey(category, number)
  }));
}

setDay(1, [
  ...task("foundation", [15, 16])
]);

setDay(2, [
  ...task("foundation", [17, 18])
]);

setDay(3, [
  ...task("foundation", [19, 20])
]);

setDay(4, [
  ...task("foundation", [21, 22])
]);

setDay(5, [
  ...task("foundation", [23, 24, 25])
]);

setDay(6, [
  ...task("reading", [6, 7])
]);

setDay(7, [
  ...task("reading", [8, 9])
]);

setDay(8, [
  ...task("reading", [10, 11, 12])
]);

setDay(9, [
  ...task("reading", [13, 14, 15])
]);

setDay(10, [
  ...task("reading", [16, 17])
]);

setDay(11, [
  ...task("phonics", [1, 2]),
  ...task("listening", [2])
]);

setDay(12, [
  ...task("phonics", [3]),
  ...task("listening", [3, 4])
]);

setDay(13, [
  ...task("phonics", [4, 5]),
  ...task("listening", [5])
]);

setDay(14, [
  ...task("phonics", [6]),
  ...task("listening", [6, 7])
]);

setDay(15, [
  ...task("phonics", [7, 8]),
  ...task("listening", [8])
]);

setDay(16, [
  ...task("phonics", [9]),
  ...task("listening", [9, 10])
]);

setDay(17, [
  ...task("phonics", [10, 11]),
  ...task("listening", [11])
]);

setDay(18, [
  ...task("phonics", [12]),
  ...task("listening", [12, 13])
]);

setDay(19, [
  ...task("phonics", [13]),
  ...task("listening", [14])
]);

setDay(20, [
  ...task("phonics", [14]),
  ...task("listening", [15, 16])
]);

setDay(21, [
  ...task("conversation", [1, 2]),
  ...task("writing", [1])
]);

setDay(22, [
  ...task("conversation", [3]),
  ...task("writing", [2, 3])
]);

setDay(23, [
  ...task("conversation", [4, 5]),
  ...task("writing", [4])
]);

setDay(24, [
  ...task("conversation", [6]),
  ...task("writing", [5, 6])
]);

setDay(25, [
  ...task("conversation", [7]),
  ...task("writing", [7, 8])
]);

setDay(26, [
  ...task("conversation", [8]),
  ...task("writing", [9, 10])
]);

setDay(27, [
  ...task("conversation", [9]),
  ...task("writing", [11, 12])
]);

setDay(28, [
  { special: "مراجعة شاملة للتأسيس والقراءة" }
]);

setDay(29, [
  { special: "مراجعة شاملة للصوتيات والاستماع" }
]);

setDay(30, [
  { special: "مراجعة المحادثة والكتابة وإجراء اختبار شامل" }
]);

/* =========================================
   REVIEW SYSTEM
========================================= */

function ensureReviews(key, completionDate) {
  if (data.reviews[key] && data.reviews[key].length) return;

  data.reviews[key] = [
    {
      date: addDays(completionDate, 3),
      stage: "الأولى",
      done: false
    },
    {
      date: addDays(completionDate, 7),
      stage: "الثانية",
      done: false
    }
  ];
}

function getAllReviews() {
  const result = [];

  Object.entries(data.reviews).forEach(([key, reviews]) => {
    if (!Array.isArray(reviews)) return;

    reviews.forEach(review => {
      result.push({
        key,
        date: review.date,
        stage: review.stage || "مراجعة",
        done: Boolean(review.done)
      });
    });
  });

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

function getDueReviews() {
  return getAllReviews().filter(review =>
    !review.done && review.date <= today()
  );
}

function getFutureReviews() {
  return getAllReviews().filter(review =>
    !review.done && review.date > today()
  );
}

function addNextReview(key, days, rating) {
  if (!data.reviews[key]) data.reviews[key] = [];

  const nextDate = addDays(today(), days);

  data.reviews[key].push({
    date: nextDate,
    stage: `مراجعة بعد التقييم: ${ratingNames[rating]}`,
    done: false
  });
}

function rateReview(key, reviewDate, rating) {
  const days = intervals[rating];

  if (!days || !data.reviews[key]) return;

  const review = data.reviews[key].find(item =>
    item.date === reviewDate && !item.done
  );

  if (!review) return;

  review.done = true;
  review.rating = rating;
  review.ratedAt = today();

  addNextReview(key, days, rating);
  recordActivity();
  saveData();
  renderAll();
}

function deleteReviewsForLesson(key) {
  delete data.reviews[key];
}

/* =========================================
   LESSON COMPLETION
========================================= */

function setLessonCompleted(key, checked) {
  if (checked) {
    data.completed[key] = today();
    ensureReviews(key, today());
    recordActivity();
  } else {
    delete data.completed[key];
    deleteReviewsForLesson(key);
  }

  saveData();
  renderAll();
}

function completedCount() {
  return Object.keys(data.completed).filter(key => {
    return categoryMap[key.split(":")[0]];
  }).length;
}

function completionPercentage() {
  return Math.round((completedCount() / TOTAL_LESSONS) * 100);
}

/* =========================================
   HTML SAFETY
========================================= */

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

/* =========================================
   NAVIGATION
========================================= */

function showSection(sectionId) {
  document.querySelectorAll(".page-section").forEach(section => {
    section.classList.toggle("active", section.id === sectionId);
  });

  document.querySelectorAll(".nav-btn").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.section === sectionId
    );
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll(".nav-btn").forEach(button => {
  button.addEventListener("click", () => {
    showSection(button.dataset.section);
  });
});

document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => {
    showSection(button.dataset.go);
  });
});

/* =========================================
   HOME DASHBOARD
========================================= */

function renderOverview() {
  const count = completedCount();
  const percentage = completionPercentage();

  document.getElementById("completedCount").textContent = count;
  document.getElementById("progressPercent").textContent = `${percentage}%`;
  document.getElementById("progressPercentCard").textContent = `${percentage}%`;
  document.getElementById("progressText").textContent = `${count} من ${TOTAL_LESSONS}`;

  document.getElementById("progressBar").style.width = `${percentage}%`;

  document.getElementById("streakCount").textContent = getStreak();
  document.getElementById("dueReviewsCount").textContent = getDueReviews().length;

  document.getElementById("todayDate").textContent =
    new Date().toLocaleDateString("ar", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
}

function renderTaskItem(item) {
  if (item.special) {
    return `
      <div class="task-item">
        <span class="task-title">⭐ ${escapeHTML(item.special)}</span>
      </div>
    `;
  }

  const category = categoryMap[item.category];
  const completed = Boolean(data.completed[item.key]);

  return `
    <div class="task-item ${completed ? "completed" : ""}">
      <label>
        <input
          type="checkbox"
          data-lesson="${escapeHTML(item.key)}"
          ${completed ? "checked" : ""}
        >
        <span>
          <span class="task-title">
            ${escapeHTML(category.name)} - الحلقة ${item.number}
          </span>
          <span class="task-category">
            ${completed ? "تم الإنجاز" : "لم يكتمل بعد"}
          </span>
        </span>
      </label>
    </div>
  `;
}

function renderTasks() {
  const select = document.getElementById("daySelect");
  const day = Number(select.value || 1);
  const tasks = plan[day] || [];

  document.getElementById("todayTasks").innerHTML =
    tasks.length
      ? tasks.map(renderTaskItem).join("")
      : '<p class="empty-state">لا توجد مهام لهذا اليوم.</p>';

  document.getElementById("planList").innerHTML =
    tasks.length
      ? tasks.map(renderTaskItem).join("")
      : '<p class="empty-state">لا توجد مهام لهذا اليوم.</p>';
}

function renderTodayReviews() {
  const reviews = getDueReviews();

  document.getElementById("todayReviews").innerHTML =
    reviews.length
      ? reviews.slice(0, 8).map(review => `
          <div class="review-item">
            <div>
              <strong>${escapeHTML(review.key)}</strong>
              <small>${escapeHTML(review.stage)}</small>
            </div>
            <span class="task-category">${formatDate(review.date)}</span>
          </div>
        `).join("")
      : '<p class="empty-state">رائع! لا توجد مراجعات مستحقة اليوم.</p>';
}

/* =========================================
   PLAN
========================================= */

document.getElementById("daySelect").addEventListener("change", renderTasks);

/* =========================================
   REVIEW DISPLAY AND RATINGS
========================================= */

function renderReviews() {
  const due = getDueReviews();
  const future = getFutureReviews();

  document.getElementById("reviewDueTotal").textContent = due.length;
  document.getElementById("reviewFutureTotal").textContent = future.length;

  const allPending = [...due, ...future];

  document.getElementById("reviewList").innerHTML =
    allPending.length
      ? allPending.map(review => {
          const isDue = review.date <= today();

          return `
            <div class="review-item">
              <div>
                <strong>${escapeHTML(review.key)}</strong>
                <div class="task-category">
                  ${escapeHTML(review.stage)}
                </div>
                <small>${isDue ? "مستحقة الآن" : "موعدها " + formatDate(review.date)}</small>
              </div>

              ${isDue ? `
                <div class="review-ratings">
                  <button data-rate="forgotten" data-key="${escapeHTML(review.key)}" data-date="${escapeHTML(review.date)}">😵 لم أتذكر</button>
                  <button data-rate="hard" data-key="${escapeHTML(review.key)}" data-date="${escapeHTML(review.date)}">😕 صعب</button>
                  <button data-rate="good" data-key="${escapeHTML(review.key)}" data-date="${escapeHTML(review.date)}">🙂 جيد</button>
                  <button data-rate="easy" data-key="${escapeHTML(review.key)}" data-date="${escapeHTML(review.date)}">😎 سهل</button>
                </div>
              ` : ""}
            </div>
          `;
        }).join("")
      : '<p class="empty-state">لا توجد مراجعات حالياً. أكمل درساً جديداً لتبدأ المراجعة.</p>';
}

document.getElementById("reviewList").addEventListener("click", event => {
  const button = event.target.closest("[data-rate]");
  if (!button) return;

  rateReview(
    button.dataset.key,
    button.dataset.date,
    button.dataset.rate
  );
});

/* =========================================
   VOCABULARY
========================================= */

const vocabularyForm = document.getElementById("vocabularyForm");

vocabularyForm.addEventListener("submit", event => {
  event.preventDefault();

  const word = document.getElementById("wordInput").value.trim();
  const meaning = document.getElementById("meaningInput").value.trim();
  const example = document.getElementById("exampleInput").value.trim();

  if (!word || !meaning) return;

  data.vocabulary.unshift({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    word,
    meaning,
    example,
    createdAt: today()
  });

  recordActivity();
  saveData();
  vocabularyForm.reset();
  renderVocabulary();
  renderStatistics();
});

function renderVocabulary() {
  const search = (
    document.getElementById("vocabularySearch").value || ""
  ).trim().toLowerCase();

  const filtered = data.vocabulary.filter(item =>
    item.word.toLowerCase().includes(search) ||
    item.meaning.toLowerCase().includes(search) ||
    (item.example || "").toLowerCase().includes(search)
  );

  document.getElementById("vocabularyCount").textContent =
    `${data.vocabulary.length} كلمة`;

  document.getElementById("statisticsVocabularyCount").textContent =
    data.vocabulary.length;

  document.getElementById("vocabularyList").innerHTML =
    filtered.length
      ? filtered.map(item => `
          <div class="vocabulary-item">
            <h4>${escapeHTML(item.word)}</h4>
            <p>${escapeHTML(item.meaning)}</p>
            ${item.example ? `<small>${escapeHTML(item.example)}</small>` : ""}
            <button data-speak="${escapeHTML(item.id)}">🔊 نطق الكلمة</button>
            <button data-delete-word="${escapeHTML(item.id)}">🗑️ حذف</button>
          </div>
        `).join("")
      : '<p class="empty-state">لا توجد كلمات مطابقة للبحث.</p>';
}

document.getElementById("vocabularySearch").addEventListener(
  "input",
  renderVocabulary
);

document.getElementById("vocabularyList").addEventListener("click", event => {
  const speakButton = event.target.closest("[data-speak]");
  const deleteButton = event.target.closest("[data-delete-word]");

  if (speakButton) {
    const item = data.vocabulary.find(
      word => word.id === speakButton.dataset.speak
    );

    if (item && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(item.word);
      utterance.lang = "en-US";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } else {
      alert("ميزة النطق غير متاحة في هذا المتصفح.");
    }
  }

  if (deleteButton) {
    const confirmed = confirm("هل تريد حذف هذه الكلمة؟");
    if (!confirmed) return;

    data.vocabulary = data.vocabulary.filter(
      word => word.id !== deleteButton.dataset.deleteWord
    );

    saveData();
    renderVocabulary();
    renderStatistics();
  }
});

/* =========================================
   STATISTICS BY COURSE
========================================= */

function renderCategoryStats() {
  const container = document.getElementById("categoryStats");

  container.innerHTML = categories.map(category => {
    let count = 0;

    for (let number = 1; number <= category.count; number++) {
      if (data.completed[lessonKey(category.id, number)]) count++;
    }

    const percentage = Math.round((count / category.count) * 100);

    return `
      <div class="category-stat">
        <div class="category-stat-header">
          <span>${escapeHTML(category.name)}</span>
          <span>${count} / ${category.count} (${percentage}%)</span>
        </div>
        <div class="category-stat-bar">
          <div class="category-stat-fill" style="width:${percentage}%"></div>
        </div>
      </div>
    `;
  }).join("");
}

/* =========================================
   ACHIEVEMENTS
========================================= */

const achievementDefinitions = [
  {
    id: "first",
    title: "البداية القوية",
    description: "أكمل أول درس",
    icon: "🌱",
    check: () => completedCount() >= 1
  },
  {
    id: "five",
    title: "أول خمس خطوات",
    description: "أكمل 5 دروس",
    icon: "⭐",
    check: () => completedCount() >= 5
  },
  {
    id: "ten",
    title: "متعلم نشيط",
    description: "أكمل 10 دروس",
    icon: "🚀",
    check: () => completedCount() >= 10
  },
  {
    id: "twentyfive",
    title: "ربع الطريق",
    description: "أكمل 25 درساً",
    icon: "🏅",
    check: () => completedCount() >= 25
  },
  {
    id: "half",
    title: "نصف الطريق",
    description: "أكمل 47 درساً",
    icon: "🏆",
    check: () => completedCount() >= 47
  },
  {
    id: "complete",
    title: "إنجاز عظيم",
    description: "أكمل الدروس الـ93",
    icon: "👑",
    check: () => completedCount() >= 93
  },
  {
    id: "vocab",
    title: "جامع الكلمات",
    description: "أضف 20 كلمة",
    icon: "📚",
    check: () => data.vocabulary.length >= 20
  },
  {
    id: "streak",
    title: "الاستمرارية",
    description: "حافظ على سلسلة 7 أيام",
    icon: "🔥",
    check: () => getBestStreak() >= 7
  }
];

function updateAchievements() {
  achievementDefinitions.forEach(achievement => {
    if (
      achievement.check() &&
      !data.achievements.includes(achievement.id)
    ) {
      data.achievements.push(achievement.id);
    }
  });
}

function renderAchievements() {
  upda
/* =========================================
   NAVIGATION COMPATIBILITY FIX
========================================= */

document.querySelectorAll("[data-page], [data-section]").forEach(button => {
  button.addEventListener("click", () => {
    const target = button.dataset.section || button.dataset.page;

    if (!target) return;

    document.querySelectorAll(".page, .page-section").forEach(page => {
      page.classList.toggle("active", page.id === target);
    });

    document.querySelectorAll("[data-page], [data-section]").forEach(nav => {
      nav.classList.toggle("active", nav === button);
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
});
   
