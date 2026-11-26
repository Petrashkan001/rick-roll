const STORAGE_KEY = "egg-counter";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (data && typeof data.total === "number" && data.log) return data;
  } catch (e) { /* ignore bad data */ }
  return { total: 0, log: {} };
}

let state = load();

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function change(amount) {
  // Never let the total go below zero.
  const actual = Math.max(amount, -state.total);
  if (actual === 0) return;
  state.total += actual;
  const key = todayKey();
  state.log[key] = Math.max(0, (state.log[key] || 0) + actual);
  if (state.log[key] === 0) delete state.log[key];
  save();
  render();
}

function render() {
  const total = state.total;
  document.getElementById("total").textContent = total;
  document.getElementById("dozens").textContent =
    `${Math.floor(total / 12)} dozen + ${total % 12}`;
  document.getElementById("today").textContent = state.log[todayKey()] || 0;

  document.getElementById("minus1").disabled = total === 0;
  document.getElementById("minus12").disabled = total === 0;

  const list = document.getElementById("log");
  list.innerHTML = "";
  const days = Object.keys(state.log).sort().reverse();
  for (const day of days) {
    const li = document.createElement("li");
    const date = new Date(day + "T00:00:00").toLocaleDateString(undefined, {
      weekday: "short", month: "short", day: "numeric",
    });
    li.innerHTML = `<span></span><strong></strong>`;
    li.children[0].textContent = date;
    li.children[1].textContent = `${state.log[day]} 🥚`;
    list.appendChild(li);
  }
  document.getElementById("empty").hidden = days.length > 0;
}

document.getElementById("plus1").addEventListener("click", () => change(1));
document.getElementById("minus1").addEventListener("click", () => change(-1));
document.getElementById("plus12").addEventListener("click", () => change(12));
document.getElementById("minus12").addEventListener("click", () => change(-12));
document.getElementById("reset").addEventListener("click", () => {
  if (confirm("Reset the counter and clear the daily log?")) {
    state = { total: 0, log: {} };
    save();
    render();
  }
});

render();
