import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { resolve } from "node:path";

import { createApiApp } from "./app";
import { parseEnvironment } from "./config/environment";

dotenv.config({ path: resolve(process.cwd(), "../../.env") });

const config = parseEnvironment(process.env);
const client = new PrismaClient({
  datasources: { db: { url: config.databaseUrl } },
});
const app = createApiApp(config, client, true);
const server = app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});

const shutdown = async () => {
  server.close();
  await client.$disconnect();
};

process.once("SIGINT", () => void shutdown());
process.once("SIGTERM", () => void shutdown());
