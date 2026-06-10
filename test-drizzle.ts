import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { chatMessages } from "./drizzle/schema";

async function test() {
  console.log("Connecting to", process.env.DATABASE_URL);
  const poolConnection = mysql.createPool(process.env.DATABASE_URL as string);
  const db = drizzle(poolConnection);
  
  try {
    await db.insert(chatMessages).values({
      conversationId: 210007,
      role: "user",
      content: "Which careers match my courses and skills?",
      tokens: 0,
    });
    console.log("Success!");
  } catch (e: any) {
    console.error("Full Error:", e);
    if (e.cause) console.error("Cause:", e.cause);
  }
  process.exit(0);
}
test();
