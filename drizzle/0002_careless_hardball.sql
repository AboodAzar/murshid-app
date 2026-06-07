CREATE TABLE `password_reset_tokens` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`token` varchar(64) NOT NULL,
	`expires_at` bigint NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`used_at` timestamp,
	CONSTRAINT `password_reset_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `password_reset_tokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE INDEX `idx_courses_departmentId` ON `courses` (`departmentId`);--> statement-breakpoint
CREATE INDEX `idx_courses_semester` ON `courses` (`semester`);--> statement-breakpoint
CREATE INDEX `idx_faqs_isActive` ON `faqs` (`isActive`);--> statement-breakpoint
CREATE INDEX `idx_notifications_userId` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_notifications_isRead` ON `notifications` (`isRead`);--> statement-breakpoint
CREATE INDEX `idx_studentCourses_studentId` ON `studentCourses` (`studentId`);--> statement-breakpoint
CREATE INDEX `idx_studentCourses_status` ON `studentCourses` (`status`);--> statement-breakpoint
CREATE INDEX `idx_users_email` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users_role` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `idx_users_departmentId` ON `users` (`departmentId`);