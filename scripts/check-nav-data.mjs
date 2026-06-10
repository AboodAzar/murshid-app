import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const [buildings] = await conn.execute("SELECT * FROM buildings");
console.log("=== BUILDINGS ===");
console.log(JSON.stringify(buildings, null, 2));

const [rooms] = await conn.execute("SELECT * FROM rooms ORDER BY floor, roomNumber LIMIT 30");
console.log("\n=== ROOMS (first 30) ===");
console.log(JSON.stringify(rooms, null, 2));

const [counts] = await conn.execute(`
  SELECT 
    COUNT(*) as totalRooms,
    SUM(CASE WHEN type='classroom' THEN 1 ELSE 0 END) as classrooms,
    SUM(CASE WHEN type='lab' THEN 1 ELSE 0 END) as labs,
    SUM(CASE WHEN type='office' THEN 1 ELSE 0 END) as offices,
    SUM(CASE WHEN type='lecture_hall' THEN 1 ELSE 0 END) as halls
  FROM rooms
`);
console.log("\n=== ROOM COUNTS ===");
console.log(JSON.stringify(counts, null, 2));

await conn.end();
