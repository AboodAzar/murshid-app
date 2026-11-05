-- 1. Pending Assignment: CS201 (Course 41) from Dr. Ahmad Khalil (210024)
INSERT INTO assignments (id, courseId, advisorId, title, titleAr, description, descriptionAr, submissionType, options, dueDate, totalPoints, createdAt, updatedAt)
VALUES (
  31001,
  41,
  210024,
  'Assignment 2: Binary Search Tree (BST) Balancing & Search Complexity',
  'واجب 2: موازنة أشجار البحث الثنائية وحساب التعقيد الزمني',
  'Given an unbalanced Binary Search Tree with N nodes: (1) Write a C++ method to perform an AVL rotation to restore balance. (2) Upload an image diagram of your tree rotations for insertion sequence [15, 10, 20, 8, 12, 18, 25]. (3) Select the worst-case time complexity of searching in a balanced BST.',
  'بناءً على شجرة بحث ثنائية: (1) اكتب دالة بلغة C++ لإجراء دوران AVL لإعادة التوازن. (2) ارفع صورة تخطيطية توضح خطوات تدوير الشجرة. (3) حدد التعقيد الزمني في أسوأ الحالات للبحث في شجرة متوازنة.',
  'all',
  '["O(1)", "O(log n)", "O(n)", "O(n log n)"]',
  DATE_ADD(NOW(), INTERVAL 6 DAY),
  100,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE title=VALUES(title), advisorId=VALUES(advisorId), description=VALUES(description), options=VALUES(options);

-- 2. Submitted Assignment: CS202 (Course 42) from Dr. Ahmad Khalil (210024)
INSERT INTO assignments (id, courseId, advisorId, title, titleAr, description, descriptionAr, submissionType, options, dueDate, totalPoints, createdAt, updatedAt)
VALUES (
  31002,
  42,
  210024,
  'Assignment 1: Polymorphism, Abstract Factory & UML Class Diagram',
  'واجب 1: تعدد الأشكال، مصنع الكائنات التجريدي، ومخطط الفئات UML',
  'Design a Vehicle Management System using abstract base classes and polymorphism in Java. Implement factory methods for Car and Truck instantiation, and submit your source code along with a handwritten or digital UML class diagram.',
  'تصميم نظام إدارة المركبات باستخدام الفئات التجريدية وتعدد الأشكال بلغة Java. قم بتضمين الكود البرمجي ومخطط فئات UML يوضح العلاقات والوراثة.',
  'all',
  NULL,
  DATE_ADD(NOW(), INTERVAL 3 DAY),
  100,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE title=VALUES(title), advisorId=VALUES(advisorId), description=VALUES(description);

-- 3. Graded Assignment: CS201 (Course 41) from Dr. Ahmad Khalil (210024)
INSERT INTO assignments (id, courseId, advisorId, title, titleAr, description, descriptionAr, submissionType, options, dueDate, totalPoints, createdAt, updatedAt)
VALUES (
  31003,
  41,
  210024,
  'Lab 1: Doubly Linked List Operations & Memory Deallocation',
  'مختبر 1: عمليات القائمة المترابطة المزدوجة وإدارة الذاكرة',
  'Implement insertFront, insertBack, deleteNode, and reverseTraversal for a Doubly Linked List in C++. Ensure zero memory leaks with proper destructor implementation.',
  'تنفيذ الإدراج من الأمام والخلف، وحذف العقد، والتنقل العكسي في قائمة مترابطة مزدوجة بلغة C++ مع ضمان عدم تسريب الذاكرة.',
  'text',
  NULL,
  DATE_SUB(NOW(), INTERVAL 8 DAY),
  100,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE title=VALUES(title), advisorId=VALUES(advisorId), description=VALUES(description);

-- 4. Overdue Assignment: PHYS102 (Course 40) from Dr. Omar Hassan (210026)
INSERT INTO assignments (id, courseId, advisorId, title, titleAr, description, descriptionAr, submissionType, options, dueDate, totalPoints, createdAt, updatedAt)
VALUES (
  31004,
  40,
  210026,
  'Problem Set 1: Gauss Law & Electric Flux Calculations',
  'مجموعة المسائل 1: قانون غاوس وحساب التدفق الكهربائي',
  'Calculate electric field intensity for concentric spherical shells and infinite line charges using symmetry properties of Gauss Law.',
  'حساب شدة المجال الكهربائي للقشور الكروية المتحدة المركز والأسلاك اللانهائية باستخدام قانون غاوس.',
  'text',
  NULL,
  DATE_SUB(NOW(), INTERVAL 15 DAY),
  100,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE title=VALUES(title), advisorId=VALUES(advisorId), description=VALUES(description);

-- Map these assignments to student Hanan (240002)
-- 1. Pending:
INSERT INTO studentAssignments (id, studentId, assignmentId, status, score, solutionText, solutionImageUrl, selectedOption, feedback, gradedBy, gradedAt, submittedAt, createdAt, updatedAt)
VALUES (
  31001,
  240002,
  31001,
  'pending',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE status='pending', score=NULL, solutionText=NULL;

-- 2. Submitted (awaiting review):
INSERT INTO studentAssignments (id, studentId, assignmentId, status, score, solutionText, solutionImageUrl, selectedOption, feedback, gradedBy, gradedAt, submittedAt, createdAt, updatedAt)
VALUES (
  31002,
  240002,
  31002,
  'submitted',
  NULL,
  '// Solution by Hanan (240002) - Vehicle Management System\nabstract class Vehicle {\n    protected String vin;\n    public abstract double calculateRentalRate(int days);\n}\nclass Car extends Vehicle {\n    public double calculateRentalRate(int days) { return days * 35.0; }\n}\nclass Truck extends Vehicle {\n    public double calculateRentalRate(int days) { return days * 85.0 + 50.0; }\n}',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
  NULL,
  NULL,
  NULL,
  NULL,
  DATE_SUB(NOW(), INTERVAL 2 HOUR),
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE status='submitted', score=NULL, submittedAt=VALUES(submittedAt);

-- 3. Graded (reviewed by Dr. Ahmad Khalil):
INSERT INTO studentAssignments (id, studentId, assignmentId, status, score, solutionText, solutionImageUrl, selectedOption, feedback, gradedBy, gradedAt, submittedAt, createdAt, updatedAt)
VALUES (
  31003,
  240002,
  31003,
  'graded',
  96,
  '// Doubly Linked List - Hanan\nstruct Node {\n    int data;\n    Node* prev;\n    Node* next;\n    Node(int v) : data(v), prev(nullptr), next(nullptr) {}\n};\nvoid reverseTraversal(Node* tail) {\n    while (tail != nullptr) {\n        std::cout << tail->data << " ";\n        tail = tail->prev;\n    }\n}',
  NULL,
  NULL,
  'Excellent pointer management and memory safety, Hanan. Your reverseTraversal and boundary checks for empty lists are exceptionally clean. Keep up the high standard! — Dr. Ahmad Khalil',
  210024,
  DATE_SUB(NOW(), INTERVAL 7 DAY),
  DATE_SUB(NOW(), INTERVAL 8 DAY),
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE status='graded', score=96, feedback=VALUES(feedback);

-- 4. Overdue (not submitted past deadline):
INSERT INTO studentAssignments (id, studentId, assignmentId, status, score, solutionText, solutionImageUrl, selectedOption, feedback, gradedBy, gradedAt, submittedAt, createdAt, updatedAt)
VALUES (
  31004,
  240002,
  31004,
  'overdue',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE status='overdue', score=NULL;
