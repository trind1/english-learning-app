import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  openSync,
  closeSync,
  readFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const environmentPath = resolve(projectRoot, ".env");

if (!existsSync(environmentPath)) {
  console.error(
    "Missing .env. Copy .env.example to .env, then run setup again.",
  );
  process.exit(1);
}

const environment = { ...process.env };
for (const sourceLine of readFileSync(environmentPath, "utf8").split(/\r?\n/)) {
  const line = sourceLine.trim();
  if (!line || line.startsWith("#")) continue;

  const separator = line.indexOf("=");
  if (separator < 1) continue;

  const name = line.slice(0, separator).trim();
  let value = line.slice(separator + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  environment[name] = value;
}

const prismaDirectory = resolve(projectRoot, "apps/api/prisma");
const databasePath = resolve(prismaDirectory, "dev.db");
mkdirSync(prismaDirectory, { recursive: true });
if (!existsSync(databasePath)) closeSync(openSync(databasePath, "a"));

const run = (script) => {
  const isWindows = process.platform === "win32";
  const command = isWindows ? (process.env.ComSpec ?? "cmd.exe") : "npm";
  const args = isWindows
    ? [
        "/d",
        "/s",
        "/c",
        `npm.cmd run ${script} --workspace @english-learning/api`,
      ]
    : ["run", script, "--workspace", "@english-learning/api"];
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    env: environment,
    stdio: "inherit",
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
};

run("db:generate");
run("db:migrate:deploy");
console.log("Setup complete. The local database is ready.");
