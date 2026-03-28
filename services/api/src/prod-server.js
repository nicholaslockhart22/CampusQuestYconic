import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { createApiHandler } from "./create-api-server.js";
import { createStore } from "./store.js";
import { getRuntimeConfig } from "./runtime.js";

const config = getRuntimeConfig();
const store = createStore(config.dataFilePath);
const apiHandler = createApiHandler({ store, logRequests: config.logRequests });

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

const repoRoot = normalize(join(fileURLToPath(new URL(".", import.meta.url)), "../../../"));
const mobileRoot = normalize(join(repoRoot, "apps/mobile"));
const adminRoot = normalize(join(repoRoot, "apps/admin"));

function sendFile(response, filePath) {
  response.writeHead(200, {
    "Content-Type": contentTypes[extname(filePath)] || "text/plain; charset=utf-8"
  });
  response.end(readFileSync(filePath));
}

function apiBaseScript() {
  return `window.__CAMPUSQUEST_API_BASE__ = window.location.origin;`;
}

function safeJoin(root, pathname) {
  const resolved = normalize(join(root, pathname));
  if (!resolved.startsWith(root)) {
    return "";
  }
  return resolved;
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (url.pathname.startsWith("/api/") || url.pathname === "/health" || url.pathname === "/ready") {
    const handled = await apiHandler(request, response);
    if (!handled) {
      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "Not found" }));
    }
    return;
  }

  if (url.pathname === "/config.js") {
    response.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8" });
    response.end(apiBaseScript());
    return;
  }

  if (url.pathname === "/admin" || url.pathname === "/admin/") {
    sendFile(response, join(adminRoot, "index.html"));
    return;
  }

  if (url.pathname.startsWith("/admin/")) {
    const assetPath = safeJoin(adminRoot, url.pathname.replace("/admin/", ""));
    if (assetPath && existsSync(assetPath)) {
      sendFile(response, assetPath);
      return;
    }
  }

  const pathname = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
  const mobileAsset = safeJoin(mobileRoot, pathname);
  if (mobileAsset && existsSync(mobileAsset)) {
    sendFile(response, mobileAsset);
    return;
  }

  sendFile(response, join(mobileRoot, "index.html"));
});

server.listen(config.port, () => {
  console.log(`CampusQuest production server listening on http://localhost:${config.port}`);
});

function shutdown() {
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
