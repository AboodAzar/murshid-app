import fs from "fs";

let c = fs.readFileSync("client/src/pages/CampusNavigation.tsx", "utf8");
c = c.replace(/\r\n/g, "\n");

const oldLectureBlock = `                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{lecture.courseName}</h4>
                            <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px]">
                              {lecture.courseCode}
                            </Badge>
                          </div>`;

const newLectureBlock = `                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{lecture.courseName}</h4>
                            <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                              {lecture.courseCode}
                            </Badge>
                            {((lecture as any).modalityLabel || (lecture as any).modality) && (
                              <Badge className={\`text-[10px] \${
                                (lecture as any).modality === "teams"
                                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                                  : (lecture as any).modality === "integrated"
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                  : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                              }\`}>
                                {(lecture as any).modalityLabel || "Face-to-Face"}
                              </Badge>
                            )}
                          </div>`;

if (c.includes(oldLectureBlock)) {
  c = c.replace(oldLectureBlock, newLectureBlock);
}

const oldEmptySchedule = `<p className="text-sm">No lectures scheduled for today.</p>
                    <p className="text-xs text-slate-600 mt-1">Check your study plan or timetable for upcoming lectures.</p>`;

const newEmptySchedule = `<p className="text-sm font-semibold text-slate-300">No on-campus lectures scheduled for today.</p>
                    <p className="text-xs text-slate-500 mt-1">Al-Zaytoonah University follows a 4-day academic week (Sunday – Wednesday). Thursday, Friday, and Saturday are lecture-free study and e-learning activity days.</p>`;

if (c.includes(oldEmptySchedule)) {
  c = c.replace(oldEmptySchedule, newEmptySchedule);
}

fs.writeFileSync("client/src/pages/CampusNavigation.tsx", c);
console.log("Patched client/src/pages/CampusNavigation.tsx");
