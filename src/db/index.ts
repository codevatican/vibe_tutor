import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "mysql://root:password@localhost:3306/vibe_tutor";

// Create pool connection
export const poolConnection = mysql.createPool(connectionString);

// Initialize drizzle
export const db = drizzle(poolConnection, { schema, mode: "default" });
