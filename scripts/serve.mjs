import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const ROOT = process.cwd();
const PORT = 5174;
const TYPES = {
  ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".mjs": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml",
  ".woff2": "font/woff2", ".png": "image/png", ".ico": "image/x-icon",
};

createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let rel = normalize(urlPath).replace(/^(\.\.[\\/])+/, "");
    if (rel.endsWith("/") || rel.endsWith("\\")) rel += "index.html";
    if (rel === "/" || rel === "\\") rel = "index.html";
    const file = join(ROOT, rel);
    const body = await readFile(file);
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("Not found");
  }
}).listen(PORT, () => console.log(`serving ${ROOT} on http://localhost:${PORT}`));
