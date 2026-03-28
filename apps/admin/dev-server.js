import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { extname, join } from "node:path";

const port = Number(process.env.ADMIN_PORT || 3002);
const apiPort = Number(process.env.API_PORT || 3001);
const root = new URL("./", import.meta.url);

createServer((request, response) => {
  if (request.url === "/config.js") {
    response.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8" });
    response.end(`window.__CAMPUSQUEST_API_BASE__ = "http://localhost:${apiPort}";`);
    return;
  }

  const pathname = request.url === "/" ? "/index.html" : request.url;
  const filePath = join(root.pathname, pathname);
  const contentTypes = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8"
  };
  response.writeHead(200, { "Content-Type": contentTypes[extname(filePath)] || "text/plain; charset=utf-8" });
  response.end(readFileSync(filePath));
}).listen(port, () => {
  console.log(`CampusQuest admin scaffold listening on http://localhost:${port}`);
});
