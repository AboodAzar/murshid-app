import fs from 'fs';

let content = fs.readFileSync('client/src/pages/CourseDetails.tsx', 'utf8');

// 1. Fix Top Banner Doctor Add Content Button: strictly require isDoctorUser
const topBtnRegex = /\{\/\* Doctor Add Content Trigger \*\/\}\s*<button[\s\S]*?<\/button>/;
const topBtnReplacement = `{/* Doctor Add Content Trigger - Strictly for Doctors/Instructors */}
            {isDoctorUser && !enrollment.isLocked && (
              <button
                onClick={() => handleOpenAddModal(1)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40 active:scale-95 border border-emerald-400/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isRtl ? "إضافة محتوى (دكتور)" : "Add Content (Doctor)"}</span>
              </button>
            )}`;

content = content.replace(topBtnRegex, topBtnReplacement);

// 2. Fix Course Content Section Header Add Button: strictly require isDoctorUser
const headerAddRegex = /\{!enrollment\.isLocked && \(\s*<button\s*onClick=\{\(\) => handleOpenAddModal\(1\)\}[\s\S]*?<\/button>\s*\)\}/;
const headerAddReplacement = `{isDoctorUser && !enrollment.isLocked && (
                  <button
                    onClick={() => handleOpenAddModal(1)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isRtl ? "إضافة للمساق" : "+ Add to Course"}</span>
                  </button>
                )}`;

content = content.replace(headerAddRegex, headerAddReplacement);

// 3. Fix Chapter Bottom Add Button: strictly require isDoctorUser
const chapterBottomAddRegex = /\{!enrollment\.isLocked && \(\s*<button\s*onClick=\{\(\) => handleOpenAddModal\(ch\.chapterNumber\)\}[\s\S]*?<\/button>\s*\)\}/;
const chapterBottomAddReplacement = `{isDoctorUser && !enrollment.isLocked && (
                            <button
                              onClick={() => handleOpenAddModal(ch.chapterNumber)}
                              className="w-full py-2 rounded-xl border border-dashed border-white/10 hover:border-emerald-500/40 text-slate-400 hover:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>{isRtl ? \`إضافة محتوى / نشاط إلى الفصل \${ch.chapterNumber}\` : \`+ Add Material / Activity to Chapter \${ch.chapterNumber}\`}</span>
                            </button>
                          )}`;

content = content.replace(chapterBottomAddRegex, chapterBottomAddReplacement);

// 4. Fix Action Buttons on Completed Courses: LOCK submissions for completed courses
const actionBtnsRegex = /\{\/\* Action Buttons \*\/\}[\s\S]*?\{\/\* Accordion Toggle Icon \*\/\}/;
const actionBtnsReplacement = `{/* Action Buttons */}
                                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                                  {/* Locked for Completed Courses */}
                                  {(enrollment.isLocked || enrollment.isCompleted) && ["assignment", "quiz", "activity"].includes(item.type) ? (
                                    <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 border border-white/10 text-slate-400 text-[10px] font-bold flex items-center gap-1 select-none cursor-not-allowed">
                                      <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                                      <span>{isRtl ? "مغلق (مساق مكتمل)" : "Closed (Course Completed)"}</span>
                                    </span>
                                  ) : item.type === "assignment" ? (
                                    <button
                                      onClick={() => setLocation("/assignments")}
                                      className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold shadow transition-all hover:scale-105 active:scale-95"
                                    >
                                      {isRtl ? "تسليم الحل ←" : "Submit Solution →"}
                                    </button>
                                  ) : item.type === "quiz" ? (
                                    <button
                                      onClick={() => toast.info(isRtl ? "بيئة الاختبار القصير..." : "Opening timed Quiz environment...")}
                                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold shadow transition-all hover:scale-105 active:scale-95"
                                    >
                                      {isRtl ? "بدء الاختبار ←" : "Take Quiz →"}
                                    </button>
                                  ) : item.type === "exam" ? (
                                    <span className="text-[10px] text-rose-300 font-bold bg-rose-500/20 px-2 py-0.5 rounded">
                                      {(enrollment.isLocked || enrollment.isCompleted) ? (isRtl ? "انتهى الامتحان" : "Exam Concluded") : (isRtl ? "قاعة 41 • 30 علامة" : "Hall 41 • 30 Pts")}
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => toast.success(isRtl ? \`جاري تنزيل \${item.fileName}...\` : \`Downloading \${item.fileName}...\`)}
                                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold border border-white/10 flex items-center gap-1 active:scale-95"
                                    >
                                      <Download className="w-3 h-3 text-emerald-400" />
                                      <span>{isRtl ? "تحميل" : "Download"}</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Accordion Toggle Icon */}`;

content = content.replace(actionBtnsRegex, actionBtnsReplacement);

fs.writeFileSync('client/src/pages/CourseDetails.tsx', content);
console.log('Successfully applied student authoring restriction and completed course submission lock in CourseDetails.tsx');
