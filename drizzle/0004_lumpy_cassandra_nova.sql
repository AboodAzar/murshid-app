CREATE TABLE `academicAlerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`advisorId` int NOT NULL,
	`studentId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`type` enum('attendance','gpa_drop','missing_assignments','at_risk','probation','custom') NOT NULL DEFAULT 'custom',
	`isResolved` boolean NOT NULL DEFAULT false,
	`resolvedAt` timestamp,
	`resolvedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `academicAlerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`titleAr` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`descriptionAr` text NOT NULL,
	`icon` varchar(64) NOT NULL,
	`color` varchar(50) NOT NULL DEFAULT '#3b82f6',
	`conditionType` enum('courses_completed','gpa_reached','attendance_streak','assignments_submitted','credits_earned','semester_completed') NOT NULL,
	`conditionValue` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`),
	CONSTRAINT `achievements_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `advisorNotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`advisorId` int NOT NULL,
	`studentId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`category` enum('general','academic','behavioral','career','attendance','gpa') NOT NULL DEFAULT 'general',
	`isPrivate` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `advisorNotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `advisorReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`advisorId` int NOT NULL,
	`studentId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`summary` text NOT NULL,
	`gpaAtReport` decimal(3,2),
	`creditsAtReport` int,
	`attendanceRateAtReport` decimal(5,2),
	`riskLevel` enum('none','low','medium','high') NOT NULL DEFAULT 'none',
	`semester` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `advisorReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`advisorId` int NOT NULL,
	`studentId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`scheduledAt` timestamp NOT NULL,
	`durationMinutes` int NOT NULL DEFAULT 30,
	`location` varchar(255),
	`meetingLink` varchar(500),
	`status` enum('scheduled','confirmed','completed','cancelled','no_show') NOT NULL DEFAULT 'scheduled',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`titleAr` varchar(255) NOT NULL,
	`description` text,
	`descriptionAr` text,
	`dueDate` timestamp NOT NULL,
	`totalPoints` int NOT NULL DEFAULT 100,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attendance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`courseId` int NOT NULL,
	`scheduleId` int NOT NULL,
	`date` timestamp NOT NULL,
	`status` enum('present','absent','excused','late') NOT NULL DEFAULT 'present',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `attendance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courseSchedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`dayOfWeek` int NOT NULL,
	`startTime` varchar(8) NOT NULL,
	`endTime` varchar(8) NOT NULL,
	`roomId` int NOT NULL,
	`instructorId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courseSchedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`advisorId` int NOT NULL,
	`studentId` int NOT NULL,
	`courseId` int,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`status` enum('pending','accepted','rejected','completed') NOT NULL DEFAULT 'pending',
	`dueDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studentAchievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`achievementId` int NOT NULL,
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	`progress` int NOT NULL DEFAULT 0,
	`metadata` text,
	CONSTRAINT `studentAchievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studentAssignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`assignmentId` int NOT NULL,
	`status` enum('submitted','graded','overdue','pending') NOT NULL DEFAULT 'pending',
	`score` int,
	`submittedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `studentAssignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `courses` ADD `instructorId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `advisorId` int;--> statement-breakpoint
CREATE INDEX `idx_academicAlerts_advisorId` ON `academicAlerts` (`advisorId`);--> statement-breakpoint
CREATE INDEX `idx_academicAlerts_studentId` ON `academicAlerts` (`studentId`);--> statement-breakpoint
CREATE INDEX `idx_academicAlerts_severity` ON `academicAlerts` (`severity`);--> statement-breakpoint
CREATE INDEX `idx_academicAlerts_isResolved` ON `academicAlerts` (`isResolved`);--> statement-breakpoint
CREATE INDEX `idx_advisorNotes_advisorId` ON `advisorNotes` (`advisorId`);--> statement-breakpoint
CREATE INDEX `idx_advisorNotes_studentId` ON `advisorNotes` (`studentId`);--> statement-breakpoint
CREATE INDEX `idx_advisorNotes_category` ON `advisorNotes` (`category`);--> statement-breakpoint
CREATE INDEX `idx_advisorReports_advisorId` ON `advisorReports` (`advisorId`);--> statement-breakpoint
CREATE INDEX `idx_advisorReports_studentId` ON `advisorReports` (`studentId`);--> statement-breakpoint
CREATE INDEX `idx_appointments_advisorId` ON `appointments` (`advisorId`);--> statement-breakpoint
CREATE INDEX `idx_appointments_studentId` ON `appointments` (`studentId`);--> statement-breakpoint
CREATE INDEX `idx_appointments_scheduledAt` ON `appointments` (`scheduledAt`);--> statement-breakpoint
CREATE INDEX `idx_appointments_status` ON `appointments` (`status`);--> statement-breakpoint
CREATE INDEX `idx_assignments_courseId` ON `assignments` (`courseId`);--> statement-breakpoint
CREATE INDEX `idx_assignments_dueDate` ON `assignments` (`dueDate`);--> statement-breakpoint
CREATE INDEX `idx_attendance_studentId` ON `attendance` (`studentId`);--> statement-breakpoint
CREATE INDEX `idx_attendance_courseId` ON `attendance` (`courseId`);--> statement-breakpoint
CREATE INDEX `idx_attendance_date` ON `attendance` (`date`);--> statement-breakpoint
CREATE INDEX `idx_courseSchedules_courseId` ON `courseSchedules` (`courseId`);--> statement-breakpoint
CREATE INDEX `idx_courseSchedules_dayOfWeek` ON `courseSchedules` (`dayOfWeek`);--> statement-breakpoint
CREATE INDEX `idx_recommendations_advisorId` ON `recommendations` (`advisorId`);--> statement-breakpoint
CREATE INDEX `idx_recommendations_studentId` ON `recommendations` (`studentId`);--> statement-breakpoint
CREATE INDEX `idx_recommendations_status` ON `recommendations` (`status`);--> statement-breakpoint
CREATE INDEX `idx_studentAchievements_studentId` ON `studentAchievements` (`studentId`);--> statement-breakpoint
CREATE INDEX `idx_studentAchievements_achievementId` ON `studentAchievements` (`achievementId`);--> statement-breakpoint
CREATE INDEX `idx_studentAssignments_studentId` ON `studentAssignments` (`studentId`);--> statement-breakpoint
CREATE INDEX `idx_studentAssignments_assignmentId` ON `studentAssignments` (`assignmentId`);--> statement-breakpoint
CREATE INDEX `idx_users_advisorId` ON `users` (`advisorId`);