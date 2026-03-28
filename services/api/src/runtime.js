import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

export function getRuntimeConfig() {
  const apiPort = Number(process.env.API_PORT || 3001);
  const mobilePort = Number(process.env.MOBILE_PORT || 3000);
  const adminPort = Number(process.env.ADMIN_PORT || 3002);
  const port = Number(process.env.PORT || 8080);
  const dataFilePath = process.env.DATA_FILE_PATH
    ? pathToFileURL(resolve(process.env.DATA_FILE_PATH))
    : undefined;
  const logRequests = process.env.LOG_REQUESTS !== "false";

  return {
    apiPort,
    mobilePort,
    adminPort,
    port,
    dataFilePath,
    logRequests
  };
}
