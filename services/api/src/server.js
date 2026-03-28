import { createApiServer } from "./create-api-server.js";
import { getRuntimeConfig } from "./runtime.js";

const config = getRuntimeConfig();
const { server } = createApiServer({
  fileUrl: config.dataFilePath,
  logRequests: config.logRequests
});

server.listen(config.apiPort, () => {
  console.log(`CampusQuest API listening on http://localhost:${config.apiPort}`);
});

function shutdown() {
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
