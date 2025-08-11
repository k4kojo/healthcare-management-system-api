import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema.js";
import { DATABASE_URI } from "./env.js";

const sql = neon(DATABASE_URI);
export const db = drizzle(sql, { schema });
