import { describe, it, expect } from "vitest";
import { getCourseStudyStrategy, formatStudyStrategyToMarkdown } from "../utils/studyStrategyEngine";
import { buildFreeTimePlan, formatFreeTimePlanToMarkdown, parseTimeToMinutes, formatMinutesToTime } from "../utils/freeTimePlanner";

describe("Study Strategy Engine with Multilingual Translation", () => {
  it("should return curated course study strategy for CS201 Data Structures", async () => {
    const res = await getCourseStudyStrategy({ courseCode: "CS201", language: "ar" });
    expect(res.courseCode).toBe("CS201");
    expect(res.videos.length).toBeGreaterThan(0);
    expect(res.articlesTranslated.length).toBeGreaterThan(0);
    expect(res.communityInsights.length).toBeGreaterThan(0);

    // Verify Russian technical article translation
    const ruArticle = res.articlesTranslated.find(a => a.originalLanguage === "ru");
    expect(ruArticle).toBeDefined();
    expect(ruArticle?.titleAr).toContain("أشجار");
    expect(ruArticle?.keyTakeawaysAr?.length).toBeGreaterThan(0);
  });

  it("should format study strategy into rich Markdown", async () => {
    const res = await getCourseStudyStrategy({ courseCode: "CS201", language: "ar" });
    const md = formatStudyStrategyToMarkdown(res);
    expect(md).toContain("أفضل استراتيجية ومصادر دراسية معتمدة");
    expect(md).toContain("Habr");
    expect(md).toContain("YouTube");
  });

  it("should support English output when requested", async () => {
    const res = await getCourseStudyStrategy({ courseCode: "PHYS102", language: "en" });
    const md = formatStudyStrategyToMarkdown(res);
    expect(md).toContain("Optimal Study Strategy");
    expect(md).toContain("Walter Lewin");
  });
});

describe("Free-Time Availability Study Planner", () => {
  it("should parse 24h and 12h time strings correctly", () => {
    expect(parseTimeToMinutes("21:00")).toBe(21 * 60);
    expect(parseTimeToMinutes("9:00 PM")).toBe(21 * 60);
    expect(parseTimeToMinutes("23:00")).toBe(23 * 60);
    expect(parseTimeToMinutes("11:00 PM")).toBe(23 * 60);
  });

  it("should format minutes to readable time strings", () => {
    expect(formatMinutesToTime(21 * 60)).toBe("21:00");
    expect(formatMinutesToTime(23 * 60)).toBe("23:00");
  });

  it("should generate a realistic time-blocked study schedule for working student (9 PM - 11 PM)", () => {
    const plan = buildFreeTimePlan({
      input: {
        freeTimeStart: "21:00",
        freeTimeEnd: "23:00",
        workScheduleNote: "طالب موظف نهاراً من 9 ص إلى 5 م",
        sessionStyle: "deep_work",
        language: "ar",
      },
      studentContext: {
        name: "حنان",
        courses: [
          { code: "CS201", name: "Data Structures", credits: 3 },
          { code: "PHYS102", name: "General Physics II", credits: 3 },
          { code: "CS202", name: "Object Oriented Programming", credits: 3 },
        ],
        assignments: [
          { title: "Assignment 2: BST Balancing", courseCode: "CS201", status: "pending" },
          { title: "Problem Set 1: Gauss Law", courseCode: "PHYS102", status: "overdue" },
        ],
      },
    });

    expect(plan.dailyAvailableMinutes).toBe(120);
    expect(plan.weeklyTotalHours).toBe(10);
    expect(plan.days.length).toBe(5); // Sunday to Thursday

    // Each day has Block 1, Active Recall Break, and Block 2
    for (const day of plan.days) {
      expect(day.blocks.length).toBe(3);
      expect(day.blocks[1].isBreak).toBe(true);
    }

    const md = formatFreeTimePlanToMarkdown(plan, "ar");
    expect(md).toContain("جدول المذاكرة الذكي");
    expect(md).toContain("21:00");
  });
});
