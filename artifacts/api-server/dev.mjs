import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const apiDir = path.dirname(fileURLToPath(import.meta.url));

function loadEnv(filePath) {
  if (!existsSync(filePath)) return;

  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] ??= value;
  }
}

loadEnv(path.resolve(apiDir, "..", "..", ".env"));
loadEnv(path.resolve(apiDir, ".env"));

process.env.NODE_ENV = "development";
process.env.PORT ??= "5001";

const tsxBin = path.resolve(apiDir, "..", "..", "scripts", "node_modules", ".bin", "tsx.CMD");

const start = spawn(tsxBin, ["watch", "./src/index.ts"], {
  cwd: apiDir,
  env: process.env,
  stdio: "inherit",
  shell: true,
});

start.on("exit", (code) => {
  process.exit(code ?? 1);
});
