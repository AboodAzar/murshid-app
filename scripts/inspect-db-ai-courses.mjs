import mysql from "mysql2/promise";

async function main() {
  const conn = await mysql.createConnection({ host: "127.0.0.1", user: "root", database: "murshid" });
  const [courses] = await conn.query("SELECT id, code, name, nameAr, credits, departmentId FROM courses WHERE code LIKE '135%' OR code IN ('130100', '130110', '130130', '130231', '131390', '133102', '101112', '101274', '420101', '420151', '420171', '420115', '420123', '420261', '420241')");
  console.log(`Found ${courses.length} courses:`);
  courses.forEach(c => {
    console.log(`ID: ${c.id} | Code: ${c.code} | Name: ${c.name} | NameAr: ${c.nameAr}`);
  });
  await conn.end();
}

main();
