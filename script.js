// =====================================
// ENGLISH PATH
// Study plan + spaced repetition
// =====================================

const categories = [
  { id: "foundation", name: "التأسيس من الصفر", count: 25 },
  { id: "reading", name: "القراءة", count: 17 },
  { id: "phonics", name: "الصوتيات", count: 14 },
  { id: "listening", name: "الاستماع", count: 16 },
  { id: "conversation", name: "المحادثة", count: 9 },
  { id: "writing", name: "الكتابة", count: 12 }
];

const plan = [
  [["foundation",15,16],["old","التأسيس",1,2]],
  [["foundation",17,18],["old","التأسيس",3,4]],
  [["foundation",19,20],["old","التأسيس",5,6]],
  [["foundation",21,22],["old","التأسيس",7,8]],
  [["foundation",23,25],["old","التأسيس",9,10]],
  [["reading",6,7],["old","التأسيس",11,12]],
  [["reading",8,9],["old","التأسيس",13,14]],
  [["reading",10,12],["old","القراءة",1,2]],
  [["reading",13,15],["old","القراءة",3,4]],
  [["reading",16,17],["old","القراءة",5,5],["test","اختبار التأسيس والقراءة"]],

  [["phonics",1,2],["listening",2,2]],
  [["phonics",3,3],["listening",3,4]],
  [["phonics",4,5],["listening",5,5]],
  [["phonics",6,6],["listening",6,7]],
  [["phonics",7,8],["listening",8,8]],
  [["phonics",9,9],["listening",9,10]],
  [["phonics",10,11],["listening",11,11]],
  [["phonics",12,12],["listening",12,13]],
  [["phonics",13,13],["listening",14,14]],
  [["phonics",14,14],["listening",15,16]],

  [["conversation",1,2],["writing",1,1]],
  [["conversation",3,3],["writing",2,3]],
  [["conversation",4,5],["writing",4,4]],
  [["conversation",6,6],["writing",5,6]],
  [["conversation",7,7],["writing",7,8]],
  [["conversation",8,8],["writing",9,10]],
  [["conversation",9,9],["writing",11,12]],

  [["phase","مراجعة التأسيس والقراءة"]],
  [["phase","مراجعة الصوتيات والاستماع"]],
  [["phase","مراجعة المحادثة والكتابة"],["test","الاختبار الشامل للمستوى الأول"]]
];

const STORAGE_KEY = "english_path_progress_v1";

let data = loadData();

function emptyData() {
  return {
    completed: {},
    reviews: {},
    special: {}
  };
}

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || emptyData();
  } catch {
    return emptyData();
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  renderAll();
}

function todayISO() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");
}

function addDays(date, days) {
  const d = new Date(date + "T12:00:00");
  d.setDate(d.getDate() + days);

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");
}

function lessonKey(category, number) {
  return category + ":" + number;
}

function categoryName(id) {
  const item = categories.find(c => c.id === id);
  return item ? item.name : id;
}

function isCompleted(key) {
  return !!data.completed[key];
}

// -------------------------------------
// Build tasks
// -------------------------------------

function getDayTasks(day) {
  return plan[day - 1].map((task, index) => {
    if (task[0] === "old") {
      return {
        id: `old-${day}-${index}`,
        type: "old",
        title: `مراجعة ${task[1]} · ${task[2] === task[3] ? task[2] : task[2] + "–" + task[3]}`
      };
    }

    if (task[0] === "test" || task[0] === "phase") {
      return {
        id: `special-${day}-${index}`,
        type: "special",
        title: task[1]
      };
    }

    return {
      id: `range-${day}-${index}`,
      type: "range",
      category: task[0],
      start: task[1],
      end: task[2]
    };
  });
}

// -------------------------------------
// Complete / undo lessons
// -------------------------------------

function toggleLesson(key, checked) {
  if (checked) {
    const completedDate = todayISO();

    data.completed[key] = completedDate;

    // Two spaced reviews: +3 days and +7 days
    data.reviews[key] = [
      {
        date: addDays(completedDate, 3),
        stage: "الأولى",
        done: false
      },
      {
        date: addDays(completedDate, 7),
        stage: "الثانية",
        done: false
      }
    ];
  } else {
    delete data.completed[key];
    delete data.reviews[key];
  }

  saveData();
}

