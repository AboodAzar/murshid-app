import fs from 'fs';

let content = fs.readFileSync('server/routers/aiChat.ts', 'utf8');

// 1. Add import for searchDoctorCourseMaterialsRAG
if (!content.includes('searchDoctorCourseMaterialsRAG')) {
  content = content.replace(
    'import { buildFreeTimePlan, formatFreeTimePlanToMarkdown } from "../utils/freeTimePlanner";',
    'import { buildFreeTimePlan, formatFreeTimePlanToMarkdown } from "../utils/freeTimePlanner";\nimport { searchDoctorCourseMaterialsRAG } from "../utils/courseMaterialKnowledgeRAG";'
  );
}

// 2. Perform Doctor Materials RAG search right before intent checks
const intentTarget = '// Check for Free-Time Study Planning Intent (e.g. 9 PM - 11 PM working student)';
const ragSearchBlock = `// 1. TOP PRIORITY (SCORE: 100+): Retrieve & Score Doctor Course Materials
        const doctorMaterialsRAG = await searchDoctorCourseMaterialsRAG({
          db,
          studentId: ctx.user.id,
          query: input.message,
          language: studentLang,
        });

        // Check for Free-Time Study Planning Intent (e.g. 9 PM - 11 PM working student)`;

content = content.replace(intentTarget, ragSearchBlock);

// 3. Pass doctorMaterials to getCourseStudyStrategy
const strategyTarget = 'const strategy = await getCourseStudyStrategy({\n            query: input.message,\n            language: studentLang,\n          });';
const strategyReplacement = `const strategy = await getCourseStudyStrategy({
            query: input.message,
            language: studentLang,
            doctorMaterials: doctorMaterialsRAG.matches,
          });`;

content = content.replace(strategyTarget, strategyReplacement);

// 4. Inject Doctor Materials context into systemPrompt
const promptTarget = `const systemPrompt = buildOliverSystemPrompt(
            studentContext,
            activeFaqs,
            activeDocs
          );`;

const promptReplacement = `let systemPrompt = buildOliverSystemPrompt(
            studentContext,
            activeFaqs,
            activeDocs
          );

          if (doctorMaterialsRAG.hasDoctorMatch) {
            systemPrompt = \`\${systemPrompt}\\n\\n\${doctorMaterialsRAG.formattedContext}\`;
          }`;

content = content.replace(promptTarget, promptReplacement);

fs.writeFileSync('server/routers/aiChat.ts', content);
console.log('Successfully updated server/routers/aiChat.ts with Doctor Course Materials RAG integration.');
