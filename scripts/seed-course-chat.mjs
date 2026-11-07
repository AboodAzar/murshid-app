import mysql from 'mysql2/promise';

async function seedCourseChat() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'murshid'
  });

  console.log('Connected to murshid database.');

  // Find course IDs for key courses: 135341 (Neural Networks), CS201, 135342 (NLP)
  const [courses] = await connection.query("SELECT id, code, name FROM courses WHERE code IN ('135341', '135342', 'CS201', '135240') LIMIT 10");
  console.log('Found courses:', courses.map(c => `${c.id}:${c.code}`));

  // Also check courseId 41 as fallback
  const courseIds = courses.map(c => c.id);
  if (!courseIds.includes(41)) courseIds.push(41);

  for (const cId of courseIds) {
    // Check if messages already exist
    const [existing] = await connection.query("SELECT COUNT(*) as count FROM course_chat_messages WHERE courseId = ?", [cId]);
    if (existing[0].count > 0) {
      console.log(`Course ${cId} already has ${existing[0].count} messages. Skipping...`);
      continue;
    }

    const messages = [
      {
        courseId: cId,
        senderId: 210024,
        senderName: "Dr. Ahmad Khalil",
        senderRole: "doctor",
        senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        messageType: "text",
        content: "مرحباً بجميع الطلبة في شعبة المساق! يرجى مراجعة الفصل الثالث قبل محاضرة الثلاثاء القادم، وقمنا برفع ملف التمارين العملية على البوابة.",
        fileUrl: null,
        fileName: null,
        fileSize: null
      },
      {
        courseId: cId,
        senderId: 210024,
        senderName: "Dr. Ahmad Khalil",
        senderRole: "doctor",
        senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        messageType: "file",
        content: "ملخص المحاضرة الثالثة مع أمثلة الحسابات الرياضية.",
        fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        fileName: "Lecture_03_Mathematical_Foundations.pdf",
        fileSize: "2.8 MB"
      },
      {
        courseId: cId,
        senderId: 210034,
        senderName: "Ali Faris (علي فارس)",
        senderRole: "student",
        senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        messageType: "text",
        content: "يعطيك العافية دكتور، بخصوص الواجب الأول هل التسليم فردي أم ضمن مجموعات؟",
        fileUrl: null,
        fileName: null,
        fileSize: null
      },
      {
        courseId: cId,
        senderId: 210024,
        senderName: "Dr. Ahmad Khalil",
        senderRole: "doctor",
        senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        messageType: "text",
        content: "التسليم فردي لكل طالب عبر منصة LMS، وسيتم إغلاق الرابط مساء الخميس القادم.",
        fileUrl: null,
        fileName: null,
        fileSize: null
      },
      {
        courseId: cId,
        senderId: 240005,
        senderName: "Omar Naser (عمر ناصر)",
        senderRole: "student",
        senderAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
        messageType: "image",
        content: "شباب هي مخطط المعمارية اللي شرحها الدكتور اليوم على اللوح لمن يحتاجها:",
        fileUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop",
        fileName: "Whiteboard_Architecture_Diagram.jpg",
        fileSize: "1.4 MB"
      },
      {
        courseId: cId,
        senderId: 240008,
        senderName: "Leen Tariq (لين طارق)",
        senderRole: "student",
        senderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        messageType: "text",
        content: "شكراً عمر! الرسمة واضحة وممتازة 👍",
        fileUrl: null,
        fileName: null,
        fileSize: null
      }
    ];

    for (const msg of messages) {
      await connection.query(
        `INSERT INTO course_chat_messages (courseId, senderId, senderName, senderRole, senderAvatar, messageType, content, fileUrl, fileName, fileSize) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [msg.courseId, msg.senderId, msg.senderName, msg.senderRole, msg.senderAvatar, msg.messageType, msg.content, msg.fileUrl, msg.fileName, msg.fileSize]
      );
    }
    console.log(`Seeded ${messages.length} messages for course ${cId}.`);
  }

  await connection.end();
  console.log('Seeding finished successfully.');
}

seedCourseChat().catch(err => {
  console.error('Error seeding course chat:', err);
  process.exit(1);
});
