import { rmSync } from "node:fs";

for (const file of ["package-lock.json", "yarn.lock"]) {
  rmSync(file, { force: true });
}

const pnpmIndicators = [
  process.env.npm_config_user_agent,
  process.env.npm_execpath,
  process.env.PNPM_HOME,
];

if (!pnpmIndicators.some((value) => value?.toLowerCase().includes("pnpm"))) {
  console.error("Use pnpm instead");
  process.exit(1);
}
