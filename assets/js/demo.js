import { SAMPLES } from "./samples.js";
import { buildReviewModel, renderReview } from "./annotate.js";
import { CONFIG } from "./config.js";
import { withTransition } from "./transition.js";

const PASTE_TAB_ID = "__paste__";

export async function requestReview(code, lang) {
  const res = await fetch(`${CONFIG.WORKER_URL}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, lang }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error || "Something went wrong." };
  return data; // {summary,findings} | {fallback:true} | {error}
}

export function initDemo(root) {
  const tabs = root.querySelector(".demo-tabs");
  const output = root.querySelector("[data-demo-output]");
  const summary = root.querySelector("[data-demo-summary]");
  const paste = root.querySelector(".demo-paste");

  const buttons = [];
  function makeTab(id, label) {
    const b = document.createElement("button");
    b.className = "demo-tab";
    b.setAttribute("role", "tab");
    b.setAttribute("tabindex", "-1");
    b.textContent = label;
    b.dataset.id = id;
    b.addEventListener("click", () => select(id));
    tabs.append(b);
    buttons.push(b);
  }
  SAMPLES.forEach((s) => makeTab(s.id, s.label));
  makeTab(PASTE_TAB_ID, "Paste your own");

  function setActive(id) {
    for (const b of buttons) {
      const on = b.dataset.id === id;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", String(on));
      b.setAttribute("tabindex", on ? "0" : "-1");
    }
  }

  tabs.addEventListener("keydown", (e) => {
    const idx = buttons.findIndex((b) => b === document.activeElement);
    if (idx === -1) return;
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      next = (idx + 1) % buttons.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      next = (idx - 1 + buttons.length) % buttons.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      next = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      next = buttons.length - 1;
    }
    if (next !== -1) {
      select(buttons[next].dataset.id);
      buttons[next].focus();
    }
  });

  function renderSample(s) {
    summary.textContent = s.summary;
    renderReview(output, buildReviewModel(s.code, s.findings));
  }

  function select(id) {
    setActive(id);
    if (id === PASTE_TAB_ID) {
      paste.hidden = false;
      summary.textContent = "";
      output.textContent = "";
      root.dispatchEvent(new CustomEvent("demo:paste-selected"));
      return;
    }
    paste.hidden = true;
    withTransition(() => renderSample(SAMPLES.find((s) => s.id === id)));
  }

  const reviewBtn = root.querySelector(".demo-review-btn");
  const textarea = root.querySelector("#demo-code");
  const status = root.querySelector(".demo-status");

  function fallbackToSample(msg) {
    status.textContent = msg;
    const s = SAMPLES[0];
    summary.textContent = s.summary;
    renderReview(output, buildReviewModel(s.code, s.findings));
  }

  if (reviewBtn && textarea && status) {
    reviewBtn.addEventListener("click", async () => {
      const code = textarea.value;
      if (!code.trim()) { status.textContent = "Paste some code first."; return; }
      if (code.split("\n").length > 150 || new Blob([code]).size > 6144) {
        status.textContent = "Max ~150 lines / 6 KB for the demo — trim it down.";
        return;
      }
      status.textContent = "Reviewing…";
      reviewBtn.disabled = true;
      const data = await requestReview(code, "").catch(() => ({ fallback: true }));
      reviewBtn.disabled = false;
      if (data.fallback) { fallbackToSample("Demo's resting — here's a sample review instead."); return; }
      if (data.error) { status.textContent = data.error; return; }
      status.textContent = "";
      summary.textContent = data.summary || "";
      renderReview(output, buildReviewModel(code, data.findings || []));
    });
  }

  select(SAMPLES[0].id); // default
  return { select, PASTE_TAB_ID };
}