function toggleSpecial(id, checked) {
  data.special[id] = checked;
  saveData();
}

// -------------------------------------
// Reviews
// -------------------------------------

function getReviews() {
  const due = [];
  const future = [];

  Object.entries(data.reviews).forEach(([key, items]) => {
    items.forEach((review, index) => {
      if (review.done) return;

      const item = { key, index, ...review };

      if (review.date <= todayISO()) {
        due.push(item);
      } else {
        future.push(item);
      }
    });
  });

  due.sort((a, b) => a.date.localeCompare(b.date));
  future.sort((a, b) => a.date.localeCompare(b.date));

  return { due, future };
}

function toggleReview(key, index, checked) {
  if (!data.reviews[key]) return;

  data.reviews[key][index].done = checked;
  saveData();
}

// -------------------------------------
// Header progress
// -------------------------------------

function renderHeader() {
  const completed = Object.keys(data.completed).filter(
    key => data.completed[key]
  ).length;

  const total = 93;
  const percent = Math.round(completed / total * 100);

  document.getElementById("completedCount").textContent = completed;
  document.getElementById("progressPercent").textContent = percent + "%";
  document.getElementById("progressBar").style.width = percent + "%";
}

// -------------------------------------
// Today's tasks
// -------------------------------------

function renderToday() {
  const day = Number(document.getElementById("daySelect").value || 1);
  const container = document.getElementById("todayTasks");

  let html = "";

  getDayTasks(day).forEach(task => {
    if (task.type === "range") {
      for (let n = task.start; n <= task.end; n++) {
        const key = lessonKey(task.category, n);
        const checked = isCompleted(key);

        html += `
          <label class="task ${checked ? "done" : ""}">
            <input type="checkbox"
              data-lesson="${key}"
              ${checked ? "checked" : ""}>

            <span>
              <span class="task-name">
                ${categoryName(task.category)} — الحلقة ${n}
              </span>
              <small>
                ${checked
                  ? "مكتملة · " + data.completed[key]
                  : "لم تكتمل بعد"}
              </small>
            </span>
          </label>
        `;
      }
    } else {
      const checked = !!data.special[task.id];

      html += `
        <label class="task ${checked ? "done" : ""}">
          <input type="checkbox"
            data-special="${task.id}"
            ${checked ? "checked" : ""}>

          <span>
            <span class="task-name">${task.title}</span>
            <small>مهمة مراجعة أو اختبار</small>
          </span>
        </label>
      `;
    }
  });

  container.innerHTML = html;

  container.querySelectorAll("[data-lesson]").forEach(input => {
    input.addEventListener("change", () => {
      toggleLesson(input.dataset.lesson, input.checked);
    });
  });

  container.querySelectorAll("[data-special]").forEach(input => {
    input.addEventListener("change", () => {
      toggleSpecial(input.dataset.special, input.checked);
    });
  });

  renderTodayReviews();
}

function renderTodayReviews() {
  const container = document.getElementById("todayReviews");
  const { due } = getReviews();

  if (!due.length) {
    container.innerHTML =
      '<p class="empty">لا توجد مراجعات مستحقة اليوم 🎉</p>';
    return;
  }

  container.innerHTML = due.map(item => `
    <div class="review-item">
      ${categoryName(item.key.split(":")[0])}
      — الحلقة ${item.key.split(":")[1]}
      <small>مراجعة ${item.stage} · ${item.date}</small>
    </div>
  `).join("");
}

// -------------------------------------
// 30-day plan
// -------------------------------------

function renderPlan() {
  const container = document.getElementById("planList");

  container.innerHTML = plan.map((_, index) => {
    const day = index + 1;

    const descriptions = getDayTasks(day).map(task => {
      if (task.type === "range") {
        return categoryName(task.category) +
          " " + task.start + "–" + task.end;
      }

      return task.title;
    }).join(" + ");

    return `
      <div class="day-row">
        <div>
          <strong>اليوم ${day}</strong>
          <small>${descriptions}</small>
        </div>

        <button data-open-day="${day}">عرض</button>
      </div>
    `;
  }).join("");

  container.querySelectorAll("[data-open-day]").forEach(button => {
    button.addEventListener("click", () => {
      document.getElementById("daySelect").value =
        button.dataset.openDay;

      document.querySelector('[data-page="home"]').click();
      renderToday();
    });
  });
}

