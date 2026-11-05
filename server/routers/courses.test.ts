import "dotenv/config";
import { describe, expect, it } from "vitest";
import { coursesRouter } from "./courses";
import type { TrpcContext } from "../_core/context";
import type { User } from "../../drizzle/schema";

const createMockContext = (user: Partial<User> | null): TrpcContext => {
  const defaultUser: User = {
    id: 999901,
    openId: "test-course-user",
    email: "student.test@zuj.edu.jo",
    name: "Course Test Student",
    password: "hashed-password",
    role: "student",
    profilePicture: null,
    bio: null,
    phone: null,
    language: "en",
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    departmentId: null,
    advisorId: null,
  };

  return {
    user: user ? { ...defaultUser, ...user } : null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
};

describe("Courses Router — Prerequisite Guard & Verification", () => {
  it("should list all course prerequisites with mapped codes and names", async () => {
    const ctx = createMockContext(null);
    const caller = coursesRouter.createCaller(ctx);

    const prereqs = await caller.getAllPrerequisites();
    expect(Array.isArray(prereqs)).toBe(true);
    expect(prereqs.length).toBeGreaterThan(0);

    const first = prereqs[0];
    expect(first).toHaveProperty("courseId");
    expect(first).toHaveProperty("prerequisiteId");
    expect(first).toHaveProperty("prerequisiteCode");
    expect(first).toHaveProperty("prerequisiteName");
  });

  it("should reject enrollment from non-student roles", async () => {
    const ctx = createMockContext({ id: 2, role: "advisor" });
    const caller = coursesRouter.createCaller(ctx);

    await expect(caller.enrollCourse({ courseId: 33 })).rejects.toThrow();
  });

  it("should reject enrollment in non-existent course with NOT_FOUND", async () => {
    const ctx = createMockContext({ id: 999902, role: "student" });
    const caller = coursesRouter.createCaller(ctx);

    try {
      await caller.enrollCourse({ courseId: 9999999 });
      expect.unreachable("Should have thrown NOT_FOUND");
    } catch (error: any) {
      expect(error.code).toBe("NOT_FOUND");
      expect(error.message).toContain("Course not found");
    }
  });

  it("should reject enrollment when required prerequisites are missing", async () => {
    // Student 999903 has completed no courses
    // Course 37 (CS102) requires Course 33 (CS101)
    const ctx = createMockContext({ id: 999903, role: "student" });
    const caller = coursesRouter.createCaller(ctx);

    try {
      await caller.enrollCourse({ courseId: 37 });
      expect.unreachable("Should have thrown BAD_REQUEST for missing prerequisite");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
      expect(error.message).toContain("Cannot enroll: Missing prerequisite course(s)");
      expect(error.message).toContain("CS101");
    }
  });

  it("should reject enrollment if course is already completed", async () => {
    // Khaled (210027) has completed course 33
    const ctx = createMockContext({ id: 210027, role: "student" });
    const caller = coursesRouter.createCaller(ctx);

    try {
      await caller.enrollCourse({ courseId: 33 });
      expect.unreachable("Should have thrown BAD_REQUEST for completed course");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
      expect(error.message).toContain("Course has already been completed");
    }
  });

  it("should reject enrollment if course is already in progress", async () => {
    // Khaled (210027) has course 54 in progress
    const ctx = createMockContext({ id: 210027, role: "student" });
    const caller = coursesRouter.createCaller(ctx);

    try {
      await caller.enrollCourse({ courseId: 54 });
      expect.unreachable("Should have thrown BAD_REQUEST for in-progress course");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
      expect(error.message).toContain("Already enrolled in this course");
    }
  });
});
