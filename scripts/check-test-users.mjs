import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { users } from "../drizzle/schema.ts";
import { like } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);
const result = await db.select().from(users).where(like(users.email, "%test%"));
console.log("Test users:", result.map(u => ({ id: u.id, email: u.email, role: u.role, isEmailVerified: u.isEmailVerified })));
