import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const db = drizzle(
  process.env.DATABASE_URL || "postgres://default:default@default:5432/default",
  { schema }
);

export { db };
