import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join } from "node:path";

const port = Number(process.env.MOBILE_PORT || 3000);
const apiPort = Number(process.env.API_PORT || 3001);
const root = new URL("./", import.meta.url);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8"
};

createServer((request, response) => {
  if (request.url === "/config.js") {
    response.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8" });
    response.end(`window.__CAMPUSQUEST_API_BASE__ = "http://localhost:${apiPort}";`);
    return;
  }

  const pathname = request.url === "/" ? "/index.html" : request.url;
  const filePath = join(root.pathname, pathname);

  if (!existsSync(filePath)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": contentTypes[extname(filePath)] || "text/plain; charset=utf-8"
  });
  response.end(readFileSync(filePath));
}).listen(port, () => {
  console.log(`CampusQuest mobile app listening on http://localhost:${port}`);
});
