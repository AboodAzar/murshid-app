import fs from "fs";

let schema = fs.readFileSync("drizzle/schema.ts", "utf8");

// Add modality to courses table
if (!schema.includes('modality: varchar("modality"')) {
  schema = schema.replace(
    'credits: int("credits").notNull(),\n    departmentId: int("departmentId").notNull(),',
    'credits: int("credits").notNull(),\n    modality: varchar("modality", { length: 50 }).default("in_person"),\n    modalityAr: varchar("modalityAr", { length: 50 }).default("وجاهي"),\n    departmentId: int("departmentId").notNull(),'
  );
  // Also handle CRLF if needed
  schema = schema.replace(
    'credits: int("credits").notNull(),\r\n    departmentId: int("departmentId").notNull(),',
    'credits: int("credits").notNull(),\r\n    modality: varchar("modality", { length: 50 }).default("in_person"),\r\n    modalityAr: varchar("modalityAr", { length: 50 }).default("وجاهي"),\r\n    departmentId: int("departmentId").notNull(),'
  );
}

// Add anti-cheat fields to attendance table
if (!schema.includes('verificationMethod: varchar("verificationMethod"')) {
  schema = schema.replace(
    'status: mysqlEnum("status", ["present", "absent", "excused", "late"])\n      .default("present")\n      .notNull(),',
    'status: mysqlEnum("status", ["present", "absent", "excused", "late"])\n      .default("present")\n      .notNull(),\n    verificationMethod: varchar("verificationMethod", { length: 50 }).default("qr_scan"),\n    checkInCode: varchar("checkInCode", { length: 100 }),\n    hallName: varchar("hallName", { length: 100 }),\n    deviceFingerprint: varchar("deviceFingerprint", { length: 255 }),'
  );
  schema = schema.replace(
    'status: mysqlEnum("status", ["present", "absent", "excused", "late"])\r\n      .default("present")\r\n      .notNull(),',
    'status: mysqlEnum("status", ["present", "absent", "excused", "late"])\r\n      .default("present")\r\n      .notNull(),\r\n    verificationMethod: varchar("verificationMethod", { length: 50 }).default("qr_scan"),\r\n    checkInCode: varchar("checkInCode", { length: 100 }),\r\n    hallName: varchar("hallName", { length: 100 }),\r\n    deviceFingerprint: varchar("deviceFingerprint", { length: 255 }),'
  );
}

fs.writeFileSync("drizzle/schema.ts", schema, "utf8");
console.log("drizzle/schema.ts successfully updated!");
