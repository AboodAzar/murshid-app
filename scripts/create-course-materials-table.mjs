import mysql from "mysql2/promise";
import "dotenv/config";

async function run() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS course_materials (
      id INT AUTO_INCREMENT PRIMARY KEY,
      courseId INT NOT NULL,
      chapterNumber INT NOT NULL DEFAULT 1,
      chapterTitle VARCHAR(255) DEFAULT 'Chapter 1',
      chapterTitleAr VARCHAR(255) DEFAULT 'الفصل 1',
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      titleAr VARCHAR(255) NULL,
      description TEXT NULL,
      fileName VARCHAR(255) NULL,
      fileUrl VARCHAR(500) NULL,
      fileSize VARCHAR(50) DEFAULT '2.5 MB',
      dueDate DATETIME NULL,
      totalPoints INT DEFAULT 10,
      doctorId INT NULL,
      doctorName VARCHAR(255) NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_cm_courseId (courseId),
      INDEX idx_cm_chapter (courseId, chapterNumber)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("course_materials table created successfully");
  await conn.end();
}

run().catch(console.error);
