import mysql from "mysql2/promise";
import "dotenv/config";

async function run() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  // Check if course_materials already has data
  const [existing] = await conn.execute("SELECT COUNT(*) as cnt FROM course_materials");
  if (existing[0]?.cnt > 0) {
    console.log("course_materials already populated with", existing[0].cnt, "items");
    await conn.end();
    return;
  }

  // Get courses
  const [courses] = await conn.execute("SELECT id, code, name FROM courses");
  const courseMap = new Map(courses.map(c => [c.code, c.id]));

  // Default seed materials for CS201 (Data Structures)
  const cs201Id = courseMap.get("CS201") || 41;
  const cs202Id = courseMap.get("CS202") || 42;
  const phys102Id = courseMap.get("PHYS102") || 40;
  const cs101Id = courseMap.get("CS101") || 33; // Completed course example

  const initialItems = [
    // CS201 Data Structures (In-Person, Active)
    {
      courseId: cs201Id,
      chapterNumber: 1,
      chapterTitle: "Chapter 1: Asymptotic Analysis & Algorithmic Complexity",
      chapterTitleAr: "الفصل 1: مفاهيم التعقيد الحسابي ونظرية Big-O",
      type: "slides",
      title: "Ch1 Slides: Big-O, Omega & Theta Notations",
      titleAr: "شرائح الفصل الأول: نظريات Big-O و Omega و Theta",
      description: "Foundational slides covering worst-case and amortized complexity bounds.",
      fileName: "CS201_Ch1_Asymptotic_Complexity.pdf",
      fileSize: "2.8 MB",
      doctorName: "Dr. Ahmad Khalil",
      totalPoints: 0,
    },
    {
      courseId: cs201Id,
      chapterNumber: 1,
      chapterTitle: "Chapter 1: Asymptotic Analysis & Algorithmic Complexity",
      chapterTitleAr: "الفصل 1: مفاهيم التعقيد الحسابي ونظرية Big-O",
      type: "activity",
      title: "Activity 1: Recurrence Relations & Master Theorem",
      titleAr: "نشاط 1: حل العلاقات التكرارية باستخدام Master Theorem",
      description: "Classroom group exercise analyzing divide-and-conquer recurrence equations.",
      fileName: "CS201_Activity1_MasterTheorem.pdf",
      fileSize: "1.2 MB",
      doctorName: "Dr. Ahmad Khalil",
      totalPoints: 5,
    },
    {
      courseId: cs201Id,
      chapterNumber: 1,
      chapterTitle: "Chapter 1: Asymptotic Analysis & Algorithmic Complexity",
      chapterTitleAr: "الفصل 1: مفاهيم التعقيد الحسابي ونظرية Big-O",
      type: "notes",
      title: "Supplementary Notes: Space vs. Time Complexity Cheat Sheet",
      titleAr: "ملخص إضافي: مقارنة التعقيد الزمني والمكاني للخوارزميات",
      description: "Quick reference guide with memory overhead formulas.",
      fileName: "Complexity_CheatSheet_ZUJ.pdf",
      fileSize: "850 KB",
      doctorName: "Dr. Ahmad Khalil",
      totalPoints: 0,
    },
    {
      courseId: cs201Id,
      chapterNumber: 1,
      chapterTitle: "Chapter 1: Asymptotic Analysis & Algorithmic Complexity",
      chapterTitleAr: "الفصل 1: مفاهيم التعقيد الحسابي ونظرية Big-O",
      type: "quiz",
      title: "Quiz 1: Asymptotic Big-O Analysis",
      titleAr: "اختبار قصير 1: حساب التعقيد الزمني للحلقات التكرارية",
      description: "Timed 15-minute quiz on loop analysis and asymptotic comparisons.",
      dueDate: "2026-11-15 23:59:00",
      doctorName: "Dr. Ahmad Khalil",
      totalPoints: 10,
    },

    // Chapter 2
    {
      courseId: cs201Id,
      chapterNumber: 2,
      chapterTitle: "Chapter 2: Linear Data Structures (Stacks, Queues, Deques)",
      chapterTitleAr: "الفصل 2: التراكيب الخطية (المكدس، الطابور، والقوائم)",
      type: "slides",
      title: "Ch2 Slides: Dynamic Array & Node-Based Implementation",
      titleAr: "شرائح الفصل الثاني: بناء القوائم المتصلة والمكدسات",
      description: "Comparison of pointer manipulation vs contiguous array memory layouts.",
      fileName: "CS201_Ch2_Linear_Structures.pdf",
      fileSize: "3.4 MB",
      doctorName: "Dr. Ahmad Khalil",
      totalPoints: 0,
    },
    {
      courseId: cs201Id,
      chapterNumber: 2,
      chapterTitle: "Chapter 2: Linear Data Structures (Stacks, Queues, Deques)",
      chapterTitleAr: "الفصل 2: التراكيب الخطية (المكدس، الطابور، والقوائم)",
      type: "assignment",
      title: "Assignment 1: Doubly Linked List Node Deletion Lab",
      titleAr: "الواجب 1: تطبيق حذف العقد من القائمة المتصلة المزدوجة",
      description: "Implement edge-case handling for head and tail pointer updates in C++/Java.",
      dueDate: "2026-11-01 23:59:00",
      doctorName: "Dr. Ahmad Khalil",
      totalPoints: 15,
    },

    // Chapter 3
    {
      courseId: cs201Id,
      chapterNumber: 3,
      chapterTitle: "Chapter 3: Binary Search Trees & Tree Traversals",
      chapterTitleAr: "الفصل 3: أشجار البحث الثنائية والاجتياز التكراري",
      type: "slides",
      title: "Ch3 Slides: In-Order, Pre-Order & Post-Order Search",
      titleAr: "شرائح الفصل الثالث: اجتياز الأشجار الثنائية وخصائص BST",
      description: "Recursive and iterative traversal mechanics and tree height balancing.",
      fileName: "CS201_Ch3_BST_Traversals.pdf",
      fileSize: "2.9 MB",
      doctorName: "Dr. Ahmad Khalil",
      totalPoints: 0,
    },
    {
      courseId: cs201Id,
      chapterNumber: 3,
      chapterTitle: "Chapter 3: Binary Search Trees & Tree Traversals",
      chapterTitleAr: "الفصل 3: أشجار البحث الثنائية والاجتياز التكراري",
      type: "activity",
      title: "Activity 2: BST Recursive Insertion & Deletion Trace",
      titleAr: "نشاط 2: تتبع مسار الإدراج والحذف التكراري في BST",
      description: "Worked-out examples showing predecessor and successor substitution.",
      fileName: "CS201_Activity2_BST_Solutions.pdf",
      fileSize: "1.5 MB",
      doctorName: "Dr. Ahmad Khalil",
      totalPoints: 5,
    },

    // Chapter 4: AVL Trees
    {
      courseId: cs201Id,
      chapterNumber: 4,
      chapterTitle: "Chapter 4: Self-Balancing AVL Trees & Rotations",
      chapterTitleAr: "الفصل 4: أشجار AVL ذاتية التوازن وحسابات الدوران",
      type: "slides",
      title: "Ch4 Slides: Single & Double AVL Rotations",
      titleAr: "شرائح الفصل الرابع: حالات الدوران الأربعة في AVL",
      description: "Detailed step-by-step visual breakdowns of LL, RR, LR, and RL rebalancing.",
      fileName: "CS201_Ch4_AVL_Rotations.pdf",
      fileSize: "4.1 MB",
      doctorName: "Dr. Ahmad Khalil",
      totalPoints: 0,
    },
    {
      courseId: cs201Id,
      chapterNumber: 4,
      chapterTitle: "Chapter 4: Self-Balancing AVL Trees & Rotations",
      chapterTitleAr: "الفصل 4: أشجار AVL ذاتية التوازن وحسابات الدوران",
      type: "assignment",
      title: "Assignment 2: AVL Tree Rotation & Height Balancing",
      titleAr: "الواجب 2: توازن شجرة AVL وحساب تعقيد الدوران",
      description: "Determine worst-case time complexity of rebalancing an AVL tree after single insertion.",
      dueDate: "2026-11-11 23:59:00",
      doctorName: "Dr. Ahmad Khalil",
      totalPoints: 20,
    },
    {
      courseId: cs201Id,
      chapterNumber: 4,
      chapterTitle: "Chapter 4: Self-Balancing AVL Trees & Rotations",
      chapterTitleAr: "الفصل 4: أشجار AVL ذاتية التوازن وحسابات الدوران",
      type: "exam",
      title: "Midterm Exam (الامتحان النصفي)",
      titleAr: "الامتحان النصفي لمساق تراكيب البيانات",
      description: "Covers Chapters 1-4. Hall 41 & Hall 42. In-Person paper exam with programming section.",
      dueDate: "2026-11-20 10:00:00",
      doctorName: "Dr. Ahmad Khalil",
      totalPoints: 30,
    },

    // Completed Course Example: CS101 Introduction to Computing
    {
      courseId: cs101Id,
      chapterNumber: 1,
      chapterTitle: "Chapter 1: Introduction to Computing & Digital Logic",
      chapterTitleAr: "الفصل 1: مقدمة في الحوسبة والمنطق الرقمي",
      type: "slides",
      title: "Archived Slides: Binary, Hexadecimal & Logic Gates",
      titleAr: "شرائح مؤرشفة: الأنظمة العددية والبوابات المنطقية",
      description: "Archived course material from Fall 2025/2026. Preserved for academic records.",
      fileName: "CS101_Archived_Ch1.pdf",
      fileSize: "2.1 MB",
      doctorName: "Dr. Samir Al-Najjar", // Will demonstrate [Deactivated] faculty!
      totalPoints: 0,
    },
    {
      courseId: cs101Id,
      chapterNumber: 2,
      chapterTitle: "Chapter 2: Algorithms, Flowcharts & Control Structures",
      chapterTitleAr: "الفصل 2: الخوارزميات، المخططات الانسيابية وجمل التحكم",
      type: "assignment",
      title: "Archived Lab 1: Pseudo-code & Flowchart Design",
      titleAr: "واجب مخبري مؤرشف: تصميم المخططات الانسيابية",
      description: "Archived assignment. Grade recorded: 98/100 (Passed).",
      dueDate: "2025-11-10 23:59:00",
      doctorName: "Dr. Samir Al-Najjar",
      totalPoints: 20,
    }
  ];

  for (const item of initialItems) {
    await conn.execute(
      `INSERT INTO course_materials 
        (courseId, chapterNumber, chapterTitle, chapterTitleAr, type, title, titleAr, description, fileName, fileSize, dueDate, totalPoints, doctorName)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.courseId,
        item.chapterNumber,
        item.chapterTitle,
        item.chapterTitleAr,
        item.type,
        item.title,
        item.titleAr || null,
        item.description || null,
        item.fileName || null,
        item.fileSize || "2.0 MB",
        item.dueDate || null,
        item.totalPoints || 0,
        item.doctorName || "Dr. Ahmad Khalil",
      ]
    );
  }

  console.log("Seeded", initialItems.length, "course materials successfully");
  await conn.end();
}

run().catch(console.error);
