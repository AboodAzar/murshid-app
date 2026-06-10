import dotenv from "dotenv";
dotenv.config();
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { chatMessages, chatConversations } from "./server/db/schema.js"; // adjust path if needed

async function test() {
  const poolConnection = mysql.createPool(process.env.DATABASE_URL);
  const db = drizzle(poolConnection);
  
  try {
    await db.insert(chatMessages).values({
      conversationId: 180001,
      role: "user",
      content: "hi",
      tokens: 0,
    });
    console.log("Success!");
  } catch (e) {
    console.error("Full Error:", e);
  }
  process.exit(0);
}
test();
