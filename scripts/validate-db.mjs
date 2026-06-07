import "dotenv/config";
import mysql from "mysql2/promise";

const requiredTables = new Map([
  ["users", ["id", "openId", "email", "name", "password", "role", "departmentId", "profilePicture", "bio", "phone", "language", "isActive", "createdAt", "updatedAt", "lastSignedIn"]],
  ["departments", ["id", "name", "nameAr", "code", "description", "descriptionAr", "headId", "createdAt", "updatedAt"]],
  ["courses", ["id", "code", "name", "nameAr", "description", "descriptionAr", "credits", "departmentId", "minGPA", "semester", "isRequired", "createdAt", "updatedAt"]],
  ["coursePrerequisites", ["id", "courseId", "prerequisiteId", "createdAt"]],
  ["studyPlans", ["id", "studentId", "advisorId", "totalCredits", "completedCredits", "currentGPA", "status", "createdAt", "updatedAt"]],
  ["studentCourses", ["id", "studentId", "courseId", "semester", "grade", "gradePoints", "status", "createdAt", "updatedAt"]],
  ["aiConversations", ["id", "studentId", "title", "context", "createdAt", "updatedAt"]],
  ["chatMessages", ["id", "conversationId", "role", "content", "tokens", "createdAt"]],
  ["faqs", ["id", "question", "questionAr", "answer", "answerAr", "category", "categoryAr", "createdBy", "views", "isActive", "createdAt", "updatedAt"]],
  ["documents", ["id", "title", "fileUrl", "fileKey", "fileType", "uploadedBy", "content", "category", "isProcessed", "createdAt", "updatedAt"]],
  ["notifications", ["id", "userId", "title", "titleAr", "message", "messageAr", "type", "relatedId", "isRead", "createdAt"]],
  ["buildings", ["id", "name", "nameAr", "code", "latitude", "longitude", "description", "descriptionAr", "createdAt", "updatedAt"]],
  ["rooms", ["id", "buildingId", "roomNumber", "name", "nameAr", "capacity", "type", "floor", "createdAt", "updatedAt"]],
  ["announcements", ["id", "title", "titleAr", "content", "contentAr", "createdBy", "priority", "targetRole", "isActive", "expiresAt", "createdAt", "updatedAt"]],
  ["aiStatistics", ["id", "studentId", "totalConversations", "totalMessages", "totalTokensUsed", "averageResponseTime", "lastUsedAt", "createdAt", "updatedAt"]],
  ["password_reset_tokens", ["id", "user_id", "token", "expires_at", "created_at", "used_at"]],
]);

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const maskUrl = value => value.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:***@");

let connection;
try {
  connection = await mysql.createConnection(databaseUrl);
  const [databaseRows] = await connection.query("SELECT DATABASE() AS db, VERSION() AS version");
  const database = databaseRows[0]?.db;
  const version = databaseRows[0]?.version;
  if (!database) {
    throw new Error("DATABASE_URL must include a database name");
  }

  const [tableRows] = await connection.query("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?", [database]);
  const actualTables = new Map(
    tableRows.map(row => [row.TABLE_NAME.toLowerCase(), row.TABLE_NAME])
  );
  const missingTables = [...requiredTables.keys()].filter(
    table => !actualTables.has(table.toLowerCase())
  );

  const missingColumns = [];
  for (const [table, columns] of requiredTables) {
    const actualTableName = actualTables.get(table.toLowerCase());
    if (!actualTableName) continue;
    const [columnRows] = await connection.query("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?", [database, actualTableName]);
    const actualColumns = new Set(columnRows.map(row => row.COLUMN_NAME));
    for (const column of columns) {
      if (!actualColumns.has(column)) {
        missingColumns.push(`${table}.${column}`);
      }
    }
  }

  if (missingTables.length > 0 || missingColumns.length > 0) {
    console.error(JSON.stringify({ ok: false, url: maskUrl(databaseUrl), database, version, missingTables, missingColumns }, null, 2));
    process.exit(1);
  }

  console.log(JSON.stringify({ ok: true, url: maskUrl(databaseUrl), database, version, tableCount: actualTables.size, requiredTableCount: requiredTables.size }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ ok: false, url: maskUrl(databaseUrl), code: error.code, errno: error.errno, sqlState: error.sqlState, message: error.message }, null, 2));
  process.exit(1);
} finally {
  if (connection) {
    await connection.end();
  }
}
