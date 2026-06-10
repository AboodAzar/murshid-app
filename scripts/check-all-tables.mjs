import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";

const db = drizzle(process.env.DATABASE_URL);
// We can just check by querying - but mysql2 doesn't have a SHOW TABLES through drizzle easily
// Let's use raw query
const result = await db.execute(sql`SHOW TABLES`);
console.log("Tables:", result[0].map(r => Object.values(r)[0]).sort());