// -------------------------------------
// Reviews page
// -------------------------------------

function renderReviews() {
  const container = document.getElementById("reviewList");
  const { due, future } = getReviews();

  if (!due.length && !future.length) {
    container.innerHTML =
      '<p class="empty">لا توجد مراجعات مجدولة حتى الآن.</p>';
    return;
  }

  let html = "";

  if (due.length) {
    html += "<h3>المراجعات المستحقة</h3>";

    html += due.map(item => `
      <label class="review-item">
        <input type="checkbox"
          data-review-key="${item.key}"
          data-review-index="${item.index}">

        ${categoryName(item.key.split(":")[0])}
        — الحلقة ${item.key.split(":")[1]}

        <small>مراجعة ${item.stage} · مستحقة الآن</small>
      </label>
    `).join("");
  }

  if (future.length) {
    html += "<h3>المراجعات القادمة</h3>";

    html += future.map(item => `
      <div class="review-item">
        ${categoryName(item.key.split(":")[0])}
        — الحلقة ${item.key.split(":")[1]}

        <small>مراجعة ${item.stage} · ${item.date}</small>
      </div>
    `).join("");
  }

  container.innerHTML = html;

  container.querySelectorAll("[data-review-key]").forEach(input => {
    input.addEventListener("change", () => {
      toggleReview(
        input.dataset.reviewKey,
        Number(input.dataset.reviewIndex),
        input.checked
      );
    });
  });
}

// -------------------------------------
// Category statistics
// -------------------------------------

function renderStats() {
  const container = document.getElementById("categoryStats");

  container.innerHTML = categories.map(category => {
    let count = 0;

    for (let n = 1; n <= category.count; n++) {
      if (isCompleted(lessonKey(category.id, n))) count++;
    }

    const percent = Math.round(count / category.count * 100);

    return `
      <div class="stat-row">
        <div>
          <strong>${category.name}</strong>
          <small>${count} من ${category.count} حلقة مكتملة</small>
        </div>
        <strong>${percent}%</strong>
      </div>
    `;
  }).join("");
}

// -------------------------------------
// Tabs
// -------------------------------------

document.querySelectorAll("[data-page]").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-page]").forEach(b => {
      b.classList.toggle("active", b === button);
    });

    document.querySelectorAll(".page").forEach(page => {
      page.classList.toggle("active", page.id === button.dataset.page);
    });
  });
});

// -------------------------------------
// Day selector
// -------------------------------------

const daySelect = document.getElementById("daySelect");

for (let day = 1; day <= 30; day++) {
  const option = document.createElement("option");
  option.value = day;
  option.textContent = "اليوم " + day;
  daySelect.appendChild(option);
}

daySelect.addEventListener("change", renderToday);

// -------------------------------------
// Backup export / import
// -------------------------------------

document.getElementById("exportBtn").addEventListener("click", () => {
  const backup = {
    app: "English Path",
    version: 1,
    exportedAt: new Date().toISOString(),
    data
  };

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "English-Path-Backup.json";
  link.click();

  URL.revokeObjectURL(url);
});

document.getElementById("importBtn").addEventListener("click", () => {
  document.getElementById("importFile").click();
});

document.getElementById("importFile").addEventListener("change", async event => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const backup = JSON.parse(await file.text());

    if (
      backup.app !== "English Path" ||
      !backup.data ||
      !backup.data.completed ||
      !backup.data.reviews
    ) {
      throw new Error("Invalid backup");
    }

    data = backup.data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    alert("تم استيراد تقدمك بنجاح.");
    renderAll();

  } catch {
    alert("الملف غير صالح أو ليس نسخة احتياطية من English Path.");
  }

  event.target.value = "";
});

// -------------------------------------
// Reset
// -------------------------------------

document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("هل أنت متأكد؟ سيتم حذف جميع الحلقات والمراجعات المسجلة.")) {
    data = emptyData();
    saveData();
  }
});

// -------------------------------------
// Render all
// -------------------------------------

function renderAll() {
  renderHeader();
  renderToday();
  renderReviews();
  renderStats();
}

renderPlan();
renderAll();

// -------------------------------------
// Offline support
// -------------------------------------

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js")
      .catch(error => console.log("Service Worker:", error));
  });
}