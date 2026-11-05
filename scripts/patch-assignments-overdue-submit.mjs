import fs from "fs";

let content = fs.readFileSync("client/src/pages/Assignments.tsx", "utf8");

// 1. Add isLateSubmission to type
content = content.replace(
  `totalPoints?: number | null;`,
  `totalPoints?: number | null;\n  isLateSubmission?: boolean;\n  isOverdueUnsubmitted?: boolean;`
);

// 2. Add Late Submission badge in top bar of the card
const oldCardPill = `{a.status === "overdue" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {language === "ar" ? "متأخر" : "Overdue"}
                        </span>
                      )}`;

const newCardPill = `{a.status === "overdue" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {language === "ar" ? "متأخر (متاح التسليم)" : "Overdue (Late Allowed)"}
                        </span>
                      )}
                      {(a.isLateSubmission || (a.submittedAt && a.dueDate && new Date(a.submittedAt) > new Date(a.dueDate))) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/25 border border-red-500/40 text-red-300 text-xs font-bold animate-pulse">
                          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                          {language === "ar" ? "⚠️ تسليم متأخر" : "⚠️ Late Submission"}
                        </span>
                      )}`;

content = content.replace(oldCardPill, newCardPill);

// 3. Update Action Buttons to allow submitting on overdue
const oldActionBtn = `{(a.status === "pending" || a.status === "submitted") && (
                        <button
                          onClick={() => openSubmitModal(a)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all hover:scale-[1.02]"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {a.status === "submitted"
                            ? language === "ar"
                              ? "تعديل الحل المسلّم"
                              : "Edit Submission"
                            : language === "ar"
                            ? "تسليم الحل للدكتور"
                            : "Submit Solution"}
                        </button>
                      )}`;

const newActionBtn = `{(a.status === "pending" || a.status === "submitted" || a.status === "overdue") && (
                        <button
                          onClick={() => openSubmitModal(a)}
                          className={\`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all hover:scale-[1.02] \${
                            a.status === "overdue"
                              ? "bg-red-600 hover:bg-red-500 text-white border border-red-400/30"
                              : a.status === "submitted"
                              ? "bg-slate-700 hover:bg-slate-600 text-white"
                              : "bg-emerald-600 hover:bg-emerald-500 text-white"
                          }\`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          {a.status === "overdue"
                            ? language === "ar"
                              ? "تسليم متأخر للدكتور"
                              : "Submit Late Solution"
                            : a.status === "submitted"
                            ? language === "ar"
                              ? "تعديل الحل المسلّم"
                              : "Edit Submission"
                            : language === "ar"
                            ? "تسليم الحل للدكتور"
                            : "Submit Solution"}
                        </button>
                      )}`;

content = content.replace(oldActionBtn, newActionBtn);

// 4. Update Doctor Grade button to also allow grading submitted or late submitted
content = content.replace(
  `{isPrivileged && a.status === "submitted" && (`,
  `{isPrivileged && (a.status === "submitted" || (a.status === "overdue" && a.solutionText)) && (`
);

// 5. Add Late Submission warning banner inside Submission Modal
const oldModalTop = `<form onSubmit={handleSubmitSolution} className="space-y-4 text-start">`;
const newModalTop = `<form onSubmit={handleSubmitSolution} className="space-y-4 text-start">
                  {(submittingAssignment.status === "overdue" || (submittingAssignment.dueDate && new Date() > new Date(submittingAssignment.dueDate))) && (
                    <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-red-300">
                          {language === "ar" ? "تنبيه: تسليم متأخر بعد انقضاء الموعد النهائي" : "Notice: Submitting After Deadline (Late Submission)"}
                        </p>
                        <p className="text-slate-300 mt-0.5 leading-relaxed">
                          {language === "ar"
                            ? "انتهى الموعد الرسمي للتسليم. يمكنك تسليم الحل، ولكن سيتم توثيقه وإبرازه كـ (تسليم متأخر) لدى الدكتور المشرف."
                            : "The official deadline has passed. You may still submit your work, but it will be flagged as Late for the faculty doctor."}
                        </p>
                      </div>
                    </div>
                  )}`;

content = content.replace(oldModalTop, newModalTop);

// 6. Add Doctor Late Submission Warning inside Grading Modal
const oldGradingFormTop = `<form onSubmit={handleGradeSubmission} className="space-y-4 text-start">`;
const newGradingFormTop = `<form onSubmit={handleGradeSubmission} className="space-y-4 text-start">
                  {(gradingAssignment.isLateSubmission || (gradingAssignment.submittedAt && gradingAssignment.dueDate && new Date(gradingAssignment.submittedAt) > new Date(gradingAssignment.dueDate))) && (
                    <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-xs text-red-200 flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-red-300">
                          {language === "ar" ? "⚠️ تنبيه للدكتور: هذا الواجب تم تسليمه متأخراً" : "⚠️ Doctor Warning: Late Student Submission"}
                        </p>
                        <p className="text-slate-300 mt-0.5">
                          {language === "ar"
                            ? "قام الطالب بالتسليم بعد انقضاء الموعد النهائي المحدد. يرجى أخذ ذلك بعين الاعتبار عند رصد الدرجة النهائية."
                            : "Student submitted after the deadline. Please factor any institutional late submission penalties into the score."}
                        </p>
                      </div>
                    </div>
                  )}`;

content = content.replace(oldGradingFormTop, newGradingFormTop);

fs.writeFileSync("client/src/pages/Assignments.tsx", content, "utf8");
console.log("Successfully updated Assignments.tsx with overdue late submission capabilities!");
