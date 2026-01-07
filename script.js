const KEY = "dos_final_bigday_v1";
const today = () => new Date().toISOString().slice(0, 10);

const state = JSON.parse(localStorage.getItem(KEY)) || {
  tab: "today",
  habits: ["Grind", "Workout", "Deep Work", "No Porn", "Sleep ≥ 7h"],
  entries: {}
};

let day = today();

/* Helpers */
function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
}
function entry(d) {
  if (!state.entries[d]) {
    state.entries[d] = { done: {}, submitted: false, workout: null, notes: "" };
  }
  return state.entries[d];
}
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.style.display = "block";
  setTimeout(() => (t.style.display = "none"), 2000);
}
function score(d) {
  return `${Object.values(entry(d).done).filter(Boolean).length}/${
    state.habits.length
  }`;
}
function last7() {
  return [...Array(7)]
    .map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    })
    .reverse();
}

/* Workout engine */
const WORKOUT_POOL = [
  ["Push-ups", "Chest, shoulders, arms"],
  ["Squats", "Legs and glutes"],
  ["Plank", "Core stability"],
  ["Jumping jacks", "Cardio warm-up"],
  ["Mountain climbers", "Conditioning"],
  ["Wall sit", "Leg endurance"]
];
function generateWorkout() {
  return WORKOUT_POOL.sort(() => 0.5 - Math.random()).slice(0, 4);
}

/* Render */
function render() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  /* Top */
  app.innerHTML += `
    <div class="top">
      <div class="brand">
        <div class="title">DOS</div>
        <div class="sub">Discipline OS</div>
      </div>
      <div class="status">${score(day)}</div>
    </div>
  `;

  /* Tabs */
  const tabs = document.createElement("div");
  tabs.className = "tabs";
  ["today", "week", "habits", "settings"].forEach((t) => {
    const b = document.createElement("button");
    b.className = "tab" + (state.tab === t ? " active" : "");
    b.textContent = t.toUpperCase();
    b.onclick = () => {
      state.tab = t;
      save();
      render();
    };
    tabs.appendChild(b);
  });
  app.appendChild(tabs);

  /* TODAY */
  if (state.tab === "today") {
    const e = entry(day);
    const dObj = new Date(day);
    const dayName =
      day === today()
        ? "Today"
        : dObj.toLocaleDateString(undefined, { weekday: "long" });
    const fullDate = dObj.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric"
    });

    const c = document.createElement("div");
    c.className = "card";
    c.innerHTML = `
      <div class="day-header">
        <div class="day-name">${dayName}</div>
        <div class="day-date">${fullDate}</div>
      </div>
      <div style="font-size:26px;font-weight:800">${score(day)}</div>
    `;

    state.habits.forEach((h) => {
      const row = document.createElement("div");
      row.className = "habit";
      row.innerHTML = `
        <div>
          <div class="name">${h}</div>
          <div class="meta">${e.submitted ? "LOCKED" : "Editable"}</div>
        </div>
        <div class="toggle ${e.done[h] ? "on" : ""} ${
        e.submitted ? "locked" : ""
      }"></div>
      `;
      row.querySelector(".toggle").onclick = () => {
        if (e.submitted) return toast("Unsubmit to edit");
        e.done[h] = !e.done[h];
        save();
        render();
      };
      c.appendChild(row);
    });

    if (!e.workout) {
      e.workout = generateWorkout();
      save();
    }

    const w = document.createElement("div");
    w.innerHTML = "<h3>Workout</h3>";
    e.workout.forEach(([n, d]) => {
      w.innerHTML += `
        <div class="workout-section">
          <div class="workout-title">${n}</div>
          <div class="workout-desc">${d}</div>
        </div>
      `;
    });
    c.appendChild(w);

    const regen = document.createElement("button");
    regen.className = "btn secondary";
    regen.textContent = "REGENERATE WORKOUT";
    regen.onclick = () => {
      e.workout = generateWorkout();
      save();
      toast("Workout regenerated");
      render();
    };
    c.appendChild(regen);

    const submit = document.createElement("button");
    submit.className = e.submitted ? "btn warn" : "btn primary";
    submit.textContent = e.submitted ? "UNSUBMIT DAY" : "SUBMIT DAY";
    submit.onclick = () => {
      if (e.submitted) {
        if (!confirm("Unsubmit this day?")) return;
        e.submitted = false;
        toast("Day unsubmitted");
      } else {
        e.submitted = true;
        toast("Day submitted");
      }
      save();
      render();
    };
    c.appendChild(submit);

    const notes = document.createElement("textarea");
    notes.placeholder = "Notes for the day…";
    notes.value = e.notes;
    notes.oninput = () => {
      e.notes = notes.value;
      save();
    };
    c.appendChild(notes);

    app.appendChild(c);
  }

  /* WEEK */
  if (state.tab === "week") {
    const c = document.createElement("div");
    c.className = "card";
    c.innerHTML = "<h3>Week</h3>";
    last7().forEach((d) => {
      const e = state.entries[d];
      const pct = e
        ? Math.round(
            (Object.values(e.done).filter(Boolean).length /
              state.habits.length) *
              100
          )
        : 0;
      c.innerHTML += `
        <div class="bar">
          <span>${new Date(d).toLocaleDateString(undefined, {
            weekday: "short"
          })}</span>
          <div class="track">
            <div class="fill ${
              pct >= 80 ? "good" : pct >= 50 ? "mid" : "bad"
            }" style="width:${pct}%"></div>
          </div>
        </div>
      `;
    });
    app.appendChild(c);
  }

  /* HABITS */
  if (state.tab === "habits") {
    const c = document.createElement("div");
    c.className = "card";
    c.innerHTML = "<h3>Habits</h3>";
    state.habits.forEach((h) => {
      const row = document.createElement("div");
      row.className = "habit";
      row.innerHTML = `<div class="name">${h}</div><button class="btn danger">DELETE</button>`;
      row.querySelector("button").onclick = () => {
        if (confirm("Delete habit?")) {
          state.habits = state.habits.filter((x) => x !== h);
          save();
          render();
        }
      };
      c.appendChild(row);
    });
    const add = document.createElement("button");
    add.className = "btn secondary";
    add.textContent = "ADD HABIT";
    add.onclick = () => {
      const n = prompt("Habit name?");
      if (n) {
        state.habits.push(n);
        save();
        render();
      }
    };
    c.appendChild(add);
    app.appendChild(c);
  }

  /* SETTINGS */
  if (state.tab === "settings") {
    const c = document.createElement("div");
    c.className = "card";
    c.innerHTML = "<h3>Settings</h3>";
    const reset = document.createElement("button");
    reset.className = "btn danger";
    reset.textContent = "RESET ALL DATA";
    reset.onclick = () => {
      if (confirm("Reset everything?")) {
        localStorage.removeItem(KEY);
        location.reload();
      }
    };
    c.appendChild(reset);
    app.appendChild(c);
  }
}

render();