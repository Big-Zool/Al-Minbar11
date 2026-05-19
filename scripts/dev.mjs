import { spawn } from "node:child_process";
import path from "node:path";

const processes = [];

function run(name, command, args, cwd = process.cwd()) {
  const child = spawn(command, args, {
    cwd,
    env: process.env,
    shell: true,
    stdio: ["inherit", "pipe", "pipe"],
  });

  processes.push(child);

  child.stdout.on("data", (data) => {
    process.stdout.write(`[${name}] ${data}`);
  });

  child.stderr.on("data", (data) => {
    process.stderr.write(`[${name}] ${data}`);
  });

  child.on("exit", (code) => {
    if (code && !shuttingDown) {
      console.error(`[${name}] exited with code ${code}`);
      shutdown(code);
    }
  });
}

let shuttingDown = false;

function shutdown(code = 0) {
  shuttingDown = true;
  for (const child of processes) {
    if (!child.killed) child.kill();
  }
  process.exit(code);
}

process.on("SIGINT", () => shutdown());
process.on("SIGTERM", () => shutdown());

run("api", "node", ["artifacts/api-server/dev.mjs"]);
run(
  "web",
  path.resolve("artifacts", "khutbah", "node_modules", ".bin", "vite.CMD"),
  ["--config", "vite.config.ts", "--host", "0.0.0.0", "--port", "5174"],
  path.resolve("artifacts", "khutbah"),
);
