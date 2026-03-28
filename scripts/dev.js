import { spawn } from "node:child_process";

const commands = [
  { name: "api", args: ["services/api/src/server.js"] },
  { name: "mobile", args: ["apps/mobile/dev-server.js"] },
  { name: "admin", args: ["apps/admin/dev-server.js"] }
];

const children = commands.map(({ name, args }) => {
  const child = spawn(process.execPath, args, {
    stdio: ["inherit", "pipe", "pipe"],
    env: process.env
  });

  child.stdout.on("data", (chunk) => {
    process.stdout.write(`[${name}] ${chunk}`);
  });

  child.stderr.on("data", (chunk) => {
    process.stderr.write(`[${name}] ${chunk}`);
  });

  return child;
});

const shutdown = () => {
  children.forEach((child) => {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
