import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Al-Zaytoonah University of Jordan - Faculty of Science and Information Technology
// Real location: Queen Alia Airport Street, Amman, Jordan
// Approximate coordinates: 31.8328°N, 35.8925°E

const facultyBuilding = {
  name: "Faculty of Science and Information Technology",
  nameAr: "كلية العلوم وتكنولوجيا المعلومات",
  code: "FSIT",
  latitude: "31.8328215",
  longitude: "35.8925197",
  description: "Main building for the Faculty of Science and Information Technology. Contains lecture halls, computer laboratories, faculty offices, and research facilities.",
  descriptionAr: "المبنى الرئيسي لكلية العلوم وتكنولوجيا المعلومات. يحتوي على قاعات المحاضرات والمختبرات الحاسوبية ومكاتب أعضاء هيئة التدريس والمرافق البحثية.",
};

// Insert building
const [buildingResult] = await conn.execute(
  `INSERT INTO buildings (name, nameAr, code, latitude, longitude, description, descriptionAr)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  [facultyBuilding.name, facultyBuilding.nameAr, facultyBuilding.code,
   facultyBuilding.latitude, facultyBuilding.longitude,
   facultyBuilding.description, facultyBuilding.descriptionAr]
);
const buildingId = buildingResult.insertId;
console.log(`Inserted building ID: ${buildingId}`);

// Rooms data for Faculty of Science and IT
// Typical layout for a 4-floor academic building
const rooms = [
  // ========== GROUND FLOOR (Floor 0) ==========
  // Entrance & Reception
  { roomNumber: "G-001", name: "Main Entrance", nameAr: "المدخل الرئيسي", capacity: 50, type: "other", floor: 0 },
  { roomNumber: "G-002", name: "Reception & Student Affairs", nameAr: "الاستقبال وشؤون الطلاب", capacity: 20, type: "office", floor: 0 },
  { roomNumber: "G-003", name: "Lobby & Waiting Area", nameAr: "البهو ومنطقة الانتظار", capacity: 40, type: "other", floor: 0 },
  // Large lecture halls
  { roomNumber: "G-101", name: "Lecture Hall A", nameAr: "قاعة المحاضرات أ", capacity: 150, type: "lecture_hall", floor: 0 },
  { roomNumber: "G-102", name: "Lecture Hall B", nameAr: "قاعة المحاضرات ب", capacity: 150, type: "lecture_hall", floor: 0 },
  { roomNumber: "G-103", name: "Lecture Hall C", nameAr: "قاعة المحاضرات ج", capacity: 120, type: "lecture_hall", floor: 0 },
  // Computer labs (ground floor)
  { roomNumber: "G-L01", name: "Computer Lab 1 - Programming", nameAr: "مختبر الحاسوب 1 - البرمجة", capacity: 35, type: "lab", floor: 0 },
  { roomNumber: "G-L02", name: "Computer Lab 2 - Networks", nameAr: "مختبر الحاسوب 2 - الشبكات", capacity: 35, type: "lab", floor: 0 },
  { roomNumber: "G-L03", name: "Computer Lab 3 - Database", nameAr: "مختبر الحاسوب 3 - قواعد البيانات", capacity: 30, type: "lab", floor: 0 },
  // Classrooms
  { roomNumber: "G-201", name: "Classroom G-201", nameAr: "قاعة الدراسة G-201", capacity: 40, type: "classroom", floor: 0 },
  { roomNumber: "G-202", name: "Classroom G-202", nameAr: "قاعة الدراسة G-202", capacity: 40, type: "classroom", floor: 0 },
  // Amenities
  { roomNumber: "G-CAF", name: "Cafeteria", nameAr: "المقصف", capacity: 60, type: "other", floor: 0 },
  { roomNumber: "G-PR", name: "Prayer Room", nameAr: "مصلى", capacity: 30, type: "other", floor: 0 },
  { roomNumber: "G-WC1", name: "Restrooms (Male)", nameAr: " دورات مياه (رجال)", capacity: 10, type: "other", floor: 0 },
  { roomNumber: "G-WC2", name: "Restrooms (Female)", nameAr: "دورات مياه (نساء)", capacity: 10, type: "other", floor: 0 },

  // ========== FIRST FLOOR (Floor 1) ==========
  // Faculty offices - Computer Science Department
  { roomNumber: "1-101", name: "CS Dept Head Office", nameAr: "مكتب رئيس قسم علوم الحاسوب", capacity: 4, type: "office", floor: 1 },
  { roomNumber: "1-102", name: "Dr. Ahmad Office", nameAr: "مكتب د. أحمد", capacity: 2, type: "office", floor: 1 },
  { roomNumber: "1-103", name: "Dr. Sara Office", nameAr: "مكتب د. سارة", capacity: 2, type: "office", floor: 1 },
  { roomNumber: "1-104", name: "Dr. Khalid Office", nameAr: "مكتب د. خالد", capacity: 2, type: "office", floor: 1 },
  { roomNumber: "1-105", name: "Dr. Layla Office", nameAr: "مكتب د. ليلى", capacity: 2, type: "office", floor: 1 },
  // Faculty offices - Information Technology Department
  { roomNumber: "1-106", name: "IT Dept Head Office", nameAr: "مكتب رئيس قسم تكنولوجيا المعلومات", capacity: 4, type: "office", floor: 1 },
  { roomNumber: "1-107", name: "Dr. Omar Office", nameAr: "مكتب د. عمر", capacity: 2, type: "office", floor: 1 },
  { roomNumber: "1-108", name: "Dr. Fatima Office", nameAr: "مكتب د. فاطمة", capacity: 2, type: "office", floor: 1 },
  // Classrooms
  { roomNumber: "1-201", name: "Classroom 1-201", nameAr: "قاعة الدراسة 1-201", capacity: 45, type: "classroom", floor: 1 },
  { roomNumber: "1-202", name: "Classroom 1-202", nameAr: "قاعة الدراسة 1-202", capacity: 45, type: "classroom", floor: 1 },
  { roomNumber: "1-203", name: "Classroom 1-203", nameAr: "قاعة الدراسة 1-203", capacity: 40, type: "classroom", floor: 1 },
  { roomNumber: "1-204", name: "Classroom 1-204", nameAr: "قاعة الدراسة 1-204", capacity: 40, type: "classroom", floor: 1 },
  // Labs
  { roomNumber: "1-L01", name: "Software Engineering Lab", nameAr: "مختبر هندسة البرمجيات", capacity: 30, type: "lab", floor: 1 },
  { roomNumber: "1-L02", name: "Cybersecurity Lab", nameAr: "مختبر الأمن السيبراني", capacity: 25, type: "lab", floor: 1 },
  { roomNumber: "1-L03", name: "AI & Machine Learning Lab", nameAr: "مختبر الذكاء الاصطناعي والتعلم الآلي", capacity: 25, type: "lab", floor: 1 },
  // Amenities
  { roomNumber: "1-WC1", name: "Restrooms (Male)", nameAr: "دورات مياه (رجال)", capacity: 10, type: "other", floor: 1 },
  { roomNumber: "1-WC2", name: "Restrooms (Female)", nameAr: "دورات مياه (نساء)", capacity: 10, type: "other", floor: 1 },

  // ========== SECOND FLOOR (Floor 2) ==========
  // Faculty offices - Mathematics & Statistics
  { roomNumber: "2-101", name: "Math Dept Head Office", nameAr: "مكتب رئيس قسم الرياضيات", capacity: 4, type: "office", floor: 2 },
  { roomNumber: "2-102", name: "Dr. Youssef Office", nameAr: "مكتب د. يوسف", capacity: 2, type: "office", floor: 2 },
  { roomNumber: "2-103", name: "Dr. Noor Office", nameAr: "مكتب د. نور", capacity: 2, type: "office", floor: 2 },
  // Faculty offices - Physics
  { roomNumber: "2-104", name: "Physics Dept Head Office", nameAr: "مكتب رئيس قسم الفيزياء", capacity: 4, type: "office", floor: 2 },
  { roomNumber: "2-105", name: "Dr. Hassan Office", nameAr: "مكتب د. حسن", capacity: 2, type: "office", floor: 2 },
  // Classrooms
  { roomNumber: "2-201", name: "Classroom 2-201", nameAr: "قاعة الدراسة 2-201", capacity: 45, type: "classroom", floor: 2 },
  { roomNumber: "2-202", name: "Classroom 2-202", nameAr: "قاعة الدراسة 2-202", capacity: 45, type: "classroom", floor: 2 },
  { roomNumber: "2-203", name: "Classroom 2-203", nameAr: "قاعة الدراسة 2-203", capacity: 50, type: "classroom", floor: 2 },
  // Labs
  { roomNumber: "2-L01", name: "Physics Laboratory", nameAr: "مختبر الفيزياء", capacity: 30, type: "lab", floor: 2 },
  { roomNumber: "2-L02", name: "Mathematics Lab", nameAr: "مختبر الرياضيات", capacity: 35, type: "lab", floor: 2 },
  { roomNumber: "2-L03", name: "Data Science Lab", nameAr: "مختبر علوم البيانات", capacity: 30, type: "lab", floor: 2 },
  // Amenities
  { roomNumber: "2-WC1", name: "Restrooms (Male)", nameAr: "دورات مياه (رجال)", capacity: 10, type: "other", floor: 2 },
  { roomNumber: "2-WC2", name: "Restrooms (Female)", nameAr: "دورات مياه (نساء)", capacity: 10, type: "other", floor: 2 },

  // ========== THIRD FLOOR (Floor 3) ==========
  // Administration & Research
  { roomNumber: "3-101", name: "Dean Office", nameAr: "مكتب العميد", capacity: 6, type: "office", floor: 3 },
  { roomNumber: "3-102", name: "Vice Dean Office", nameAr: "مكتب نائب العميد", capacity: 4, type: "office", floor: 3 },
  { roomNumber: "3-103", name: "Faculty Council Room", nameAr: "قاعة مجلس الكلية", capacity: 25, type: "office", floor: 3 },
  { roomNumber: "3-104", name: "Graduate Studies Office", nameAr: "مكتب الدراسات العليا", capacity: 4, type: "office", floor: 3 },
  { roomNumber: "3-105", name: "Research Center", nameAr: "مركز البحوث", capacity: 15, type: "lab", floor: 3 },
  // Conference & Seminar rooms
  { roomNumber: "3-201", name: "Seminar Room A", nameAr: "قاعة الندوات أ", capacity: 60, type: "lecture_hall", floor: 3 },
  { roomNumber: "3-202", name: "Seminar Room B", nameAr: "قاعة الندوات ب", capacity: 40, type: "classroom", floor: 3 },
  // Smart classrooms
  { roomNumber: "3-301", name: "Smart Classroom 3-301", nameAr: "قاعة الدراسة الذكية 3-301", capacity: 35, type: "classroom", floor: 3 },
  { roomNumber: "3-302", name: "Smart Classroom 3-302", nameAr: "قاعة الدراسة الذكية 3-302", capacity: 35, type: "classroom", floor: 3 },
  // Amenities
  { roomNumber: "3-WC1", name: "Restrooms (Male)", nameAr: "دورات مياه (رجال)", capacity: 10, type: "other", floor: 3 },
  { roomNumber: "3-WC2", name: "Restrooms (Female)", nameAr: "دورات مياه (نساء)", capacity: 10, type: "other", floor: 3 },
];

// Insert all rooms
for (const room of rooms) {
  await conn.execute(
    `INSERT INTO rooms (buildingId, roomNumber, name, nameAr, capacity, type, floor)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [buildingId, room.roomNumber, room.name, room.nameAr, room.capacity, room.type, room.floor]
  );
}

console.log(`Inserted ${rooms.length} rooms`);
console.log(`\nCampus seeding complete for Faculty of Science and Information Technology!`);
console.log(`Building ID: ${buildingId}`);
console.log(`Location: ${facultyBuilding.latitude}, ${facultyBuilding.longitude}`);

await conn.end();
