import { execFileSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { basename, resolve } from "node:path";

import { PrismaClient } from "@prisma/client";

const require = createRequire(import.meta.url);

export type TestDatabase = Readonly<{
  client: PrismaClient;
  databaseUrl: string;
  dispose: () => Promise<void>;
}>;

export const createMigratedTestDatabase = async (): Promise<TestDatabase> => {
  const directory = await mkdtemp(
    resolve(process.cwd(), "prisma/test-database-"),
  );
  const databasePath = resolve(directory, "test.db");
  const databaseUrl = `file:${databasePath}`;
  const migrationUrl = `file:./${basename(directory)}/test.db`;
  const schemaPath = resolve(process.cwd(), "prisma/schema.prisma");
  const prismaCli = require.resolve("prisma/build/index.js");

  // Prisma's SQLite engine expects the disposable file to exist in this restricted test environment.
  await writeFile(databasePath, "");

  execFileSync(
    process.execPath,
    [prismaCli, "migrate", "deploy", "--schema", schemaPath],
    {
      env: { ...process.env, DATABASE_URL: migrationUrl },
      stdio: "pipe",
    },
  );

  const client = new PrismaClient({ datasourceUrl: databaseUrl });
  await client.$connect();

  return {
    client,
    databaseUrl,
    dispose: async () => {
      await client.$disconnect();
      await rm(directory, { force: true, recursive: true });
    },
  };
};
