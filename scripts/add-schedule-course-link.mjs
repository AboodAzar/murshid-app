import fs from 'fs';

let content = fs.readFileSync('client/src/pages/Schedule.tsx', 'utf8');

// 1. Add useLocation import if not present
if (!content.includes('useLocation')) {
  content = content.replace(
    'import { useState } from "react";',
    'import { useState } from "react";\nimport { useLocation } from "wouter";'
  );
}

// 2. Add setLocation hook inside Schedule
if (!content.includes('const [, setLocation] = useLocation();')) {
  content = content.replace(
    'const { user } = useAuth();',
    'const { user } = useAuth();\n  const [, setLocation] = useLocation();'
  );
}

// 3. Add Course & Materials button before isTeams
const target = '{/* Interactive Action Button (Teams Join or Moodle Link) */}';
if (content.includes(target) && !content.includes('Course & Materials')) {
  const replacement = `{/* Interactive Action Button (Course Template, Teams Join or Moodle Link) */}
                              <button
                                onClick={() => setLocation(\`/courses/\${s.courseId || 41}\`)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600/30 text-white text-xs font-bold border border-white/10 hover:border-emerald-500/40 transition-all shrink-0"
                              >
                                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                                <span>{dir === "rtl" ? "المساق والمواد" : "Course & Materials"}</span>
                              </button>`;
  content = content.replace(target, replacement);
}

fs.writeFileSync('client/src/pages/Schedule.tsx', content);
console.log('Successfully updated Schedule.tsx with Course & Materials navigation button!');
