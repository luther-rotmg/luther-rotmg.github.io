// Curated, generic real-world patterns — NOT from any private repo.
// Line numbers in findings are 1-indexed against the code string.
export const SAMPLES = [
  {
    id: "n-plus-1",
    label: "N+1 query",
    lang: "javascript",
    code: [
      "async function getOrders(users) {",
      "  const out = [];",
      "  for (const u of users) {",
      "    const orders = await db.query(",
      "      'SELECT * FROM orders WHERE user_id = ?', u.id);",
      "    out.push({ user: u, orders });",
      "  }",
      "  return out;",
      "}",
    ].join("\n"),
    summary: "One query per user — a classic N+1. Batches into a single round-trip.",
    findings: [
      { line: 4, severity: "high", category: "perf", comment: "N+1 query — one DB round-trip per user. Fetch all orders in one IN (...) query, then group in memory." },
      { line: 5, severity: "med", category: "security", comment: "Good: parameterized. Keep it this way — never interpolate u.id into the SQL string." },
    ],
  },
  {
    id: "unvalidated-input",
    label: "Unvalidated input",
    lang: "javascript",
    code: [
      "app.post('/avatar', (req, res) => {",
      "  const name = req.body.filename;",
      "  const path = './uploads/' + name;",
      "  fs.writeFileSync(path, req.body.data);",
      "  res.send('saved ' + name);",
      "});",
    ].join("\n"),
    summary: "Attacker-controlled filename flows straight into a filesystem path and the response.",
    findings: [
      { line: 3, severity: "high", category: "security", comment: "Path traversal: '../../etc/...' escapes ./uploads. Use path.basename(name) and resolve against a fixed root." },
      { line: 5, severity: "med", category: "security", comment: "Reflected output — escape `name` before echoing it back to avoid injection in the response." },
      { line: 4, severity: "low", category: "perf", comment: "Synchronous write blocks the event loop under load — prefer fs.promises.writeFile." },
    ],
  },
  {
    id: "tangled-fn",
    label: "Tangled function",
    lang: "python",
    code: [
      "def process(items):",
      "    r = []",
      "    for i in items:",
      "        if i['t'] == 'a' and i['v'] > 0 and not i.get('x'):",
      "            r.append(i['v'] * 2)",
      "        elif i['t'] == 'b':",
      "            r.append(i['v'] + 10)",
      "    return r",
    ].join("\n"),
    summary: "Dense conditionals and one-letter names hide the intent. Names + a guard clause fix it.",
    findings: [
      { line: 4, severity: "med", category: "maintainability", comment: "This condition encodes a business rule no reader can name. Extract `is_active_type_a(item)`." },
      { line: 1, severity: "low", category: "style", comment: "`process`/`items`/`r`/`i`/`t`/`v` carry no meaning — rename to the domain terms." },
    ],
  },
  {
    id: "async-bug",
    label: "Async bug",
    lang: "javascript",
    code: [
      "function loadAll(ids) {",
      "  const results = [];",
      "  ids.forEach(async (id) => {",
      "    const data = await fetch('/x/' + id).then(r => r.json());",
      "    results.push(data);",
      "  });",
      "  return results; // always []",
      "}",
    ].join("\n"),
    summary: "forEach doesn't await — the function returns before any fetch resolves.",
    findings: [
      { line: 3, severity: "high", category: "bug", comment: "async callback in forEach is fire-and-forget; loadAll returns [] before fetches finish. Use `await Promise.all(ids.map(...))`." },
      { line: 7, severity: "low", category: "maintainability", comment: "The `// always []` comment documents a bug instead of fixing it — delete once the await is correct." },
    ],
  },
];
