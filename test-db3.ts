import mysql from "mysql2/promise";

try {
  mysql.createPool('"mysql://user:pass@host/db"');
  console.log("Success");
} catch (e: any) {
  console.log("Error:", e.message);
}
