import { defineConfig } from "drizzle-kit";
import "./envConfig.ts";

export default defineConfig({
  schema: "./lib/schema.ts",
  out: "./drizzle-sqlite",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.SQLITE_PATH || "./data/comics.db",
  },
});
