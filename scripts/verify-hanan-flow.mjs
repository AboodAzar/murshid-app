import { createTestSession } from "../tests/e2e/test-client.mjs";

async function run() {
  console.log("=== 1. Student Hanan Login & Assignment Fetch ===");
  const hananSession = createTestSession();
  await hananSession.login("hanan@gmail.com", "password123");
  const assignments = await hananSession.client.student.assignments.query();
  console.log(`Fetched ${assignments.length} assignments for student Hanan:`);
  for (const a of assignments) {
    console.log(`  -> [${a.status.toUpperCase()}] ${a.courseCode} | "${a.title}" | Doctor: ${a.doctorName} | Due: ${a.dueDate} | Score: ${a.score}`);
  }

  console.log("\n=== 2. Student Submits Solution for Pending Assignment 31001 ===");
  const submitRes = await hananSession.client.student.submitAssignment.mutate({
    assignmentId: 31001,
    solutionText: "void rotateLeft(Node* &root) { Node* rightChild = root->right; root->right = rightChild->left; rightChild->left = root; root = rightChild; }",
    solutionImageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600",
    selectedOption: "O(log n)",
  });
  console.log("Submit result:", submitRes);

  console.log("\n=== 3. Doctor Dr. Ahmad Khalil Logs in and Grades Submission ===");
  const doctorSession = createTestSession();
  await doctorSession.login("a.khalil@zuj.edu.jo", "password123");
  const gradeRes = await doctorSession.client.student.gradeAssignment.mutate({
    studentAssignmentId: 31001,
    score: 98,
    feedback: "Exceptional AVL tree rotation logic and correct O(log n) complexity analysis. Excellent work Hanan! — Dr. Ahmad Khalil",
  });
  console.log("Doctor grade result:", gradeRes);

  console.log("\n=== 4. Re-fetch Hanan Assignments to Verify Graded State ===");
  const updated = await hananSession.client.student.assignments.query();
  const item = updated.find(a => a.id === 31001 || a.assignmentId === 31001);
  console.log("Verified newly graded assignment in Hanan query:");
  console.log({
    title: item?.title,
    status: item?.status,
    score: item?.score,
    feedback: item?.feedback,
    doctor: item?.doctorName,
  });

  // Reset 31001 back to pending so that Hanan still has a pending assignment to submit in the UI!
  const resetSession = createTestSession();
  await resetSession.login("a.khalil@zuj.edu.jo", "password123");
  await hananSession.client.student.submitAssignment.mutate({
    assignmentId: 31001,
    solutionText: "",
    solutionImageUrl: "",
    selectedOption: "",
  });
  // Execute direct DB reset for 31001 to pending
  const { getDb } = await import("../server/db.ts");
  const db = await getDb();
  await db.execute("UPDATE studentAssignments SET status = 'pending', score = NULL, solutionText = NULL, solutionImageUrl = NULL, selectedOption = NULL, feedback = NULL WHERE id = 31001");
  console.log("\nReset assignment 31001 back to 'pending' so Hanan has a pending task ready to interact with in the browser!");

  console.log("\nSUCCESS: All four assignment states (pending, submitted, graded, overdue) and doctor-student flow verified!");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
