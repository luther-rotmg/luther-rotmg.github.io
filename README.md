# luther.

Personal site for **luther** — developer & reverse engineer.

Stack: vanilla JS + CSS, no build step, self-hosted fonts (Fraunces + IBM Plex), Cloudflare Worker backend for the contact form and live code-review demo.

---

## Deploy — static site

Push to `luther-rotmg.github.io` (already wired in `package.json`):

```
git push
```

GitHub Pages serves the repo root automatically; `.nojekyll` is present so asset paths are not mangled.

---

## Deploy — Cloudflare Worker

The live demo panel and contact form both hit a shared Cloudflare Worker. The Worker source lives in `worker/` locally but is **git-ignored** (deploy-only; never served on Pages).

1. `cd worker && npm install`
2. Create a KV namespace for rate-limiting and bind it in `worker/wrangler.toml`:
   ```
   wrangler kv namespace create RL
   # paste the returned id into [[kv_namespaces]] in wrangler.toml
   ```
   Without this binding, rate-limiting and budget checks fail open (not fatal, but unprotected).
3. Set secrets:
   ```
   wrangler secret put ANTHROPIC_API_KEY   # LLM API key (for /review)
   wrangler secret put RESEND_API_KEY      # Resend API key (for /contact)
   wrangler secret put LEAD_FROM           # verified Resend sender address (for /contact)
   wrangler secret put LEAD_TO             # recipient address (for /contact)
   ```
4. Deploy: `cd worker && wrangler deploy`
5. After deploy, copy the Worker URL and update `assets/js/config.js`:

```js
export const CONFIG = {
  WORKER_URL: "https://your-worker.your-subdomain.workers.dev",
  ...
};
```

This origin is already listed in `ALLOWED_ORIGINS` inside the Worker — no further CORS changes needed.

---

## Local dev

```
npm run serve   # or: node scripts/serve.mjs
```

Serves on `http://localhost:5174`.

---

## No backend? No problem.

- **Demo panel** falls back to a curated set of static examples when the Worker is unreachable.
- **Contact form** shows a "reach me on GitHub" fallback link (no email exposed).

Both degraded paths work with zero backend.

---

## Tests

```
npm test       # unit tests (Vitest)
npm run e2e    # end-to-end (Playwright, requires serve on :5174)
```
