import { drizzle } from "drizzle-orm/mysql2";

try {
  drizzle('mysql://murshid:Google-Database-2024@34.76.63.244:3306/murshid?ssl={"rejectUnauthorized":false}');
  console.log("Success");
} catch (e: any) {
  console.log("Error:", e.message);
}
