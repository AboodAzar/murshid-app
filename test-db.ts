import { drizzle } from "drizzle-orm/mysql2";
import dotenv from "dotenv";
dotenv.config();

try {
  const db = drizzle(process.env.DATABASE_URL as string);
  console.log("Drizzle instance created successfully!");
} catch (e: any) {
  console.error("Failed to create drizzle instance:", e.message);
}
