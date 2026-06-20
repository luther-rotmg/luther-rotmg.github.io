const SEV = new Set(["high", "med", "low"]);

export function severityClass(severity) {
  return SEV.has(severity) ? `sev-${severity}` : "sev-low";
}

export function buildReviewModel(code, findings) {
  const rawLines = String(code).split("\n");
  const lines = rawLines.map((text, i) => ({ num: i + 1, text, finding: null }));
  const last = lines.length;
  for (const f of findings || []) {
    const idx = Math.min(Math.max(Number(f.line) || 1, 1), last) - 1;
    // first finding wins for a line; ignore extras to keep one note per line
    if (lines[idx] && lines[idx].finding === null) lines[idx].finding = f;
  }
  return { lines };
}

export function renderReview(container, model) {
  container.textContent = "";
  const panel = document.createElement("div");
  panel.className = "code-panel mono";
  for (const line of model.lines) {
    const row = document.createElement("div");
    row.className = "code-line";
    if (line.finding) row.classList.add("flagged", severityClass(line.finding.severity));
    const gutter = document.createElement("span");
    gutter.className = "gutter";
    gutter.textContent = String(line.num);
    const src = document.createElement("span");
    src.className = "src";
    src.textContent = line.text || " ";
    row.append(gutter, src);
    panel.append(row);
    if (line.finding) {
      const note = document.createElement("div");
      note.className = `note hw ${severityClass(line.finding.severity)}`;
      const cat = document.createElement("span");
      cat.className = "note-cat";
      cat.textContent = line.finding.category;
      const text = document.createElement("span");
      text.textContent = line.finding.comment;
      note.append(cat, text);
      panel.append(note);
    }
  }
  container.append(panel);
}
