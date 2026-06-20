// ⌘K / Ctrl-K command palette: fuzzy nav to sections, projects, demo, contact.
import { withTransition } from "./transition.js";

const ACTIONS = [
  { label: "Go to Work", hint: "section", run: () => go("#work") },
  { label: "Go to Skills", hint: "section", run: () => go("#skills") },
  { label: "Live demo — review some code", hint: "section", run: () => go("#lab") },
  { label: "About", hint: "section", run: () => go("#about") },
  { label: "Contact", hint: "section", run: () => go("#contact") },
  { label: "Open Tincture", hint: "tincturepoe2.com", run: () => open("https://tincturepoe2.com") },
  { label: "Open APK Inspector", hint: "tool", run: () => open("https://luther-rotmg.github.io/apk-inspector") },
  { label: "Open Packet Visualizer", hint: "tool", run: () => open("https://luther-rotmg.github.io/packet-visualizer") },
  { label: "Open APK Security Scanner", hint: "tool", run: () => open("https://luther-rotmg.github.io/apk-security-scanner") },
  { label: "GitHub", hint: "github.com/luther-rotmg", run: () => open("https://github.com/luther-rotmg") },
];
function go(hash) { withTransition(() => { location.hash = hash; }); }
function open(url) { window.open(url, "_blank", "noopener"); }

export function initPalette() {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.createElement("div");
  root.className = "cmdk"; root.hidden = true;
  root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true"); root.setAttribute("aria-label", "Command palette");
  root.innerHTML = `<div class="cmdk-panel"><input class="cmdk-input" type="text" placeholder="Type a command or section…" aria-label="Command" autocomplete="off" spellcheck="false"><ul class="cmdk-list" role="listbox"></ul></div>`;
  document.body.append(root);
  const input = root.querySelector(".cmdk-input");
  const list = root.querySelector(".cmdk-list");
  let filtered = ACTIONS, active = 0, lastFocus = null;

  const match = (q) => { const s = q.toLowerCase().trim(); return !s ? ACTIONS : ACTIONS.filter(a => (a.label + " " + a.hint).toLowerCase().includes(s)); };
  function render() {
    list.innerHTML = "";
    filtered.forEach((a, i) => {
      const li = document.createElement("li");
      li.className = "cmdk-item" + (i === active ? " active" : "");
      li.setAttribute("role", "option"); li.setAttribute("aria-selected", String(i === active));
      li.innerHTML = `<span>${a.label}</span><span class="cmdk-hint">${a.hint}</span>`;
      li.addEventListener("click", () => run(i));
      list.append(li);
    });
  }
  function open_() { lastFocus = document.activeElement; root.hidden = false; input.value = ""; filtered = ACTIONS; active = 0; render(); input.focus(); }
  function close_() { root.hidden = true; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  function run(i) { const a = filtered[i]; close_(); if (a) a.run(); }

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); root.hidden ? open_() : close_(); }
  });
  input.addEventListener("input", () => { filtered = match(input.value); active = 0; render(); });
  root.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { e.preventDefault(); close_(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); active = Math.min(active + 1, filtered.length - 1); render(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); active = Math.max(active - 1, 0); render(); }
    else if (e.key === "Enter") { e.preventDefault(); run(active); }
    else if (e.key === "Tab") { e.preventDefault(); } // trap focus on the single input
  });
  root.addEventListener("click", (e) => { if (e.target === root) close_(); });
  render();
}
