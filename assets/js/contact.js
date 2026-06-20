import { CONFIG } from "./config.js";

export function validateContactForm(data) {
  const errors = {};
  if (!data.name || !data.name.trim()) errors.name = "Your name?";
  if (!data.email || !data.email.trim()) errors.email = "How can I reach you?";
  if (!data.message || data.message.trim().length < 5) errors.message = "Tell me a little about the project.";
  return { valid: Object.keys(errors).length === 0, errors };
}

export function initContact(form) {
  const status = form.querySelector(".form-status");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const { valid, errors } = validateContactForm(data);
    if (!valid) { status.textContent = Object.values(errors)[0]; return; }
    status.textContent = "Sending…";
    try {
      const res = await fetch(`${CONFIG.WORKER_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        form.reset();
        status.textContent = "Got it — I'll be in touch soon.";
      } else {
        status.textContent = `Couldn't send. Reach me on GitHub: ${CONFIG.GITHUB_URL}`;
      }
    } catch {
      status.textContent = `Couldn't send. Reach me on GitHub: ${CONFIG.GITHUB_URL}`;
    }
  });
}
