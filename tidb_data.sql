/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: __drizzle_migrations
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `__drizzle_migrations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `hash` text NOT NULL,
  `created_at` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
  /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `id` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin AUTO_INCREMENT = 30001;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: academicAlerts
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `academicAlerts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `advisorId` int NOT NULL,
  `studentId` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `severity` enum('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
  `type` enum(
  'attendance',
  'gpa_drop',
  'missing_assignments',
  'at_risk',
  'probation',
  'custom'
  ) NOT NULL DEFAULT 'custom',
  `isResolved` tinyint(1) NOT NULL DEFAULT '0',
  `resolvedAt` timestamp NULL DEFAULT NULL,
  `resolvedBy` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
  /*T![clustered_index] CLUSTERED */,
  KEY `idx_academicAlerts_advisorId` (`advisorId`),
  KEY `idx_academicAlerts_studentId` (`studentId`),
  KEY `idx_academicAlerts_severity` (`severity`),
  KEY `idx_academicAlerts_isResolved` (`isResolved`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: achievements
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `achievements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key` varchar(64) NOT NULL,
  `title` varchar(255) NOT NULL,
  `titleAr` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `descriptionAr` text NOT NULL,
  `icon` varchar(64) NOT NULL,
  `color` varchar(50) NOT NULL DEFAULT '#3b82f6',
  `conditionType` enum(
  'courses_completed',
  'gpa_reached',
  'attendance_streak',
  'assignments_submitted',
  'credits_earned',
  'semester_completed'
  ) NOT NULL,
  `conditionValue` int NOT NULL DEFAULT '0',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
  /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `achievements_key_unique` (`key`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: advisorNotes
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `advisorNotes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `advisorId` int NOT NULL,
  `studentId` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `category` enum(
  'general',
  'academic',
  'behavioral',
  'career',
  'attendance',
  'gpa'
  ) NOT NULL DEFAULT 'general',
  `isPrivate` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
  /*T![clustered_index] CLUSTERED */,
  KEY `idx_advisorNotes_advisorId` (`advisorId`),
  KEY `idx_advisorNotes_studentId` (`studentId`),
  KEY `idx_advisorNotes_category` (`category`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: advisorReports
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `advisorReports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `advisorId` int NOT NULL,
  `studentId` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `summary` text NOT NULL,
  `gpaAtReport` decimal(3, 2) DEFAULT NULL,
  `creditsAtReport` int DEFAULT NULL,
  `attendanceRateAtReport` decimal(5, 2) DEFAULT NULL,
  `riskLevel` enum('none', 'low', 'medium', 'high') NOT NULL DEFAULT 'none',
  `semester` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
  /*T![clustered_index] CLUSTERED */,
  KEY `idx_advisorReports_advisorId` (`advisorId`),
  KEY `idx_advisorReports_studentId` (`studentId`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: aiConversations
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `aiConversations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `studentId` int NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `context` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
  /*T![clustered_index] CLUSTERED */
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin AUTO_INCREMENT = 210001;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: aiStatistics
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `aiStatistics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `studentId` int DEFAULT NULL,
  `totalConversations` int NOT NULL DEFAULT '0',
  `totalMessages` int NOT NULL DEFAULT '0',
  `totalTokensUsed` int NOT NULL DEFAULT '0',
  `averageResponseTime` int DEFAULT '0',
  `lastUsedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
  /*T![clustered_index] CLUSTERED */
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: announcements
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `announcements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `titleAr` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `contentAr` longtext NOT NULL,
  `createdBy` int NOT NULL,
  `priority` enum('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  `targetRole` enum('student', 'advisor', 'admin', 'all') NOT NULL DEFAULT 'all',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `expiresAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
  /*T![clustered_index] CLUSTERED */
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin AUTO_INCREMENT = 30001;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: appointments
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `appointments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `advisorId` int NOT NULL,
  `studentId` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `scheduledAt` timestamp NOT NULL,
  `durationMinutes` int NOT NULL DEFAULT '30',
  `location` varchar(255) DEFAULT NULL,
  `meetingLink` varchar(500) DEFAULT NULL,
  `status` enum(
  'scheduled',
  'confirmed',
  'completed',
  'cancelled',
  'no_show'
  ) NOT NULL DEFAULT 'scheduled',
  `notes` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
  /*T![clustered_index] CLUSTERED */,
  KEY `idx_appointments_advisorId` (`advisorId`),
  KEY `idx_appointments_studentId` (`studentId`),
  KEY `idx_appointments_scheduledAt` (`scheduledAt`),
  KEY `idx_appointments_status` (`status`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin AUTO_INCREMENT = 30001;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: assignments
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `courseId` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `titleAr` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `descriptionAr` text DEFAULT NULL,
  `dueDate` timestamp NOT NULL,
  `totalPoints` int NOT NULL DEFAULT '100',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
  /*T![clustered_index] CLUSTERED */,
  KEY `idx_assignments_courseId` (`courseId`),
  KEY `idx_assignments_dueDate` (`dueDate`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin AUTO_INCREMENT = 30001;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: attendance
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `studentId` int NOT NULL,
  `courseId` int NOT NULL,
  `scheduleId` int NOT NULL,
  `date` timestamp NOT NULL,
  `status` enum('present', 'absent', 'excused', 'late') NOT NULL DEFAULT 'present',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
  /*T![clustered_index] CLUSTERED */,
  KEY `idx_attendance_studentId` (`studentId`),
  KEY `idx_attendance_courseId` (`courseId`),
  KEY `idx_attendance_date` (`date`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin AUTO_INCREMENT = 60001;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: buildings
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `buildings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `nameAr` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL,
  `latitude` decimal(10, 8) NOT NULL,
  `longitude` decimal(11, 8) NOT NULL,
  `description` text DEFAULT NULL,
  `descriptionAr` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
  /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `buildings_code_unique` (`code`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin AUTO_INCREMENT = 30001;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: chatMessages
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `chatMessages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversationId` int NOT NULL,
  `role` enum('user', 'assistant') NOT NULL,
  `content` longtext NOT NULL,
  `tokens` int DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
  /*T![clustered_index] CLUSTERED */
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin AUTO_INCREMENT = 360001;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: coursePrerequisites
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `coursePrerequisites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `courseId` int NOT NULL,
  `prerequisiteId` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
  /*T![clustered_index] CLUSTERED */
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin AUTO_INCREMENT = 30001;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: courseSchedules
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `courseSchedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `courseId` int NOT NULL,
  `dayOfWeek` int NOT NULL,
  `startTime` varchar(8) NOT NULL,
  `endTime` varchar(8) NOT NULL,
  `roomId` int NOT NULL,
  `instructorId` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
  /*T![clustered_index] CLUSTERED */,
  KEY `idx_courseSchedules_courseId` (`courseId`),
  KEY `idx_courseSchedules_dayOfWeek` (`dayOfWeek`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin AUTO_INCREMENT = 30001;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: courses
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `nameAr` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `descriptionAr` text DEFAULT NULL,
  `credits` int NOT NULL,
  `departmentId` int NOT NULL,
  `minGPA` decimal(3, 2) DEFAULT '0.00',
  `semester` int NOT NULL,
  `isRequired` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `instructorId` int DEFAULT NULL,
  PRIMARY KEY (`id`)
  /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `courses_code_unique` (`code`),
  KEY `idx_courses_departmentId` (`departmentId`),
  KEY `idx_courses_semester` (`semester`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin AUTO_INCREMENT = 30001;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: departments
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `nameAr` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `descriptionAr` text DEFAULT NULL,
  `headId` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
  /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `departments_code_unique` (`code`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin AUTO_INCREMENT = 30001;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: documents
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `fileUrl` varchar(500) NOT NULL,
  `fileKey` varchar(500) NOT NULL,
  `fileType` varchar(50) NOT NULL,
  `uploadedBy` int NOT NULL,
  `content` longtext DEFAULT NULL,
  `category` varchar(100) NOT NULL,
  `isProcessed` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
  /*T![clustered_index] CLUSTERED */
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: email_verification_tokens
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `email_verification_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(10) NOT NULL,
  `expires_at` bigint NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
  /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `id` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin AUTO_INCREMENT = 14060001;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: faqs
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `faqs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question` text NOT NULL,
  `questionAr` text NOT NULL,
  `answer` longtext NOT NULL,
  `answerAr` longtext NOT NULL,
  `category` varchar(100) NOT NULL,
  `categoryAr` varchar(100) NOT NULL,
  `createdBy` int NOT NULL,
  `views` int NOT NULL DEFAULT '0',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
  /*T![clustered_index] CLUSTERED */,
  KEY `idx_faqs_isActive` (`isActive`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin AUTO_INCREMENT = 30001;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: notifications
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `titleAr` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `messageAr` text NOT NULL,
  `type` enum('info', 'warning', 'success', 'error') NOT NULL DEFAULT 'info',
  `relatedId` int DEFAULT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
  /*T![clustered_index] CLUSTERED */,
  KEY `idx_notifications_userId` (`userId`),
  KEY `idx_notifications_isRead` (`isRead`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: password_reset_tokens
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(64) NOT NULL,
  `expires_at` bigint NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `used_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
  /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `password_reset_tokens_token_unique` (`token`),
  UNIQUE KEY `id` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin AUTO_INCREMENT = 30001;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: recommendations
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `recommendations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `advisorId` int NOT NULL,
  `studentId` int NOT NULL,
  `courseId` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `priority` enum('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  `status` enum('pending', 'accepted', 'rejected', 'completed') NOT NULL DEFAULT 'pending',
  `dueDate` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
  /*T![clustered_index] CLUSTERED */,
  KEY `idx_recommendations_advisorId` (`advisorId`),
  KEY `idx_recommendations_studentId` (`studentId`),
  KEY `idx_recommendations_status` (`status`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin AUTO_INCREMENT = 30001;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: rooms
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `buildingId` int NOT NULL,
  `roomNumber` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `nameAr` varchar(255) NOT NULL,
  `capacity` int NOT NULL,
  `type` enum(
  'classroom',
  'lab',
  'lecture_hall',
  'office',
  'other'
  ) NOT NULL DEFAULT 'classroom',
  `floor` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
  /*T![clustered_index] CLUSTERED */
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin AUTO_INCREMENT = 30001;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: studentAchievements
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `studentAchievements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `studentId` int NOT NULL,
  `achievementId` int NOT NULL,
  `unlockedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `progress` int NOT NULL DEFAULT '0',
  `metadata` text DEFAULT NULL,
  PRIMARY KEY (`id`)
  /*T![clustered_index] CLUSTERED */,
  KEY `idx_studentAchievements_studentId` (`studentId`),
  KEY `idx_studentAchievements_achievementId` (`achievementId`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: studentAssignments
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `studentAssignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `studentId` int NOT NULL,
  `assignmentId` int NOT NULL,
  `status` enum('submitted', 'graded', 'overdue', 'pending') NOT NULL DEFAULT 'pending',
  `score` int DEFAULT NULL,
  `submittedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
  /*T![clustered_index] CLUSTERED */,
  KEY `idx_studentAssignments_studentId` (`studentId`),
  KEY `idx_studentAssignments_assignmentId` (`assignmentId`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin AUTO_INCREMENT = 30001;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: studentCourses
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `studentCourses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `studentId` int NOT NULL,
  `courseId` int NOT NULL,
  `semester` int NOT NULL,
  `grade` varchar(2) DEFAULT NULL,
  `gradePoints` decimal(3, 2) DEFAULT NULL,
  `status` enum('completed', 'in_progress', 'planned') NOT NULL DEFAULT 'planned',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
  /*T![clustered_index] CLUSTERED */,
  KEY `idx_studentCourses_studentId` (`studentId`),
  KEY `idx_studentCourses_status` (`status`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin AUTO_INCREMENT = 60001;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: studyPlans
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `studyPlans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `studentId` int NOT NULL,
  `advisorId` int DEFAULT NULL,
  `totalCredits` int NOT NULL,
  `completedCredits` int NOT NULL DEFAULT '0',
  `currentGPA` decimal(3, 2) DEFAULT '0.00',
  `status` enum('active', 'completed', 'on_hold') NOT NULL DEFAULT 'active',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
  /*T![clustered_index] CLUSTERED */
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin AUTO_INCREMENT = 120001;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: users
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `openId` varchar(64) NOT NULL,
  `email` varchar(320) NOT NULL,
  `name` text DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('student', 'advisor', 'admin') NOT NULL DEFAULT 'student',
  `departmentId` int DEFAULT NULL,
  `profilePicture` varchar(500) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `language` enum('en', 'ar') NOT NULL DEFAULT 'en',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `isEmailVerified` tinyint(1) NOT NULL DEFAULT '0',
  `advisorId` int DEFAULT NULL,
  PRIMARY KEY (`id`)
  /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `users_openId_unique` (`openId`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `idx_users_email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_departmentId` (`departmentId`),
  KEY `idx_users_advisorId` (`advisorId`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin AUTO_INCREMENT = 270001;

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: __drizzle_migrations
# ------------------------------------------------------------

INSERT INTO
  `__drizzle_migrations` (`id`, `hash`, `created_at`)
VALUES
  (
    1,
    'b2ba62d710cdddf493918b34e3027d8daafcd82800723f5e9164371bc1740b6b',
    1781037057155
  );
INSERT INTO
  `__drizzle_migrations` (`id`, `hash`, `created_at`)
VALUES
  (
    2,
    '4eed0b26ea462c6c4097333b7b9587209dd09af3deba27498b70116bf982ff69',
    1781037057355
  );
INSERT INTO
  `__drizzle_migrations` (`id`, `hash`, `created_at`)
VALUES
  (
    3,
    '688c9aad208f701959345e7a32bddba44c034ab73b3b9f717064d2a30086f1f9',
    1781037057458
  );
INSERT INTO
  `__drizzle_migrations` (`id`, `hash`, `created_at`)
VALUES
  (
    4,
    '2b62f5d5479d60247e8cdff8c81497c146cc942b5f9f2a43d7dc93baeafa25e0',
    1781037057528
  );
INSERT INTO
  `__drizzle_migrations` (`id`, `hash`, `created_at`)
VALUES
  (
    5,
    '07062bf7f5099ce2e64a2ba6ee51d74f5faf28aa884853485611a94eda08629f',
    1781037057600
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: academicAlerts
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: achievements
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: advisorNotes
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: advisorReports
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: aiConversations
# ------------------------------------------------------------

INSERT INTO
  `aiConversations` (
    `id`,
    `studentId`,
    `title`,
    `context`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1,
    1,
    'Conversation 6/7/2026',
    NULL,
    '2026-06-07 16:53:35',
    '2026-06-07 16:53:35'
  );
INSERT INTO
  `aiConversations` (
    `id`,
    `studentId`,
    `title`,
    `context`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30001,
    30003,
    'Conversation 6/7/2026',
    NULL,
    '2026-06-07 18:01:14',
    '2026-06-07 18:01:14'
  );
INSERT INTO
  `aiConversations` (
    `id`,
    `studentId`,
    `title`,
    `context`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30002,
    30003,
    'Conversation 6/7/2026',
    NULL,
    '2026-06-07 18:01:14',
    '2026-06-07 18:01:14'
  );
INSERT INTO
  `aiConversations` (
    `id`,
    `studentId`,
    `title`,
    `context`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30003,
    30003,
    'Conversation 6/7/2026',
    NULL,
    '2026-06-07 18:01:15',
    '2026-06-07 18:01:15'
  );
INSERT INTO
  `aiConversations` (
    `id`,
    `studentId`,
    `title`,
    `context`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30004,
    30002,
    'Conversation 6/7/2026',
    NULL,
    '2026-06-07 19:03:38',
    '2026-06-07 19:03:38'
  );
INSERT INTO
  `aiConversations` (
    `id`,
    `studentId`,
    `title`,
    `context`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30005,
    30001,
    'محادثة 6/7/2026',
    NULL,
    '2026-06-07 19:20:41',
    '2026-06-07 19:20:41'
  );
INSERT INTO
  `aiConversations` (
    `id`,
    `studentId`,
    `title`,
    `context`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    60001,
    30001,
    'Conversation 6/9/2026',
    NULL,
    '2026-06-09 03:36:53',
    '2026-06-09 03:36:53'
  );
INSERT INTO
  `aiConversations` (
    `id`,
    `studentId`,
    `title`,
    `context`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    90001,
    30001,
    'Conversation 6/9/2026',
    NULL,
    '2026-06-09 07:27:52',
    '2026-06-09 07:27:52'
  );
INSERT INTO
  `aiConversations` (
    `id`,
    `studentId`,
    `title`,
    `context`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    120001,
    180002,
    'New Conversation',
    NULL,
    '2026-06-09 21:17:32',
    '2026-06-09 21:17:32'
  );
INSERT INTO
  `aiConversations` (
    `id`,
    `studentId`,
    `title`,
    `context`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    120002,
    180002,
    'New Conversation',
    NULL,
    '2026-06-09 21:25:15',
    '2026-06-09 21:25:15'
  );
INSERT INTO
  `aiConversations` (
    `id`,
    `studentId`,
    `title`,
    `context`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    150001,
    30001,
    'Conversation 6/10/2026',
    NULL,
    '2026-06-09 22:11:48',
    '2026-06-09 22:11:48'
  );
INSERT INTO
  `aiConversations` (
    `id`,
    `studentId`,
    `title`,
    `context`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    180001,
    240002,
    'Conversation 6/10/2026',
    NULL,
    '2026-06-10 00:33:52',
    '2026-06-10 00:33:52'
  );
INSERT INTO
  `aiConversations` (
    `id`,
    `studentId`,
    `title`,
    `context`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    180002,
    240002,
    'Conversation 6/10/2026',
    NULL,
    '2026-06-10 00:33:53',
    '2026-06-10 00:33:53'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: aiStatistics
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: announcements
# ------------------------------------------------------------

INSERT INTO
  `announcements` (
    `id`,
    `title`,
    `titleAr`,
    `content`,
    `contentAr`,
    `createdBy`,
    `priority`,
    `targetRole`,
    `isActive`,
    `expiresAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1,
    'Welcome to Murshid!',
    'أهلا في مرشد!',
    'Welcome to the new era of communication!',
    'أهلا بالعصر الجديد للتواصل!',
    1,
    'medium',
    'all',
    1,
    NULL,
    '2026-06-07 18:06:09',
    '2026-06-07 18:06:09'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: appointments
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: assignments
# ------------------------------------------------------------

INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    161,
    33,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:04:47',
    100,
    '2026-06-10 00:04:47',
    '2026-06-10 00:04:47'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    162,
    33,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:04:47',
    100,
    '2026-06-10 00:04:47',
    '2026-06-10 00:04:47'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    163,
    33,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:04:48',
    100,
    '2026-06-10 00:04:47',
    '2026-06-10 00:04:47'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    164,
    33,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:04:48',
    100,
    '2026-06-10 00:04:47',
    '2026-06-10 00:04:47'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    165,
    33,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:04:48',
    100,
    '2026-06-10 00:04:47',
    '2026-06-10 00:04:47'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    166,
    34,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:04:48',
    100,
    '2026-06-10 00:04:47',
    '2026-06-10 00:04:47'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    167,
    34,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:04:48',
    100,
    '2026-06-10 00:04:48',
    '2026-06-10 00:04:48'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    168,
    34,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:04:48',
    100,
    '2026-06-10 00:04:48',
    '2026-06-10 00:04:48'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    169,
    34,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:04:48',
    100,
    '2026-06-10 00:04:48',
    '2026-06-10 00:04:48'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    170,
    34,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:04:48',
    100,
    '2026-06-10 00:04:48',
    '2026-06-10 00:04:48'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    171,
    35,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:04:49',
    100,
    '2026-06-10 00:04:48',
    '2026-06-10 00:04:48'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    172,
    35,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:04:49',
    100,
    '2026-06-10 00:04:48',
    '2026-06-10 00:04:48'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    173,
    35,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:04:49',
    100,
    '2026-06-10 00:04:48',
    '2026-06-10 00:04:48'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    174,
    35,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:04:49',
    100,
    '2026-06-10 00:04:48',
    '2026-06-10 00:04:48'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    175,
    35,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:04:49',
    100,
    '2026-06-10 00:04:48',
    '2026-06-10 00:04:48'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    176,
    36,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:04:49',
    100,
    '2026-06-10 00:04:49',
    '2026-06-10 00:04:49'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    177,
    36,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:04:49',
    100,
    '2026-06-10 00:04:49',
    '2026-06-10 00:04:49'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    178,
    36,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:04:49',
    100,
    '2026-06-10 00:04:49',
    '2026-06-10 00:04:49'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    179,
    36,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:04:49',
    100,
    '2026-06-10 00:04:49',
    '2026-06-10 00:04:49'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    180,
    36,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:04:49',
    100,
    '2026-06-10 00:04:49',
    '2026-06-10 00:04:49'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    181,
    37,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:04:50',
    100,
    '2026-06-10 00:04:49',
    '2026-06-10 00:04:49'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    182,
    37,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:04:50',
    100,
    '2026-06-10 00:04:49',
    '2026-06-10 00:04:49'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    183,
    37,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:04:50',
    100,
    '2026-06-10 00:04:49',
    '2026-06-10 00:04:49'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    184,
    37,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:04:50',
    100,
    '2026-06-10 00:04:49',
    '2026-06-10 00:04:49'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    185,
    37,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:04:50',
    100,
    '2026-06-10 00:04:49',
    '2026-06-10 00:04:49'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    186,
    38,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:04:50',
    100,
    '2026-06-10 00:04:50',
    '2026-06-10 00:04:50'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    187,
    38,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:04:50',
    100,
    '2026-06-10 00:04:50',
    '2026-06-10 00:04:50'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    188,
    38,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:04:50',
    100,
    '2026-06-10 00:04:50',
    '2026-06-10 00:04:50'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    189,
    38,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:04:50',
    100,
    '2026-06-10 00:04:50',
    '2026-06-10 00:04:50'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    190,
    38,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:04:50',
    100,
    '2026-06-10 00:04:50',
    '2026-06-10 00:04:50'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    191,
    39,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:04:51',
    100,
    '2026-06-10 00:04:50',
    '2026-06-10 00:04:50'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    192,
    39,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:04:51',
    100,
    '2026-06-10 00:04:50',
    '2026-06-10 00:04:50'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    193,
    39,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:04:51',
    100,
    '2026-06-10 00:04:50',
    '2026-06-10 00:04:50'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    194,
    39,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:04:51',
    100,
    '2026-06-10 00:04:50',
    '2026-06-10 00:04:50'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    195,
    39,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:04:51',
    100,
    '2026-06-10 00:04:50',
    '2026-06-10 00:04:50'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    196,
    40,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:04:51',
    100,
    '2026-06-10 00:04:50',
    '2026-06-10 00:04:50'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    197,
    40,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:04:51',
    100,
    '2026-06-10 00:04:50',
    '2026-06-10 00:04:50'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    198,
    40,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:04:51',
    100,
    '2026-06-10 00:04:50',
    '2026-06-10 00:04:50'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    199,
    40,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:04:51',
    100,
    '2026-06-10 00:04:51',
    '2026-06-10 00:04:51'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    200,
    40,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:04:51',
    100,
    '2026-06-10 00:04:51',
    '2026-06-10 00:04:51'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    201,
    41,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:04:51',
    100,
    '2026-06-10 00:04:51',
    '2026-06-10 00:04:51'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    202,
    41,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:04:51',
    100,
    '2026-06-10 00:04:51',
    '2026-06-10 00:04:51'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    203,
    41,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:04:51',
    100,
    '2026-06-10 00:04:51',
    '2026-06-10 00:04:51'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    204,
    41,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:04:51',
    100,
    '2026-06-10 00:04:51',
    '2026-06-10 00:04:51'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    205,
    41,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:04:52',
    100,
    '2026-06-10 00:04:51',
    '2026-06-10 00:04:51'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    206,
    42,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:04:52',
    100,
    '2026-06-10 00:04:51',
    '2026-06-10 00:04:51'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    207,
    42,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:04:52',
    100,
    '2026-06-10 00:04:51',
    '2026-06-10 00:04:51'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    208,
    42,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:04:52',
    100,
    '2026-06-10 00:04:51',
    '2026-06-10 00:04:51'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    209,
    42,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:04:52',
    100,
    '2026-06-10 00:04:51',
    '2026-06-10 00:04:51'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    210,
    42,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:04:52',
    100,
    '2026-06-10 00:04:51',
    '2026-06-10 00:04:51'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    211,
    43,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:04:52',
    100,
    '2026-06-10 00:04:51',
    '2026-06-10 00:04:51'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    212,
    43,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:04:52',
    100,
    '2026-06-10 00:04:51',
    '2026-06-10 00:04:51'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    213,
    43,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:04:52',
    100,
    '2026-06-10 00:04:51',
    '2026-06-10 00:04:51'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    214,
    43,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:04:52',
    100,
    '2026-06-10 00:04:52',
    '2026-06-10 00:04:52'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    215,
    43,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:04:52',
    100,
    '2026-06-10 00:04:52',
    '2026-06-10 00:04:52'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    216,
    44,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:04:52',
    100,
    '2026-06-10 00:04:52',
    '2026-06-10 00:04:52'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    217,
    44,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:04:52',
    100,
    '2026-06-10 00:04:52',
    '2026-06-10 00:04:52'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    218,
    44,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:04:52',
    100,
    '2026-06-10 00:04:52',
    '2026-06-10 00:04:52'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    219,
    44,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:04:52',
    100,
    '2026-06-10 00:04:52',
    '2026-06-10 00:04:52'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    220,
    44,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:04:53',
    100,
    '2026-06-10 00:04:52',
    '2026-06-10 00:04:52'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    221,
    45,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:04:53',
    100,
    '2026-06-10 00:04:52',
    '2026-06-10 00:04:52'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    222,
    45,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:04:53',
    100,
    '2026-06-10 00:04:52',
    '2026-06-10 00:04:52'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    223,
    45,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:04:53',
    100,
    '2026-06-10 00:04:52',
    '2026-06-10 00:04:52'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    224,
    45,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:04:53',
    100,
    '2026-06-10 00:04:52',
    '2026-06-10 00:04:52'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    225,
    45,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:04:53',
    100,
    '2026-06-10 00:04:52',
    '2026-06-10 00:04:52'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    226,
    46,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:04:53',
    100,
    '2026-06-10 00:04:53',
    '2026-06-10 00:04:53'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    227,
    46,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:04:53',
    100,
    '2026-06-10 00:04:53',
    '2026-06-10 00:04:53'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    228,
    46,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:04:53',
    100,
    '2026-06-10 00:04:53',
    '2026-06-10 00:04:53'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    229,
    46,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:04:53',
    100,
    '2026-06-10 00:04:53',
    '2026-06-10 00:04:53'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    230,
    46,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:04:54',
    100,
    '2026-06-10 00:04:53',
    '2026-06-10 00:04:53'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    231,
    47,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:04:54',
    100,
    '2026-06-10 00:04:53',
    '2026-06-10 00:04:53'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    232,
    47,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:04:54',
    100,
    '2026-06-10 00:04:53',
    '2026-06-10 00:04:53'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    233,
    47,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:04:54',
    100,
    '2026-06-10 00:04:53',
    '2026-06-10 00:04:53'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    234,
    47,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:04:54',
    100,
    '2026-06-10 00:04:54',
    '2026-06-10 00:04:54'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    235,
    47,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:04:54',
    100,
    '2026-06-10 00:04:54',
    '2026-06-10 00:04:54'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    236,
    48,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:04:54',
    100,
    '2026-06-10 00:04:54',
    '2026-06-10 00:04:54'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    237,
    48,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:04:55',
    100,
    '2026-06-10 00:04:54',
    '2026-06-10 00:04:54'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    238,
    48,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:04:55',
    100,
    '2026-06-10 00:04:54',
    '2026-06-10 00:04:54'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    239,
    48,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:04:55',
    100,
    '2026-06-10 00:04:54',
    '2026-06-10 00:04:54'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    240,
    48,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:04:55',
    100,
    '2026-06-10 00:04:54',
    '2026-06-10 00:04:54'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    241,
    49,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:04:55',
    100,
    '2026-06-10 00:04:54',
    '2026-06-10 00:04:54'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    242,
    49,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:04:55',
    100,
    '2026-06-10 00:04:55',
    '2026-06-10 00:04:55'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    243,
    49,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:04:55',
    100,
    '2026-06-10 00:04:55',
    '2026-06-10 00:04:55'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    244,
    49,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:04:55',
    100,
    '2026-06-10 00:04:55',
    '2026-06-10 00:04:55'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    245,
    49,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:04:56',
    100,
    '2026-06-10 00:04:55',
    '2026-06-10 00:04:55'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    246,
    50,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:04:56',
    100,
    '2026-06-10 00:04:55',
    '2026-06-10 00:04:55'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    247,
    50,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:04:56',
    100,
    '2026-06-10 00:04:55',
    '2026-06-10 00:04:55'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    248,
    50,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:04:56',
    100,
    '2026-06-10 00:04:55',
    '2026-06-10 00:04:55'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    249,
    50,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:04:56',
    100,
    '2026-06-10 00:04:55',
    '2026-06-10 00:04:55'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    250,
    50,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:04:56',
    100,
    '2026-06-10 00:04:55',
    '2026-06-10 00:04:55'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    251,
    51,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:04:56',
    100,
    '2026-06-10 00:04:56',
    '2026-06-10 00:04:56'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    252,
    51,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:04:56',
    100,
    '2026-06-10 00:04:56',
    '2026-06-10 00:04:56'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    253,
    51,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:04:56',
    100,
    '2026-06-10 00:04:56',
    '2026-06-10 00:04:56'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    254,
    51,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:04:56',
    100,
    '2026-06-10 00:04:56',
    '2026-06-10 00:04:56'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    255,
    51,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:04:57',
    100,
    '2026-06-10 00:04:56',
    '2026-06-10 00:04:56'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    256,
    52,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:04:57',
    100,
    '2026-06-10 00:04:56',
    '2026-06-10 00:04:56'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    257,
    52,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:04:57',
    100,
    '2026-06-10 00:04:56',
    '2026-06-10 00:04:56'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    258,
    52,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:04:57',
    100,
    '2026-06-10 00:04:56',
    '2026-06-10 00:04:56'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    259,
    52,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:04:57',
    100,
    '2026-06-10 00:04:56',
    '2026-06-10 00:04:56'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    260,
    52,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:04:57',
    100,
    '2026-06-10 00:04:56',
    '2026-06-10 00:04:56'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    261,
    53,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:04:57',
    100,
    '2026-06-10 00:04:56',
    '2026-06-10 00:04:56'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    262,
    53,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:04:57',
    100,
    '2026-06-10 00:04:56',
    '2026-06-10 00:04:56'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    263,
    53,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:04:57',
    100,
    '2026-06-10 00:04:57',
    '2026-06-10 00:04:57'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    264,
    53,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:04:57',
    100,
    '2026-06-10 00:04:57',
    '2026-06-10 00:04:57'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    265,
    53,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:04:57',
    100,
    '2026-06-10 00:04:57',
    '2026-06-10 00:04:57'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    266,
    54,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:04:57',
    100,
    '2026-06-10 00:04:57',
    '2026-06-10 00:04:57'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    267,
    54,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:04:57',
    100,
    '2026-06-10 00:04:57',
    '2026-06-10 00:04:57'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    268,
    54,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:04:57',
    100,
    '2026-06-10 00:04:57',
    '2026-06-10 00:04:57'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    269,
    54,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:04:57',
    100,
    '2026-06-10 00:04:57',
    '2026-06-10 00:04:57'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    270,
    54,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:04:58',
    100,
    '2026-06-10 00:04:57',
    '2026-06-10 00:04:57'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    271,
    55,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:04:58',
    100,
    '2026-06-10 00:04:57',
    '2026-06-10 00:04:57'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    272,
    55,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:04:58',
    100,
    '2026-06-10 00:04:57',
    '2026-06-10 00:04:57'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    273,
    55,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:04:58',
    100,
    '2026-06-10 00:04:57',
    '2026-06-10 00:04:57'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    274,
    55,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:04:58',
    100,
    '2026-06-10 00:04:57',
    '2026-06-10 00:04:57'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    275,
    55,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:04:58',
    100,
    '2026-06-10 00:04:57',
    '2026-06-10 00:04:57'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    276,
    56,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:04:58',
    100,
    '2026-06-10 00:04:57',
    '2026-06-10 00:04:57'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    277,
    56,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:04:58',
    100,
    '2026-06-10 00:04:57',
    '2026-06-10 00:04:57'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    278,
    56,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:04:58',
    100,
    '2026-06-10 00:04:57',
    '2026-06-10 00:04:57'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    279,
    56,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:04:58',
    100,
    '2026-06-10 00:04:58',
    '2026-06-10 00:04:58'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    280,
    56,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:04:58',
    100,
    '2026-06-10 00:04:58',
    '2026-06-10 00:04:58'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    281,
    57,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:04:58',
    100,
    '2026-06-10 00:04:58',
    '2026-06-10 00:04:58'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    282,
    57,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:04:58',
    100,
    '2026-06-10 00:04:58',
    '2026-06-10 00:04:58'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    283,
    57,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:04:58',
    100,
    '2026-06-10 00:04:58',
    '2026-06-10 00:04:58'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    284,
    57,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:04:58',
    100,
    '2026-06-10 00:04:58',
    '2026-06-10 00:04:58'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    285,
    57,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:04:59',
    100,
    '2026-06-10 00:04:58',
    '2026-06-10 00:04:58'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    286,
    58,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:04:59',
    100,
    '2026-06-10 00:04:58',
    '2026-06-10 00:04:58'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    287,
    58,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:04:59',
    100,
    '2026-06-10 00:04:58',
    '2026-06-10 00:04:58'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    288,
    58,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:04:59',
    100,
    '2026-06-10 00:04:58',
    '2026-06-10 00:04:58'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    289,
    58,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:04:59',
    100,
    '2026-06-10 00:04:58',
    '2026-06-10 00:04:58'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    290,
    58,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:04:59',
    100,
    '2026-06-10 00:04:58',
    '2026-06-10 00:04:58'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    291,
    59,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:04:59',
    100,
    '2026-06-10 00:04:58',
    '2026-06-10 00:04:58'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    292,
    59,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:04:59',
    100,
    '2026-06-10 00:04:58',
    '2026-06-10 00:04:58'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    293,
    59,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:04:59',
    100,
    '2026-06-10 00:04:59',
    '2026-06-10 00:04:59'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    294,
    59,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:04:59',
    100,
    '2026-06-10 00:04:59',
    '2026-06-10 00:04:59'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    295,
    59,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:04:59',
    100,
    '2026-06-10 00:04:59',
    '2026-06-10 00:04:59'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    296,
    60,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:04:59',
    100,
    '2026-06-10 00:04:59',
    '2026-06-10 00:04:59'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    297,
    60,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:04:59',
    100,
    '2026-06-10 00:04:59',
    '2026-06-10 00:04:59'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    298,
    60,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:04:59',
    100,
    '2026-06-10 00:04:59',
    '2026-06-10 00:04:59'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    299,
    60,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:05:00',
    100,
    '2026-06-10 00:04:59',
    '2026-06-10 00:04:59'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    300,
    60,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:05:00',
    100,
    '2026-06-10 00:04:59',
    '2026-06-10 00:04:59'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    301,
    61,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:05:00',
    100,
    '2026-06-10 00:04:59',
    '2026-06-10 00:04:59'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    302,
    61,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:05:00',
    100,
    '2026-06-10 00:04:59',
    '2026-06-10 00:04:59'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    303,
    61,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:05:00',
    100,
    '2026-06-10 00:04:59',
    '2026-06-10 00:04:59'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    304,
    61,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:05:00',
    100,
    '2026-06-10 00:04:59',
    '2026-06-10 00:04:59'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    305,
    61,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:05:00',
    100,
    '2026-06-10 00:04:59',
    '2026-06-10 00:04:59'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    306,
    62,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:05:00',
    100,
    '2026-06-10 00:04:59',
    '2026-06-10 00:04:59'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    307,
    62,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:05:00',
    100,
    '2026-06-10 00:04:59',
    '2026-06-10 00:04:59'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    308,
    62,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:05:00',
    100,
    '2026-06-10 00:05:00',
    '2026-06-10 00:05:00'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    309,
    62,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:05:00',
    100,
    '2026-06-10 00:05:00',
    '2026-06-10 00:05:00'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    310,
    62,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:05:00',
    100,
    '2026-06-10 00:05:00',
    '2026-06-10 00:05:00'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    311,
    63,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:05:00',
    100,
    '2026-06-10 00:05:00',
    '2026-06-10 00:05:00'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    312,
    63,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:05:00',
    100,
    '2026-06-10 00:05:00',
    '2026-06-10 00:05:00'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    313,
    63,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:05:00',
    100,
    '2026-06-10 00:05:00',
    '2026-06-10 00:05:00'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    314,
    63,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:05:01',
    100,
    '2026-06-10 00:05:00',
    '2026-06-10 00:05:00'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    315,
    63,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:05:01',
    100,
    '2026-06-10 00:05:00',
    '2026-06-10 00:05:00'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    316,
    64,
    'Assignment 1',
    'واجب 1',
    NULL,
    NULL,
    '2026-06-08 03:05:01',
    100,
    '2026-06-10 00:05:00',
    '2026-06-10 00:05:00'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    317,
    64,
    'Assignment 2',
    'واجب 2',
    NULL,
    NULL,
    '2026-06-15 03:05:01',
    100,
    '2026-06-10 00:05:00',
    '2026-06-10 00:05:00'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    318,
    64,
    'Midterm Project',
    'مشروع منتصف الفصل',
    NULL,
    NULL,
    '2026-06-24 03:05:01',
    100,
    '2026-06-10 00:05:00',
    '2026-06-10 00:05:00'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    319,
    64,
    'Lab Report',
    'تقرير المختبر',
    NULL,
    NULL,
    '2026-06-17 03:05:01',
    100,
    '2026-06-10 00:05:00',
    '2026-06-10 00:05:00'
  );
INSERT INTO
  `assignments` (
    `id`,
    `courseId`,
    `title`,
    `titleAr`,
    `description`,
    `descriptionAr`,
    `dueDate`,
    `totalPoints`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    320,
    64,
    'Research Paper',
    'ورقة بحثية',
    NULL,
    NULL,
    '2026-07-01 03:05:01',
    100,
    '2026-06-10 00:05:01',
    '2026-06-10 00:05:01'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: attendance
# ------------------------------------------------------------

INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1,
    210027,
    33,
    33,
    '2026-06-10 03:05:49',
    'present',
    '2026-06-10 00:05:48',
    '2026-06-10 00:05:48'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    2,
    210027,
    33,
    33,
    '2026-06-08 03:05:49',
    'present',
    '2026-06-10 00:05:48',
    '2026-06-10 00:05:48'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    3,
    210027,
    33,
    33,
    '2026-06-06 03:05:49',
    'absent',
    '2026-06-10 00:05:48',
    '2026-06-10 00:05:48'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    4,
    210027,
    33,
    33,
    '2026-06-04 03:05:49',
    'present',
    '2026-06-10 00:05:49',
    '2026-06-10 00:05:49'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    5,
    210027,
    33,
    33,
    '2026-06-02 03:05:49',
    'late',
    '2026-06-10 00:05:49',
    '2026-06-10 00:05:49'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    6,
    210027,
    33,
    33,
    '2026-05-31 03:05:49',
    'present',
    '2026-06-10 00:05:49',
    '2026-06-10 00:05:49'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    7,
    210027,
    33,
    33,
    '2026-05-29 03:05:49',
    'excused',
    '2026-06-10 00:05:49',
    '2026-06-10 00:05:49'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    8,
    210027,
    33,
    33,
    '2026-05-27 03:05:50',
    'present',
    '2026-06-10 00:05:49',
    '2026-06-10 00:05:49'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    9,
    210027,
    33,
    33,
    '2026-05-25 03:05:50',
    'absent',
    '2026-06-10 00:05:49',
    '2026-06-10 00:05:49'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    10,
    210027,
    33,
    33,
    '2026-05-23 03:05:50',
    'present',
    '2026-06-10 00:05:49',
    '2026-06-10 00:05:49'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    11,
    210027,
    33,
    33,
    '2026-05-21 03:05:50',
    'present',
    '2026-06-10 00:05:49',
    '2026-06-10 00:05:49'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    12,
    210027,
    33,
    33,
    '2026-05-19 03:05:50',
    'absent',
    '2026-06-10 00:05:49',
    '2026-06-10 00:05:49'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    13,
    210027,
    33,
    33,
    '2026-05-17 03:05:50',
    'present',
    '2026-06-10 00:05:49',
    '2026-06-10 00:05:49'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    14,
    210027,
    33,
    33,
    '2026-05-15 03:05:50',
    'late',
    '2026-06-10 00:05:50',
    '2026-06-10 00:05:50'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    15,
    210027,
    33,
    33,
    '2026-05-13 03:05:50',
    'present',
    '2026-06-10 00:05:50',
    '2026-06-10 00:05:50'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    16,
    210027,
    33,
    33,
    '2026-05-11 03:05:50',
    'excused',
    '2026-06-10 00:05:50',
    '2026-06-10 00:05:50'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    17,
    210027,
    33,
    33,
    '2026-05-09 03:05:51',
    'present',
    '2026-06-10 00:05:50',
    '2026-06-10 00:05:50'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    18,
    210027,
    33,
    33,
    '2026-05-07 03:05:51',
    'absent',
    '2026-06-10 00:05:50',
    '2026-06-10 00:05:50'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    19,
    210027,
    33,
    33,
    '2026-05-05 03:05:51',
    'present',
    '2026-06-10 00:05:50',
    '2026-06-10 00:05:50'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    20,
    210027,
    33,
    33,
    '2026-05-03 03:05:51',
    'present',
    '2026-06-10 00:05:50',
    '2026-06-10 00:05:50'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    21,
    210027,
    34,
    34,
    '2026-06-10 03:05:51',
    'present',
    '2026-06-10 00:05:51',
    '2026-06-10 00:05:51'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    22,
    210027,
    34,
    34,
    '2026-06-08 03:05:51',
    'present',
    '2026-06-10 00:05:51',
    '2026-06-10 00:05:51'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    23,
    210027,
    34,
    34,
    '2026-06-06 03:05:51',
    'absent',
    '2026-06-10 00:05:51',
    '2026-06-10 00:05:51'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    24,
    210027,
    34,
    34,
    '2026-06-04 03:05:52',
    'present',
    '2026-06-10 00:05:51',
    '2026-06-10 00:05:51'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    25,
    210027,
    34,
    34,
    '2026-06-02 03:05:52',
    'late',
    '2026-06-10 00:05:51',
    '2026-06-10 00:05:51'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    26,
    210027,
    34,
    34,
    '2026-05-31 03:05:52',
    'present',
    '2026-06-10 00:05:51',
    '2026-06-10 00:05:51'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    27,
    210027,
    34,
    34,
    '2026-05-29 03:05:52',
    'excused',
    '2026-06-10 00:05:51',
    '2026-06-10 00:05:51'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    28,
    210027,
    34,
    34,
    '2026-05-27 03:05:52',
    'present',
    '2026-06-10 00:05:51',
    '2026-06-10 00:05:51'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    29,
    210027,
    34,
    34,
    '2026-05-25 03:05:52',
    'absent',
    '2026-06-10 00:05:51',
    '2026-06-10 00:05:51'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30,
    210027,
    34,
    34,
    '2026-05-23 03:05:52',
    'present',
    '2026-06-10 00:05:52',
    '2026-06-10 00:05:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    31,
    210027,
    34,
    34,
    '2026-05-21 03:05:52',
    'present',
    '2026-06-10 00:05:52',
    '2026-06-10 00:05:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    32,
    210027,
    34,
    34,
    '2026-05-19 03:05:52',
    'absent',
    '2026-06-10 00:05:52',
    '2026-06-10 00:05:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    33,
    210027,
    34,
    34,
    '2026-05-17 03:05:52',
    'present',
    '2026-06-10 00:05:52',
    '2026-06-10 00:05:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    34,
    210027,
    34,
    34,
    '2026-05-15 03:05:53',
    'late',
    '2026-06-10 00:05:52',
    '2026-06-10 00:05:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    35,
    210027,
    34,
    34,
    '2026-05-13 03:05:53',
    'present',
    '2026-06-10 00:05:52',
    '2026-06-10 00:05:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    36,
    210027,
    34,
    34,
    '2026-05-11 03:05:53',
    'excused',
    '2026-06-10 00:05:52',
    '2026-06-10 00:05:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    37,
    210027,
    34,
    34,
    '2026-05-09 03:05:53',
    'present',
    '2026-06-10 00:05:52',
    '2026-06-10 00:05:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    38,
    210027,
    34,
    34,
    '2026-05-07 03:05:53',
    'absent',
    '2026-06-10 00:05:52',
    '2026-06-10 00:05:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    39,
    210027,
    34,
    34,
    '2026-05-05 03:05:53',
    'present',
    '2026-06-10 00:05:52',
    '2026-06-10 00:05:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    40,
    210027,
    34,
    34,
    '2026-05-03 03:05:53',
    'present',
    '2026-06-10 00:05:53',
    '2026-06-10 00:05:53'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    41,
    210027,
    35,
    35,
    '2026-06-10 03:05:53',
    'present',
    '2026-06-10 00:05:53',
    '2026-06-10 00:05:53'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    42,
    210027,
    35,
    35,
    '2026-06-08 03:05:53',
    'present',
    '2026-06-10 00:05:53',
    '2026-06-10 00:05:53'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    43,
    210027,
    35,
    35,
    '2026-06-06 03:05:53',
    'absent',
    '2026-06-10 00:05:53',
    '2026-06-10 00:05:53'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    44,
    210027,
    35,
    35,
    '2026-06-04 03:05:54',
    'present',
    '2026-06-10 00:05:53',
    '2026-06-10 00:05:53'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    45,
    210027,
    35,
    35,
    '2026-06-02 03:05:54',
    'late',
    '2026-06-10 00:05:53',
    '2026-06-10 00:05:53'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    46,
    210027,
    35,
    35,
    '2026-05-31 03:05:54',
    'present',
    '2026-06-10 00:05:53',
    '2026-06-10 00:05:53'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    47,
    210027,
    35,
    35,
    '2026-05-29 03:05:54',
    'excused',
    '2026-06-10 00:05:53',
    '2026-06-10 00:05:53'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    48,
    210027,
    35,
    35,
    '2026-05-27 03:05:54',
    'present',
    '2026-06-10 00:05:53',
    '2026-06-10 00:05:53'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    49,
    210027,
    35,
    35,
    '2026-05-25 03:05:54',
    'absent',
    '2026-06-10 00:05:54',
    '2026-06-10 00:05:54'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    50,
    210027,
    35,
    35,
    '2026-05-23 03:05:54',
    'present',
    '2026-06-10 00:05:54',
    '2026-06-10 00:05:54'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    51,
    210027,
    35,
    35,
    '2026-05-21 03:05:54',
    'present',
    '2026-06-10 00:05:54',
    '2026-06-10 00:05:54'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    52,
    210027,
    35,
    35,
    '2026-05-19 03:05:54',
    'absent',
    '2026-06-10 00:05:54',
    '2026-06-10 00:05:54'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    53,
    210027,
    35,
    35,
    '2026-05-17 03:05:55',
    'present',
    '2026-06-10 00:05:54',
    '2026-06-10 00:05:54'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    54,
    210027,
    35,
    35,
    '2026-05-15 03:05:55',
    'late',
    '2026-06-10 00:05:54',
    '2026-06-10 00:05:54'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    55,
    210027,
    35,
    35,
    '2026-05-13 03:05:55',
    'present',
    '2026-06-10 00:05:54',
    '2026-06-10 00:05:54'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    56,
    210027,
    35,
    35,
    '2026-05-11 03:05:55',
    'excused',
    '2026-06-10 00:05:54',
    '2026-06-10 00:05:54'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    57,
    210027,
    35,
    35,
    '2026-05-09 03:05:55',
    'present',
    '2026-06-10 00:05:54',
    '2026-06-10 00:05:54'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    58,
    210027,
    35,
    35,
    '2026-05-07 03:05:55',
    'absent',
    '2026-06-10 00:05:54',
    '2026-06-10 00:05:54'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    59,
    210027,
    35,
    35,
    '2026-05-05 03:05:55',
    'present',
    '2026-06-10 00:05:55',
    '2026-06-10 00:05:55'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    60,
    210027,
    35,
    35,
    '2026-05-03 03:05:55',
    'present',
    '2026-06-10 00:05:55',
    '2026-06-10 00:05:55'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    61,
    210027,
    36,
    36,
    '2026-06-10 03:05:55',
    'present',
    '2026-06-10 00:05:55',
    '2026-06-10 00:05:55'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    62,
    210027,
    36,
    36,
    '2026-06-08 03:05:56',
    'present',
    '2026-06-10 00:05:55',
    '2026-06-10 00:05:55'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    63,
    210027,
    36,
    36,
    '2026-06-06 03:05:56',
    'absent',
    '2026-06-10 00:05:55',
    '2026-06-10 00:05:55'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    64,
    210027,
    36,
    36,
    '2026-06-04 03:05:56',
    'present',
    '2026-06-10 00:05:55',
    '2026-06-10 00:05:55'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    65,
    210027,
    36,
    36,
    '2026-06-02 03:05:56',
    'late',
    '2026-06-10 00:05:55',
    '2026-06-10 00:05:55'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    66,
    210027,
    36,
    36,
    '2026-05-31 03:05:56',
    'present',
    '2026-06-10 00:05:55',
    '2026-06-10 00:05:55'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    67,
    210027,
    36,
    36,
    '2026-05-29 03:05:56',
    'excused',
    '2026-06-10 00:05:55',
    '2026-06-10 00:05:55'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    68,
    210027,
    36,
    36,
    '2026-05-27 03:05:56',
    'present',
    '2026-06-10 00:05:56',
    '2026-06-10 00:05:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    69,
    210027,
    36,
    36,
    '2026-05-25 03:05:56',
    'absent',
    '2026-06-10 00:05:56',
    '2026-06-10 00:05:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    70,
    210027,
    36,
    36,
    '2026-05-23 03:05:56',
    'present',
    '2026-06-10 00:05:56',
    '2026-06-10 00:05:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    71,
    210027,
    36,
    36,
    '2026-05-21 03:05:56',
    'present',
    '2026-06-10 00:05:56',
    '2026-06-10 00:05:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    72,
    210027,
    36,
    36,
    '2026-05-19 03:05:57',
    'absent',
    '2026-06-10 00:05:56',
    '2026-06-10 00:05:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    73,
    210027,
    36,
    36,
    '2026-05-17 03:05:57',
    'present',
    '2026-06-10 00:05:56',
    '2026-06-10 00:05:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    74,
    210027,
    36,
    36,
    '2026-05-15 03:05:57',
    'late',
    '2026-06-10 00:05:56',
    '2026-06-10 00:05:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    75,
    210027,
    36,
    36,
    '2026-05-13 03:05:57',
    'present',
    '2026-06-10 00:05:56',
    '2026-06-10 00:05:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    76,
    210027,
    36,
    36,
    '2026-05-11 03:05:57',
    'excused',
    '2026-06-10 00:05:56',
    '2026-06-10 00:05:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    77,
    210027,
    36,
    36,
    '2026-05-09 03:05:57',
    'present',
    '2026-06-10 00:05:57',
    '2026-06-10 00:05:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    78,
    210027,
    36,
    36,
    '2026-05-07 03:05:57',
    'absent',
    '2026-06-10 00:05:57',
    '2026-06-10 00:05:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    79,
    210027,
    36,
    36,
    '2026-05-05 03:05:57',
    'present',
    '2026-06-10 00:05:57',
    '2026-06-10 00:05:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    80,
    210027,
    36,
    36,
    '2026-05-03 03:05:57',
    'present',
    '2026-06-10 00:05:57',
    '2026-06-10 00:05:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    81,
    210027,
    37,
    37,
    '2026-06-10 03:05:58',
    'present',
    '2026-06-10 00:05:57',
    '2026-06-10 00:05:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    82,
    210027,
    37,
    37,
    '2026-06-08 03:05:58',
    'present',
    '2026-06-10 00:05:57',
    '2026-06-10 00:05:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    83,
    210027,
    37,
    37,
    '2026-06-06 03:05:58',
    'absent',
    '2026-06-10 00:05:57',
    '2026-06-10 00:05:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    84,
    210027,
    37,
    37,
    '2026-06-04 03:05:58',
    'present',
    '2026-06-10 00:05:57',
    '2026-06-10 00:05:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    85,
    210027,
    37,
    37,
    '2026-06-02 03:05:58',
    'late',
    '2026-06-10 00:05:57',
    '2026-06-10 00:05:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    86,
    210027,
    37,
    37,
    '2026-05-31 03:05:58',
    'present',
    '2026-06-10 00:05:58',
    '2026-06-10 00:05:58'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    87,
    210027,
    37,
    37,
    '2026-05-29 03:05:58',
    'excused',
    '2026-06-10 00:05:58',
    '2026-06-10 00:05:58'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    88,
    210027,
    37,
    37,
    '2026-05-27 03:05:58',
    'present',
    '2026-06-10 00:05:58',
    '2026-06-10 00:05:58'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    89,
    210027,
    37,
    37,
    '2026-05-25 03:05:58',
    'absent',
    '2026-06-10 00:05:58',
    '2026-06-10 00:05:58'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    90,
    210027,
    37,
    37,
    '2026-05-23 03:05:59',
    'present',
    '2026-06-10 00:05:58',
    '2026-06-10 00:05:58'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    91,
    210027,
    37,
    37,
    '2026-05-21 03:05:59',
    'present',
    '2026-06-10 00:05:58',
    '2026-06-10 00:05:58'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    92,
    210027,
    37,
    37,
    '2026-05-19 03:05:59',
    'absent',
    '2026-06-10 00:05:58',
    '2026-06-10 00:05:58'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    93,
    210027,
    37,
    37,
    '2026-05-17 03:05:59',
    'present',
    '2026-06-10 00:05:58',
    '2026-06-10 00:05:58'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    94,
    210027,
    37,
    37,
    '2026-05-15 03:05:59',
    'late',
    '2026-06-10 00:05:58',
    '2026-06-10 00:05:58'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    95,
    210027,
    37,
    37,
    '2026-05-13 03:05:59',
    'present',
    '2026-06-10 00:05:58',
    '2026-06-10 00:05:58'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    96,
    210027,
    37,
    37,
    '2026-05-11 03:05:59',
    'excused',
    '2026-06-10 00:05:59',
    '2026-06-10 00:05:59'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    97,
    210027,
    37,
    37,
    '2026-05-09 03:05:59',
    'present',
    '2026-06-10 00:05:59',
    '2026-06-10 00:05:59'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    98,
    210027,
    37,
    37,
    '2026-05-07 03:05:59',
    'absent',
    '2026-06-10 00:05:59',
    '2026-06-10 00:05:59'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    99,
    210027,
    37,
    37,
    '2026-05-05 03:05:59',
    'present',
    '2026-06-10 00:05:59',
    '2026-06-10 00:05:59'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    100,
    210027,
    37,
    37,
    '2026-05-03 03:05:59',
    'present',
    '2026-06-10 00:05:59',
    '2026-06-10 00:05:59'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    101,
    210027,
    38,
    38,
    '2026-06-10 03:05:59',
    'present',
    '2026-06-10 00:05:59',
    '2026-06-10 00:05:59'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    102,
    210027,
    38,
    38,
    '2026-06-08 03:06:00',
    'present',
    '2026-06-10 00:05:59',
    '2026-06-10 00:05:59'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    103,
    210027,
    38,
    38,
    '2026-06-06 03:06:00',
    'absent',
    '2026-06-10 00:05:59',
    '2026-06-10 00:05:59'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    104,
    210027,
    38,
    38,
    '2026-06-04 03:06:00',
    'present',
    '2026-06-10 00:05:59',
    '2026-06-10 00:05:59'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    105,
    210027,
    38,
    38,
    '2026-06-02 03:06:00',
    'late',
    '2026-06-10 00:05:59',
    '2026-06-10 00:05:59'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    106,
    210027,
    38,
    38,
    '2026-05-31 03:06:00',
    'present',
    '2026-06-10 00:05:59',
    '2026-06-10 00:05:59'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    107,
    210027,
    38,
    38,
    '2026-05-29 03:06:00',
    'excused',
    '2026-06-10 00:05:59',
    '2026-06-10 00:05:59'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    108,
    210027,
    38,
    38,
    '2026-05-27 03:06:00',
    'present',
    '2026-06-10 00:05:59',
    '2026-06-10 00:05:59'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    109,
    210027,
    38,
    38,
    '2026-05-25 03:06:00',
    'absent',
    '2026-06-10 00:05:59',
    '2026-06-10 00:05:59'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    110,
    210027,
    38,
    38,
    '2026-05-23 03:06:00',
    'present',
    '2026-06-10 00:06:00',
    '2026-06-10 00:06:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    111,
    210027,
    38,
    38,
    '2026-05-21 03:06:00',
    'present',
    '2026-06-10 00:06:00',
    '2026-06-10 00:06:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    112,
    210027,
    38,
    38,
    '2026-05-19 03:06:00',
    'absent',
    '2026-06-10 00:06:00',
    '2026-06-10 00:06:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    113,
    210027,
    38,
    38,
    '2026-05-17 03:06:00',
    'present',
    '2026-06-10 00:06:00',
    '2026-06-10 00:06:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    114,
    210027,
    38,
    38,
    '2026-05-15 03:06:00',
    'late',
    '2026-06-10 00:06:00',
    '2026-06-10 00:06:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    115,
    210027,
    38,
    38,
    '2026-05-13 03:06:00',
    'present',
    '2026-06-10 00:06:00',
    '2026-06-10 00:06:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    116,
    210027,
    38,
    38,
    '2026-05-11 03:06:01',
    'excused',
    '2026-06-10 00:06:00',
    '2026-06-10 00:06:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    117,
    210027,
    38,
    38,
    '2026-05-09 03:06:01',
    'present',
    '2026-06-10 00:06:00',
    '2026-06-10 00:06:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    118,
    210027,
    38,
    38,
    '2026-05-07 03:06:01',
    'absent',
    '2026-06-10 00:06:00',
    '2026-06-10 00:06:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    119,
    210027,
    38,
    38,
    '2026-05-05 03:06:01',
    'present',
    '2026-06-10 00:06:00',
    '2026-06-10 00:06:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    120,
    210027,
    38,
    38,
    '2026-05-03 03:06:01',
    'present',
    '2026-06-10 00:06:00',
    '2026-06-10 00:06:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    121,
    210027,
    39,
    39,
    '2026-06-10 03:06:01',
    'present',
    '2026-06-10 00:06:00',
    '2026-06-10 00:06:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    122,
    210027,
    39,
    39,
    '2026-06-08 03:06:01',
    'present',
    '2026-06-10 00:06:00',
    '2026-06-10 00:06:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    123,
    210027,
    39,
    39,
    '2026-06-06 03:06:01',
    'absent',
    '2026-06-10 00:06:00',
    '2026-06-10 00:06:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    124,
    210027,
    39,
    39,
    '2026-06-04 03:06:01',
    'present',
    '2026-06-10 00:06:00',
    '2026-06-10 00:06:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    125,
    210027,
    39,
    39,
    '2026-06-02 03:06:01',
    'late',
    '2026-06-10 00:06:01',
    '2026-06-10 00:06:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    126,
    210027,
    39,
    39,
    '2026-05-31 03:06:01',
    'present',
    '2026-06-10 00:06:01',
    '2026-06-10 00:06:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    127,
    210027,
    39,
    39,
    '2026-05-29 03:06:01',
    'excused',
    '2026-06-10 00:06:01',
    '2026-06-10 00:06:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    128,
    210027,
    39,
    39,
    '2026-05-27 03:06:01',
    'present',
    '2026-06-10 00:06:01',
    '2026-06-10 00:06:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    129,
    210027,
    39,
    39,
    '2026-05-25 03:06:01',
    'absent',
    '2026-06-10 00:06:01',
    '2026-06-10 00:06:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    130,
    210027,
    39,
    39,
    '2026-05-23 03:06:01',
    'present',
    '2026-06-10 00:06:01',
    '2026-06-10 00:06:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    131,
    210027,
    39,
    39,
    '2026-05-21 03:06:02',
    'present',
    '2026-06-10 00:06:01',
    '2026-06-10 00:06:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    132,
    210027,
    39,
    39,
    '2026-05-19 03:06:02',
    'absent',
    '2026-06-10 00:06:01',
    '2026-06-10 00:06:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    133,
    210027,
    39,
    39,
    '2026-05-17 03:06:02',
    'present',
    '2026-06-10 00:06:01',
    '2026-06-10 00:06:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    134,
    210027,
    39,
    39,
    '2026-05-15 03:06:02',
    'late',
    '2026-06-10 00:06:01',
    '2026-06-10 00:06:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    135,
    210027,
    39,
    39,
    '2026-05-13 03:06:02',
    'present',
    '2026-06-10 00:06:01',
    '2026-06-10 00:06:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    136,
    210027,
    39,
    39,
    '2026-05-11 03:06:02',
    'excused',
    '2026-06-10 00:06:01',
    '2026-06-10 00:06:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    137,
    210027,
    39,
    39,
    '2026-05-09 03:06:02',
    'present',
    '2026-06-10 00:06:01',
    '2026-06-10 00:06:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    138,
    210027,
    39,
    39,
    '2026-05-07 03:06:02',
    'absent',
    '2026-06-10 00:06:01',
    '2026-06-10 00:06:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    139,
    210027,
    39,
    39,
    '2026-05-05 03:06:02',
    'present',
    '2026-06-10 00:06:01',
    '2026-06-10 00:06:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    140,
    210027,
    39,
    39,
    '2026-05-03 03:06:02',
    'present',
    '2026-06-10 00:06:02',
    '2026-06-10 00:06:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    141,
    210027,
    40,
    40,
    '2026-06-10 03:06:02',
    'present',
    '2026-06-10 00:06:02',
    '2026-06-10 00:06:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    142,
    210027,
    40,
    40,
    '2026-06-08 03:06:02',
    'present',
    '2026-06-10 00:06:02',
    '2026-06-10 00:06:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    143,
    210027,
    40,
    40,
    '2026-06-06 03:06:02',
    'absent',
    '2026-06-10 00:06:02',
    '2026-06-10 00:06:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    144,
    210027,
    40,
    40,
    '2026-06-04 03:06:02',
    'present',
    '2026-06-10 00:06:02',
    '2026-06-10 00:06:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    145,
    210027,
    40,
    40,
    '2026-06-02 03:06:02',
    'late',
    '2026-06-10 00:06:02',
    '2026-06-10 00:06:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    146,
    210027,
    40,
    40,
    '2026-05-31 03:06:03',
    'present',
    '2026-06-10 00:06:02',
    '2026-06-10 00:06:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    147,
    210027,
    40,
    40,
    '2026-05-29 03:06:03',
    'excused',
    '2026-06-10 00:06:02',
    '2026-06-10 00:06:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    148,
    210027,
    40,
    40,
    '2026-05-27 03:06:03',
    'present',
    '2026-06-10 00:06:02',
    '2026-06-10 00:06:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    149,
    210027,
    40,
    40,
    '2026-05-25 03:06:03',
    'absent',
    '2026-06-10 00:06:02',
    '2026-06-10 00:06:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    150,
    210027,
    40,
    40,
    '2026-05-23 03:06:03',
    'present',
    '2026-06-10 00:06:02',
    '2026-06-10 00:06:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    151,
    210027,
    40,
    40,
    '2026-05-21 03:06:03',
    'present',
    '2026-06-10 00:06:02',
    '2026-06-10 00:06:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    152,
    210027,
    40,
    40,
    '2026-05-19 03:06:03',
    'absent',
    '2026-06-10 00:06:02',
    '2026-06-10 00:06:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    153,
    210027,
    40,
    40,
    '2026-05-17 03:06:03',
    'present',
    '2026-06-10 00:06:02',
    '2026-06-10 00:06:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    154,
    210027,
    40,
    40,
    '2026-05-15 03:06:03',
    'late',
    '2026-06-10 00:06:03',
    '2026-06-10 00:06:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    155,
    210027,
    40,
    40,
    '2026-05-13 03:06:04',
    'present',
    '2026-06-10 00:06:03',
    '2026-06-10 00:06:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    156,
    210027,
    40,
    40,
    '2026-05-11 03:06:04',
    'excused',
    '2026-06-10 00:06:03',
    '2026-06-10 00:06:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    157,
    210027,
    40,
    40,
    '2026-05-09 03:06:04',
    'present',
    '2026-06-10 00:06:03',
    '2026-06-10 00:06:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    158,
    210027,
    40,
    40,
    '2026-05-07 03:06:04',
    'absent',
    '2026-06-10 00:06:03',
    '2026-06-10 00:06:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    159,
    210027,
    40,
    40,
    '2026-05-05 03:06:04',
    'present',
    '2026-06-10 00:06:03',
    '2026-06-10 00:06:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    160,
    210027,
    40,
    40,
    '2026-05-03 03:06:04',
    'present',
    '2026-06-10 00:06:03',
    '2026-06-10 00:06:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    161,
    210027,
    41,
    41,
    '2026-06-10 03:06:04',
    'present',
    '2026-06-10 00:06:04',
    '2026-06-10 00:06:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    162,
    210027,
    41,
    41,
    '2026-06-08 03:06:04',
    'present',
    '2026-06-10 00:06:04',
    '2026-06-10 00:06:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    163,
    210027,
    41,
    41,
    '2026-06-06 03:06:04',
    'absent',
    '2026-06-10 00:06:04',
    '2026-06-10 00:06:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    164,
    210027,
    41,
    41,
    '2026-06-04 03:06:04',
    'present',
    '2026-06-10 00:06:04',
    '2026-06-10 00:06:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    165,
    210027,
    41,
    41,
    '2026-06-02 03:06:05',
    'late',
    '2026-06-10 00:06:04',
    '2026-06-10 00:06:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    166,
    210027,
    41,
    41,
    '2026-05-31 03:06:05',
    'present',
    '2026-06-10 00:06:04',
    '2026-06-10 00:06:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    167,
    210027,
    41,
    41,
    '2026-05-29 03:06:05',
    'excused',
    '2026-06-10 00:06:04',
    '2026-06-10 00:06:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    168,
    210027,
    41,
    41,
    '2026-05-27 03:06:05',
    'present',
    '2026-06-10 00:06:04',
    '2026-06-10 00:06:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    169,
    210027,
    41,
    41,
    '2026-05-25 03:06:05',
    'absent',
    '2026-06-10 00:06:04',
    '2026-06-10 00:06:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    170,
    210027,
    41,
    41,
    '2026-05-23 03:06:05',
    'present',
    '2026-06-10 00:06:04',
    '2026-06-10 00:06:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    171,
    210027,
    41,
    41,
    '2026-05-21 03:06:05',
    'present',
    '2026-06-10 00:06:05',
    '2026-06-10 00:06:05'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    172,
    210027,
    41,
    41,
    '2026-05-19 03:06:05',
    'absent',
    '2026-06-10 00:06:05',
    '2026-06-10 00:06:05'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    173,
    210027,
    41,
    41,
    '2026-05-17 03:06:05',
    'present',
    '2026-06-10 00:06:05',
    '2026-06-10 00:06:05'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    174,
    210027,
    41,
    41,
    '2026-05-15 03:06:05',
    'late',
    '2026-06-10 00:06:05',
    '2026-06-10 00:06:05'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    175,
    210027,
    41,
    41,
    '2026-05-13 03:06:06',
    'present',
    '2026-06-10 00:06:05',
    '2026-06-10 00:06:05'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    176,
    210027,
    41,
    41,
    '2026-05-11 03:06:06',
    'excused',
    '2026-06-10 00:06:05',
    '2026-06-10 00:06:05'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    177,
    210027,
    41,
    41,
    '2026-05-09 03:06:06',
    'present',
    '2026-06-10 00:06:05',
    '2026-06-10 00:06:05'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    178,
    210027,
    41,
    41,
    '2026-05-07 03:06:06',
    'absent',
    '2026-06-10 00:06:05',
    '2026-06-10 00:06:05'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    179,
    210027,
    41,
    41,
    '2026-05-05 03:06:06',
    'present',
    '2026-06-10 00:06:05',
    '2026-06-10 00:06:05'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    180,
    210027,
    41,
    41,
    '2026-05-03 03:06:06',
    'present',
    '2026-06-10 00:06:06',
    '2026-06-10 00:06:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    181,
    210027,
    42,
    42,
    '2026-06-10 03:06:06',
    'present',
    '2026-06-10 00:06:06',
    '2026-06-10 00:06:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    182,
    210027,
    42,
    42,
    '2026-06-08 03:06:06',
    'present',
    '2026-06-10 00:06:06',
    '2026-06-10 00:06:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    183,
    210027,
    42,
    42,
    '2026-06-06 03:06:06',
    'absent',
    '2026-06-10 00:06:06',
    '2026-06-10 00:06:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    184,
    210027,
    42,
    42,
    '2026-06-04 03:06:06',
    'present',
    '2026-06-10 00:06:06',
    '2026-06-10 00:06:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    185,
    210027,
    42,
    42,
    '2026-06-02 03:06:07',
    'late',
    '2026-06-10 00:06:06',
    '2026-06-10 00:06:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    186,
    210027,
    42,
    42,
    '2026-05-31 03:06:07',
    'present',
    '2026-06-10 00:06:06',
    '2026-06-10 00:06:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    187,
    210027,
    42,
    42,
    '2026-05-29 03:06:07',
    'excused',
    '2026-06-10 00:06:06',
    '2026-06-10 00:06:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    188,
    210027,
    42,
    42,
    '2026-05-27 03:06:07',
    'present',
    '2026-06-10 00:06:06',
    '2026-06-10 00:06:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    189,
    210027,
    42,
    42,
    '2026-05-25 03:06:07',
    'absent',
    '2026-06-10 00:06:07',
    '2026-06-10 00:06:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    190,
    210027,
    42,
    42,
    '2026-05-23 03:06:07',
    'present',
    '2026-06-10 00:06:07',
    '2026-06-10 00:06:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    191,
    210027,
    42,
    42,
    '2026-05-21 03:06:07',
    'present',
    '2026-06-10 00:06:07',
    '2026-06-10 00:06:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    192,
    210027,
    42,
    42,
    '2026-05-19 03:06:07',
    'absent',
    '2026-06-10 00:06:07',
    '2026-06-10 00:06:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    193,
    210027,
    42,
    42,
    '2026-05-17 03:06:08',
    'present',
    '2026-06-10 00:06:07',
    '2026-06-10 00:06:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    194,
    210027,
    42,
    42,
    '2026-05-15 03:06:08',
    'late',
    '2026-06-10 00:06:07',
    '2026-06-10 00:06:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    195,
    210027,
    42,
    42,
    '2026-05-13 03:06:08',
    'present',
    '2026-06-10 00:06:07',
    '2026-06-10 00:06:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    196,
    210027,
    42,
    42,
    '2026-05-11 03:06:08',
    'excused',
    '2026-06-10 00:06:07',
    '2026-06-10 00:06:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    197,
    210027,
    42,
    42,
    '2026-05-09 03:06:08',
    'present',
    '2026-06-10 00:06:07',
    '2026-06-10 00:06:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    198,
    210027,
    42,
    42,
    '2026-05-07 03:06:08',
    'absent',
    '2026-06-10 00:06:08',
    '2026-06-10 00:06:08'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    199,
    210027,
    42,
    42,
    '2026-05-05 03:06:08',
    'present',
    '2026-06-10 00:06:08',
    '2026-06-10 00:06:08'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    200,
    210027,
    42,
    42,
    '2026-05-03 03:06:08',
    'present',
    '2026-06-10 00:06:08',
    '2026-06-10 00:06:08'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    201,
    210027,
    43,
    43,
    '2026-06-10 03:06:08',
    'present',
    '2026-06-10 00:06:08',
    '2026-06-10 00:06:08'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    202,
    210027,
    43,
    43,
    '2026-06-08 03:06:09',
    'present',
    '2026-06-10 00:06:08',
    '2026-06-10 00:06:08'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    203,
    210027,
    43,
    43,
    '2026-06-06 03:06:09',
    'absent',
    '2026-06-10 00:06:08',
    '2026-06-10 00:06:08'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    204,
    210027,
    43,
    43,
    '2026-06-04 03:06:09',
    'present',
    '2026-06-10 00:06:08',
    '2026-06-10 00:06:08'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    205,
    210027,
    43,
    43,
    '2026-06-02 03:06:09',
    'late',
    '2026-06-10 00:06:08',
    '2026-06-10 00:06:08'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    206,
    210027,
    43,
    43,
    '2026-05-31 03:06:09',
    'present',
    '2026-06-10 00:06:08',
    '2026-06-10 00:06:08'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    207,
    210027,
    43,
    43,
    '2026-05-29 03:06:09',
    'excused',
    '2026-06-10 00:06:08',
    '2026-06-10 00:06:08'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    208,
    210027,
    43,
    43,
    '2026-05-27 03:06:09',
    'present',
    '2026-06-10 00:06:09',
    '2026-06-10 00:06:09'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    209,
    210027,
    43,
    43,
    '2026-05-25 03:06:09',
    'absent',
    '2026-06-10 00:06:09',
    '2026-06-10 00:06:09'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    210,
    210027,
    43,
    43,
    '2026-05-23 03:06:10',
    'present',
    '2026-06-10 00:06:09',
    '2026-06-10 00:06:09'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    211,
    210027,
    43,
    43,
    '2026-05-21 03:06:10',
    'present',
    '2026-06-10 00:06:09',
    '2026-06-10 00:06:09'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    212,
    210027,
    43,
    43,
    '2026-05-19 03:06:10',
    'absent',
    '2026-06-10 00:06:09',
    '2026-06-10 00:06:09'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    213,
    210027,
    43,
    43,
    '2026-05-17 03:06:10',
    'present',
    '2026-06-10 00:06:09',
    '2026-06-10 00:06:09'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    214,
    210027,
    43,
    43,
    '2026-05-15 03:06:10',
    'late',
    '2026-06-10 00:06:09',
    '2026-06-10 00:06:09'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    215,
    210027,
    43,
    43,
    '2026-05-13 03:06:10',
    'present',
    '2026-06-10 00:06:09',
    '2026-06-10 00:06:09'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    216,
    210027,
    43,
    43,
    '2026-05-11 03:06:10',
    'excused',
    '2026-06-10 00:06:10',
    '2026-06-10 00:06:10'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    217,
    210027,
    43,
    43,
    '2026-05-09 03:06:10',
    'present',
    '2026-06-10 00:06:10',
    '2026-06-10 00:06:10'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    218,
    210027,
    43,
    43,
    '2026-05-07 03:06:10',
    'absent',
    '2026-06-10 00:06:10',
    '2026-06-10 00:06:10'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    219,
    210027,
    43,
    43,
    '2026-05-05 03:06:10',
    'present',
    '2026-06-10 00:06:10',
    '2026-06-10 00:06:10'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    220,
    210027,
    43,
    43,
    '2026-05-03 03:06:11',
    'present',
    '2026-06-10 00:06:10',
    '2026-06-10 00:06:10'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    221,
    210027,
    44,
    44,
    '2026-06-10 03:06:11',
    'present',
    '2026-06-10 00:06:10',
    '2026-06-10 00:06:10'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    222,
    210027,
    44,
    44,
    '2026-06-08 03:06:11',
    'present',
    '2026-06-10 00:06:10',
    '2026-06-10 00:06:10'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    223,
    210027,
    44,
    44,
    '2026-06-06 03:06:11',
    'absent',
    '2026-06-10 00:06:10',
    '2026-06-10 00:06:10'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    224,
    210027,
    44,
    44,
    '2026-06-04 03:06:11',
    'present',
    '2026-06-10 00:06:10',
    '2026-06-10 00:06:10'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    225,
    210027,
    44,
    44,
    '2026-06-02 03:06:11',
    'late',
    '2026-06-10 00:06:11',
    '2026-06-10 00:06:11'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    226,
    210027,
    44,
    44,
    '2026-05-31 03:06:11',
    'present',
    '2026-06-10 00:06:11',
    '2026-06-10 00:06:11'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    227,
    210027,
    44,
    44,
    '2026-05-29 03:06:11',
    'excused',
    '2026-06-10 00:06:11',
    '2026-06-10 00:06:11'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    228,
    210027,
    44,
    44,
    '2026-05-27 03:06:12',
    'present',
    '2026-06-10 00:06:11',
    '2026-06-10 00:06:11'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    229,
    210027,
    44,
    44,
    '2026-05-25 03:06:12',
    'absent',
    '2026-06-10 00:06:11',
    '2026-06-10 00:06:11'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    230,
    210027,
    44,
    44,
    '2026-05-23 03:06:12',
    'present',
    '2026-06-10 00:06:11',
    '2026-06-10 00:06:11'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    231,
    210027,
    44,
    44,
    '2026-05-21 03:06:12',
    'present',
    '2026-06-10 00:06:11',
    '2026-06-10 00:06:11'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    232,
    210027,
    44,
    44,
    '2026-05-19 03:06:12',
    'absent',
    '2026-06-10 00:06:11',
    '2026-06-10 00:06:11'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    233,
    210027,
    44,
    44,
    '2026-05-17 03:06:12',
    'present',
    '2026-06-10 00:06:11',
    '2026-06-10 00:06:11'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    234,
    210027,
    44,
    44,
    '2026-05-15 03:06:12',
    'late',
    '2026-06-10 00:06:12',
    '2026-06-10 00:06:12'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    235,
    210027,
    44,
    44,
    '2026-05-13 03:06:12',
    'present',
    '2026-06-10 00:06:12',
    '2026-06-10 00:06:12'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    236,
    210027,
    44,
    44,
    '2026-05-11 03:06:12',
    'excused',
    '2026-06-10 00:06:12',
    '2026-06-10 00:06:12'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    237,
    210027,
    44,
    44,
    '2026-05-09 03:06:12',
    'present',
    '2026-06-10 00:06:12',
    '2026-06-10 00:06:12'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    238,
    210027,
    44,
    44,
    '2026-05-07 03:06:13',
    'absent',
    '2026-06-10 00:06:12',
    '2026-06-10 00:06:12'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    239,
    210027,
    44,
    44,
    '2026-05-05 03:06:13',
    'present',
    '2026-06-10 00:06:12',
    '2026-06-10 00:06:12'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    240,
    210027,
    44,
    44,
    '2026-05-03 03:06:13',
    'present',
    '2026-06-10 00:06:12',
    '2026-06-10 00:06:12'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    241,
    210027,
    45,
    45,
    '2026-06-10 03:06:13',
    'present',
    '2026-06-10 00:06:12',
    '2026-06-10 00:06:12'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    242,
    210027,
    45,
    45,
    '2026-06-08 03:06:13',
    'present',
    '2026-06-10 00:06:12',
    '2026-06-10 00:06:12'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    243,
    210027,
    45,
    45,
    '2026-06-06 03:06:13',
    'absent',
    '2026-06-10 00:06:12',
    '2026-06-10 00:06:12'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    244,
    210027,
    45,
    45,
    '2026-06-04 03:06:13',
    'present',
    '2026-06-10 00:06:13',
    '2026-06-10 00:06:13'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    245,
    210027,
    45,
    45,
    '2026-06-02 03:06:13',
    'late',
    '2026-06-10 00:06:13',
    '2026-06-10 00:06:13'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    246,
    210027,
    45,
    45,
    '2026-05-31 03:06:13',
    'present',
    '2026-06-10 00:06:13',
    '2026-06-10 00:06:13'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    247,
    210027,
    45,
    45,
    '2026-05-29 03:06:13',
    'excused',
    '2026-06-10 00:06:13',
    '2026-06-10 00:06:13'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    248,
    210027,
    45,
    45,
    '2026-05-27 03:06:14',
    'present',
    '2026-06-10 00:06:13',
    '2026-06-10 00:06:13'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    249,
    210027,
    45,
    45,
    '2026-05-25 03:06:14',
    'absent',
    '2026-06-10 00:06:13',
    '2026-06-10 00:06:13'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    250,
    210027,
    45,
    45,
    '2026-05-23 03:06:14',
    'present',
    '2026-06-10 00:06:13',
    '2026-06-10 00:06:13'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    251,
    210027,
    45,
    45,
    '2026-05-21 03:06:14',
    'present',
    '2026-06-10 00:06:13',
    '2026-06-10 00:06:13'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    252,
    210027,
    45,
    45,
    '2026-05-19 03:06:14',
    'absent',
    '2026-06-10 00:06:13',
    '2026-06-10 00:06:13'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    253,
    210027,
    45,
    45,
    '2026-05-17 03:06:14',
    'present',
    '2026-06-10 00:06:13',
    '2026-06-10 00:06:13'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    254,
    210027,
    45,
    45,
    '2026-05-15 03:06:14',
    'late',
    '2026-06-10 00:06:14',
    '2026-06-10 00:06:14'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    255,
    210027,
    45,
    45,
    '2026-05-13 03:06:14',
    'present',
    '2026-06-10 00:06:14',
    '2026-06-10 00:06:14'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    256,
    210027,
    45,
    45,
    '2026-05-11 03:06:14',
    'excused',
    '2026-06-10 00:06:14',
    '2026-06-10 00:06:14'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    257,
    210027,
    45,
    45,
    '2026-05-09 03:06:15',
    'present',
    '2026-06-10 00:06:14',
    '2026-06-10 00:06:14'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    258,
    210027,
    45,
    45,
    '2026-05-07 03:06:15',
    'absent',
    '2026-06-10 00:06:14',
    '2026-06-10 00:06:14'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    259,
    210027,
    45,
    45,
    '2026-05-05 03:06:15',
    'present',
    '2026-06-10 00:06:14',
    '2026-06-10 00:06:14'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    260,
    210027,
    45,
    45,
    '2026-05-03 03:06:15',
    'present',
    '2026-06-10 00:06:14',
    '2026-06-10 00:06:14'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    261,
    210027,
    46,
    46,
    '2026-06-10 03:06:15',
    'present',
    '2026-06-10 00:06:15',
    '2026-06-10 00:06:15'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    262,
    210027,
    46,
    46,
    '2026-06-08 03:06:15',
    'present',
    '2026-06-10 00:06:15',
    '2026-06-10 00:06:15'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    263,
    210027,
    46,
    46,
    '2026-06-06 03:06:15',
    'absent',
    '2026-06-10 00:06:15',
    '2026-06-10 00:06:15'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    264,
    210027,
    46,
    46,
    '2026-06-04 03:06:15',
    'present',
    '2026-06-10 00:06:15',
    '2026-06-10 00:06:15'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    265,
    210027,
    46,
    46,
    '2026-06-02 03:06:16',
    'late',
    '2026-06-10 00:06:15',
    '2026-06-10 00:06:15'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    266,
    210027,
    46,
    46,
    '2026-05-31 03:06:16',
    'present',
    '2026-06-10 00:06:15',
    '2026-06-10 00:06:15'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    267,
    210027,
    46,
    46,
    '2026-05-29 03:06:16',
    'excused',
    '2026-06-10 00:06:15',
    '2026-06-10 00:06:15'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    268,
    210027,
    46,
    46,
    '2026-05-27 03:06:16',
    'present',
    '2026-06-10 00:06:16',
    '2026-06-10 00:06:16'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    269,
    210027,
    46,
    46,
    '2026-05-25 03:06:16',
    'absent',
    '2026-06-10 00:06:16',
    '2026-06-10 00:06:16'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    270,
    210027,
    46,
    46,
    '2026-05-23 03:06:16',
    'present',
    '2026-06-10 00:06:16',
    '2026-06-10 00:06:16'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    271,
    210027,
    46,
    46,
    '2026-05-21 03:06:16',
    'present',
    '2026-06-10 00:06:16',
    '2026-06-10 00:06:16'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    272,
    210027,
    46,
    46,
    '2026-05-19 03:06:17',
    'absent',
    '2026-06-10 00:06:16',
    '2026-06-10 00:06:16'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    273,
    210027,
    46,
    46,
    '2026-05-17 03:06:17',
    'present',
    '2026-06-10 00:06:16',
    '2026-06-10 00:06:16'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    274,
    210027,
    46,
    46,
    '2026-05-15 03:06:17',
    'late',
    '2026-06-10 00:06:16',
    '2026-06-10 00:06:16'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    275,
    210027,
    46,
    46,
    '2026-05-13 03:06:17',
    'present',
    '2026-06-10 00:06:16',
    '2026-06-10 00:06:16'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    276,
    210027,
    46,
    46,
    '2026-05-11 03:06:17',
    'excused',
    '2026-06-10 00:06:16',
    '2026-06-10 00:06:16'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    277,
    210027,
    46,
    46,
    '2026-05-09 03:06:17',
    'present',
    '2026-06-10 00:06:16',
    '2026-06-10 00:06:16'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    278,
    210027,
    46,
    46,
    '2026-05-07 03:06:17',
    'absent',
    '2026-06-10 00:06:17',
    '2026-06-10 00:06:17'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    279,
    210027,
    46,
    46,
    '2026-05-05 03:06:17',
    'present',
    '2026-06-10 00:06:17',
    '2026-06-10 00:06:17'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    280,
    210027,
    46,
    46,
    '2026-05-03 03:06:17',
    'present',
    '2026-06-10 00:06:17',
    '2026-06-10 00:06:17'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    281,
    210027,
    47,
    47,
    '2026-06-10 03:06:17',
    'present',
    '2026-06-10 00:06:17',
    '2026-06-10 00:06:17'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    282,
    210027,
    47,
    47,
    '2026-06-08 03:06:18',
    'present',
    '2026-06-10 00:06:17',
    '2026-06-10 00:06:17'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    283,
    210027,
    47,
    47,
    '2026-06-06 03:06:18',
    'absent',
    '2026-06-10 00:06:17',
    '2026-06-10 00:06:17'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    284,
    210027,
    47,
    47,
    '2026-06-04 03:06:18',
    'present',
    '2026-06-10 00:06:17',
    '2026-06-10 00:06:17'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    285,
    210027,
    47,
    47,
    '2026-06-02 03:06:18',
    'late',
    '2026-06-10 00:06:17',
    '2026-06-10 00:06:17'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    286,
    210027,
    47,
    47,
    '2026-05-31 03:06:18',
    'present',
    '2026-06-10 00:06:17',
    '2026-06-10 00:06:17'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    287,
    210027,
    47,
    47,
    '2026-05-29 03:06:18',
    'excused',
    '2026-06-10 00:06:17',
    '2026-06-10 00:06:17'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    288,
    210027,
    47,
    47,
    '2026-05-27 03:06:18',
    'present',
    '2026-06-10 00:06:18',
    '2026-06-10 00:06:18'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    289,
    210027,
    47,
    47,
    '2026-05-25 03:06:18',
    'absent',
    '2026-06-10 00:06:18',
    '2026-06-10 00:06:18'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    290,
    210027,
    47,
    47,
    '2026-05-23 03:06:18',
    'present',
    '2026-06-10 00:06:18',
    '2026-06-10 00:06:18'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    291,
    210027,
    47,
    47,
    '2026-05-21 03:06:18',
    'present',
    '2026-06-10 00:06:18',
    '2026-06-10 00:06:18'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    292,
    210027,
    47,
    47,
    '2026-05-19 03:06:19',
    'absent',
    '2026-06-10 00:06:18',
    '2026-06-10 00:06:18'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    293,
    210027,
    47,
    47,
    '2026-05-17 03:06:19',
    'present',
    '2026-06-10 00:06:18',
    '2026-06-10 00:06:18'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    294,
    210027,
    47,
    47,
    '2026-05-15 03:06:19',
    'late',
    '2026-06-10 00:06:18',
    '2026-06-10 00:06:18'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    295,
    210027,
    47,
    47,
    '2026-05-13 03:06:19',
    'present',
    '2026-06-10 00:06:18',
    '2026-06-10 00:06:18'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    296,
    210027,
    47,
    47,
    '2026-05-11 03:06:19',
    'excused',
    '2026-06-10 00:06:18',
    '2026-06-10 00:06:18'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    297,
    210027,
    47,
    47,
    '2026-05-09 03:06:19',
    'present',
    '2026-06-10 00:06:19',
    '2026-06-10 00:06:19'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    298,
    210027,
    47,
    47,
    '2026-05-07 03:06:19',
    'absent',
    '2026-06-10 00:06:19',
    '2026-06-10 00:06:19'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    299,
    210027,
    47,
    47,
    '2026-05-05 03:06:19',
    'present',
    '2026-06-10 00:06:19',
    '2026-06-10 00:06:19'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    300,
    210027,
    47,
    47,
    '2026-05-03 03:06:19',
    'present',
    '2026-06-10 00:06:19',
    '2026-06-10 00:06:19'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    301,
    210027,
    48,
    48,
    '2026-06-10 03:06:20',
    'present',
    '2026-06-10 00:06:19',
    '2026-06-10 00:06:19'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    302,
    210027,
    48,
    48,
    '2026-06-08 03:06:20',
    'present',
    '2026-06-10 00:06:19',
    '2026-06-10 00:06:19'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    303,
    210027,
    48,
    48,
    '2026-06-06 03:06:20',
    'absent',
    '2026-06-10 00:06:19',
    '2026-06-10 00:06:19'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    304,
    210027,
    48,
    48,
    '2026-06-04 03:06:20',
    'present',
    '2026-06-10 00:06:19',
    '2026-06-10 00:06:19'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    305,
    210027,
    48,
    48,
    '2026-06-02 03:06:20',
    'late',
    '2026-06-10 00:06:20',
    '2026-06-10 00:06:20'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    306,
    210027,
    48,
    48,
    '2026-05-31 03:06:20',
    'present',
    '2026-06-10 00:06:20',
    '2026-06-10 00:06:20'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    307,
    210027,
    48,
    48,
    '2026-05-29 03:06:20',
    'excused',
    '2026-06-10 00:06:20',
    '2026-06-10 00:06:20'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    308,
    210027,
    48,
    48,
    '2026-05-27 03:06:20',
    'present',
    '2026-06-10 00:06:20',
    '2026-06-10 00:06:20'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    309,
    210027,
    48,
    48,
    '2026-05-25 03:06:21',
    'absent',
    '2026-06-10 00:06:20',
    '2026-06-10 00:06:20'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    310,
    210027,
    48,
    48,
    '2026-05-23 03:06:21',
    'present',
    '2026-06-10 00:06:20',
    '2026-06-10 00:06:20'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    311,
    210027,
    48,
    48,
    '2026-05-21 03:06:21',
    'present',
    '2026-06-10 00:06:20',
    '2026-06-10 00:06:20'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    312,
    210027,
    48,
    48,
    '2026-05-19 03:06:21',
    'absent',
    '2026-06-10 00:06:20',
    '2026-06-10 00:06:20'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    313,
    210027,
    48,
    48,
    '2026-05-17 03:06:21',
    'present',
    '2026-06-10 00:06:20',
    '2026-06-10 00:06:20'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    314,
    210027,
    48,
    48,
    '2026-05-15 03:06:21',
    'late',
    '2026-06-10 00:06:20',
    '2026-06-10 00:06:20'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    315,
    210027,
    48,
    48,
    '2026-05-13 03:06:21',
    'present',
    '2026-06-10 00:06:21',
    '2026-06-10 00:06:21'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    316,
    210027,
    48,
    48,
    '2026-05-11 03:06:21',
    'excused',
    '2026-06-10 00:06:21',
    '2026-06-10 00:06:21'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    317,
    210027,
    48,
    48,
    '2026-05-09 03:06:21',
    'present',
    '2026-06-10 00:06:21',
    '2026-06-10 00:06:21'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    318,
    210027,
    48,
    48,
    '2026-05-07 03:06:21',
    'absent',
    '2026-06-10 00:06:21',
    '2026-06-10 00:06:21'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    319,
    210027,
    48,
    48,
    '2026-05-05 03:06:21',
    'present',
    '2026-06-10 00:06:21',
    '2026-06-10 00:06:21'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    320,
    210027,
    48,
    48,
    '2026-05-03 03:06:21',
    'present',
    '2026-06-10 00:06:21',
    '2026-06-10 00:06:21'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    321,
    210027,
    49,
    49,
    '2026-06-10 03:06:22',
    'present',
    '2026-06-10 00:06:21',
    '2026-06-10 00:06:21'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    322,
    210027,
    49,
    49,
    '2026-06-08 03:06:22',
    'present',
    '2026-06-10 00:06:21',
    '2026-06-10 00:06:21'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    323,
    210027,
    49,
    49,
    '2026-06-06 03:06:22',
    'absent',
    '2026-06-10 00:06:21',
    '2026-06-10 00:06:21'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    324,
    210027,
    49,
    49,
    '2026-06-04 03:06:22',
    'present',
    '2026-06-10 00:06:21',
    '2026-06-10 00:06:21'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    325,
    210027,
    49,
    49,
    '2026-06-02 03:06:22',
    'late',
    '2026-06-10 00:06:21',
    '2026-06-10 00:06:21'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    326,
    210027,
    49,
    49,
    '2026-05-31 03:06:22',
    'present',
    '2026-06-10 00:06:21',
    '2026-06-10 00:06:21'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    327,
    210027,
    49,
    49,
    '2026-05-29 03:06:22',
    'excused',
    '2026-06-10 00:06:21',
    '2026-06-10 00:06:21'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    328,
    210027,
    49,
    49,
    '2026-05-27 03:06:22',
    'present',
    '2026-06-10 00:06:22',
    '2026-06-10 00:06:22'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    329,
    210027,
    49,
    49,
    '2026-05-25 03:06:22',
    'absent',
    '2026-06-10 00:06:22',
    '2026-06-10 00:06:22'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    330,
    210027,
    49,
    49,
    '2026-05-23 03:06:22',
    'present',
    '2026-06-10 00:06:22',
    '2026-06-10 00:06:22'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    331,
    210027,
    49,
    49,
    '2026-05-21 03:06:22',
    'present',
    '2026-06-10 00:06:22',
    '2026-06-10 00:06:22'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    332,
    210027,
    49,
    49,
    '2026-05-19 03:06:22',
    'absent',
    '2026-06-10 00:06:22',
    '2026-06-10 00:06:22'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    333,
    210027,
    49,
    49,
    '2026-05-17 03:06:22',
    'present',
    '2026-06-10 00:06:22',
    '2026-06-10 00:06:22'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    334,
    210027,
    49,
    49,
    '2026-05-15 03:06:23',
    'late',
    '2026-06-10 00:06:22',
    '2026-06-10 00:06:22'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    335,
    210027,
    49,
    49,
    '2026-05-13 03:06:23',
    'present',
    '2026-06-10 00:06:22',
    '2026-06-10 00:06:22'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    336,
    210027,
    49,
    49,
    '2026-05-11 03:06:23',
    'excused',
    '2026-06-10 00:06:22',
    '2026-06-10 00:06:22'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    337,
    210027,
    49,
    49,
    '2026-05-09 03:06:23',
    'present',
    '2026-06-10 00:06:22',
    '2026-06-10 00:06:22'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    338,
    210027,
    49,
    49,
    '2026-05-07 03:06:23',
    'absent',
    '2026-06-10 00:06:22',
    '2026-06-10 00:06:22'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    339,
    210027,
    49,
    49,
    '2026-05-05 03:06:23',
    'present',
    '2026-06-10 00:06:22',
    '2026-06-10 00:06:22'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    340,
    210027,
    49,
    49,
    '2026-05-03 03:06:23',
    'present',
    '2026-06-10 00:06:22',
    '2026-06-10 00:06:22'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    341,
    210027,
    50,
    50,
    '2026-06-10 03:06:23',
    'present',
    '2026-06-10 00:06:22',
    '2026-06-10 00:06:22'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    342,
    210027,
    50,
    50,
    '2026-06-08 03:06:23',
    'present',
    '2026-06-10 00:06:22',
    '2026-06-10 00:06:22'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    343,
    210027,
    50,
    50,
    '2026-06-06 03:06:23',
    'absent',
    '2026-06-10 00:06:23',
    '2026-06-10 00:06:23'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    344,
    210027,
    50,
    50,
    '2026-06-04 03:06:23',
    'present',
    '2026-06-10 00:06:23',
    '2026-06-10 00:06:23'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    345,
    210027,
    50,
    50,
    '2026-06-02 03:06:23',
    'late',
    '2026-06-10 00:06:23',
    '2026-06-10 00:06:23'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    346,
    210027,
    50,
    50,
    '2026-05-31 03:06:23',
    'present',
    '2026-06-10 00:06:23',
    '2026-06-10 00:06:23'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    347,
    210027,
    50,
    50,
    '2026-05-29 03:06:24',
    'excused',
    '2026-06-10 00:06:23',
    '2026-06-10 00:06:23'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    348,
    210027,
    50,
    50,
    '2026-05-27 03:06:24',
    'present',
    '2026-06-10 00:06:23',
    '2026-06-10 00:06:23'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    349,
    210027,
    50,
    50,
    '2026-05-25 03:06:24',
    'absent',
    '2026-06-10 00:06:23',
    '2026-06-10 00:06:23'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    350,
    210027,
    50,
    50,
    '2026-05-23 03:06:24',
    'present',
    '2026-06-10 00:06:23',
    '2026-06-10 00:06:23'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    351,
    210027,
    50,
    50,
    '2026-05-21 03:06:24',
    'present',
    '2026-06-10 00:06:23',
    '2026-06-10 00:06:23'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    352,
    210027,
    50,
    50,
    '2026-05-19 03:06:24',
    'absent',
    '2026-06-10 00:06:24',
    '2026-06-10 00:06:24'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    353,
    210027,
    50,
    50,
    '2026-05-17 03:06:24',
    'present',
    '2026-06-10 00:06:24',
    '2026-06-10 00:06:24'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    354,
    210027,
    50,
    50,
    '2026-05-15 03:06:24',
    'late',
    '2026-06-10 00:06:24',
    '2026-06-10 00:06:24'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    355,
    210027,
    50,
    50,
    '2026-05-13 03:06:24',
    'present',
    '2026-06-10 00:06:24',
    '2026-06-10 00:06:24'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    356,
    210027,
    50,
    50,
    '2026-05-11 03:06:25',
    'excused',
    '2026-06-10 00:06:24',
    '2026-06-10 00:06:24'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    357,
    210027,
    50,
    50,
    '2026-05-09 03:06:25',
    'present',
    '2026-06-10 00:06:24',
    '2026-06-10 00:06:24'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    358,
    210027,
    50,
    50,
    '2026-05-07 03:06:25',
    'absent',
    '2026-06-10 00:06:24',
    '2026-06-10 00:06:24'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    359,
    210027,
    50,
    50,
    '2026-05-05 03:06:25',
    'present',
    '2026-06-10 00:06:24',
    '2026-06-10 00:06:24'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    360,
    210027,
    50,
    50,
    '2026-05-03 03:06:25',
    'present',
    '2026-06-10 00:06:24',
    '2026-06-10 00:06:24'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    361,
    210027,
    51,
    51,
    '2026-06-10 03:06:25',
    'present',
    '2026-06-10 00:06:24',
    '2026-06-10 00:06:24'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    362,
    210027,
    51,
    51,
    '2026-06-08 03:06:25',
    'present',
    '2026-06-10 00:06:25',
    '2026-06-10 00:06:25'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    363,
    210027,
    51,
    51,
    '2026-06-06 03:06:25',
    'absent',
    '2026-06-10 00:06:25',
    '2026-06-10 00:06:25'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    364,
    210027,
    51,
    51,
    '2026-06-04 03:06:25',
    'present',
    '2026-06-10 00:06:25',
    '2026-06-10 00:06:25'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    365,
    210027,
    51,
    51,
    '2026-06-02 03:06:25',
    'late',
    '2026-06-10 00:06:25',
    '2026-06-10 00:06:25'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    366,
    210027,
    51,
    51,
    '2026-05-31 03:06:26',
    'present',
    '2026-06-10 00:06:25',
    '2026-06-10 00:06:25'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    367,
    210027,
    51,
    51,
    '2026-05-29 03:06:26',
    'excused',
    '2026-06-10 00:06:25',
    '2026-06-10 00:06:25'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    368,
    210027,
    51,
    51,
    '2026-05-27 03:06:26',
    'present',
    '2026-06-10 00:06:25',
    '2026-06-10 00:06:25'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    369,
    210027,
    51,
    51,
    '2026-05-25 03:06:26',
    'absent',
    '2026-06-10 00:06:25',
    '2026-06-10 00:06:25'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    370,
    210027,
    51,
    51,
    '2026-05-23 03:06:26',
    'present',
    '2026-06-10 00:06:25',
    '2026-06-10 00:06:25'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    371,
    210027,
    51,
    51,
    '2026-05-21 03:06:26',
    'present',
    '2026-06-10 00:06:25',
    '2026-06-10 00:06:25'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    372,
    210027,
    51,
    51,
    '2026-05-19 03:06:26',
    'absent',
    '2026-06-10 00:06:26',
    '2026-06-10 00:06:26'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    373,
    210027,
    51,
    51,
    '2026-05-17 03:06:26',
    'present',
    '2026-06-10 00:06:26',
    '2026-06-10 00:06:26'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    374,
    210027,
    51,
    51,
    '2026-05-15 03:06:26',
    'late',
    '2026-06-10 00:06:26',
    '2026-06-10 00:06:26'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    375,
    210027,
    51,
    51,
    '2026-05-13 03:06:26',
    'present',
    '2026-06-10 00:06:26',
    '2026-06-10 00:06:26'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    376,
    210027,
    51,
    51,
    '2026-05-11 03:06:27',
    'excused',
    '2026-06-10 00:06:26',
    '2026-06-10 00:06:26'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    377,
    210027,
    51,
    51,
    '2026-05-09 03:06:27',
    'present',
    '2026-06-10 00:06:26',
    '2026-06-10 00:06:26'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    378,
    210027,
    51,
    51,
    '2026-05-07 03:06:27',
    'absent',
    '2026-06-10 00:06:26',
    '2026-06-10 00:06:26'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    379,
    210027,
    51,
    51,
    '2026-05-05 03:06:27',
    'present',
    '2026-06-10 00:06:26',
    '2026-06-10 00:06:26'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    380,
    210027,
    51,
    51,
    '2026-05-03 03:06:27',
    'present',
    '2026-06-10 00:06:26',
    '2026-06-10 00:06:26'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    381,
    210027,
    52,
    52,
    '2026-06-10 03:06:27',
    'present',
    '2026-06-10 00:06:26',
    '2026-06-10 00:06:26'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    382,
    210027,
    52,
    52,
    '2026-06-08 03:06:27',
    'present',
    '2026-06-10 00:06:27',
    '2026-06-10 00:06:27'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    383,
    210027,
    52,
    52,
    '2026-06-06 03:06:27',
    'absent',
    '2026-06-10 00:06:27',
    '2026-06-10 00:06:27'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    384,
    210027,
    52,
    52,
    '2026-06-04 03:06:27',
    'present',
    '2026-06-10 00:06:27',
    '2026-06-10 00:06:27'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    385,
    210027,
    52,
    52,
    '2026-06-02 03:06:28',
    'late',
    '2026-06-10 00:06:27',
    '2026-06-10 00:06:27'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    386,
    210027,
    52,
    52,
    '2026-05-31 03:06:28',
    'present',
    '2026-06-10 00:06:27',
    '2026-06-10 00:06:27'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    387,
    210027,
    52,
    52,
    '2026-05-29 03:06:28',
    'excused',
    '2026-06-10 00:06:27',
    '2026-06-10 00:06:27'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    388,
    210027,
    52,
    52,
    '2026-05-27 03:06:28',
    'present',
    '2026-06-10 00:06:27',
    '2026-06-10 00:06:27'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    389,
    210027,
    52,
    52,
    '2026-05-25 03:06:28',
    'absent',
    '2026-06-10 00:06:27',
    '2026-06-10 00:06:27'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    390,
    210027,
    52,
    52,
    '2026-05-23 03:06:28',
    'present',
    '2026-06-10 00:06:28',
    '2026-06-10 00:06:28'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    391,
    210027,
    52,
    52,
    '2026-05-21 03:06:28',
    'present',
    '2026-06-10 00:06:28',
    '2026-06-10 00:06:28'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    392,
    210027,
    52,
    52,
    '2026-05-19 03:06:29',
    'absent',
    '2026-06-10 00:06:28',
    '2026-06-10 00:06:28'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    393,
    210027,
    52,
    52,
    '2026-05-17 03:06:29',
    'present',
    '2026-06-10 00:06:28',
    '2026-06-10 00:06:28'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    394,
    210027,
    52,
    52,
    '2026-05-15 03:06:29',
    'late',
    '2026-06-10 00:06:28',
    '2026-06-10 00:06:28'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    395,
    210027,
    52,
    52,
    '2026-05-13 03:06:29',
    'present',
    '2026-06-10 00:06:28',
    '2026-06-10 00:06:28'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    396,
    210027,
    52,
    52,
    '2026-05-11 03:06:29',
    'excused',
    '2026-06-10 00:06:28',
    '2026-06-10 00:06:28'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    397,
    210027,
    52,
    52,
    '2026-05-09 03:06:29',
    'present',
    '2026-06-10 00:06:28',
    '2026-06-10 00:06:28'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    398,
    210027,
    52,
    52,
    '2026-05-07 03:06:29',
    'absent',
    '2026-06-10 00:06:29',
    '2026-06-10 00:06:29'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    399,
    210027,
    52,
    52,
    '2026-05-05 03:06:29',
    'present',
    '2026-06-10 00:06:29',
    '2026-06-10 00:06:29'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    400,
    210027,
    52,
    52,
    '2026-05-03 03:06:29',
    'present',
    '2026-06-10 00:06:29',
    '2026-06-10 00:06:29'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    401,
    210027,
    53,
    53,
    '2026-06-10 03:06:29',
    'present',
    '2026-06-10 00:06:29',
    '2026-06-10 00:06:29'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    402,
    210027,
    53,
    53,
    '2026-06-08 03:06:30',
    'present',
    '2026-06-10 00:06:29',
    '2026-06-10 00:06:29'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    403,
    210027,
    53,
    53,
    '2026-06-06 03:06:30',
    'absent',
    '2026-06-10 00:06:29',
    '2026-06-10 00:06:29'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    404,
    210027,
    53,
    53,
    '2026-06-04 03:06:30',
    'present',
    '2026-06-10 00:06:29',
    '2026-06-10 00:06:29'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    405,
    210027,
    53,
    53,
    '2026-06-02 03:06:30',
    'late',
    '2026-06-10 00:06:29',
    '2026-06-10 00:06:29'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    406,
    210027,
    53,
    53,
    '2026-05-31 03:06:30',
    'present',
    '2026-06-10 00:06:29',
    '2026-06-10 00:06:29'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    407,
    210027,
    53,
    53,
    '2026-05-29 03:06:30',
    'excused',
    '2026-06-10 00:06:29',
    '2026-06-10 00:06:29'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    408,
    210027,
    53,
    53,
    '2026-05-27 03:06:30',
    'present',
    '2026-06-10 00:06:30',
    '2026-06-10 00:06:30'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    409,
    210027,
    53,
    53,
    '2026-05-25 03:06:30',
    'absent',
    '2026-06-10 00:06:30',
    '2026-06-10 00:06:30'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    410,
    210027,
    53,
    53,
    '2026-05-23 03:06:30',
    'present',
    '2026-06-10 00:06:30',
    '2026-06-10 00:06:30'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    411,
    210027,
    53,
    53,
    '2026-05-21 03:06:30',
    'present',
    '2026-06-10 00:06:30',
    '2026-06-10 00:06:30'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    412,
    210027,
    53,
    53,
    '2026-05-19 03:06:31',
    'absent',
    '2026-06-10 00:06:30',
    '2026-06-10 00:06:30'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    413,
    210027,
    53,
    53,
    '2026-05-17 03:06:31',
    'present',
    '2026-06-10 00:06:30',
    '2026-06-10 00:06:30'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    414,
    210027,
    53,
    53,
    '2026-05-15 03:06:31',
    'late',
    '2026-06-10 00:06:30',
    '2026-06-10 00:06:30'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    415,
    210027,
    53,
    53,
    '2026-05-13 03:06:31',
    'present',
    '2026-06-10 00:06:30',
    '2026-06-10 00:06:30'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    416,
    210027,
    53,
    53,
    '2026-05-11 03:06:31',
    'excused',
    '2026-06-10 00:06:30',
    '2026-06-10 00:06:30'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    417,
    210027,
    53,
    53,
    '2026-05-09 03:06:31',
    'present',
    '2026-06-10 00:06:30',
    '2026-06-10 00:06:30'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    418,
    210027,
    53,
    53,
    '2026-05-07 03:06:31',
    'absent',
    '2026-06-10 00:06:31',
    '2026-06-10 00:06:31'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    419,
    210027,
    53,
    53,
    '2026-05-05 03:06:31',
    'present',
    '2026-06-10 00:06:31',
    '2026-06-10 00:06:31'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    420,
    210027,
    53,
    53,
    '2026-05-03 03:06:31',
    'present',
    '2026-06-10 00:06:31',
    '2026-06-10 00:06:31'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    421,
    210027,
    54,
    54,
    '2026-06-10 03:06:31',
    'present',
    '2026-06-10 00:06:31',
    '2026-06-10 00:06:31'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    422,
    210027,
    54,
    54,
    '2026-06-08 03:06:32',
    'present',
    '2026-06-10 00:06:31',
    '2026-06-10 00:06:31'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    423,
    210027,
    54,
    54,
    '2026-06-06 03:06:32',
    'absent',
    '2026-06-10 00:06:31',
    '2026-06-10 00:06:31'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    424,
    210027,
    54,
    54,
    '2026-06-04 03:06:32',
    'present',
    '2026-06-10 00:06:31',
    '2026-06-10 00:06:31'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    425,
    210027,
    54,
    54,
    '2026-06-02 03:06:32',
    'late',
    '2026-06-10 00:06:31',
    '2026-06-10 00:06:31'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    426,
    210027,
    54,
    54,
    '2026-05-31 03:06:32',
    'present',
    '2026-06-10 00:06:32',
    '2026-06-10 00:06:32'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    427,
    210027,
    54,
    54,
    '2026-05-29 03:06:32',
    'excused',
    '2026-06-10 00:06:32',
    '2026-06-10 00:06:32'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    428,
    210027,
    54,
    54,
    '2026-05-27 03:06:32',
    'present',
    '2026-06-10 00:06:32',
    '2026-06-10 00:06:32'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    429,
    210027,
    54,
    54,
    '2026-05-25 03:06:32',
    'absent',
    '2026-06-10 00:06:32',
    '2026-06-10 00:06:32'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    430,
    210027,
    54,
    54,
    '2026-05-23 03:06:33',
    'present',
    '2026-06-10 00:06:32',
    '2026-06-10 00:06:32'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    431,
    210027,
    54,
    54,
    '2026-05-21 03:06:33',
    'present',
    '2026-06-10 00:06:32',
    '2026-06-10 00:06:32'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    432,
    210027,
    54,
    54,
    '2026-05-19 03:06:33',
    'absent',
    '2026-06-10 00:06:32',
    '2026-06-10 00:06:32'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    433,
    210027,
    54,
    54,
    '2026-05-17 03:06:33',
    'present',
    '2026-06-10 00:06:32',
    '2026-06-10 00:06:32'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    434,
    210027,
    54,
    54,
    '2026-05-15 03:06:33',
    'late',
    '2026-06-10 00:06:32',
    '2026-06-10 00:06:32'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    435,
    210027,
    54,
    54,
    '2026-05-13 03:06:33',
    'present',
    '2026-06-10 00:06:32',
    '2026-06-10 00:06:32'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    436,
    210027,
    54,
    54,
    '2026-05-11 03:06:33',
    'excused',
    '2026-06-10 00:06:33',
    '2026-06-10 00:06:33'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    437,
    210027,
    54,
    54,
    '2026-05-09 03:06:33',
    'present',
    '2026-06-10 00:06:33',
    '2026-06-10 00:06:33'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    438,
    210027,
    54,
    54,
    '2026-05-07 03:06:33',
    'absent',
    '2026-06-10 00:06:33',
    '2026-06-10 00:06:33'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    439,
    210027,
    54,
    54,
    '2026-05-05 03:06:33',
    'present',
    '2026-06-10 00:06:33',
    '2026-06-10 00:06:33'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    440,
    210027,
    54,
    54,
    '2026-05-03 03:06:34',
    'present',
    '2026-06-10 00:06:33',
    '2026-06-10 00:06:33'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    441,
    210027,
    55,
    55,
    '2026-06-10 03:06:34',
    'present',
    '2026-06-10 00:06:33',
    '2026-06-10 00:06:33'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    442,
    210027,
    55,
    55,
    '2026-06-08 03:06:34',
    'present',
    '2026-06-10 00:06:33',
    '2026-06-10 00:06:33'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    443,
    210027,
    55,
    55,
    '2026-06-06 03:06:34',
    'absent',
    '2026-06-10 00:06:33',
    '2026-06-10 00:06:33'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    444,
    210027,
    55,
    55,
    '2026-06-04 03:06:34',
    'present',
    '2026-06-10 00:06:33',
    '2026-06-10 00:06:33'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    445,
    210027,
    55,
    55,
    '2026-06-02 03:06:34',
    'late',
    '2026-06-10 00:06:33',
    '2026-06-10 00:06:33'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    446,
    210027,
    55,
    55,
    '2026-05-31 03:06:34',
    'present',
    '2026-06-10 00:06:34',
    '2026-06-10 00:06:34'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    447,
    210027,
    55,
    55,
    '2026-05-29 03:06:34',
    'excused',
    '2026-06-10 00:06:34',
    '2026-06-10 00:06:34'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    448,
    210027,
    55,
    55,
    '2026-05-27 03:06:34',
    'present',
    '2026-06-10 00:06:34',
    '2026-06-10 00:06:34'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    449,
    210027,
    55,
    55,
    '2026-05-25 03:06:35',
    'absent',
    '2026-06-10 00:06:34',
    '2026-06-10 00:06:34'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    450,
    210027,
    55,
    55,
    '2026-05-23 03:06:35',
    'present',
    '2026-06-10 00:06:34',
    '2026-06-10 00:06:34'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    451,
    210027,
    55,
    55,
    '2026-05-21 03:06:35',
    'present',
    '2026-06-10 00:06:34',
    '2026-06-10 00:06:34'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    452,
    210027,
    55,
    55,
    '2026-05-19 03:06:35',
    'absent',
    '2026-06-10 00:06:34',
    '2026-06-10 00:06:34'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    453,
    210027,
    55,
    55,
    '2026-05-17 03:06:35',
    'present',
    '2026-06-10 00:06:34',
    '2026-06-10 00:06:34'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    454,
    210027,
    55,
    55,
    '2026-05-15 03:06:35',
    'late',
    '2026-06-10 00:06:35',
    '2026-06-10 00:06:35'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    455,
    210027,
    55,
    55,
    '2026-05-13 03:06:35',
    'present',
    '2026-06-10 00:06:35',
    '2026-06-10 00:06:35'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    456,
    210027,
    55,
    55,
    '2026-05-11 03:06:35',
    'excused',
    '2026-06-10 00:06:35',
    '2026-06-10 00:06:35'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    457,
    210027,
    55,
    55,
    '2026-05-09 03:06:35',
    'present',
    '2026-06-10 00:06:35',
    '2026-06-10 00:06:35'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    458,
    210027,
    55,
    55,
    '2026-05-07 03:06:36',
    'absent',
    '2026-06-10 00:06:35',
    '2026-06-10 00:06:35'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    459,
    210027,
    55,
    55,
    '2026-05-05 03:06:36',
    'present',
    '2026-06-10 00:06:35',
    '2026-06-10 00:06:35'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    460,
    210027,
    55,
    55,
    '2026-05-03 03:06:36',
    'present',
    '2026-06-10 00:06:35',
    '2026-06-10 00:06:35'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    461,
    210027,
    56,
    56,
    '2026-06-10 03:06:36',
    'present',
    '2026-06-10 00:06:35',
    '2026-06-10 00:06:35'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    462,
    210027,
    56,
    56,
    '2026-06-08 03:06:36',
    'present',
    '2026-06-10 00:06:36',
    '2026-06-10 00:06:36'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    463,
    210027,
    56,
    56,
    '2026-06-06 03:06:36',
    'absent',
    '2026-06-10 00:06:36',
    '2026-06-10 00:06:36'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    464,
    210027,
    56,
    56,
    '2026-06-04 03:06:36',
    'present',
    '2026-06-10 00:06:36',
    '2026-06-10 00:06:36'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    465,
    210027,
    56,
    56,
    '2026-06-02 03:06:36',
    'late',
    '2026-06-10 00:06:36',
    '2026-06-10 00:06:36'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    466,
    210027,
    56,
    56,
    '2026-05-31 03:06:37',
    'present',
    '2026-06-10 00:06:36',
    '2026-06-10 00:06:36'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    467,
    210027,
    56,
    56,
    '2026-05-29 03:06:37',
    'excused',
    '2026-06-10 00:06:36',
    '2026-06-10 00:06:36'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    468,
    210027,
    56,
    56,
    '2026-05-27 03:06:37',
    'present',
    '2026-06-10 00:06:36',
    '2026-06-10 00:06:36'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    469,
    210027,
    56,
    56,
    '2026-05-25 03:06:37',
    'absent',
    '2026-06-10 00:06:36',
    '2026-06-10 00:06:36'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    470,
    210027,
    56,
    56,
    '2026-05-23 03:06:37',
    'present',
    '2026-06-10 00:06:36',
    '2026-06-10 00:06:36'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    471,
    210027,
    56,
    56,
    '2026-05-21 03:06:37',
    'present',
    '2026-06-10 00:06:36',
    '2026-06-10 00:06:36'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    472,
    210027,
    56,
    56,
    '2026-05-19 03:06:37',
    'absent',
    '2026-06-10 00:06:37',
    '2026-06-10 00:06:37'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    473,
    210027,
    56,
    56,
    '2026-05-17 03:06:37',
    'present',
    '2026-06-10 00:06:37',
    '2026-06-10 00:06:37'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    474,
    210027,
    56,
    56,
    '2026-05-15 03:06:37',
    'late',
    '2026-06-10 00:06:37',
    '2026-06-10 00:06:37'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    475,
    210027,
    56,
    56,
    '2026-05-13 03:06:37',
    'present',
    '2026-06-10 00:06:37',
    '2026-06-10 00:06:37'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    476,
    210027,
    56,
    56,
    '2026-05-11 03:06:38',
    'excused',
    '2026-06-10 00:06:37',
    '2026-06-10 00:06:37'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    477,
    210027,
    56,
    56,
    '2026-05-09 03:06:38',
    'present',
    '2026-06-10 00:06:37',
    '2026-06-10 00:06:37'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    478,
    210027,
    56,
    56,
    '2026-05-07 03:06:38',
    'absent',
    '2026-06-10 00:06:37',
    '2026-06-10 00:06:37'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    479,
    210027,
    56,
    56,
    '2026-05-05 03:06:38',
    'present',
    '2026-06-10 00:06:37',
    '2026-06-10 00:06:37'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    480,
    210027,
    56,
    56,
    '2026-05-03 03:06:38',
    'present',
    '2026-06-10 00:06:37',
    '2026-06-10 00:06:37'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    481,
    210027,
    57,
    57,
    '2026-06-10 03:06:38',
    'present',
    '2026-06-10 00:06:37',
    '2026-06-10 00:06:37'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    482,
    210027,
    57,
    57,
    '2026-06-08 03:06:38',
    'present',
    '2026-06-10 00:06:38',
    '2026-06-10 00:06:38'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    483,
    210027,
    57,
    57,
    '2026-06-06 03:06:38',
    'absent',
    '2026-06-10 00:06:38',
    '2026-06-10 00:06:38'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    484,
    210027,
    57,
    57,
    '2026-06-04 03:06:38',
    'present',
    '2026-06-10 00:06:38',
    '2026-06-10 00:06:38'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    485,
    210027,
    57,
    57,
    '2026-06-02 03:06:38',
    'late',
    '2026-06-10 00:06:38',
    '2026-06-10 00:06:38'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    486,
    210027,
    57,
    57,
    '2026-05-31 03:06:39',
    'present',
    '2026-06-10 00:06:38',
    '2026-06-10 00:06:38'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    487,
    210027,
    57,
    57,
    '2026-05-29 03:06:39',
    'excused',
    '2026-06-10 00:06:38',
    '2026-06-10 00:06:38'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    488,
    210027,
    57,
    57,
    '2026-05-27 03:06:39',
    'present',
    '2026-06-10 00:06:38',
    '2026-06-10 00:06:38'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    489,
    210027,
    57,
    57,
    '2026-05-25 03:06:39',
    'absent',
    '2026-06-10 00:06:38',
    '2026-06-10 00:06:38'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    490,
    210027,
    57,
    57,
    '2026-05-23 03:06:39',
    'present',
    '2026-06-10 00:06:38',
    '2026-06-10 00:06:38'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    491,
    210027,
    57,
    57,
    '2026-05-21 03:06:39',
    'present',
    '2026-06-10 00:06:38',
    '2026-06-10 00:06:38'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    492,
    210027,
    57,
    57,
    '2026-05-19 03:06:39',
    'absent',
    '2026-06-10 00:06:39',
    '2026-06-10 00:06:39'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    493,
    210027,
    57,
    57,
    '2026-05-17 03:06:39',
    'present',
    '2026-06-10 00:06:39',
    '2026-06-10 00:06:39'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    494,
    210027,
    57,
    57,
    '2026-05-15 03:06:39',
    'late',
    '2026-06-10 00:06:39',
    '2026-06-10 00:06:39'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    495,
    210027,
    57,
    57,
    '2026-05-13 03:06:39',
    'present',
    '2026-06-10 00:06:39',
    '2026-06-10 00:06:39'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    496,
    210027,
    57,
    57,
    '2026-05-11 03:06:40',
    'excused',
    '2026-06-10 00:06:39',
    '2026-06-10 00:06:39'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    497,
    210027,
    57,
    57,
    '2026-05-09 03:06:40',
    'present',
    '2026-06-10 00:06:39',
    '2026-06-10 00:06:39'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    498,
    210027,
    57,
    57,
    '2026-05-07 03:06:40',
    'absent',
    '2026-06-10 00:06:39',
    '2026-06-10 00:06:39'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    499,
    210027,
    57,
    57,
    '2026-05-05 03:06:40',
    'present',
    '2026-06-10 00:06:39',
    '2026-06-10 00:06:39'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    500,
    210027,
    57,
    57,
    '2026-05-03 03:06:40',
    'present',
    '2026-06-10 00:06:39',
    '2026-06-10 00:06:39'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    501,
    210028,
    33,
    33,
    '2026-06-10 03:06:40',
    'present',
    '2026-06-10 00:06:40',
    '2026-06-10 00:06:40'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    502,
    210028,
    33,
    33,
    '2026-06-08 03:06:40',
    'absent',
    '2026-06-10 00:06:40',
    '2026-06-10 00:06:40'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    503,
    210028,
    33,
    33,
    '2026-06-06 03:06:40',
    'absent',
    '2026-06-10 00:06:40',
    '2026-06-10 00:06:40'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    504,
    210028,
    33,
    33,
    '2026-06-04 03:06:41',
    'late',
    '2026-06-10 00:06:40',
    '2026-06-10 00:06:40'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    505,
    210028,
    33,
    33,
    '2026-06-02 03:06:41',
    'present',
    '2026-06-10 00:06:40',
    '2026-06-10 00:06:40'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    506,
    210028,
    33,
    33,
    '2026-05-31 03:06:41',
    'absent',
    '2026-06-10 00:06:40',
    '2026-06-10 00:06:40'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    507,
    210028,
    33,
    33,
    '2026-05-29 03:06:41',
    'present',
    '2026-06-10 00:06:40',
    '2026-06-10 00:06:40'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    508,
    210028,
    33,
    33,
    '2026-05-27 03:06:41',
    'late',
    '2026-06-10 00:06:41',
    '2026-06-10 00:06:41'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    509,
    210028,
    33,
    33,
    '2026-05-25 03:06:41',
    'absent',
    '2026-06-10 00:06:41',
    '2026-06-10 00:06:41'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    510,
    210028,
    33,
    33,
    '2026-05-23 03:06:41',
    'present',
    '2026-06-10 00:06:41',
    '2026-06-10 00:06:41'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    511,
    210028,
    33,
    33,
    '2026-05-21 03:06:41',
    'present',
    '2026-06-10 00:06:41',
    '2026-06-10 00:06:41'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    512,
    210028,
    33,
    33,
    '2026-05-19 03:06:42',
    'absent',
    '2026-06-10 00:06:41',
    '2026-06-10 00:06:41'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    513,
    210028,
    33,
    33,
    '2026-05-17 03:06:42',
    'absent',
    '2026-06-10 00:06:41',
    '2026-06-10 00:06:41'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    514,
    210028,
    33,
    33,
    '2026-05-15 03:06:42',
    'late',
    '2026-06-10 00:06:41',
    '2026-06-10 00:06:41'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    515,
    210028,
    33,
    33,
    '2026-05-13 03:06:42',
    'present',
    '2026-06-10 00:06:41',
    '2026-06-10 00:06:41'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    516,
    210028,
    33,
    33,
    '2026-05-11 03:06:42',
    'absent',
    '2026-06-10 00:06:41',
    '2026-06-10 00:06:41'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    517,
    210028,
    33,
    33,
    '2026-05-09 03:06:42',
    'present',
    '2026-06-10 00:06:41',
    '2026-06-10 00:06:41'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    518,
    210028,
    33,
    33,
    '2026-05-07 03:06:42',
    'late',
    '2026-06-10 00:06:42',
    '2026-06-10 00:06:42'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    519,
    210028,
    33,
    33,
    '2026-05-05 03:06:42',
    'absent',
    '2026-06-10 00:06:42',
    '2026-06-10 00:06:42'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    520,
    210028,
    33,
    33,
    '2026-05-03 03:06:42',
    'present',
    '2026-06-10 00:06:42',
    '2026-06-10 00:06:42'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    521,
    210028,
    34,
    34,
    '2026-06-10 03:06:42',
    'present',
    '2026-06-10 00:06:42',
    '2026-06-10 00:06:42'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    522,
    210028,
    34,
    34,
    '2026-06-08 03:06:43',
    'absent',
    '2026-06-10 00:06:42',
    '2026-06-10 00:06:42'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    523,
    210028,
    34,
    34,
    '2026-06-06 03:06:43',
    'absent',
    '2026-06-10 00:06:42',
    '2026-06-10 00:06:42'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    524,
    210028,
    34,
    34,
    '2026-06-04 03:06:43',
    'late',
    '2026-06-10 00:06:42',
    '2026-06-10 00:06:42'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    525,
    210028,
    34,
    34,
    '2026-06-02 03:06:43',
    'present',
    '2026-06-10 00:06:42',
    '2026-06-10 00:06:42'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    526,
    210028,
    34,
    34,
    '2026-05-31 03:06:43',
    'absent',
    '2026-06-10 00:06:42',
    '2026-06-10 00:06:42'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    527,
    210028,
    34,
    34,
    '2026-05-29 03:06:43',
    'present',
    '2026-06-10 00:06:42',
    '2026-06-10 00:06:42'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    528,
    210028,
    34,
    34,
    '2026-05-27 03:06:43',
    'late',
    '2026-06-10 00:06:43',
    '2026-06-10 00:06:43'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    529,
    210028,
    34,
    34,
    '2026-05-25 03:06:43',
    'absent',
    '2026-06-10 00:06:43',
    '2026-06-10 00:06:43'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    530,
    210028,
    34,
    34,
    '2026-05-23 03:06:43',
    'present',
    '2026-06-10 00:06:43',
    '2026-06-10 00:06:43'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    531,
    210028,
    34,
    34,
    '2026-05-21 03:06:43',
    'present',
    '2026-06-10 00:06:43',
    '2026-06-10 00:06:43'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    532,
    210028,
    34,
    34,
    '2026-05-19 03:06:43',
    'absent',
    '2026-06-10 00:06:43',
    '2026-06-10 00:06:43'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    533,
    210028,
    34,
    34,
    '2026-05-17 03:06:44',
    'absent',
    '2026-06-10 00:06:43',
    '2026-06-10 00:06:43'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    534,
    210028,
    34,
    34,
    '2026-05-15 03:06:44',
    'late',
    '2026-06-10 00:06:43',
    '2026-06-10 00:06:43'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    535,
    210028,
    34,
    34,
    '2026-05-13 03:06:44',
    'present',
    '2026-06-10 00:06:43',
    '2026-06-10 00:06:43'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    536,
    210028,
    34,
    34,
    '2026-05-11 03:06:44',
    'absent',
    '2026-06-10 00:06:43',
    '2026-06-10 00:06:43'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    537,
    210028,
    34,
    34,
    '2026-05-09 03:06:44',
    'present',
    '2026-06-10 00:06:43',
    '2026-06-10 00:06:43'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    538,
    210028,
    34,
    34,
    '2026-05-07 03:06:44',
    'late',
    '2026-06-10 00:06:43',
    '2026-06-10 00:06:43'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    539,
    210028,
    34,
    34,
    '2026-05-05 03:06:44',
    'absent',
    '2026-06-10 00:06:43',
    '2026-06-10 00:06:43'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    540,
    210028,
    34,
    34,
    '2026-05-03 03:06:44',
    'present',
    '2026-06-10 00:06:43',
    '2026-06-10 00:06:43'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    541,
    210028,
    35,
    35,
    '2026-06-10 03:06:44',
    'present',
    '2026-06-10 00:06:44',
    '2026-06-10 00:06:44'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    542,
    210028,
    35,
    35,
    '2026-06-08 03:06:44',
    'absent',
    '2026-06-10 00:06:44',
    '2026-06-10 00:06:44'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    543,
    210028,
    35,
    35,
    '2026-06-06 03:06:44',
    'absent',
    '2026-06-10 00:06:44',
    '2026-06-10 00:06:44'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    544,
    210028,
    35,
    35,
    '2026-06-04 03:06:44',
    'late',
    '2026-06-10 00:06:44',
    '2026-06-10 00:06:44'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    545,
    210028,
    35,
    35,
    '2026-06-02 03:06:44',
    'present',
    '2026-06-10 00:06:44',
    '2026-06-10 00:06:44'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    546,
    210028,
    35,
    35,
    '2026-05-31 03:06:45',
    'absent',
    '2026-06-10 00:06:44',
    '2026-06-10 00:06:44'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    547,
    210028,
    35,
    35,
    '2026-05-29 03:06:45',
    'present',
    '2026-06-10 00:06:44',
    '2026-06-10 00:06:44'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    548,
    210028,
    35,
    35,
    '2026-05-27 03:06:45',
    'late',
    '2026-06-10 00:06:44',
    '2026-06-10 00:06:44'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    549,
    210028,
    35,
    35,
    '2026-05-25 03:06:45',
    'absent',
    '2026-06-10 00:06:44',
    '2026-06-10 00:06:44'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    550,
    210028,
    35,
    35,
    '2026-05-23 03:06:45',
    'present',
    '2026-06-10 00:06:44',
    '2026-06-10 00:06:44'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    551,
    210028,
    35,
    35,
    '2026-05-21 03:06:45',
    'present',
    '2026-06-10 00:06:44',
    '2026-06-10 00:06:44'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    552,
    210028,
    35,
    35,
    '2026-05-19 03:06:45',
    'absent',
    '2026-06-10 00:06:44',
    '2026-06-10 00:06:44'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    553,
    210028,
    35,
    35,
    '2026-05-17 03:06:45',
    'absent',
    '2026-06-10 00:06:44',
    '2026-06-10 00:06:44'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    554,
    210028,
    35,
    35,
    '2026-05-15 03:06:45',
    'late',
    '2026-06-10 00:06:44',
    '2026-06-10 00:06:44'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    555,
    210028,
    35,
    35,
    '2026-05-13 03:06:45',
    'present',
    '2026-06-10 00:06:45',
    '2026-06-10 00:06:45'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    556,
    210028,
    35,
    35,
    '2026-05-11 03:06:45',
    'absent',
    '2026-06-10 00:06:45',
    '2026-06-10 00:06:45'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    557,
    210028,
    35,
    35,
    '2026-05-09 03:06:45',
    'present',
    '2026-06-10 00:06:45',
    '2026-06-10 00:06:45'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    558,
    210028,
    35,
    35,
    '2026-05-07 03:06:45',
    'late',
    '2026-06-10 00:06:45',
    '2026-06-10 00:06:45'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    559,
    210028,
    35,
    35,
    '2026-05-05 03:06:45',
    'absent',
    '2026-06-10 00:06:45',
    '2026-06-10 00:06:45'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    560,
    210028,
    35,
    35,
    '2026-05-03 03:06:45',
    'present',
    '2026-06-10 00:06:45',
    '2026-06-10 00:06:45'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    561,
    210028,
    36,
    36,
    '2026-06-10 03:06:46',
    'present',
    '2026-06-10 00:06:45',
    '2026-06-10 00:06:45'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    562,
    210028,
    36,
    36,
    '2026-06-08 03:06:46',
    'absent',
    '2026-06-10 00:06:45',
    '2026-06-10 00:06:45'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    563,
    210028,
    36,
    36,
    '2026-06-06 03:06:46',
    'absent',
    '2026-06-10 00:06:45',
    '2026-06-10 00:06:45'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    564,
    210028,
    36,
    36,
    '2026-06-04 03:06:46',
    'late',
    '2026-06-10 00:06:45',
    '2026-06-10 00:06:45'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    565,
    210028,
    36,
    36,
    '2026-06-02 03:06:46',
    'present',
    '2026-06-10 00:06:45',
    '2026-06-10 00:06:45'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    566,
    210028,
    36,
    36,
    '2026-05-31 03:06:46',
    'absent',
    '2026-06-10 00:06:46',
    '2026-06-10 00:06:46'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    567,
    210028,
    36,
    36,
    '2026-05-29 03:06:46',
    'present',
    '2026-06-10 00:06:46',
    '2026-06-10 00:06:46'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    568,
    210028,
    36,
    36,
    '2026-05-27 03:06:46',
    'late',
    '2026-06-10 00:06:46',
    '2026-06-10 00:06:46'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    569,
    210028,
    36,
    36,
    '2026-05-25 03:06:46',
    'absent',
    '2026-06-10 00:06:46',
    '2026-06-10 00:06:46'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    570,
    210028,
    36,
    36,
    '2026-05-23 03:06:47',
    'present',
    '2026-06-10 00:06:46',
    '2026-06-10 00:06:46'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    571,
    210028,
    36,
    36,
    '2026-05-21 03:06:47',
    'present',
    '2026-06-10 00:06:46',
    '2026-06-10 00:06:46'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    572,
    210028,
    36,
    36,
    '2026-05-19 03:06:47',
    'absent',
    '2026-06-10 00:06:46',
    '2026-06-10 00:06:46'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    573,
    210028,
    36,
    36,
    '2026-05-17 03:06:47',
    'absent',
    '2026-06-10 00:06:46',
    '2026-06-10 00:06:46'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    574,
    210028,
    36,
    36,
    '2026-05-15 03:06:47',
    'late',
    '2026-06-10 00:06:46',
    '2026-06-10 00:06:46'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    575,
    210028,
    36,
    36,
    '2026-05-13 03:06:47',
    'present',
    '2026-06-10 00:06:47',
    '2026-06-10 00:06:47'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    576,
    210028,
    36,
    36,
    '2026-05-11 03:06:47',
    'absent',
    '2026-06-10 00:06:47',
    '2026-06-10 00:06:47'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    577,
    210028,
    36,
    36,
    '2026-05-09 03:06:47',
    'present',
    '2026-06-10 00:06:47',
    '2026-06-10 00:06:47'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    578,
    210028,
    36,
    36,
    '2026-05-07 03:06:47',
    'late',
    '2026-06-10 00:06:47',
    '2026-06-10 00:06:47'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    579,
    210028,
    36,
    36,
    '2026-05-05 03:06:48',
    'absent',
    '2026-06-10 00:06:47',
    '2026-06-10 00:06:47'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    580,
    210028,
    36,
    36,
    '2026-05-03 03:06:48',
    'present',
    '2026-06-10 00:06:47',
    '2026-06-10 00:06:47'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    581,
    210028,
    37,
    37,
    '2026-06-10 03:06:48',
    'present',
    '2026-06-10 00:06:47',
    '2026-06-10 00:06:47'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    582,
    210028,
    37,
    37,
    '2026-06-08 03:06:48',
    'absent',
    '2026-06-10 00:06:47',
    '2026-06-10 00:06:47'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    583,
    210028,
    37,
    37,
    '2026-06-06 03:06:48',
    'absent',
    '2026-06-10 00:06:48',
    '2026-06-10 00:06:48'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    584,
    210028,
    37,
    37,
    '2026-06-04 03:06:48',
    'late',
    '2026-06-10 00:06:48',
    '2026-06-10 00:06:48'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    585,
    210028,
    37,
    37,
    '2026-06-02 03:06:48',
    'present',
    '2026-06-10 00:06:48',
    '2026-06-10 00:06:48'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    586,
    210028,
    37,
    37,
    '2026-05-31 03:06:48',
    'absent',
    '2026-06-10 00:06:48',
    '2026-06-10 00:06:48'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    587,
    210028,
    37,
    37,
    '2026-05-29 03:06:49',
    'present',
    '2026-06-10 00:06:48',
    '2026-06-10 00:06:48'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    588,
    210028,
    37,
    37,
    '2026-05-27 03:06:49',
    'late',
    '2026-06-10 00:06:48',
    '2026-06-10 00:06:48'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    589,
    210028,
    37,
    37,
    '2026-05-25 03:06:49',
    'absent',
    '2026-06-10 00:06:48',
    '2026-06-10 00:06:48'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    590,
    210028,
    37,
    37,
    '2026-05-23 03:06:49',
    'present',
    '2026-06-10 00:06:48',
    '2026-06-10 00:06:48'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    591,
    210028,
    37,
    37,
    '2026-05-21 03:06:49',
    'present',
    '2026-06-10 00:06:48',
    '2026-06-10 00:06:48'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    592,
    210028,
    37,
    37,
    '2026-05-19 03:06:49',
    'absent',
    '2026-06-10 00:06:49',
    '2026-06-10 00:06:49'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    593,
    210028,
    37,
    37,
    '2026-05-17 03:06:49',
    'absent',
    '2026-06-10 00:06:49',
    '2026-06-10 00:06:49'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    594,
    210028,
    37,
    37,
    '2026-05-15 03:06:49',
    'late',
    '2026-06-10 00:06:49',
    '2026-06-10 00:06:49'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    595,
    210028,
    37,
    37,
    '2026-05-13 03:06:49',
    'present',
    '2026-06-10 00:06:49',
    '2026-06-10 00:06:49'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    596,
    210028,
    37,
    37,
    '2026-05-11 03:06:50',
    'absent',
    '2026-06-10 00:06:49',
    '2026-06-10 00:06:49'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    597,
    210028,
    37,
    37,
    '2026-05-09 03:06:50',
    'present',
    '2026-06-10 00:06:49',
    '2026-06-10 00:06:49'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    598,
    210028,
    37,
    37,
    '2026-05-07 03:06:50',
    'late',
    '2026-06-10 00:06:49',
    '2026-06-10 00:06:49'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    599,
    210028,
    37,
    37,
    '2026-05-05 03:06:50',
    'absent',
    '2026-06-10 00:06:49',
    '2026-06-10 00:06:49'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    600,
    210028,
    37,
    37,
    '2026-05-03 03:06:50',
    'present',
    '2026-06-10 00:06:50',
    '2026-06-10 00:06:50'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    601,
    210028,
    38,
    38,
    '2026-06-10 03:06:50',
    'present',
    '2026-06-10 00:06:50',
    '2026-06-10 00:06:50'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    602,
    210028,
    38,
    38,
    '2026-06-08 03:06:50',
    'absent',
    '2026-06-10 00:06:50',
    '2026-06-10 00:06:50'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    603,
    210028,
    38,
    38,
    '2026-06-06 03:06:50',
    'absent',
    '2026-06-10 00:06:50',
    '2026-06-10 00:06:50'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    604,
    210028,
    38,
    38,
    '2026-06-04 03:06:51',
    'late',
    '2026-06-10 00:06:50',
    '2026-06-10 00:06:50'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    605,
    210028,
    38,
    38,
    '2026-06-02 03:06:51',
    'present',
    '2026-06-10 00:06:50',
    '2026-06-10 00:06:50'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    606,
    210028,
    38,
    38,
    '2026-05-31 03:06:51',
    'absent',
    '2026-06-10 00:06:50',
    '2026-06-10 00:06:50'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    607,
    210028,
    38,
    38,
    '2026-05-29 03:06:51',
    'present',
    '2026-06-10 00:06:50',
    '2026-06-10 00:06:50'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    608,
    210028,
    38,
    38,
    '2026-05-27 03:06:51',
    'late',
    '2026-06-10 00:06:50',
    '2026-06-10 00:06:50'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    609,
    210028,
    38,
    38,
    '2026-05-25 03:06:51',
    'absent',
    '2026-06-10 00:06:50',
    '2026-06-10 00:06:50'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    610,
    210028,
    38,
    38,
    '2026-05-23 03:06:51',
    'present',
    '2026-06-10 00:06:51',
    '2026-06-10 00:06:51'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    611,
    210028,
    38,
    38,
    '2026-05-21 03:06:51',
    'present',
    '2026-06-10 00:06:51',
    '2026-06-10 00:06:51'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    612,
    210028,
    38,
    38,
    '2026-05-19 03:06:51',
    'absent',
    '2026-06-10 00:06:51',
    '2026-06-10 00:06:51'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    613,
    210028,
    38,
    38,
    '2026-05-17 03:06:51',
    'absent',
    '2026-06-10 00:06:51',
    '2026-06-10 00:06:51'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    614,
    210028,
    38,
    38,
    '2026-05-15 03:06:52',
    'late',
    '2026-06-10 00:06:51',
    '2026-06-10 00:06:51'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    615,
    210028,
    38,
    38,
    '2026-05-13 03:06:52',
    'present',
    '2026-06-10 00:06:51',
    '2026-06-10 00:06:51'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    616,
    210028,
    38,
    38,
    '2026-05-11 03:06:52',
    'absent',
    '2026-06-10 00:06:51',
    '2026-06-10 00:06:51'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    617,
    210028,
    38,
    38,
    '2026-05-09 03:06:52',
    'present',
    '2026-06-10 00:06:51',
    '2026-06-10 00:06:51'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    618,
    210028,
    38,
    38,
    '2026-05-07 03:06:52',
    'late',
    '2026-06-10 00:06:51',
    '2026-06-10 00:06:51'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    619,
    210028,
    38,
    38,
    '2026-05-05 03:06:52',
    'absent',
    '2026-06-10 00:06:51',
    '2026-06-10 00:06:51'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    620,
    210028,
    38,
    38,
    '2026-05-03 03:06:52',
    'present',
    '2026-06-10 00:06:51',
    '2026-06-10 00:06:51'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    621,
    210028,
    39,
    39,
    '2026-06-10 03:06:52',
    'present',
    '2026-06-10 00:06:51',
    '2026-06-10 00:06:51'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    622,
    210028,
    39,
    39,
    '2026-06-08 03:06:52',
    'absent',
    '2026-06-10 00:06:52',
    '2026-06-10 00:06:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    623,
    210028,
    39,
    39,
    '2026-06-06 03:06:52',
    'absent',
    '2026-06-10 00:06:52',
    '2026-06-10 00:06:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    624,
    210028,
    39,
    39,
    '2026-06-04 03:06:52',
    'late',
    '2026-06-10 00:06:52',
    '2026-06-10 00:06:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    625,
    210028,
    39,
    39,
    '2026-06-02 03:06:52',
    'present',
    '2026-06-10 00:06:52',
    '2026-06-10 00:06:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    626,
    210028,
    39,
    39,
    '2026-05-31 03:06:52',
    'absent',
    '2026-06-10 00:06:52',
    '2026-06-10 00:06:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    627,
    210028,
    39,
    39,
    '2026-05-29 03:06:52',
    'present',
    '2026-06-10 00:06:52',
    '2026-06-10 00:06:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    628,
    210028,
    39,
    39,
    '2026-05-27 03:06:52',
    'late',
    '2026-06-10 00:06:52',
    '2026-06-10 00:06:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    629,
    210028,
    39,
    39,
    '2026-05-25 03:06:53',
    'absent',
    '2026-06-10 00:06:52',
    '2026-06-10 00:06:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    630,
    210028,
    39,
    39,
    '2026-05-23 03:06:53',
    'present',
    '2026-06-10 00:06:52',
    '2026-06-10 00:06:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    631,
    210028,
    39,
    39,
    '2026-05-21 03:06:53',
    'present',
    '2026-06-10 00:06:52',
    '2026-06-10 00:06:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    632,
    210028,
    39,
    39,
    '2026-05-19 03:06:53',
    'absent',
    '2026-06-10 00:06:52',
    '2026-06-10 00:06:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    633,
    210028,
    39,
    39,
    '2026-05-17 03:06:53',
    'absent',
    '2026-06-10 00:06:52',
    '2026-06-10 00:06:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    634,
    210028,
    39,
    39,
    '2026-05-15 03:06:53',
    'late',
    '2026-06-10 00:06:52',
    '2026-06-10 00:06:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    635,
    210028,
    39,
    39,
    '2026-05-13 03:06:53',
    'present',
    '2026-06-10 00:06:52',
    '2026-06-10 00:06:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    636,
    210028,
    39,
    39,
    '2026-05-11 03:06:53',
    'absent',
    '2026-06-10 00:06:52',
    '2026-06-10 00:06:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    637,
    210028,
    39,
    39,
    '2026-05-09 03:06:53',
    'present',
    '2026-06-10 00:06:53',
    '2026-06-10 00:06:53'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    638,
    210028,
    39,
    39,
    '2026-05-07 03:06:53',
    'late',
    '2026-06-10 00:06:53',
    '2026-06-10 00:06:53'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    639,
    210028,
    39,
    39,
    '2026-05-05 03:06:53',
    'absent',
    '2026-06-10 00:06:53',
    '2026-06-10 00:06:53'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    640,
    210028,
    39,
    39,
    '2026-05-03 03:06:53',
    'present',
    '2026-06-10 00:06:53',
    '2026-06-10 00:06:53'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    641,
    210028,
    40,
    40,
    '2026-06-10 03:06:53',
    'present',
    '2026-06-10 00:06:53',
    '2026-06-10 00:06:53'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    642,
    210028,
    40,
    40,
    '2026-06-08 03:06:53',
    'absent',
    '2026-06-10 00:06:53',
    '2026-06-10 00:06:53'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    643,
    210028,
    40,
    40,
    '2026-06-06 03:06:54',
    'absent',
    '2026-06-10 00:06:53',
    '2026-06-10 00:06:53'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    644,
    210028,
    40,
    40,
    '2026-06-04 03:06:54',
    'late',
    '2026-06-10 00:06:53',
    '2026-06-10 00:06:53'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    645,
    210028,
    40,
    40,
    '2026-06-02 03:06:54',
    'present',
    '2026-06-10 00:06:53',
    '2026-06-10 00:06:53'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    646,
    210028,
    40,
    40,
    '2026-05-31 03:06:54',
    'absent',
    '2026-06-10 00:06:53',
    '2026-06-10 00:06:53'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    647,
    210028,
    40,
    40,
    '2026-05-29 03:06:54',
    'present',
    '2026-06-10 00:06:53',
    '2026-06-10 00:06:53'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    648,
    210028,
    40,
    40,
    '2026-05-27 03:06:54',
    'late',
    '2026-06-10 00:06:54',
    '2026-06-10 00:06:54'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    649,
    210028,
    40,
    40,
    '2026-05-25 03:06:54',
    'absent',
    '2026-06-10 00:06:54',
    '2026-06-10 00:06:54'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    650,
    210028,
    40,
    40,
    '2026-05-23 03:06:54',
    'present',
    '2026-06-10 00:06:54',
    '2026-06-10 00:06:54'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    651,
    210028,
    40,
    40,
    '2026-05-21 03:06:55',
    'present',
    '2026-06-10 00:06:54',
    '2026-06-10 00:06:54'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    652,
    210028,
    40,
    40,
    '2026-05-19 03:06:55',
    'absent',
    '2026-06-10 00:06:54',
    '2026-06-10 00:06:54'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    653,
    210028,
    40,
    40,
    '2026-05-17 03:06:55',
    'absent',
    '2026-06-10 00:06:54',
    '2026-06-10 00:06:54'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    654,
    210028,
    40,
    40,
    '2026-05-15 03:06:55',
    'late',
    '2026-06-10 00:06:54',
    '2026-06-10 00:06:54'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    655,
    210028,
    40,
    40,
    '2026-05-13 03:06:55',
    'present',
    '2026-06-10 00:06:54',
    '2026-06-10 00:06:54'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    656,
    210028,
    40,
    40,
    '2026-05-11 03:06:55',
    'absent',
    '2026-06-10 00:06:54',
    '2026-06-10 00:06:54'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    657,
    210028,
    40,
    40,
    '2026-05-09 03:06:55',
    'present',
    '2026-06-10 00:06:55',
    '2026-06-10 00:06:55'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    658,
    210028,
    40,
    40,
    '2026-05-07 03:06:55',
    'late',
    '2026-06-10 00:06:55',
    '2026-06-10 00:06:55'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    659,
    210028,
    40,
    40,
    '2026-05-05 03:06:55',
    'absent',
    '2026-06-10 00:06:55',
    '2026-06-10 00:06:55'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    660,
    210028,
    40,
    40,
    '2026-05-03 03:06:55',
    'present',
    '2026-06-10 00:06:55',
    '2026-06-10 00:06:55'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    661,
    210029,
    33,
    33,
    '2026-06-10 03:06:56',
    'present',
    '2026-06-10 00:06:55',
    '2026-06-10 00:06:55'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    662,
    210029,
    33,
    33,
    '2026-06-08 03:06:56',
    'present',
    '2026-06-10 00:06:55',
    '2026-06-10 00:06:55'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    663,
    210029,
    33,
    33,
    '2026-06-06 03:06:56',
    'present',
    '2026-06-10 00:06:55',
    '2026-06-10 00:06:55'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    664,
    210029,
    33,
    33,
    '2026-06-04 03:06:56',
    'present',
    '2026-06-10 00:06:55',
    '2026-06-10 00:06:55'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    665,
    210029,
    33,
    33,
    '2026-06-02 03:06:56',
    'excused',
    '2026-06-10 00:06:56',
    '2026-06-10 00:06:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    666,
    210029,
    33,
    33,
    '2026-05-31 03:06:56',
    'present',
    '2026-06-10 00:06:56',
    '2026-06-10 00:06:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    667,
    210029,
    33,
    33,
    '2026-05-29 03:06:56',
    'present',
    '2026-06-10 00:06:56',
    '2026-06-10 00:06:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    668,
    210029,
    33,
    33,
    '2026-05-27 03:06:56',
    'late',
    '2026-06-10 00:06:56',
    '2026-06-10 00:06:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    669,
    210029,
    33,
    33,
    '2026-05-25 03:06:57',
    'present',
    '2026-06-10 00:06:56',
    '2026-06-10 00:06:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    670,
    210029,
    33,
    33,
    '2026-05-23 03:06:57',
    'present',
    '2026-06-10 00:06:56',
    '2026-06-10 00:06:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    671,
    210029,
    33,
    33,
    '2026-05-21 03:06:57',
    'present',
    '2026-06-10 00:06:56',
    '2026-06-10 00:06:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    672,
    210029,
    33,
    33,
    '2026-05-19 03:06:57',
    'present',
    '2026-06-10 00:06:56',
    '2026-06-10 00:06:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    673,
    210029,
    33,
    33,
    '2026-05-17 03:06:57',
    'excused',
    '2026-06-10 00:06:56',
    '2026-06-10 00:06:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    674,
    210029,
    33,
    33,
    '2026-05-15 03:06:57',
    'present',
    '2026-06-10 00:06:56',
    '2026-06-10 00:06:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    675,
    210029,
    33,
    33,
    '2026-05-13 03:06:57',
    'present',
    '2026-06-10 00:06:57',
    '2026-06-10 00:06:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    676,
    210029,
    33,
    33,
    '2026-05-11 03:06:57',
    'late',
    '2026-06-10 00:06:57',
    '2026-06-10 00:06:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    677,
    210029,
    33,
    33,
    '2026-05-09 03:06:57',
    'present',
    '2026-06-10 00:06:57',
    '2026-06-10 00:06:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    678,
    210029,
    33,
    33,
    '2026-05-07 03:06:57',
    'present',
    '2026-06-10 00:06:57',
    '2026-06-10 00:06:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    679,
    210029,
    33,
    33,
    '2026-05-05 03:06:58',
    'present',
    '2026-06-10 00:06:57',
    '2026-06-10 00:06:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    680,
    210029,
    33,
    33,
    '2026-05-03 03:06:58',
    'present',
    '2026-06-10 00:06:57',
    '2026-06-10 00:06:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    681,
    210029,
    34,
    34,
    '2026-06-10 03:06:58',
    'present',
    '2026-06-10 00:06:57',
    '2026-06-10 00:06:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    682,
    210029,
    34,
    34,
    '2026-06-08 03:06:58',
    'present',
    '2026-06-10 00:06:57',
    '2026-06-10 00:06:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    683,
    210029,
    34,
    34,
    '2026-06-06 03:06:58',
    'present',
    '2026-06-10 00:06:57',
    '2026-06-10 00:06:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    684,
    210029,
    34,
    34,
    '2026-06-04 03:06:58',
    'present',
    '2026-06-10 00:06:58',
    '2026-06-10 00:06:58'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    685,
    210029,
    34,
    34,
    '2026-06-02 03:06:58',
    'excused',
    '2026-06-10 00:06:58',
    '2026-06-10 00:06:58'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    686,
    210029,
    34,
    34,
    '2026-05-31 03:06:58',
    'present',
    '2026-06-10 00:06:58',
    '2026-06-10 00:06:58'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    687,
    210029,
    34,
    34,
    '2026-05-29 03:06:58',
    'present',
    '2026-06-10 00:06:58',
    '2026-06-10 00:06:58'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    688,
    210029,
    34,
    34,
    '2026-05-27 03:06:59',
    'late',
    '2026-06-10 00:06:58',
    '2026-06-10 00:06:58'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    689,
    210029,
    34,
    34,
    '2026-05-25 03:06:59',
    'present',
    '2026-06-10 00:06:58',
    '2026-06-10 00:06:58'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    690,
    210029,
    34,
    34,
    '2026-05-23 03:06:59',
    'present',
    '2026-06-10 00:06:58',
    '2026-06-10 00:06:58'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    691,
    210029,
    34,
    34,
    '2026-05-21 03:06:59',
    'present',
    '2026-06-10 00:06:58',
    '2026-06-10 00:06:58'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    692,
    210029,
    34,
    34,
    '2026-05-19 03:06:59',
    'present',
    '2026-06-10 00:06:58',
    '2026-06-10 00:06:58'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    693,
    210029,
    34,
    34,
    '2026-05-17 03:06:59',
    'excused',
    '2026-06-10 00:06:58',
    '2026-06-10 00:06:58'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    694,
    210029,
    34,
    34,
    '2026-05-15 03:06:59',
    'present',
    '2026-06-10 00:06:59',
    '2026-06-10 00:06:59'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    695,
    210029,
    34,
    34,
    '2026-05-13 03:06:59',
    'present',
    '2026-06-10 00:06:59',
    '2026-06-10 00:06:59'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    696,
    210029,
    34,
    34,
    '2026-05-11 03:06:59',
    'late',
    '2026-06-10 00:06:59',
    '2026-06-10 00:06:59'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    697,
    210029,
    34,
    34,
    '2026-05-09 03:07:00',
    'present',
    '2026-06-10 00:06:59',
    '2026-06-10 00:06:59'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    698,
    210029,
    34,
    34,
    '2026-05-07 03:07:00',
    'present',
    '2026-06-10 00:06:59',
    '2026-06-10 00:06:59'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    699,
    210029,
    34,
    34,
    '2026-05-05 03:07:00',
    'present',
    '2026-06-10 00:06:59',
    '2026-06-10 00:06:59'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    700,
    210029,
    34,
    34,
    '2026-05-03 03:07:00',
    'present',
    '2026-06-10 00:06:59',
    '2026-06-10 00:06:59'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    701,
    210029,
    35,
    35,
    '2026-06-10 03:07:00',
    'present',
    '2026-06-10 00:07:00',
    '2026-06-10 00:07:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    702,
    210029,
    35,
    35,
    '2026-06-08 03:07:00',
    'present',
    '2026-06-10 00:07:00',
    '2026-06-10 00:07:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    703,
    210029,
    35,
    35,
    '2026-06-06 03:07:00',
    'present',
    '2026-06-10 00:07:00',
    '2026-06-10 00:07:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    704,
    210029,
    35,
    35,
    '2026-06-04 03:07:00',
    'present',
    '2026-06-10 00:07:00',
    '2026-06-10 00:07:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    705,
    210029,
    35,
    35,
    '2026-06-02 03:07:01',
    'excused',
    '2026-06-10 00:07:00',
    '2026-06-10 00:07:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    706,
    210029,
    35,
    35,
    '2026-05-31 03:07:01',
    'present',
    '2026-06-10 00:07:00',
    '2026-06-10 00:07:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    707,
    210029,
    35,
    35,
    '2026-05-29 03:07:01',
    'present',
    '2026-06-10 00:07:00',
    '2026-06-10 00:07:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    708,
    210029,
    35,
    35,
    '2026-05-27 03:07:01',
    'late',
    '2026-06-10 00:07:00',
    '2026-06-10 00:07:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    709,
    210029,
    35,
    35,
    '2026-05-25 03:07:01',
    'present',
    '2026-06-10 00:07:00',
    '2026-06-10 00:07:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    710,
    210029,
    35,
    35,
    '2026-05-23 03:07:01',
    'present',
    '2026-06-10 00:07:00',
    '2026-06-10 00:07:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    711,
    210029,
    35,
    35,
    '2026-05-21 03:07:01',
    'present',
    '2026-06-10 00:07:01',
    '2026-06-10 00:07:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    712,
    210029,
    35,
    35,
    '2026-05-19 03:07:01',
    'present',
    '2026-06-10 00:07:01',
    '2026-06-10 00:07:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    713,
    210029,
    35,
    35,
    '2026-05-17 03:07:01',
    'excused',
    '2026-06-10 00:07:01',
    '2026-06-10 00:07:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    714,
    210029,
    35,
    35,
    '2026-05-15 03:07:01',
    'present',
    '2026-06-10 00:07:01',
    '2026-06-10 00:07:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    715,
    210029,
    35,
    35,
    '2026-05-13 03:07:01',
    'present',
    '2026-06-10 00:07:01',
    '2026-06-10 00:07:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    716,
    210029,
    35,
    35,
    '2026-05-11 03:07:02',
    'late',
    '2026-06-10 00:07:01',
    '2026-06-10 00:07:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    717,
    210029,
    35,
    35,
    '2026-05-09 03:07:02',
    'present',
    '2026-06-10 00:07:01',
    '2026-06-10 00:07:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    718,
    210029,
    35,
    35,
    '2026-05-07 03:07:02',
    'present',
    '2026-06-10 00:07:01',
    '2026-06-10 00:07:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    719,
    210029,
    35,
    35,
    '2026-05-05 03:07:02',
    'present',
    '2026-06-10 00:07:01',
    '2026-06-10 00:07:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    720,
    210029,
    35,
    35,
    '2026-05-03 03:07:02',
    'present',
    '2026-06-10 00:07:01',
    '2026-06-10 00:07:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    721,
    210029,
    36,
    36,
    '2026-06-10 03:07:02',
    'present',
    '2026-06-10 00:07:01',
    '2026-06-10 00:07:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    722,
    210029,
    36,
    36,
    '2026-06-08 03:07:02',
    'present',
    '2026-06-10 00:07:01',
    '2026-06-10 00:07:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    723,
    210029,
    36,
    36,
    '2026-06-06 03:07:02',
    'present',
    '2026-06-10 00:07:01',
    '2026-06-10 00:07:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    724,
    210029,
    36,
    36,
    '2026-06-04 03:07:02',
    'present',
    '2026-06-10 00:07:02',
    '2026-06-10 00:07:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    725,
    210029,
    36,
    36,
    '2026-06-02 03:07:02',
    'excused',
    '2026-06-10 00:07:02',
    '2026-06-10 00:07:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    726,
    210029,
    36,
    36,
    '2026-05-31 03:07:02',
    'present',
    '2026-06-10 00:07:02',
    '2026-06-10 00:07:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    727,
    210029,
    36,
    36,
    '2026-05-29 03:07:02',
    'present',
    '2026-06-10 00:07:02',
    '2026-06-10 00:07:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    728,
    210029,
    36,
    36,
    '2026-05-27 03:07:02',
    'late',
    '2026-06-10 00:07:02',
    '2026-06-10 00:07:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    729,
    210029,
    36,
    36,
    '2026-05-25 03:07:02',
    'present',
    '2026-06-10 00:07:02',
    '2026-06-10 00:07:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    730,
    210029,
    36,
    36,
    '2026-05-23 03:07:03',
    'present',
    '2026-06-10 00:07:02',
    '2026-06-10 00:07:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    731,
    210029,
    36,
    36,
    '2026-05-21 03:07:03',
    'present',
    '2026-06-10 00:07:02',
    '2026-06-10 00:07:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    732,
    210029,
    36,
    36,
    '2026-05-19 03:07:03',
    'present',
    '2026-06-10 00:07:02',
    '2026-06-10 00:07:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    733,
    210029,
    36,
    36,
    '2026-05-17 03:07:03',
    'excused',
    '2026-06-10 00:07:02',
    '2026-06-10 00:07:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    734,
    210029,
    36,
    36,
    '2026-05-15 03:07:03',
    'present',
    '2026-06-10 00:07:02',
    '2026-06-10 00:07:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    735,
    210029,
    36,
    36,
    '2026-05-13 03:07:03',
    'present',
    '2026-06-10 00:07:02',
    '2026-06-10 00:07:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    736,
    210029,
    36,
    36,
    '2026-05-11 03:07:03',
    'late',
    '2026-06-10 00:07:02',
    '2026-06-10 00:07:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    737,
    210029,
    36,
    36,
    '2026-05-09 03:07:03',
    'present',
    '2026-06-10 00:07:02',
    '2026-06-10 00:07:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    738,
    210029,
    36,
    36,
    '2026-05-07 03:07:03',
    'present',
    '2026-06-10 00:07:02',
    '2026-06-10 00:07:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    739,
    210029,
    36,
    36,
    '2026-05-05 03:07:03',
    'present',
    '2026-06-10 00:07:03',
    '2026-06-10 00:07:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    740,
    210029,
    36,
    36,
    '2026-05-03 03:07:03',
    'present',
    '2026-06-10 00:07:03',
    '2026-06-10 00:07:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    741,
    210029,
    37,
    37,
    '2026-06-10 03:07:03',
    'present',
    '2026-06-10 00:07:03',
    '2026-06-10 00:07:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    742,
    210029,
    37,
    37,
    '2026-06-08 03:07:03',
    'present',
    '2026-06-10 00:07:03',
    '2026-06-10 00:07:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    743,
    210029,
    37,
    37,
    '2026-06-06 03:07:03',
    'present',
    '2026-06-10 00:07:03',
    '2026-06-10 00:07:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    744,
    210029,
    37,
    37,
    '2026-06-04 03:07:04',
    'present',
    '2026-06-10 00:07:03',
    '2026-06-10 00:07:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    745,
    210029,
    37,
    37,
    '2026-06-02 03:07:04',
    'excused',
    '2026-06-10 00:07:03',
    '2026-06-10 00:07:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    746,
    210029,
    37,
    37,
    '2026-05-31 03:07:04',
    'present',
    '2026-06-10 00:07:03',
    '2026-06-10 00:07:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    747,
    210029,
    37,
    37,
    '2026-05-29 03:07:04',
    'present',
    '2026-06-10 00:07:03',
    '2026-06-10 00:07:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    748,
    210029,
    37,
    37,
    '2026-05-27 03:07:04',
    'late',
    '2026-06-10 00:07:03',
    '2026-06-10 00:07:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    749,
    210029,
    37,
    37,
    '2026-05-25 03:07:04',
    'present',
    '2026-06-10 00:07:03',
    '2026-06-10 00:07:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    750,
    210029,
    37,
    37,
    '2026-05-23 03:07:04',
    'present',
    '2026-06-10 00:07:03',
    '2026-06-10 00:07:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    751,
    210029,
    37,
    37,
    '2026-05-21 03:07:04',
    'present',
    '2026-06-10 00:07:03',
    '2026-06-10 00:07:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    752,
    210029,
    37,
    37,
    '2026-05-19 03:07:04',
    'present',
    '2026-06-10 00:07:03',
    '2026-06-10 00:07:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    753,
    210029,
    37,
    37,
    '2026-05-17 03:07:04',
    'excused',
    '2026-06-10 00:07:04',
    '2026-06-10 00:07:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    754,
    210029,
    37,
    37,
    '2026-05-15 03:07:04',
    'present',
    '2026-06-10 00:07:04',
    '2026-06-10 00:07:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    755,
    210029,
    37,
    37,
    '2026-05-13 03:07:04',
    'present',
    '2026-06-10 00:07:04',
    '2026-06-10 00:07:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    756,
    210029,
    37,
    37,
    '2026-05-11 03:07:04',
    'late',
    '2026-06-10 00:07:04',
    '2026-06-10 00:07:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    757,
    210029,
    37,
    37,
    '2026-05-09 03:07:04',
    'present',
    '2026-06-10 00:07:04',
    '2026-06-10 00:07:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    758,
    210029,
    37,
    37,
    '2026-05-07 03:07:04',
    'present',
    '2026-06-10 00:07:04',
    '2026-06-10 00:07:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    759,
    210029,
    37,
    37,
    '2026-05-05 03:07:05',
    'present',
    '2026-06-10 00:07:04',
    '2026-06-10 00:07:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    760,
    210029,
    37,
    37,
    '2026-05-03 03:07:05',
    'present',
    '2026-06-10 00:07:04',
    '2026-06-10 00:07:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    761,
    210029,
    38,
    38,
    '2026-06-10 03:07:05',
    'present',
    '2026-06-10 00:07:04',
    '2026-06-10 00:07:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    762,
    210029,
    38,
    38,
    '2026-06-08 03:07:05',
    'present',
    '2026-06-10 00:07:04',
    '2026-06-10 00:07:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    763,
    210029,
    38,
    38,
    '2026-06-06 03:07:05',
    'present',
    '2026-06-10 00:07:04',
    '2026-06-10 00:07:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    764,
    210029,
    38,
    38,
    '2026-06-04 03:07:05',
    'present',
    '2026-06-10 00:07:04',
    '2026-06-10 00:07:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    765,
    210029,
    38,
    38,
    '2026-06-02 03:07:05',
    'excused',
    '2026-06-10 00:07:04',
    '2026-06-10 00:07:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    766,
    210029,
    38,
    38,
    '2026-05-31 03:07:05',
    'present',
    '2026-06-10 00:07:04',
    '2026-06-10 00:07:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    767,
    210029,
    38,
    38,
    '2026-05-29 03:07:05',
    'present',
    '2026-06-10 00:07:04',
    '2026-06-10 00:07:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    768,
    210029,
    38,
    38,
    '2026-05-27 03:07:05',
    'late',
    '2026-06-10 00:07:05',
    '2026-06-10 00:07:05'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    769,
    210029,
    38,
    38,
    '2026-05-25 03:07:05',
    'present',
    '2026-06-10 00:07:05',
    '2026-06-10 00:07:05'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    770,
    210029,
    38,
    38,
    '2026-05-23 03:07:05',
    'present',
    '2026-06-10 00:07:05',
    '2026-06-10 00:07:05'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    771,
    210029,
    38,
    38,
    '2026-05-21 03:07:05',
    'present',
    '2026-06-10 00:07:05',
    '2026-06-10 00:07:05'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    772,
    210029,
    38,
    38,
    '2026-05-19 03:07:05',
    'present',
    '2026-06-10 00:07:05',
    '2026-06-10 00:07:05'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    773,
    210029,
    38,
    38,
    '2026-05-17 03:07:05',
    'excused',
    '2026-06-10 00:07:05',
    '2026-06-10 00:07:05'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    774,
    210029,
    38,
    38,
    '2026-05-15 03:07:06',
    'present',
    '2026-06-10 00:07:05',
    '2026-06-10 00:07:05'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    775,
    210029,
    38,
    38,
    '2026-05-13 03:07:06',
    'present',
    '2026-06-10 00:07:05',
    '2026-06-10 00:07:05'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    776,
    210029,
    38,
    38,
    '2026-05-11 03:07:06',
    'late',
    '2026-06-10 00:07:05',
    '2026-06-10 00:07:05'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    777,
    210029,
    38,
    38,
    '2026-05-09 03:07:06',
    'present',
    '2026-06-10 00:07:05',
    '2026-06-10 00:07:05'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    778,
    210029,
    38,
    38,
    '2026-05-07 03:07:06',
    'present',
    '2026-06-10 00:07:05',
    '2026-06-10 00:07:05'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    779,
    210029,
    38,
    38,
    '2026-05-05 03:07:06',
    'present',
    '2026-06-10 00:07:06',
    '2026-06-10 00:07:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    780,
    210029,
    38,
    38,
    '2026-05-03 03:07:06',
    'present',
    '2026-06-10 00:07:06',
    '2026-06-10 00:07:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    781,
    210029,
    39,
    39,
    '2026-06-10 03:07:06',
    'present',
    '2026-06-10 00:07:06',
    '2026-06-10 00:07:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    782,
    210029,
    39,
    39,
    '2026-06-08 03:07:07',
    'present',
    '2026-06-10 00:07:06',
    '2026-06-10 00:07:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    783,
    210029,
    39,
    39,
    '2026-06-06 03:07:07',
    'present',
    '2026-06-10 00:07:06',
    '2026-06-10 00:07:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    784,
    210029,
    39,
    39,
    '2026-06-04 03:07:07',
    'present',
    '2026-06-10 00:07:06',
    '2026-06-10 00:07:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    785,
    210029,
    39,
    39,
    '2026-06-02 03:07:07',
    'excused',
    '2026-06-10 00:07:06',
    '2026-06-10 00:07:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    786,
    210029,
    39,
    39,
    '2026-05-31 03:07:07',
    'present',
    '2026-06-10 00:07:06',
    '2026-06-10 00:07:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    787,
    210029,
    39,
    39,
    '2026-05-29 03:07:07',
    'present',
    '2026-06-10 00:07:06',
    '2026-06-10 00:07:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    788,
    210029,
    39,
    39,
    '2026-05-27 03:07:07',
    'late',
    '2026-06-10 00:07:07',
    '2026-06-10 00:07:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    789,
    210029,
    39,
    39,
    '2026-05-25 03:07:07',
    'present',
    '2026-06-10 00:07:07',
    '2026-06-10 00:07:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    790,
    210029,
    39,
    39,
    '2026-05-23 03:07:07',
    'present',
    '2026-06-10 00:07:07',
    '2026-06-10 00:07:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    791,
    210029,
    39,
    39,
    '2026-05-21 03:07:07',
    'present',
    '2026-06-10 00:07:07',
    '2026-06-10 00:07:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    792,
    210029,
    39,
    39,
    '2026-05-19 03:07:08',
    'present',
    '2026-06-10 00:07:07',
    '2026-06-10 00:07:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    793,
    210029,
    39,
    39,
    '2026-05-17 03:07:08',
    'excused',
    '2026-06-10 00:07:07',
    '2026-06-10 00:07:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    794,
    210029,
    39,
    39,
    '2026-05-15 03:07:08',
    'present',
    '2026-06-10 00:07:07',
    '2026-06-10 00:07:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    795,
    210029,
    39,
    39,
    '2026-05-13 03:07:08',
    'present',
    '2026-06-10 00:07:07',
    '2026-06-10 00:07:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    796,
    210029,
    39,
    39,
    '2026-05-11 03:07:08',
    'late',
    '2026-06-10 00:07:07',
    '2026-06-10 00:07:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    797,
    210029,
    39,
    39,
    '2026-05-09 03:07:08',
    'present',
    '2026-06-10 00:07:08',
    '2026-06-10 00:07:08'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    798,
    210029,
    39,
    39,
    '2026-05-07 03:07:08',
    'present',
    '2026-06-10 00:07:08',
    '2026-06-10 00:07:08'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    799,
    210029,
    39,
    39,
    '2026-05-05 03:07:08',
    'present',
    '2026-06-10 00:07:08',
    '2026-06-10 00:07:08'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    800,
    210029,
    39,
    39,
    '2026-05-03 03:07:08',
    'present',
    '2026-06-10 00:07:08',
    '2026-06-10 00:07:08'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    801,
    210029,
    40,
    40,
    '2026-06-10 03:07:09',
    'present',
    '2026-06-10 00:07:08',
    '2026-06-10 00:07:08'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    802,
    210029,
    40,
    40,
    '2026-06-08 03:07:09',
    'present',
    '2026-06-10 00:07:08',
    '2026-06-10 00:07:08'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    803,
    210029,
    40,
    40,
    '2026-06-06 03:07:09',
    'present',
    '2026-06-10 00:07:08',
    '2026-06-10 00:07:08'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    804,
    210029,
    40,
    40,
    '2026-06-04 03:07:09',
    'present',
    '2026-06-10 00:07:08',
    '2026-06-10 00:07:08'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    805,
    210029,
    40,
    40,
    '2026-06-02 03:07:09',
    'excused',
    '2026-06-10 00:07:08',
    '2026-06-10 00:07:08'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    806,
    210029,
    40,
    40,
    '2026-05-31 03:07:09',
    'present',
    '2026-06-10 00:07:08',
    '2026-06-10 00:07:08'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    807,
    210029,
    40,
    40,
    '2026-05-29 03:07:09',
    'present',
    '2026-06-10 00:07:09',
    '2026-06-10 00:07:09'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    808,
    210029,
    40,
    40,
    '2026-05-27 03:07:09',
    'late',
    '2026-06-10 00:07:09',
    '2026-06-10 00:07:09'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    809,
    210029,
    40,
    40,
    '2026-05-25 03:07:09',
    'present',
    '2026-06-10 00:07:09',
    '2026-06-10 00:07:09'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    810,
    210029,
    40,
    40,
    '2026-05-23 03:07:09',
    'present',
    '2026-06-10 00:07:09',
    '2026-06-10 00:07:09'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    811,
    210029,
    40,
    40,
    '2026-05-21 03:07:10',
    'present',
    '2026-06-10 00:07:09',
    '2026-06-10 00:07:09'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    812,
    210029,
    40,
    40,
    '2026-05-19 03:07:10',
    'present',
    '2026-06-10 00:07:09',
    '2026-06-10 00:07:09'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    813,
    210029,
    40,
    40,
    '2026-05-17 03:07:10',
    'excused',
    '2026-06-10 00:07:09',
    '2026-06-10 00:07:09'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    814,
    210029,
    40,
    40,
    '2026-05-15 03:07:10',
    'present',
    '2026-06-10 00:07:09',
    '2026-06-10 00:07:09'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    815,
    210029,
    40,
    40,
    '2026-05-13 03:07:10',
    'present',
    '2026-06-10 00:07:09',
    '2026-06-10 00:07:09'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    816,
    210029,
    40,
    40,
    '2026-05-11 03:07:10',
    'late',
    '2026-06-10 00:07:10',
    '2026-06-10 00:07:10'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    817,
    210029,
    40,
    40,
    '2026-05-09 03:07:10',
    'present',
    '2026-06-10 00:07:10',
    '2026-06-10 00:07:10'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    818,
    210029,
    40,
    40,
    '2026-05-07 03:07:10',
    'present',
    '2026-06-10 00:07:10',
    '2026-06-10 00:07:10'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    819,
    210029,
    40,
    40,
    '2026-05-05 03:07:10',
    'present',
    '2026-06-10 00:07:10',
    '2026-06-10 00:07:10'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    820,
    210029,
    40,
    40,
    '2026-05-03 03:07:11',
    'present',
    '2026-06-10 00:07:10',
    '2026-06-10 00:07:10'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    821,
    210029,
    41,
    41,
    '2026-06-10 03:07:11',
    'present',
    '2026-06-10 00:07:10',
    '2026-06-10 00:07:10'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    822,
    210029,
    41,
    41,
    '2026-06-08 03:07:11',
    'present',
    '2026-06-10 00:07:10',
    '2026-06-10 00:07:10'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    823,
    210029,
    41,
    41,
    '2026-06-06 03:07:11',
    'present',
    '2026-06-10 00:07:10',
    '2026-06-10 00:07:10'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    824,
    210029,
    41,
    41,
    '2026-06-04 03:07:11',
    'present',
    '2026-06-10 00:07:10',
    '2026-06-10 00:07:10'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    825,
    210029,
    41,
    41,
    '2026-06-02 03:07:11',
    'excused',
    '2026-06-10 00:07:10',
    '2026-06-10 00:07:10'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    826,
    210029,
    41,
    41,
    '2026-05-31 03:07:11',
    'present',
    '2026-06-10 00:07:11',
    '2026-06-10 00:07:11'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    827,
    210029,
    41,
    41,
    '2026-05-29 03:07:11',
    'present',
    '2026-06-10 00:07:11',
    '2026-06-10 00:07:11'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    828,
    210029,
    41,
    41,
    '2026-05-27 03:07:11',
    'late',
    '2026-06-10 00:07:11',
    '2026-06-10 00:07:11'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    829,
    210029,
    41,
    41,
    '2026-05-25 03:07:11',
    'present',
    '2026-06-10 00:07:11',
    '2026-06-10 00:07:11'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    830,
    210029,
    41,
    41,
    '2026-05-23 03:07:12',
    'present',
    '2026-06-10 00:07:11',
    '2026-06-10 00:07:11'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    831,
    210029,
    41,
    41,
    '2026-05-21 03:07:12',
    'present',
    '2026-06-10 00:07:11',
    '2026-06-10 00:07:11'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    832,
    210029,
    41,
    41,
    '2026-05-19 03:07:12',
    'present',
    '2026-06-10 00:07:11',
    '2026-06-10 00:07:11'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    833,
    210029,
    41,
    41,
    '2026-05-17 03:07:12',
    'excused',
    '2026-06-10 00:07:11',
    '2026-06-10 00:07:11'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    834,
    210029,
    41,
    41,
    '2026-05-15 03:07:12',
    'present',
    '2026-06-10 00:07:12',
    '2026-06-10 00:07:12'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    835,
    210029,
    41,
    41,
    '2026-05-13 03:07:12',
    'present',
    '2026-06-10 00:07:12',
    '2026-06-10 00:07:12'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    836,
    210029,
    41,
    41,
    '2026-05-11 03:07:12',
    'late',
    '2026-06-10 00:07:12',
    '2026-06-10 00:07:12'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    837,
    210029,
    41,
    41,
    '2026-05-09 03:07:13',
    'present',
    '2026-06-10 00:07:12',
    '2026-06-10 00:07:12'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    838,
    210029,
    41,
    41,
    '2026-05-07 03:07:13',
    'present',
    '2026-06-10 00:07:12',
    '2026-06-10 00:07:12'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    839,
    210029,
    41,
    41,
    '2026-05-05 03:07:13',
    'present',
    '2026-06-10 00:07:12',
    '2026-06-10 00:07:12'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    840,
    210029,
    41,
    41,
    '2026-05-03 03:07:13',
    'present',
    '2026-06-10 00:07:12',
    '2026-06-10 00:07:12'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    841,
    210029,
    42,
    42,
    '2026-06-10 03:07:13',
    'present',
    '2026-06-10 00:07:12',
    '2026-06-10 00:07:12'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    842,
    210029,
    42,
    42,
    '2026-06-08 03:07:13',
    'present',
    '2026-06-10 00:07:12',
    '2026-06-10 00:07:12'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    843,
    210029,
    42,
    42,
    '2026-06-06 03:07:13',
    'present',
    '2026-06-10 00:07:13',
    '2026-06-10 00:07:13'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    844,
    210029,
    42,
    42,
    '2026-06-04 03:07:13',
    'present',
    '2026-06-10 00:07:13',
    '2026-06-10 00:07:13'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    845,
    210029,
    42,
    42,
    '2026-06-02 03:07:13',
    'excused',
    '2026-06-10 00:07:13',
    '2026-06-10 00:07:13'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    846,
    210029,
    42,
    42,
    '2026-05-31 03:07:13',
    'present',
    '2026-06-10 00:07:13',
    '2026-06-10 00:07:13'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    847,
    210029,
    42,
    42,
    '2026-05-29 03:07:14',
    'present',
    '2026-06-10 00:07:13',
    '2026-06-10 00:07:13'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    848,
    210029,
    42,
    42,
    '2026-05-27 03:07:14',
    'late',
    '2026-06-10 00:07:13',
    '2026-06-10 00:07:13'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    849,
    210029,
    42,
    42,
    '2026-05-25 03:07:14',
    'present',
    '2026-06-10 00:07:13',
    '2026-06-10 00:07:13'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    850,
    210029,
    42,
    42,
    '2026-05-23 03:07:14',
    'present',
    '2026-06-10 00:07:13',
    '2026-06-10 00:07:13'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    851,
    210029,
    42,
    42,
    '2026-05-21 03:07:14',
    'present',
    '2026-06-10 00:07:13',
    '2026-06-10 00:07:13'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    852,
    210029,
    42,
    42,
    '2026-05-19 03:07:14',
    'present',
    '2026-06-10 00:07:13',
    '2026-06-10 00:07:13'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    853,
    210029,
    42,
    42,
    '2026-05-17 03:07:14',
    'excused',
    '2026-06-10 00:07:14',
    '2026-06-10 00:07:14'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    854,
    210029,
    42,
    42,
    '2026-05-15 03:07:14',
    'present',
    '2026-06-10 00:07:14',
    '2026-06-10 00:07:14'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    855,
    210029,
    42,
    42,
    '2026-05-13 03:07:14',
    'present',
    '2026-06-10 00:07:14',
    '2026-06-10 00:07:14'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    856,
    210029,
    42,
    42,
    '2026-05-11 03:07:14',
    'late',
    '2026-06-10 00:07:14',
    '2026-06-10 00:07:14'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    857,
    210029,
    42,
    42,
    '2026-05-09 03:07:15',
    'present',
    '2026-06-10 00:07:14',
    '2026-06-10 00:07:14'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    858,
    210029,
    42,
    42,
    '2026-05-07 03:07:15',
    'present',
    '2026-06-10 00:07:14',
    '2026-06-10 00:07:14'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    859,
    210029,
    42,
    42,
    '2026-05-05 03:07:15',
    'present',
    '2026-06-10 00:07:14',
    '2026-06-10 00:07:14'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    860,
    210029,
    42,
    42,
    '2026-05-03 03:07:15',
    'present',
    '2026-06-10 00:07:14',
    '2026-06-10 00:07:14'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    861,
    210029,
    43,
    43,
    '2026-06-10 03:07:15',
    'present',
    '2026-06-10 00:07:14',
    '2026-06-10 00:07:14'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    862,
    210029,
    43,
    43,
    '2026-06-08 03:07:15',
    'present',
    '2026-06-10 00:07:15',
    '2026-06-10 00:07:15'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    863,
    210029,
    43,
    43,
    '2026-06-06 03:07:15',
    'present',
    '2026-06-10 00:07:15',
    '2026-06-10 00:07:15'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    864,
    210029,
    43,
    43,
    '2026-06-04 03:07:15',
    'present',
    '2026-06-10 00:07:15',
    '2026-06-10 00:07:15'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    865,
    210029,
    43,
    43,
    '2026-06-02 03:07:15',
    'excused',
    '2026-06-10 00:07:15',
    '2026-06-10 00:07:15'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    866,
    210029,
    43,
    43,
    '2026-05-31 03:07:16',
    'present',
    '2026-06-10 00:07:15',
    '2026-06-10 00:07:15'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    867,
    210029,
    43,
    43,
    '2026-05-29 03:07:16',
    'present',
    '2026-06-10 00:07:15',
    '2026-06-10 00:07:15'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    868,
    210029,
    43,
    43,
    '2026-05-27 03:07:16',
    'late',
    '2026-06-10 00:07:15',
    '2026-06-10 00:07:15'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    869,
    210029,
    43,
    43,
    '2026-05-25 03:07:16',
    'present',
    '2026-06-10 00:07:15',
    '2026-06-10 00:07:15'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    870,
    210029,
    43,
    43,
    '2026-05-23 03:07:16',
    'present',
    '2026-06-10 00:07:15',
    '2026-06-10 00:07:15'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    871,
    210029,
    43,
    43,
    '2026-05-21 03:07:16',
    'present',
    '2026-06-10 00:07:16',
    '2026-06-10 00:07:16'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    872,
    210029,
    43,
    43,
    '2026-05-19 03:07:16',
    'present',
    '2026-06-10 00:07:16',
    '2026-06-10 00:07:16'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    873,
    210029,
    43,
    43,
    '2026-05-17 03:07:16',
    'excused',
    '2026-06-10 00:07:16',
    '2026-06-10 00:07:16'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    874,
    210029,
    43,
    43,
    '2026-05-15 03:07:16',
    'present',
    '2026-06-10 00:07:16',
    '2026-06-10 00:07:16'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    875,
    210029,
    43,
    43,
    '2026-05-13 03:07:17',
    'present',
    '2026-06-10 00:07:16',
    '2026-06-10 00:07:16'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    876,
    210029,
    43,
    43,
    '2026-05-11 03:07:17',
    'late',
    '2026-06-10 00:07:16',
    '2026-06-10 00:07:16'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    877,
    210029,
    43,
    43,
    '2026-05-09 03:07:17',
    'present',
    '2026-06-10 00:07:16',
    '2026-06-10 00:07:16'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    878,
    210029,
    43,
    43,
    '2026-05-07 03:07:17',
    'present',
    '2026-06-10 00:07:16',
    '2026-06-10 00:07:16'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    879,
    210029,
    43,
    43,
    '2026-05-05 03:07:17',
    'present',
    '2026-06-10 00:07:16',
    '2026-06-10 00:07:16'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    880,
    210029,
    43,
    43,
    '2026-05-03 03:07:17',
    'present',
    '2026-06-10 00:07:16',
    '2026-06-10 00:07:16'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    881,
    210029,
    44,
    44,
    '2026-06-10 03:07:17',
    'present',
    '2026-06-10 00:07:17',
    '2026-06-10 00:07:17'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    882,
    210029,
    44,
    44,
    '2026-06-08 03:07:17',
    'present',
    '2026-06-10 00:07:17',
    '2026-06-10 00:07:17'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    883,
    210029,
    44,
    44,
    '2026-06-06 03:07:17',
    'present',
    '2026-06-10 00:07:17',
    '2026-06-10 00:07:17'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    884,
    210029,
    44,
    44,
    '2026-06-04 03:07:17',
    'present',
    '2026-06-10 00:07:17',
    '2026-06-10 00:07:17'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    885,
    210029,
    44,
    44,
    '2026-06-02 03:07:18',
    'excused',
    '2026-06-10 00:07:17',
    '2026-06-10 00:07:17'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    886,
    210029,
    44,
    44,
    '2026-05-31 03:07:18',
    'present',
    '2026-06-10 00:07:17',
    '2026-06-10 00:07:17'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    887,
    210029,
    44,
    44,
    '2026-05-29 03:07:18',
    'present',
    '2026-06-10 00:07:17',
    '2026-06-10 00:07:17'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    888,
    210029,
    44,
    44,
    '2026-05-27 03:07:18',
    'late',
    '2026-06-10 00:07:17',
    '2026-06-10 00:07:17'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    889,
    210029,
    44,
    44,
    '2026-05-25 03:07:18',
    'present',
    '2026-06-10 00:07:17',
    '2026-06-10 00:07:17'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    890,
    210029,
    44,
    44,
    '2026-05-23 03:07:18',
    'present',
    '2026-06-10 00:07:17',
    '2026-06-10 00:07:17'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    891,
    210029,
    44,
    44,
    '2026-05-21 03:07:18',
    'present',
    '2026-06-10 00:07:18',
    '2026-06-10 00:07:18'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    892,
    210029,
    44,
    44,
    '2026-05-19 03:07:18',
    'present',
    '2026-06-10 00:07:18',
    '2026-06-10 00:07:18'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    893,
    210029,
    44,
    44,
    '2026-05-17 03:07:19',
    'excused',
    '2026-06-10 00:07:18',
    '2026-06-10 00:07:18'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    894,
    210029,
    44,
    44,
    '2026-05-15 03:07:19',
    'present',
    '2026-06-10 00:07:18',
    '2026-06-10 00:07:18'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    895,
    210029,
    44,
    44,
    '2026-05-13 03:07:19',
    'present',
    '2026-06-10 00:07:18',
    '2026-06-10 00:07:18'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    896,
    210029,
    44,
    44,
    '2026-05-11 03:07:19',
    'late',
    '2026-06-10 00:07:18',
    '2026-06-10 00:07:18'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    897,
    210029,
    44,
    44,
    '2026-05-09 03:07:19',
    'present',
    '2026-06-10 00:07:19',
    '2026-06-10 00:07:19'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    898,
    210029,
    44,
    44,
    '2026-05-07 03:07:19',
    'present',
    '2026-06-10 00:07:19',
    '2026-06-10 00:07:19'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    899,
    210029,
    44,
    44,
    '2026-05-05 03:07:19',
    'present',
    '2026-06-10 00:07:19',
    '2026-06-10 00:07:19'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    900,
    210029,
    44,
    44,
    '2026-05-03 03:07:19',
    'present',
    '2026-06-10 00:07:19',
    '2026-06-10 00:07:19'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    901,
    210029,
    45,
    45,
    '2026-06-10 03:07:20',
    'present',
    '2026-06-10 00:07:19',
    '2026-06-10 00:07:19'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    902,
    210029,
    45,
    45,
    '2026-06-08 03:07:20',
    'present',
    '2026-06-10 00:07:19',
    '2026-06-10 00:07:19'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    903,
    210029,
    45,
    45,
    '2026-06-06 03:07:20',
    'present',
    '2026-06-10 00:07:19',
    '2026-06-10 00:07:19'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    904,
    210029,
    45,
    45,
    '2026-06-04 03:07:20',
    'present',
    '2026-06-10 00:07:19',
    '2026-06-10 00:07:19'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    905,
    210029,
    45,
    45,
    '2026-06-02 03:07:20',
    'excused',
    '2026-06-10 00:07:19',
    '2026-06-10 00:07:19'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    906,
    210029,
    45,
    45,
    '2026-05-31 03:07:20',
    'present',
    '2026-06-10 00:07:20',
    '2026-06-10 00:07:20'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    907,
    210029,
    45,
    45,
    '2026-05-29 03:07:20',
    'present',
    '2026-06-10 00:07:20',
    '2026-06-10 00:07:20'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    908,
    210029,
    45,
    45,
    '2026-05-27 03:07:20',
    'late',
    '2026-06-10 00:07:20',
    '2026-06-10 00:07:20'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    909,
    210029,
    45,
    45,
    '2026-05-25 03:07:20',
    'present',
    '2026-06-10 00:07:20',
    '2026-06-10 00:07:20'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    910,
    210029,
    45,
    45,
    '2026-05-23 03:07:21',
    'present',
    '2026-06-10 00:07:20',
    '2026-06-10 00:07:20'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    911,
    210029,
    45,
    45,
    '2026-05-21 03:07:21',
    'present',
    '2026-06-10 00:07:20',
    '2026-06-10 00:07:20'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    912,
    210029,
    45,
    45,
    '2026-05-19 03:07:21',
    'present',
    '2026-06-10 00:07:20',
    '2026-06-10 00:07:20'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    913,
    210029,
    45,
    45,
    '2026-05-17 03:07:21',
    'excused',
    '2026-06-10 00:07:20',
    '2026-06-10 00:07:20'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    914,
    210029,
    45,
    45,
    '2026-05-15 03:07:21',
    'present',
    '2026-06-10 00:07:20',
    '2026-06-10 00:07:20'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    915,
    210029,
    45,
    45,
    '2026-05-13 03:07:21',
    'present',
    '2026-06-10 00:07:20',
    '2026-06-10 00:07:20'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    916,
    210029,
    45,
    45,
    '2026-05-11 03:07:21',
    'late',
    '2026-06-10 00:07:21',
    '2026-06-10 00:07:21'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    917,
    210029,
    45,
    45,
    '2026-05-09 03:07:21',
    'present',
    '2026-06-10 00:07:21',
    '2026-06-10 00:07:21'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    918,
    210029,
    45,
    45,
    '2026-05-07 03:07:21',
    'present',
    '2026-06-10 00:07:21',
    '2026-06-10 00:07:21'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    919,
    210029,
    45,
    45,
    '2026-05-05 03:07:21',
    'present',
    '2026-06-10 00:07:21',
    '2026-06-10 00:07:21'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    920,
    210029,
    45,
    45,
    '2026-05-03 03:07:22',
    'present',
    '2026-06-10 00:07:21',
    '2026-06-10 00:07:21'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    921,
    210029,
    46,
    46,
    '2026-06-10 03:07:22',
    'present',
    '2026-06-10 00:07:21',
    '2026-06-10 00:07:21'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    922,
    210029,
    46,
    46,
    '2026-06-08 03:07:22',
    'present',
    '2026-06-10 00:07:21',
    '2026-06-10 00:07:21'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    923,
    210029,
    46,
    46,
    '2026-06-06 03:07:22',
    'present',
    '2026-06-10 00:07:21',
    '2026-06-10 00:07:21'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    924,
    210029,
    46,
    46,
    '2026-06-04 03:07:22',
    'present',
    '2026-06-10 00:07:21',
    '2026-06-10 00:07:21'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    925,
    210029,
    46,
    46,
    '2026-06-02 03:07:22',
    'excused',
    '2026-06-10 00:07:21',
    '2026-06-10 00:07:21'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    926,
    210029,
    46,
    46,
    '2026-05-31 03:07:22',
    'present',
    '2026-06-10 00:07:21',
    '2026-06-10 00:07:21'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    927,
    210029,
    46,
    46,
    '2026-05-29 03:07:22',
    'present',
    '2026-06-10 00:07:21',
    '2026-06-10 00:07:21'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    928,
    210029,
    46,
    46,
    '2026-05-27 03:07:22',
    'late',
    '2026-06-10 00:07:22',
    '2026-06-10 00:07:22'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    929,
    210029,
    46,
    46,
    '2026-05-25 03:07:22',
    'present',
    '2026-06-10 00:07:22',
    '2026-06-10 00:07:22'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    930,
    210029,
    46,
    46,
    '2026-05-23 03:07:22',
    'present',
    '2026-06-10 00:07:22',
    '2026-06-10 00:07:22'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    931,
    210029,
    46,
    46,
    '2026-05-21 03:07:22',
    'present',
    '2026-06-10 00:07:22',
    '2026-06-10 00:07:22'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    932,
    210029,
    46,
    46,
    '2026-05-19 03:07:22',
    'present',
    '2026-06-10 00:07:22',
    '2026-06-10 00:07:22'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    933,
    210029,
    46,
    46,
    '2026-05-17 03:07:22',
    'excused',
    '2026-06-10 00:07:22',
    '2026-06-10 00:07:22'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    934,
    210029,
    46,
    46,
    '2026-05-15 03:07:23',
    'present',
    '2026-06-10 00:07:22',
    '2026-06-10 00:07:22'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    935,
    210029,
    46,
    46,
    '2026-05-13 03:07:23',
    'present',
    '2026-06-10 00:07:22',
    '2026-06-10 00:07:22'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    936,
    210029,
    46,
    46,
    '2026-05-11 03:07:23',
    'late',
    '2026-06-10 00:07:22',
    '2026-06-10 00:07:22'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    937,
    210029,
    46,
    46,
    '2026-05-09 03:07:23',
    'present',
    '2026-06-10 00:07:22',
    '2026-06-10 00:07:22'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    938,
    210029,
    46,
    46,
    '2026-05-07 03:07:23',
    'present',
    '2026-06-10 00:07:22',
    '2026-06-10 00:07:22'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    939,
    210029,
    46,
    46,
    '2026-05-05 03:07:23',
    'present',
    '2026-06-10 00:07:22',
    '2026-06-10 00:07:22'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    940,
    210029,
    46,
    46,
    '2026-05-03 03:07:23',
    'present',
    '2026-06-10 00:07:22',
    '2026-06-10 00:07:22'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    941,
    210029,
    47,
    47,
    '2026-06-10 03:07:23',
    'present',
    '2026-06-10 00:07:22',
    '2026-06-10 00:07:22'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    942,
    210029,
    47,
    47,
    '2026-06-08 03:07:23',
    'present',
    '2026-06-10 00:07:23',
    '2026-06-10 00:07:23'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    943,
    210029,
    47,
    47,
    '2026-06-06 03:07:23',
    'present',
    '2026-06-10 00:07:23',
    '2026-06-10 00:07:23'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    944,
    210029,
    47,
    47,
    '2026-06-04 03:07:23',
    'present',
    '2026-06-10 00:07:23',
    '2026-06-10 00:07:23'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    945,
    210029,
    47,
    47,
    '2026-06-02 03:07:23',
    'excused',
    '2026-06-10 00:07:23',
    '2026-06-10 00:07:23'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    946,
    210029,
    47,
    47,
    '2026-05-31 03:07:23',
    'present',
    '2026-06-10 00:07:23',
    '2026-06-10 00:07:23'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    947,
    210029,
    47,
    47,
    '2026-05-29 03:07:23',
    'present',
    '2026-06-10 00:07:23',
    '2026-06-10 00:07:23'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    948,
    210029,
    47,
    47,
    '2026-05-27 03:07:24',
    'late',
    '2026-06-10 00:07:23',
    '2026-06-10 00:07:23'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    949,
    210029,
    47,
    47,
    '2026-05-25 03:07:24',
    'present',
    '2026-06-10 00:07:23',
    '2026-06-10 00:07:23'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    950,
    210029,
    47,
    47,
    '2026-05-23 03:07:24',
    'present',
    '2026-06-10 00:07:23',
    '2026-06-10 00:07:23'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    951,
    210029,
    47,
    47,
    '2026-05-21 03:07:24',
    'present',
    '2026-06-10 00:07:23',
    '2026-06-10 00:07:23'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    952,
    210029,
    47,
    47,
    '2026-05-19 03:07:24',
    'present',
    '2026-06-10 00:07:23',
    '2026-06-10 00:07:23'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    953,
    210029,
    47,
    47,
    '2026-05-17 03:07:24',
    'excused',
    '2026-06-10 00:07:23',
    '2026-06-10 00:07:23'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    954,
    210029,
    47,
    47,
    '2026-05-15 03:07:24',
    'present',
    '2026-06-10 00:07:23',
    '2026-06-10 00:07:23'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    955,
    210029,
    47,
    47,
    '2026-05-13 03:07:24',
    'present',
    '2026-06-10 00:07:24',
    '2026-06-10 00:07:24'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    956,
    210029,
    47,
    47,
    '2026-05-11 03:07:24',
    'late',
    '2026-06-10 00:07:24',
    '2026-06-10 00:07:24'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    957,
    210029,
    47,
    47,
    '2026-05-09 03:07:24',
    'present',
    '2026-06-10 00:07:24',
    '2026-06-10 00:07:24'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    958,
    210029,
    47,
    47,
    '2026-05-07 03:07:24',
    'present',
    '2026-06-10 00:07:24',
    '2026-06-10 00:07:24'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    959,
    210029,
    47,
    47,
    '2026-05-05 03:07:25',
    'present',
    '2026-06-10 00:07:24',
    '2026-06-10 00:07:24'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    960,
    210029,
    47,
    47,
    '2026-05-03 03:07:25',
    'present',
    '2026-06-10 00:07:24',
    '2026-06-10 00:07:24'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    961,
    210029,
    48,
    48,
    '2026-06-10 03:07:25',
    'present',
    '2026-06-10 00:07:24',
    '2026-06-10 00:07:24'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    962,
    210029,
    48,
    48,
    '2026-06-08 03:07:25',
    'present',
    '2026-06-10 00:07:24',
    '2026-06-10 00:07:24'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    963,
    210029,
    48,
    48,
    '2026-06-06 03:07:25',
    'present',
    '2026-06-10 00:07:25',
    '2026-06-10 00:07:25'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    964,
    210029,
    48,
    48,
    '2026-06-04 03:07:25',
    'present',
    '2026-06-10 00:07:25',
    '2026-06-10 00:07:25'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    965,
    210029,
    48,
    48,
    '2026-06-02 03:07:25',
    'excused',
    '2026-06-10 00:07:25',
    '2026-06-10 00:07:25'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    966,
    210029,
    48,
    48,
    '2026-05-31 03:07:25',
    'present',
    '2026-06-10 00:07:25',
    '2026-06-10 00:07:25'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    967,
    210029,
    48,
    48,
    '2026-05-29 03:07:26',
    'present',
    '2026-06-10 00:07:25',
    '2026-06-10 00:07:25'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    968,
    210029,
    48,
    48,
    '2026-05-27 03:07:26',
    'late',
    '2026-06-10 00:07:25',
    '2026-06-10 00:07:25'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    969,
    210029,
    48,
    48,
    '2026-05-25 03:07:26',
    'present',
    '2026-06-10 00:07:25',
    '2026-06-10 00:07:25'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    970,
    210029,
    48,
    48,
    '2026-05-23 03:07:26',
    'present',
    '2026-06-10 00:07:25',
    '2026-06-10 00:07:25'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    971,
    210029,
    48,
    48,
    '2026-05-21 03:07:26',
    'present',
    '2026-06-10 00:07:25',
    '2026-06-10 00:07:25'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    972,
    210029,
    48,
    48,
    '2026-05-19 03:07:26',
    'present',
    '2026-06-10 00:07:25',
    '2026-06-10 00:07:25'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    973,
    210029,
    48,
    48,
    '2026-05-17 03:07:26',
    'excused',
    '2026-06-10 00:07:26',
    '2026-06-10 00:07:26'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    974,
    210029,
    48,
    48,
    '2026-05-15 03:07:26',
    'present',
    '2026-06-10 00:07:26',
    '2026-06-10 00:07:26'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    975,
    210029,
    48,
    48,
    '2026-05-13 03:07:26',
    'present',
    '2026-06-10 00:07:26',
    '2026-06-10 00:07:26'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    976,
    210029,
    48,
    48,
    '2026-05-11 03:07:26',
    'late',
    '2026-06-10 00:07:26',
    '2026-06-10 00:07:26'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    977,
    210029,
    48,
    48,
    '2026-05-09 03:07:27',
    'present',
    '2026-06-10 00:07:26',
    '2026-06-10 00:07:26'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    978,
    210029,
    48,
    48,
    '2026-05-07 03:07:27',
    'present',
    '2026-06-10 00:07:26',
    '2026-06-10 00:07:26'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    979,
    210029,
    48,
    48,
    '2026-05-05 03:07:27',
    'present',
    '2026-06-10 00:07:26',
    '2026-06-10 00:07:26'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    980,
    210029,
    48,
    48,
    '2026-05-03 03:07:27',
    'present',
    '2026-06-10 00:07:26',
    '2026-06-10 00:07:26'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    981,
    210029,
    49,
    49,
    '2026-06-10 03:07:27',
    'present',
    '2026-06-10 00:07:26',
    '2026-06-10 00:07:26'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    982,
    210029,
    49,
    49,
    '2026-06-08 03:07:27',
    'present',
    '2026-06-10 00:07:26',
    '2026-06-10 00:07:26'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    983,
    210029,
    49,
    49,
    '2026-06-06 03:07:27',
    'present',
    '2026-06-10 00:07:27',
    '2026-06-10 00:07:27'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    984,
    210029,
    49,
    49,
    '2026-06-04 03:07:27',
    'present',
    '2026-06-10 00:07:27',
    '2026-06-10 00:07:27'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    985,
    210029,
    49,
    49,
    '2026-06-02 03:07:27',
    'excused',
    '2026-06-10 00:07:27',
    '2026-06-10 00:07:27'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    986,
    210029,
    49,
    49,
    '2026-05-31 03:07:28',
    'present',
    '2026-06-10 00:07:27',
    '2026-06-10 00:07:27'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    987,
    210029,
    49,
    49,
    '2026-05-29 03:07:28',
    'present',
    '2026-06-10 00:07:27',
    '2026-06-10 00:07:27'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    988,
    210029,
    49,
    49,
    '2026-05-27 03:07:28',
    'late',
    '2026-06-10 00:07:27',
    '2026-06-10 00:07:27'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    989,
    210029,
    49,
    49,
    '2026-05-25 03:07:28',
    'present',
    '2026-06-10 00:07:27',
    '2026-06-10 00:07:27'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    990,
    210029,
    49,
    49,
    '2026-05-23 03:07:28',
    'present',
    '2026-06-10 00:07:27',
    '2026-06-10 00:07:27'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    991,
    210029,
    49,
    49,
    '2026-05-21 03:07:28',
    'present',
    '2026-06-10 00:07:28',
    '2026-06-10 00:07:28'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    992,
    210029,
    49,
    49,
    '2026-05-19 03:07:28',
    'present',
    '2026-06-10 00:07:28',
    '2026-06-10 00:07:28'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    993,
    210029,
    49,
    49,
    '2026-05-17 03:07:28',
    'excused',
    '2026-06-10 00:07:28',
    '2026-06-10 00:07:28'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    994,
    210029,
    49,
    49,
    '2026-05-15 03:07:28',
    'present',
    '2026-06-10 00:07:28',
    '2026-06-10 00:07:28'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    995,
    210029,
    49,
    49,
    '2026-05-13 03:07:29',
    'present',
    '2026-06-10 00:07:28',
    '2026-06-10 00:07:28'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    996,
    210029,
    49,
    49,
    '2026-05-11 03:07:29',
    'late',
    '2026-06-10 00:07:28',
    '2026-06-10 00:07:28'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    997,
    210029,
    49,
    49,
    '2026-05-09 03:07:29',
    'present',
    '2026-06-10 00:07:28',
    '2026-06-10 00:07:28'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    998,
    210029,
    49,
    49,
    '2026-05-07 03:07:29',
    'present',
    '2026-06-10 00:07:28',
    '2026-06-10 00:07:28'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    999,
    210029,
    49,
    49,
    '2026-05-05 03:07:29',
    'present',
    '2026-06-10 00:07:28',
    '2026-06-10 00:07:28'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1000,
    210029,
    49,
    49,
    '2026-05-03 03:07:29',
    'present',
    '2026-06-10 00:07:28',
    '2026-06-10 00:07:28'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1001,
    210029,
    50,
    50,
    '2026-06-10 03:07:29',
    'present',
    '2026-06-10 00:07:29',
    '2026-06-10 00:07:29'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1002,
    210029,
    50,
    50,
    '2026-06-08 03:07:29',
    'present',
    '2026-06-10 00:07:29',
    '2026-06-10 00:07:29'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1003,
    210029,
    50,
    50,
    '2026-06-06 03:07:29',
    'present',
    '2026-06-10 00:07:29',
    '2026-06-10 00:07:29'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1004,
    210029,
    50,
    50,
    '2026-06-04 03:07:29',
    'present',
    '2026-06-10 00:07:29',
    '2026-06-10 00:07:29'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1005,
    210029,
    50,
    50,
    '2026-06-02 03:07:30',
    'excused',
    '2026-06-10 00:07:29',
    '2026-06-10 00:07:29'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1006,
    210029,
    50,
    50,
    '2026-05-31 03:07:30',
    'present',
    '2026-06-10 00:07:29',
    '2026-06-10 00:07:29'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1007,
    210029,
    50,
    50,
    '2026-05-29 03:07:30',
    'present',
    '2026-06-10 00:07:29',
    '2026-06-10 00:07:29'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1008,
    210029,
    50,
    50,
    '2026-05-27 03:07:30',
    'late',
    '2026-06-10 00:07:29',
    '2026-06-10 00:07:29'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1009,
    210029,
    50,
    50,
    '2026-05-25 03:07:30',
    'present',
    '2026-06-10 00:07:29',
    '2026-06-10 00:07:29'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1010,
    210029,
    50,
    50,
    '2026-05-23 03:07:30',
    'present',
    '2026-06-10 00:07:29',
    '2026-06-10 00:07:29'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1011,
    210029,
    50,
    50,
    '2026-05-21 03:07:30',
    'present',
    '2026-06-10 00:07:29',
    '2026-06-10 00:07:29'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1012,
    210029,
    50,
    50,
    '2026-05-19 03:07:30',
    'present',
    '2026-06-10 00:07:30',
    '2026-06-10 00:07:30'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1013,
    210029,
    50,
    50,
    '2026-05-17 03:07:30',
    'excused',
    '2026-06-10 00:07:30',
    '2026-06-10 00:07:30'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1014,
    210029,
    50,
    50,
    '2026-05-15 03:07:30',
    'present',
    '2026-06-10 00:07:30',
    '2026-06-10 00:07:30'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1015,
    210029,
    50,
    50,
    '2026-05-13 03:07:30',
    'present',
    '2026-06-10 00:07:30',
    '2026-06-10 00:07:30'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1016,
    210029,
    50,
    50,
    '2026-05-11 03:07:30',
    'late',
    '2026-06-10 00:07:30',
    '2026-06-10 00:07:30'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1017,
    210029,
    50,
    50,
    '2026-05-09 03:07:30',
    'present',
    '2026-06-10 00:07:30',
    '2026-06-10 00:07:30'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1018,
    210029,
    50,
    50,
    '2026-05-07 03:07:31',
    'present',
    '2026-06-10 00:07:30',
    '2026-06-10 00:07:30'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1019,
    210029,
    50,
    50,
    '2026-05-05 03:07:31',
    'present',
    '2026-06-10 00:07:30',
    '2026-06-10 00:07:30'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1020,
    210029,
    50,
    50,
    '2026-05-03 03:07:31',
    'present',
    '2026-06-10 00:07:30',
    '2026-06-10 00:07:30'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1021,
    210029,
    51,
    51,
    '2026-06-10 03:07:31',
    'present',
    '2026-06-10 00:07:30',
    '2026-06-10 00:07:30'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1022,
    210029,
    51,
    51,
    '2026-06-08 03:07:31',
    'present',
    '2026-06-10 00:07:30',
    '2026-06-10 00:07:30'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1023,
    210029,
    51,
    51,
    '2026-06-06 03:07:31',
    'present',
    '2026-06-10 00:07:30',
    '2026-06-10 00:07:30'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1024,
    210029,
    51,
    51,
    '2026-06-04 03:07:31',
    'present',
    '2026-06-10 00:07:30',
    '2026-06-10 00:07:30'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1025,
    210029,
    51,
    51,
    '2026-06-02 03:07:31',
    'excused',
    '2026-06-10 00:07:30',
    '2026-06-10 00:07:30'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1026,
    210029,
    51,
    51,
    '2026-05-31 03:07:31',
    'present',
    '2026-06-10 00:07:31',
    '2026-06-10 00:07:31'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1027,
    210029,
    51,
    51,
    '2026-05-29 03:07:31',
    'present',
    '2026-06-10 00:07:31',
    '2026-06-10 00:07:31'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1028,
    210029,
    51,
    51,
    '2026-05-27 03:07:31',
    'late',
    '2026-06-10 00:07:31',
    '2026-06-10 00:07:31'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1029,
    210029,
    51,
    51,
    '2026-05-25 03:07:31',
    'present',
    '2026-06-10 00:07:31',
    '2026-06-10 00:07:31'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1030,
    210029,
    51,
    51,
    '2026-05-23 03:07:31',
    'present',
    '2026-06-10 00:07:31',
    '2026-06-10 00:07:31'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1031,
    210029,
    51,
    51,
    '2026-05-21 03:07:31',
    'present',
    '2026-06-10 00:07:31',
    '2026-06-10 00:07:31'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1032,
    210029,
    51,
    51,
    '2026-05-19 03:07:32',
    'present',
    '2026-06-10 00:07:31',
    '2026-06-10 00:07:31'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1033,
    210029,
    51,
    51,
    '2026-05-17 03:07:32',
    'excused',
    '2026-06-10 00:07:31',
    '2026-06-10 00:07:31'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1034,
    210029,
    51,
    51,
    '2026-05-15 03:07:32',
    'present',
    '2026-06-10 00:07:31',
    '2026-06-10 00:07:31'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1035,
    210029,
    51,
    51,
    '2026-05-13 03:07:32',
    'present',
    '2026-06-10 00:07:31',
    '2026-06-10 00:07:31'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1036,
    210029,
    51,
    51,
    '2026-05-11 03:07:32',
    'late',
    '2026-06-10 00:07:31',
    '2026-06-10 00:07:31'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1037,
    210029,
    51,
    51,
    '2026-05-09 03:07:32',
    'present',
    '2026-06-10 00:07:31',
    '2026-06-10 00:07:31'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1038,
    210029,
    51,
    51,
    '2026-05-07 03:07:32',
    'present',
    '2026-06-10 00:07:31',
    '2026-06-10 00:07:31'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1039,
    210029,
    51,
    51,
    '2026-05-05 03:07:32',
    'present',
    '2026-06-10 00:07:31',
    '2026-06-10 00:07:31'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1040,
    210029,
    51,
    51,
    '2026-05-03 03:07:32',
    'present',
    '2026-06-10 00:07:32',
    '2026-06-10 00:07:32'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1041,
    210029,
    52,
    52,
    '2026-06-10 03:07:32',
    'present',
    '2026-06-10 00:07:32',
    '2026-06-10 00:07:32'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1042,
    210029,
    52,
    52,
    '2026-06-08 03:07:32',
    'present',
    '2026-06-10 00:07:32',
    '2026-06-10 00:07:32'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1043,
    210029,
    52,
    52,
    '2026-06-06 03:07:33',
    'present',
    '2026-06-10 00:07:32',
    '2026-06-10 00:07:32'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1044,
    210029,
    52,
    52,
    '2026-06-04 03:07:33',
    'present',
    '2026-06-10 00:07:32',
    '2026-06-10 00:07:32'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1045,
    210029,
    52,
    52,
    '2026-06-02 03:07:33',
    'excused',
    '2026-06-10 00:07:32',
    '2026-06-10 00:07:32'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1046,
    210029,
    52,
    52,
    '2026-05-31 03:07:33',
    'present',
    '2026-06-10 00:07:32',
    '2026-06-10 00:07:32'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1047,
    210029,
    52,
    52,
    '2026-05-29 03:07:33',
    'present',
    '2026-06-10 00:07:32',
    '2026-06-10 00:07:32'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1048,
    210029,
    52,
    52,
    '2026-05-27 03:07:33',
    'late',
    '2026-06-10 00:07:32',
    '2026-06-10 00:07:32'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1049,
    210029,
    52,
    52,
    '2026-05-25 03:07:33',
    'present',
    '2026-06-10 00:07:33',
    '2026-06-10 00:07:33'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1050,
    210029,
    52,
    52,
    '2026-05-23 03:07:33',
    'present',
    '2026-06-10 00:07:33',
    '2026-06-10 00:07:33'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1051,
    210029,
    52,
    52,
    '2026-05-21 03:07:33',
    'present',
    '2026-06-10 00:07:33',
    '2026-06-10 00:07:33'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1052,
    210029,
    52,
    52,
    '2026-05-19 03:07:33',
    'present',
    '2026-06-10 00:07:33',
    '2026-06-10 00:07:33'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1053,
    210029,
    52,
    52,
    '2026-05-17 03:07:34',
    'excused',
    '2026-06-10 00:07:33',
    '2026-06-10 00:07:33'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1054,
    210029,
    52,
    52,
    '2026-05-15 03:07:34',
    'present',
    '2026-06-10 00:07:33',
    '2026-06-10 00:07:33'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1055,
    210029,
    52,
    52,
    '2026-05-13 03:07:34',
    'present',
    '2026-06-10 00:07:33',
    '2026-06-10 00:07:33'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1056,
    210029,
    52,
    52,
    '2026-05-11 03:07:34',
    'late',
    '2026-06-10 00:07:33',
    '2026-06-10 00:07:33'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1057,
    210029,
    52,
    52,
    '2026-05-09 03:07:34',
    'present',
    '2026-06-10 00:07:33',
    '2026-06-10 00:07:33'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1058,
    210029,
    52,
    52,
    '2026-05-07 03:07:34',
    'present',
    '2026-06-10 00:07:33',
    '2026-06-10 00:07:33'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1059,
    210029,
    52,
    52,
    '2026-05-05 03:07:34',
    'present',
    '2026-06-10 00:07:34',
    '2026-06-10 00:07:34'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1060,
    210029,
    52,
    52,
    '2026-05-03 03:07:34',
    'present',
    '2026-06-10 00:07:34',
    '2026-06-10 00:07:34'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1061,
    210029,
    53,
    53,
    '2026-06-10 03:07:34',
    'present',
    '2026-06-10 00:07:34',
    '2026-06-10 00:07:34'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1062,
    210029,
    53,
    53,
    '2026-06-08 03:07:34',
    'present',
    '2026-06-10 00:07:34',
    '2026-06-10 00:07:34'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1063,
    210029,
    53,
    53,
    '2026-06-06 03:07:35',
    'present',
    '2026-06-10 00:07:34',
    '2026-06-10 00:07:34'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1064,
    210029,
    53,
    53,
    '2026-06-04 03:07:35',
    'present',
    '2026-06-10 00:07:34',
    '2026-06-10 00:07:34'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1065,
    210029,
    53,
    53,
    '2026-06-02 03:07:35',
    'excused',
    '2026-06-10 00:07:34',
    '2026-06-10 00:07:34'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1066,
    210029,
    53,
    53,
    '2026-05-31 03:07:35',
    'present',
    '2026-06-10 00:07:34',
    '2026-06-10 00:07:34'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1067,
    210029,
    53,
    53,
    '2026-05-29 03:07:35',
    'present',
    '2026-06-10 00:07:34',
    '2026-06-10 00:07:34'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1068,
    210029,
    53,
    53,
    '2026-05-27 03:07:35',
    'late',
    '2026-06-10 00:07:34',
    '2026-06-10 00:07:34'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1069,
    210029,
    53,
    53,
    '2026-05-25 03:07:35',
    'present',
    '2026-06-10 00:07:35',
    '2026-06-10 00:07:35'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1070,
    210029,
    53,
    53,
    '2026-05-23 03:07:35',
    'present',
    '2026-06-10 00:07:35',
    '2026-06-10 00:07:35'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1071,
    210029,
    53,
    53,
    '2026-05-21 03:07:35',
    'present',
    '2026-06-10 00:07:35',
    '2026-06-10 00:07:35'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1072,
    210029,
    53,
    53,
    '2026-05-19 03:07:35',
    'present',
    '2026-06-10 00:07:35',
    '2026-06-10 00:07:35'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1073,
    210029,
    53,
    53,
    '2026-05-17 03:07:36',
    'excused',
    '2026-06-10 00:07:35',
    '2026-06-10 00:07:35'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1074,
    210029,
    53,
    53,
    '2026-05-15 03:07:36',
    'present',
    '2026-06-10 00:07:35',
    '2026-06-10 00:07:35'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1075,
    210029,
    53,
    53,
    '2026-05-13 03:07:36',
    'present',
    '2026-06-10 00:07:35',
    '2026-06-10 00:07:35'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1076,
    210029,
    53,
    53,
    '2026-05-11 03:07:36',
    'late',
    '2026-06-10 00:07:35',
    '2026-06-10 00:07:35'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1077,
    210029,
    53,
    53,
    '2026-05-09 03:07:36',
    'present',
    '2026-06-10 00:07:36',
    '2026-06-10 00:07:36'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1078,
    210029,
    53,
    53,
    '2026-05-07 03:07:36',
    'present',
    '2026-06-10 00:07:36',
    '2026-06-10 00:07:36'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1079,
    210029,
    53,
    53,
    '2026-05-05 03:07:36',
    'present',
    '2026-06-10 00:07:36',
    '2026-06-10 00:07:36'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1080,
    210029,
    53,
    53,
    '2026-05-03 03:07:36',
    'present',
    '2026-06-10 00:07:36',
    '2026-06-10 00:07:36'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1081,
    210030,
    33,
    33,
    '2026-06-10 03:07:37',
    'present',
    '2026-06-10 00:07:36',
    '2026-06-10 00:07:36'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1082,
    210030,
    33,
    33,
    '2026-06-08 03:07:37',
    'present',
    '2026-06-10 00:07:36',
    '2026-06-10 00:07:36'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1083,
    210030,
    33,
    33,
    '2026-06-06 03:07:37',
    'absent',
    '2026-06-10 00:07:36',
    '2026-06-10 00:07:36'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1084,
    210030,
    33,
    33,
    '2026-06-04 03:07:37',
    'present',
    '2026-06-10 00:07:36',
    '2026-06-10 00:07:36'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1085,
    210030,
    33,
    33,
    '2026-06-02 03:07:37',
    'late',
    '2026-06-10 00:07:36',
    '2026-06-10 00:07:36'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1086,
    210030,
    33,
    33,
    '2026-05-31 03:07:37',
    'present',
    '2026-06-10 00:07:37',
    '2026-06-10 00:07:37'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1087,
    210030,
    33,
    33,
    '2026-05-29 03:07:37',
    'excused',
    '2026-06-10 00:07:37',
    '2026-06-10 00:07:37'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1088,
    210030,
    33,
    33,
    '2026-05-27 03:07:38',
    'present',
    '2026-06-10 00:07:37',
    '2026-06-10 00:07:37'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1089,
    210030,
    33,
    33,
    '2026-05-25 03:07:38',
    'absent',
    '2026-06-10 00:07:37',
    '2026-06-10 00:07:37'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1090,
    210030,
    33,
    33,
    '2026-05-23 03:07:38',
    'present',
    '2026-06-10 00:07:37',
    '2026-06-10 00:07:37'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1091,
    210030,
    33,
    33,
    '2026-05-21 03:07:38',
    'present',
    '2026-06-10 00:07:37',
    '2026-06-10 00:07:37'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1092,
    210030,
    33,
    33,
    '2026-05-19 03:07:38',
    'absent',
    '2026-06-10 00:07:37',
    '2026-06-10 00:07:37'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1093,
    210030,
    33,
    33,
    '2026-05-17 03:07:38',
    'present',
    '2026-06-10 00:07:38',
    '2026-06-10 00:07:38'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1094,
    210030,
    33,
    33,
    '2026-05-15 03:07:38',
    'late',
    '2026-06-10 00:07:38',
    '2026-06-10 00:07:38'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1095,
    210030,
    33,
    33,
    '2026-05-13 03:07:38',
    'present',
    '2026-06-10 00:07:38',
    '2026-06-10 00:07:38'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1096,
    210030,
    33,
    33,
    '2026-05-11 03:07:38',
    'excused',
    '2026-06-10 00:07:38',
    '2026-06-10 00:07:38'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1097,
    210030,
    33,
    33,
    '2026-05-09 03:07:39',
    'present',
    '2026-06-10 00:07:38',
    '2026-06-10 00:07:38'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1098,
    210030,
    33,
    33,
    '2026-05-07 03:07:39',
    'absent',
    '2026-06-10 00:07:38',
    '2026-06-10 00:07:38'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1099,
    210030,
    33,
    33,
    '2026-05-05 03:07:39',
    'present',
    '2026-06-10 00:07:38',
    '2026-06-10 00:07:38'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1100,
    210030,
    33,
    33,
    '2026-05-03 03:07:39',
    'present',
    '2026-06-10 00:07:38',
    '2026-06-10 00:07:38'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1101,
    210030,
    34,
    34,
    '2026-06-10 03:07:39',
    'present',
    '2026-06-10 00:07:38',
    '2026-06-10 00:07:38'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1102,
    210030,
    34,
    34,
    '2026-06-08 03:07:39',
    'present',
    '2026-06-10 00:07:38',
    '2026-06-10 00:07:38'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1103,
    210030,
    34,
    34,
    '2026-06-06 03:07:39',
    'absent',
    '2026-06-10 00:07:39',
    '2026-06-10 00:07:39'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1104,
    210030,
    34,
    34,
    '2026-06-04 03:07:39',
    'present',
    '2026-06-10 00:07:39',
    '2026-06-10 00:07:39'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1105,
    210030,
    34,
    34,
    '2026-06-02 03:07:39',
    'late',
    '2026-06-10 00:07:39',
    '2026-06-10 00:07:39'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1106,
    210030,
    34,
    34,
    '2026-05-31 03:07:39',
    'present',
    '2026-06-10 00:07:39',
    '2026-06-10 00:07:39'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1107,
    210030,
    34,
    34,
    '2026-05-29 03:07:40',
    'excused',
    '2026-06-10 00:07:39',
    '2026-06-10 00:07:39'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1108,
    210030,
    34,
    34,
    '2026-05-27 03:07:40',
    'present',
    '2026-06-10 00:07:39',
    '2026-06-10 00:07:39'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1109,
    210030,
    34,
    34,
    '2026-05-25 03:07:40',
    'absent',
    '2026-06-10 00:07:39',
    '2026-06-10 00:07:39'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1110,
    210030,
    34,
    34,
    '2026-05-23 03:07:40',
    'present',
    '2026-06-10 00:07:39',
    '2026-06-10 00:07:39'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1111,
    210030,
    34,
    34,
    '2026-05-21 03:07:40',
    'present',
    '2026-06-10 00:07:40',
    '2026-06-10 00:07:40'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1112,
    210030,
    34,
    34,
    '2026-05-19 03:07:40',
    'absent',
    '2026-06-10 00:07:40',
    '2026-06-10 00:07:40'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1113,
    210030,
    34,
    34,
    '2026-05-17 03:07:40',
    'present',
    '2026-06-10 00:07:40',
    '2026-06-10 00:07:40'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1114,
    210030,
    34,
    34,
    '2026-05-15 03:07:40',
    'late',
    '2026-06-10 00:07:40',
    '2026-06-10 00:07:40'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1115,
    210030,
    34,
    34,
    '2026-05-13 03:07:41',
    'present',
    '2026-06-10 00:07:40',
    '2026-06-10 00:07:40'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1116,
    210030,
    34,
    34,
    '2026-05-11 03:07:41',
    'excused',
    '2026-06-10 00:07:40',
    '2026-06-10 00:07:40'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1117,
    210030,
    34,
    34,
    '2026-05-09 03:07:41',
    'present',
    '2026-06-10 00:07:40',
    '2026-06-10 00:07:40'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1118,
    210030,
    34,
    34,
    '2026-05-07 03:07:41',
    'absent',
    '2026-06-10 00:07:40',
    '2026-06-10 00:07:40'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1119,
    210030,
    34,
    34,
    '2026-05-05 03:07:41',
    'present',
    '2026-06-10 00:07:40',
    '2026-06-10 00:07:40'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1120,
    210030,
    34,
    34,
    '2026-05-03 03:07:41',
    'present',
    '2026-06-10 00:07:40',
    '2026-06-10 00:07:40'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1121,
    210030,
    35,
    35,
    '2026-06-10 03:07:41',
    'present',
    '2026-06-10 00:07:41',
    '2026-06-10 00:07:41'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1122,
    210030,
    35,
    35,
    '2026-06-08 03:07:41',
    'present',
    '2026-06-10 00:07:41',
    '2026-06-10 00:07:41'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1123,
    210030,
    35,
    35,
    '2026-06-06 03:07:41',
    'absent',
    '2026-06-10 00:07:41',
    '2026-06-10 00:07:41'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1124,
    210030,
    35,
    35,
    '2026-06-04 03:07:41',
    'present',
    '2026-06-10 00:07:41',
    '2026-06-10 00:07:41'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1125,
    210030,
    35,
    35,
    '2026-06-02 03:07:42',
    'late',
    '2026-06-10 00:07:41',
    '2026-06-10 00:07:41'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1126,
    210030,
    35,
    35,
    '2026-05-31 03:07:42',
    'present',
    '2026-06-10 00:07:41',
    '2026-06-10 00:07:41'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1127,
    210030,
    35,
    35,
    '2026-05-29 03:07:42',
    'excused',
    '2026-06-10 00:07:41',
    '2026-06-10 00:07:41'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1128,
    210030,
    35,
    35,
    '2026-05-27 03:07:42',
    'present',
    '2026-06-10 00:07:41',
    '2026-06-10 00:07:41'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1129,
    210030,
    35,
    35,
    '2026-05-25 03:07:42',
    'absent',
    '2026-06-10 00:07:41',
    '2026-06-10 00:07:41'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1130,
    210030,
    35,
    35,
    '2026-05-23 03:07:42',
    'present',
    '2026-06-10 00:07:41',
    '2026-06-10 00:07:41'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1131,
    210030,
    35,
    35,
    '2026-05-21 03:07:42',
    'present',
    '2026-06-10 00:07:42',
    '2026-06-10 00:07:42'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1132,
    210030,
    35,
    35,
    '2026-05-19 03:07:42',
    'absent',
    '2026-06-10 00:07:42',
    '2026-06-10 00:07:42'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1133,
    210030,
    35,
    35,
    '2026-05-17 03:07:42',
    'present',
    '2026-06-10 00:07:42',
    '2026-06-10 00:07:42'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1134,
    210030,
    35,
    35,
    '2026-05-15 03:07:42',
    'late',
    '2026-06-10 00:07:42',
    '2026-06-10 00:07:42'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1135,
    210030,
    35,
    35,
    '2026-05-13 03:07:43',
    'present',
    '2026-06-10 00:07:42',
    '2026-06-10 00:07:42'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1136,
    210030,
    35,
    35,
    '2026-05-11 03:07:43',
    'excused',
    '2026-06-10 00:07:42',
    '2026-06-10 00:07:42'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1137,
    210030,
    35,
    35,
    '2026-05-09 03:07:43',
    'present',
    '2026-06-10 00:07:42',
    '2026-06-10 00:07:42'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1138,
    210030,
    35,
    35,
    '2026-05-07 03:07:43',
    'absent',
    '2026-06-10 00:07:42',
    '2026-06-10 00:07:42'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1139,
    210030,
    35,
    35,
    '2026-05-05 03:07:43',
    'present',
    '2026-06-10 00:07:42',
    '2026-06-10 00:07:42'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1140,
    210030,
    35,
    35,
    '2026-05-03 03:07:43',
    'present',
    '2026-06-10 00:07:42',
    '2026-06-10 00:07:42'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1141,
    210030,
    36,
    36,
    '2026-06-10 03:07:43',
    'present',
    '2026-06-10 00:07:43',
    '2026-06-10 00:07:43'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1142,
    210030,
    36,
    36,
    '2026-06-08 03:07:43',
    'present',
    '2026-06-10 00:07:43',
    '2026-06-10 00:07:43'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1143,
    210030,
    36,
    36,
    '2026-06-06 03:07:43',
    'absent',
    '2026-06-10 00:07:43',
    '2026-06-10 00:07:43'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1144,
    210030,
    36,
    36,
    '2026-06-04 03:07:44',
    'present',
    '2026-06-10 00:07:43',
    '2026-06-10 00:07:43'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1145,
    210030,
    36,
    36,
    '2026-06-02 03:07:44',
    'late',
    '2026-06-10 00:07:43',
    '2026-06-10 00:07:43'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1146,
    210030,
    36,
    36,
    '2026-05-31 03:07:44',
    'present',
    '2026-06-10 00:07:43',
    '2026-06-10 00:07:43'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1147,
    210030,
    36,
    36,
    '2026-05-29 03:07:44',
    'excused',
    '2026-06-10 00:07:43',
    '2026-06-10 00:07:43'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1148,
    210030,
    36,
    36,
    '2026-05-27 03:07:44',
    'present',
    '2026-06-10 00:07:43',
    '2026-06-10 00:07:43'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1149,
    210030,
    36,
    36,
    '2026-05-25 03:07:44',
    'absent',
    '2026-06-10 00:07:44',
    '2026-06-10 00:07:44'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1150,
    210030,
    36,
    36,
    '2026-05-23 03:07:44',
    'present',
    '2026-06-10 00:07:44',
    '2026-06-10 00:07:44'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1151,
    210030,
    36,
    36,
    '2026-05-21 03:07:44',
    'present',
    '2026-06-10 00:07:44',
    '2026-06-10 00:07:44'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1152,
    210030,
    36,
    36,
    '2026-05-19 03:07:44',
    'absent',
    '2026-06-10 00:07:44',
    '2026-06-10 00:07:44'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1153,
    210030,
    36,
    36,
    '2026-05-17 03:07:45',
    'present',
    '2026-06-10 00:07:44',
    '2026-06-10 00:07:44'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1154,
    210030,
    36,
    36,
    '2026-05-15 03:07:45',
    'late',
    '2026-06-10 00:07:44',
    '2026-06-10 00:07:44'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1155,
    210030,
    36,
    36,
    '2026-05-13 03:07:45',
    'present',
    '2026-06-10 00:07:44',
    '2026-06-10 00:07:44'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1156,
    210030,
    36,
    36,
    '2026-05-11 03:07:45',
    'excused',
    '2026-06-10 00:07:44',
    '2026-06-10 00:07:44'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1157,
    210030,
    36,
    36,
    '2026-05-09 03:07:45',
    'present',
    '2026-06-10 00:07:45',
    '2026-06-10 00:07:45'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1158,
    210030,
    36,
    36,
    '2026-05-07 03:07:45',
    'absent',
    '2026-06-10 00:07:45',
    '2026-06-10 00:07:45'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1159,
    210030,
    36,
    36,
    '2026-05-05 03:07:45',
    'present',
    '2026-06-10 00:07:45',
    '2026-06-10 00:07:45'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1160,
    210030,
    36,
    36,
    '2026-05-03 03:07:45',
    'present',
    '2026-06-10 00:07:45',
    '2026-06-10 00:07:45'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1161,
    210030,
    37,
    37,
    '2026-06-10 03:07:46',
    'present',
    '2026-06-10 00:07:45',
    '2026-06-10 00:07:45'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1162,
    210030,
    37,
    37,
    '2026-06-08 03:07:46',
    'present',
    '2026-06-10 00:07:45',
    '2026-06-10 00:07:45'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1163,
    210030,
    37,
    37,
    '2026-06-06 03:07:46',
    'absent',
    '2026-06-10 00:07:45',
    '2026-06-10 00:07:45'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1164,
    210030,
    37,
    37,
    '2026-06-04 03:07:46',
    'present',
    '2026-06-10 00:07:45',
    '2026-06-10 00:07:45'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1165,
    210030,
    37,
    37,
    '2026-06-02 03:07:46',
    'late',
    '2026-06-10 00:07:45',
    '2026-06-10 00:07:45'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1166,
    210030,
    37,
    37,
    '2026-05-31 03:07:46',
    'present',
    '2026-06-10 00:07:45',
    '2026-06-10 00:07:45'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1167,
    210030,
    37,
    37,
    '2026-05-29 03:07:46',
    'excused',
    '2026-06-10 00:07:46',
    '2026-06-10 00:07:46'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1168,
    210030,
    37,
    37,
    '2026-05-27 03:07:46',
    'present',
    '2026-06-10 00:07:46',
    '2026-06-10 00:07:46'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1169,
    210030,
    37,
    37,
    '2026-05-25 03:07:46',
    'absent',
    '2026-06-10 00:07:46',
    '2026-06-10 00:07:46'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1170,
    210030,
    37,
    37,
    '2026-05-23 03:07:46',
    'present',
    '2026-06-10 00:07:46',
    '2026-06-10 00:07:46'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1171,
    210030,
    37,
    37,
    '2026-05-21 03:07:47',
    'present',
    '2026-06-10 00:07:46',
    '2026-06-10 00:07:46'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1172,
    210030,
    37,
    37,
    '2026-05-19 03:07:47',
    'absent',
    '2026-06-10 00:07:46',
    '2026-06-10 00:07:46'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1173,
    210030,
    37,
    37,
    '2026-05-17 03:07:47',
    'present',
    '2026-06-10 00:07:46',
    '2026-06-10 00:07:46'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1174,
    210030,
    37,
    37,
    '2026-05-15 03:07:47',
    'late',
    '2026-06-10 00:07:46',
    '2026-06-10 00:07:46'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1175,
    210030,
    37,
    37,
    '2026-05-13 03:07:47',
    'present',
    '2026-06-10 00:07:46',
    '2026-06-10 00:07:46'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1176,
    210030,
    37,
    37,
    '2026-05-11 03:07:47',
    'excused',
    '2026-06-10 00:07:46',
    '2026-06-10 00:07:46'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1177,
    210030,
    37,
    37,
    '2026-05-09 03:07:47',
    'present',
    '2026-06-10 00:07:47',
    '2026-06-10 00:07:47'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1178,
    210030,
    37,
    37,
    '2026-05-07 03:07:47',
    'absent',
    '2026-06-10 00:07:47',
    '2026-06-10 00:07:47'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1179,
    210030,
    37,
    37,
    '2026-05-05 03:07:47',
    'present',
    '2026-06-10 00:07:47',
    '2026-06-10 00:07:47'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1180,
    210030,
    37,
    37,
    '2026-05-03 03:07:47',
    'present',
    '2026-06-10 00:07:47',
    '2026-06-10 00:07:47'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1181,
    210030,
    38,
    38,
    '2026-06-10 03:07:48',
    'present',
    '2026-06-10 00:07:47',
    '2026-06-10 00:07:47'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1182,
    210030,
    38,
    38,
    '2026-06-08 03:07:48',
    'present',
    '2026-06-10 00:07:47',
    '2026-06-10 00:07:47'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1183,
    210030,
    38,
    38,
    '2026-06-06 03:07:48',
    'absent',
    '2026-06-10 00:07:47',
    '2026-06-10 00:07:47'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1184,
    210030,
    38,
    38,
    '2026-06-04 03:07:48',
    'present',
    '2026-06-10 00:07:47',
    '2026-06-10 00:07:47'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1185,
    210030,
    38,
    38,
    '2026-06-02 03:07:48',
    'late',
    '2026-06-10 00:07:48',
    '2026-06-10 00:07:48'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1186,
    210030,
    38,
    38,
    '2026-05-31 03:07:48',
    'present',
    '2026-06-10 00:07:48',
    '2026-06-10 00:07:48'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1187,
    210030,
    38,
    38,
    '2026-05-29 03:07:48',
    'excused',
    '2026-06-10 00:07:48',
    '2026-06-10 00:07:48'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1188,
    210030,
    38,
    38,
    '2026-05-27 03:07:48',
    'present',
    '2026-06-10 00:07:48',
    '2026-06-10 00:07:48'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1189,
    210030,
    38,
    38,
    '2026-05-25 03:07:49',
    'absent',
    '2026-06-10 00:07:48',
    '2026-06-10 00:07:48'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1190,
    210030,
    38,
    38,
    '2026-05-23 03:07:49',
    'present',
    '2026-06-10 00:07:48',
    '2026-06-10 00:07:48'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1191,
    210030,
    38,
    38,
    '2026-05-21 03:07:49',
    'present',
    '2026-06-10 00:07:48',
    '2026-06-10 00:07:48'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1192,
    210030,
    38,
    38,
    '2026-05-19 03:07:49',
    'absent',
    '2026-06-10 00:07:48',
    '2026-06-10 00:07:48'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1193,
    210030,
    38,
    38,
    '2026-05-17 03:07:49',
    'present',
    '2026-06-10 00:07:48',
    '2026-06-10 00:07:48'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1194,
    210030,
    38,
    38,
    '2026-05-15 03:07:49',
    'late',
    '2026-06-10 00:07:49',
    '2026-06-10 00:07:49'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1195,
    210030,
    38,
    38,
    '2026-05-13 03:07:49',
    'present',
    '2026-06-10 00:07:49',
    '2026-06-10 00:07:49'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1196,
    210030,
    38,
    38,
    '2026-05-11 03:07:49',
    'excused',
    '2026-06-10 00:07:49',
    '2026-06-10 00:07:49'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1197,
    210030,
    38,
    38,
    '2026-05-09 03:07:49',
    'present',
    '2026-06-10 00:07:49',
    '2026-06-10 00:07:49'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1198,
    210030,
    38,
    38,
    '2026-05-07 03:07:50',
    'absent',
    '2026-06-10 00:07:49',
    '2026-06-10 00:07:49'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1199,
    210030,
    38,
    38,
    '2026-05-05 03:07:50',
    'present',
    '2026-06-10 00:07:49',
    '2026-06-10 00:07:49'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1200,
    210030,
    38,
    38,
    '2026-05-03 03:07:50',
    'present',
    '2026-06-10 00:07:49',
    '2026-06-10 00:07:49'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1201,
    210030,
    39,
    39,
    '2026-06-10 03:07:50',
    'present',
    '2026-06-10 00:07:49',
    '2026-06-10 00:07:49'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1202,
    210030,
    39,
    39,
    '2026-06-08 03:07:50',
    'present',
    '2026-06-10 00:07:50',
    '2026-06-10 00:07:50'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1203,
    210030,
    39,
    39,
    '2026-06-06 03:07:50',
    'absent',
    '2026-06-10 00:07:50',
    '2026-06-10 00:07:50'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1204,
    210030,
    39,
    39,
    '2026-06-04 03:07:50',
    'present',
    '2026-06-10 00:07:50',
    '2026-06-10 00:07:50'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1205,
    210030,
    39,
    39,
    '2026-06-02 03:07:50',
    'late',
    '2026-06-10 00:07:50',
    '2026-06-10 00:07:50'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1206,
    210030,
    39,
    39,
    '2026-05-31 03:07:51',
    'present',
    '2026-06-10 00:07:50',
    '2026-06-10 00:07:50'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1207,
    210030,
    39,
    39,
    '2026-05-29 03:07:51',
    'excused',
    '2026-06-10 00:07:50',
    '2026-06-10 00:07:50'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1208,
    210030,
    39,
    39,
    '2026-05-27 03:07:51',
    'present',
    '2026-06-10 00:07:50',
    '2026-06-10 00:07:50'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1209,
    210030,
    39,
    39,
    '2026-05-25 03:07:51',
    'absent',
    '2026-06-10 00:07:50',
    '2026-06-10 00:07:50'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1210,
    210030,
    39,
    39,
    '2026-05-23 03:07:51',
    'present',
    '2026-06-10 00:07:50',
    '2026-06-10 00:07:50'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1211,
    210030,
    39,
    39,
    '2026-05-21 03:07:51',
    'present',
    '2026-06-10 00:07:50',
    '2026-06-10 00:07:50'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1212,
    210030,
    39,
    39,
    '2026-05-19 03:07:51',
    'absent',
    '2026-06-10 00:07:51',
    '2026-06-10 00:07:51'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1213,
    210030,
    39,
    39,
    '2026-05-17 03:07:51',
    'present',
    '2026-06-10 00:07:51',
    '2026-06-10 00:07:51'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1214,
    210030,
    39,
    39,
    '2026-05-15 03:07:51',
    'late',
    '2026-06-10 00:07:51',
    '2026-06-10 00:07:51'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1215,
    210030,
    39,
    39,
    '2026-05-13 03:07:51',
    'present',
    '2026-06-10 00:07:51',
    '2026-06-10 00:07:51'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1216,
    210030,
    39,
    39,
    '2026-05-11 03:07:52',
    'excused',
    '2026-06-10 00:07:51',
    '2026-06-10 00:07:51'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1217,
    210030,
    39,
    39,
    '2026-05-09 03:07:52',
    'present',
    '2026-06-10 00:07:51',
    '2026-06-10 00:07:51'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1218,
    210030,
    39,
    39,
    '2026-05-07 03:07:52',
    'absent',
    '2026-06-10 00:07:51',
    '2026-06-10 00:07:51'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1219,
    210030,
    39,
    39,
    '2026-05-05 03:07:52',
    'present',
    '2026-06-10 00:07:51',
    '2026-06-10 00:07:51'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1220,
    210030,
    39,
    39,
    '2026-05-03 03:07:52',
    'present',
    '2026-06-10 00:07:51',
    '2026-06-10 00:07:51'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1221,
    210030,
    40,
    40,
    '2026-06-10 03:07:52',
    'present',
    '2026-06-10 00:07:52',
    '2026-06-10 00:07:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1222,
    210030,
    40,
    40,
    '2026-06-08 03:07:52',
    'present',
    '2026-06-10 00:07:52',
    '2026-06-10 00:07:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1223,
    210030,
    40,
    40,
    '2026-06-06 03:07:52',
    'absent',
    '2026-06-10 00:07:52',
    '2026-06-10 00:07:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1224,
    210030,
    40,
    40,
    '2026-06-04 03:07:52',
    'present',
    '2026-06-10 00:07:52',
    '2026-06-10 00:07:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1225,
    210030,
    40,
    40,
    '2026-06-02 03:07:53',
    'late',
    '2026-06-10 00:07:52',
    '2026-06-10 00:07:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1226,
    210030,
    40,
    40,
    '2026-05-31 03:07:53',
    'present',
    '2026-06-10 00:07:52',
    '2026-06-10 00:07:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1227,
    210030,
    40,
    40,
    '2026-05-29 03:07:53',
    'excused',
    '2026-06-10 00:07:52',
    '2026-06-10 00:07:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1228,
    210030,
    40,
    40,
    '2026-05-27 03:07:53',
    'present',
    '2026-06-10 00:07:52',
    '2026-06-10 00:07:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1229,
    210030,
    40,
    40,
    '2026-05-25 03:07:53',
    'absent',
    '2026-06-10 00:07:52',
    '2026-06-10 00:07:52'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1230,
    210030,
    40,
    40,
    '2026-05-23 03:07:53',
    'present',
    '2026-06-10 00:07:53',
    '2026-06-10 00:07:53'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1231,
    210030,
    40,
    40,
    '2026-05-21 03:07:53',
    'present',
    '2026-06-10 00:07:53',
    '2026-06-10 00:07:53'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1232,
    210030,
    40,
    40,
    '2026-05-19 03:07:53',
    'absent',
    '2026-06-10 00:07:53',
    '2026-06-10 00:07:53'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1233,
    210030,
    40,
    40,
    '2026-05-17 03:07:53',
    'present',
    '2026-06-10 00:07:53',
    '2026-06-10 00:07:53'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1234,
    210030,
    40,
    40,
    '2026-05-15 03:07:53',
    'late',
    '2026-06-10 00:07:53',
    '2026-06-10 00:07:53'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1235,
    210030,
    40,
    40,
    '2026-05-13 03:07:54',
    'present',
    '2026-06-10 00:07:53',
    '2026-06-10 00:07:53'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1236,
    210030,
    40,
    40,
    '2026-05-11 03:07:54',
    'excused',
    '2026-06-10 00:07:53',
    '2026-06-10 00:07:53'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1237,
    210030,
    40,
    40,
    '2026-05-09 03:07:54',
    'present',
    '2026-06-10 00:07:53',
    '2026-06-10 00:07:53'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1238,
    210030,
    40,
    40,
    '2026-05-07 03:07:54',
    'absent',
    '2026-06-10 00:07:53',
    '2026-06-10 00:07:53'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1239,
    210030,
    40,
    40,
    '2026-05-05 03:07:54',
    'present',
    '2026-06-10 00:07:53',
    '2026-06-10 00:07:53'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1240,
    210030,
    40,
    40,
    '2026-05-03 03:07:54',
    'present',
    '2026-06-10 00:07:54',
    '2026-06-10 00:07:54'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1241,
    210030,
    41,
    41,
    '2026-06-10 03:07:54',
    'present',
    '2026-06-10 00:07:54',
    '2026-06-10 00:07:54'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1242,
    210030,
    41,
    41,
    '2026-06-08 03:07:54',
    'present',
    '2026-06-10 00:07:54',
    '2026-06-10 00:07:54'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1243,
    210030,
    41,
    41,
    '2026-06-06 03:07:54',
    'absent',
    '2026-06-10 00:07:54',
    '2026-06-10 00:07:54'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1244,
    210030,
    41,
    41,
    '2026-06-04 03:07:55',
    'present',
    '2026-06-10 00:07:54',
    '2026-06-10 00:07:54'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1245,
    210030,
    41,
    41,
    '2026-06-02 03:07:55',
    'late',
    '2026-06-10 00:07:54',
    '2026-06-10 00:07:54'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1246,
    210030,
    41,
    41,
    '2026-05-31 03:07:55',
    'present',
    '2026-06-10 00:07:54',
    '2026-06-10 00:07:54'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1247,
    210030,
    41,
    41,
    '2026-05-29 03:07:55',
    'excused',
    '2026-06-10 00:07:54',
    '2026-06-10 00:07:54'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1248,
    210030,
    41,
    41,
    '2026-05-27 03:07:55',
    'present',
    '2026-06-10 00:07:54',
    '2026-06-10 00:07:54'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1249,
    210030,
    41,
    41,
    '2026-05-25 03:07:55',
    'absent',
    '2026-06-10 00:07:54',
    '2026-06-10 00:07:54'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1250,
    210030,
    41,
    41,
    '2026-05-23 03:07:55',
    'present',
    '2026-06-10 00:07:55',
    '2026-06-10 00:07:55'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1251,
    210030,
    41,
    41,
    '2026-05-21 03:07:55',
    'present',
    '2026-06-10 00:07:55',
    '2026-06-10 00:07:55'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1252,
    210030,
    41,
    41,
    '2026-05-19 03:07:55',
    'absent',
    '2026-06-10 00:07:55',
    '2026-06-10 00:07:55'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1253,
    210030,
    41,
    41,
    '2026-05-17 03:07:55',
    'present',
    '2026-06-10 00:07:55',
    '2026-06-10 00:07:55'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1254,
    210030,
    41,
    41,
    '2026-05-15 03:07:56',
    'late',
    '2026-06-10 00:07:55',
    '2026-06-10 00:07:55'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1255,
    210030,
    41,
    41,
    '2026-05-13 03:07:56',
    'present',
    '2026-06-10 00:07:55',
    '2026-06-10 00:07:55'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1256,
    210030,
    41,
    41,
    '2026-05-11 03:07:56',
    'excused',
    '2026-06-10 00:07:55',
    '2026-06-10 00:07:55'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1257,
    210030,
    41,
    41,
    '2026-05-09 03:07:56',
    'present',
    '2026-06-10 00:07:55',
    '2026-06-10 00:07:55'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1258,
    210030,
    41,
    41,
    '2026-05-07 03:07:56',
    'absent',
    '2026-06-10 00:07:55',
    '2026-06-10 00:07:55'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1259,
    210030,
    41,
    41,
    '2026-05-05 03:07:56',
    'present',
    '2026-06-10 00:07:56',
    '2026-06-10 00:07:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1260,
    210030,
    41,
    41,
    '2026-05-03 03:07:56',
    'present',
    '2026-06-10 00:07:56',
    '2026-06-10 00:07:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1261,
    210030,
    42,
    42,
    '2026-06-10 03:07:56',
    'present',
    '2026-06-10 00:07:56',
    '2026-06-10 00:07:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1262,
    210030,
    42,
    42,
    '2026-06-08 03:07:56',
    'present',
    '2026-06-10 00:07:56',
    '2026-06-10 00:07:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1263,
    210030,
    42,
    42,
    '2026-06-06 03:07:56',
    'absent',
    '2026-06-10 00:07:56',
    '2026-06-10 00:07:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1264,
    210030,
    42,
    42,
    '2026-06-04 03:07:56',
    'present',
    '2026-06-10 00:07:56',
    '2026-06-10 00:07:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1265,
    210030,
    42,
    42,
    '2026-06-02 03:07:57',
    'late',
    '2026-06-10 00:07:56',
    '2026-06-10 00:07:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1266,
    210030,
    42,
    42,
    '2026-05-31 03:07:57',
    'present',
    '2026-06-10 00:07:56',
    '2026-06-10 00:07:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1267,
    210030,
    42,
    42,
    '2026-05-29 03:07:57',
    'excused',
    '2026-06-10 00:07:56',
    '2026-06-10 00:07:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1268,
    210030,
    42,
    42,
    '2026-05-27 03:07:57',
    'present',
    '2026-06-10 00:07:56',
    '2026-06-10 00:07:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1269,
    210030,
    42,
    42,
    '2026-05-25 03:07:57',
    'absent',
    '2026-06-10 00:07:56',
    '2026-06-10 00:07:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1270,
    210030,
    42,
    42,
    '2026-05-23 03:07:57',
    'present',
    '2026-06-10 00:07:56',
    '2026-06-10 00:07:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1271,
    210030,
    42,
    42,
    '2026-05-21 03:07:57',
    'present',
    '2026-06-10 00:07:56',
    '2026-06-10 00:07:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1272,
    210030,
    42,
    42,
    '2026-05-19 03:07:57',
    'absent',
    '2026-06-10 00:07:56',
    '2026-06-10 00:07:56'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1273,
    210030,
    42,
    42,
    '2026-05-17 03:07:57',
    'present',
    '2026-06-10 00:07:57',
    '2026-06-10 00:07:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1274,
    210030,
    42,
    42,
    '2026-05-15 03:07:57',
    'late',
    '2026-06-10 00:07:57',
    '2026-06-10 00:07:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1275,
    210030,
    42,
    42,
    '2026-05-13 03:07:57',
    'present',
    '2026-06-10 00:07:57',
    '2026-06-10 00:07:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1276,
    210030,
    42,
    42,
    '2026-05-11 03:07:57',
    'excused',
    '2026-06-10 00:07:57',
    '2026-06-10 00:07:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1277,
    210030,
    42,
    42,
    '2026-05-09 03:07:57',
    'present',
    '2026-06-10 00:07:57',
    '2026-06-10 00:07:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1278,
    210030,
    42,
    42,
    '2026-05-07 03:07:57',
    'absent',
    '2026-06-10 00:07:57',
    '2026-06-10 00:07:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1279,
    210030,
    42,
    42,
    '2026-05-05 03:07:58',
    'present',
    '2026-06-10 00:07:57',
    '2026-06-10 00:07:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1280,
    210030,
    42,
    42,
    '2026-05-03 03:07:58',
    'present',
    '2026-06-10 00:07:57',
    '2026-06-10 00:07:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1281,
    210030,
    43,
    43,
    '2026-06-10 03:07:58',
    'present',
    '2026-06-10 00:07:57',
    '2026-06-10 00:07:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1282,
    210030,
    43,
    43,
    '2026-06-08 03:07:58',
    'present',
    '2026-06-10 00:07:57',
    '2026-06-10 00:07:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1283,
    210030,
    43,
    43,
    '2026-06-06 03:07:58',
    'absent',
    '2026-06-10 00:07:57',
    '2026-06-10 00:07:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1284,
    210030,
    43,
    43,
    '2026-06-04 03:07:58',
    'present',
    '2026-06-10 00:07:57',
    '2026-06-10 00:07:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1285,
    210030,
    43,
    43,
    '2026-06-02 03:07:58',
    'late',
    '2026-06-10 00:07:57',
    '2026-06-10 00:07:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1286,
    210030,
    43,
    43,
    '2026-05-31 03:07:58',
    'present',
    '2026-06-10 00:07:57',
    '2026-06-10 00:07:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1287,
    210030,
    43,
    43,
    '2026-05-29 03:07:58',
    'excused',
    '2026-06-10 00:07:57',
    '2026-06-10 00:07:57'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1288,
    210030,
    43,
    43,
    '2026-05-27 03:07:58',
    'present',
    '2026-06-10 00:07:58',
    '2026-06-10 00:07:58'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1289,
    210030,
    43,
    43,
    '2026-05-25 03:07:58',
    'absent',
    '2026-06-10 00:07:58',
    '2026-06-10 00:07:58'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1290,
    210030,
    43,
    43,
    '2026-05-23 03:07:58',
    'present',
    '2026-06-10 00:07:58',
    '2026-06-10 00:07:58'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1291,
    210030,
    43,
    43,
    '2026-05-21 03:07:58',
    'present',
    '2026-06-10 00:07:58',
    '2026-06-10 00:07:58'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1292,
    210030,
    43,
    43,
    '2026-05-19 03:07:59',
    'absent',
    '2026-06-10 00:07:58',
    '2026-06-10 00:07:58'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1293,
    210030,
    43,
    43,
    '2026-05-17 03:07:59',
    'present',
    '2026-06-10 00:07:58',
    '2026-06-10 00:07:58'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1294,
    210030,
    43,
    43,
    '2026-05-15 03:07:59',
    'late',
    '2026-06-10 00:07:58',
    '2026-06-10 00:07:58'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1295,
    210030,
    43,
    43,
    '2026-05-13 03:07:59',
    'present',
    '2026-06-10 00:07:58',
    '2026-06-10 00:07:58'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1296,
    210030,
    43,
    43,
    '2026-05-11 03:07:59',
    'excused',
    '2026-06-10 00:07:58',
    '2026-06-10 00:07:58'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1297,
    210030,
    43,
    43,
    '2026-05-09 03:07:59',
    'present',
    '2026-06-10 00:07:58',
    '2026-06-10 00:07:58'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1298,
    210030,
    43,
    43,
    '2026-05-07 03:07:59',
    'absent',
    '2026-06-10 00:07:59',
    '2026-06-10 00:07:59'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1299,
    210030,
    43,
    43,
    '2026-05-05 03:07:59',
    'present',
    '2026-06-10 00:07:59',
    '2026-06-10 00:07:59'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1300,
    210030,
    43,
    43,
    '2026-05-03 03:07:59',
    'present',
    '2026-06-10 00:07:59',
    '2026-06-10 00:07:59'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1301,
    210030,
    44,
    44,
    '2026-06-10 03:07:59',
    'present',
    '2026-06-10 00:07:59',
    '2026-06-10 00:07:59'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1302,
    210030,
    44,
    44,
    '2026-06-08 03:08:00',
    'present',
    '2026-06-10 00:07:59',
    '2026-06-10 00:07:59'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1303,
    210030,
    44,
    44,
    '2026-06-06 03:08:00',
    'absent',
    '2026-06-10 00:07:59',
    '2026-06-10 00:07:59'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1304,
    210030,
    44,
    44,
    '2026-06-04 03:08:00',
    'present',
    '2026-06-10 00:07:59',
    '2026-06-10 00:07:59'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1305,
    210030,
    44,
    44,
    '2026-06-02 03:08:00',
    'late',
    '2026-06-10 00:07:59',
    '2026-06-10 00:07:59'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1306,
    210030,
    44,
    44,
    '2026-05-31 03:08:00',
    'present',
    '2026-06-10 00:07:59',
    '2026-06-10 00:07:59'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1307,
    210030,
    44,
    44,
    '2026-05-29 03:08:00',
    'excused',
    '2026-06-10 00:08:00',
    '2026-06-10 00:08:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1308,
    210030,
    44,
    44,
    '2026-05-27 03:08:00',
    'present',
    '2026-06-10 00:08:00',
    '2026-06-10 00:08:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1309,
    210030,
    44,
    44,
    '2026-05-25 03:08:00',
    'absent',
    '2026-06-10 00:08:00',
    '2026-06-10 00:08:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1310,
    210030,
    44,
    44,
    '2026-05-23 03:08:00',
    'present',
    '2026-06-10 00:08:00',
    '2026-06-10 00:08:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1311,
    210030,
    44,
    44,
    '2026-05-21 03:08:01',
    'present',
    '2026-06-10 00:08:00',
    '2026-06-10 00:08:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1312,
    210030,
    44,
    44,
    '2026-05-19 03:08:01',
    'absent',
    '2026-06-10 00:08:00',
    '2026-06-10 00:08:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1313,
    210030,
    44,
    44,
    '2026-05-17 03:08:01',
    'present',
    '2026-06-10 00:08:00',
    '2026-06-10 00:08:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1314,
    210030,
    44,
    44,
    '2026-05-15 03:08:01',
    'late',
    '2026-06-10 00:08:00',
    '2026-06-10 00:08:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1315,
    210030,
    44,
    44,
    '2026-05-13 03:08:01',
    'present',
    '2026-06-10 00:08:00',
    '2026-06-10 00:08:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1316,
    210030,
    44,
    44,
    '2026-05-11 03:08:01',
    'excused',
    '2026-06-10 00:08:00',
    '2026-06-10 00:08:00'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1317,
    210030,
    44,
    44,
    '2026-05-09 03:08:01',
    'present',
    '2026-06-10 00:08:01',
    '2026-06-10 00:08:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1318,
    210030,
    44,
    44,
    '2026-05-07 03:08:01',
    'absent',
    '2026-06-10 00:08:01',
    '2026-06-10 00:08:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1319,
    210030,
    44,
    44,
    '2026-05-05 03:08:01',
    'present',
    '2026-06-10 00:08:01',
    '2026-06-10 00:08:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1320,
    210030,
    44,
    44,
    '2026-05-03 03:08:01',
    'present',
    '2026-06-10 00:08:01',
    '2026-06-10 00:08:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1321,
    210030,
    45,
    45,
    '2026-06-10 03:08:02',
    'present',
    '2026-06-10 00:08:01',
    '2026-06-10 00:08:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1322,
    210030,
    45,
    45,
    '2026-06-08 03:08:02',
    'present',
    '2026-06-10 00:08:01',
    '2026-06-10 00:08:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1323,
    210030,
    45,
    45,
    '2026-06-06 03:08:02',
    'absent',
    '2026-06-10 00:08:01',
    '2026-06-10 00:08:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1324,
    210030,
    45,
    45,
    '2026-06-04 03:08:02',
    'present',
    '2026-06-10 00:08:01',
    '2026-06-10 00:08:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1325,
    210030,
    45,
    45,
    '2026-06-02 03:08:02',
    'late',
    '2026-06-10 00:08:01',
    '2026-06-10 00:08:01'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1326,
    210030,
    45,
    45,
    '2026-05-31 03:08:02',
    'present',
    '2026-06-10 00:08:02',
    '2026-06-10 00:08:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1327,
    210030,
    45,
    45,
    '2026-05-29 03:08:02',
    'excused',
    '2026-06-10 00:08:02',
    '2026-06-10 00:08:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1328,
    210030,
    45,
    45,
    '2026-05-27 03:08:02',
    'present',
    '2026-06-10 00:08:02',
    '2026-06-10 00:08:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1329,
    210030,
    45,
    45,
    '2026-05-25 03:08:02',
    'absent',
    '2026-06-10 00:08:02',
    '2026-06-10 00:08:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1330,
    210030,
    45,
    45,
    '2026-05-23 03:08:02',
    'present',
    '2026-06-10 00:08:02',
    '2026-06-10 00:08:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1331,
    210030,
    45,
    45,
    '2026-05-21 03:08:03',
    'present',
    '2026-06-10 00:08:02',
    '2026-06-10 00:08:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1332,
    210030,
    45,
    45,
    '2026-05-19 03:08:03',
    'absent',
    '2026-06-10 00:08:02',
    '2026-06-10 00:08:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1333,
    210030,
    45,
    45,
    '2026-05-17 03:08:03',
    'present',
    '2026-06-10 00:08:02',
    '2026-06-10 00:08:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1334,
    210030,
    45,
    45,
    '2026-05-15 03:08:03',
    'late',
    '2026-06-10 00:08:02',
    '2026-06-10 00:08:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1335,
    210030,
    45,
    45,
    '2026-05-13 03:08:03',
    'present',
    '2026-06-10 00:08:02',
    '2026-06-10 00:08:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1336,
    210030,
    45,
    45,
    '2026-05-11 03:08:03',
    'excused',
    '2026-06-10 00:08:02',
    '2026-06-10 00:08:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1337,
    210030,
    45,
    45,
    '2026-05-09 03:08:03',
    'present',
    '2026-06-10 00:08:02',
    '2026-06-10 00:08:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1338,
    210030,
    45,
    45,
    '2026-05-07 03:08:03',
    'absent',
    '2026-06-10 00:08:02',
    '2026-06-10 00:08:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1339,
    210030,
    45,
    45,
    '2026-05-05 03:08:03',
    'present',
    '2026-06-10 00:08:02',
    '2026-06-10 00:08:02'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1340,
    210030,
    45,
    45,
    '2026-05-03 03:08:03',
    'present',
    '2026-06-10 00:08:03',
    '2026-06-10 00:08:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1341,
    210030,
    46,
    46,
    '2026-06-10 03:08:03',
    'present',
    '2026-06-10 00:08:03',
    '2026-06-10 00:08:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1342,
    210030,
    46,
    46,
    '2026-06-08 03:08:03',
    'present',
    '2026-06-10 00:08:03',
    '2026-06-10 00:08:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1343,
    210030,
    46,
    46,
    '2026-06-06 03:08:03',
    'absent',
    '2026-06-10 00:08:03',
    '2026-06-10 00:08:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1344,
    210030,
    46,
    46,
    '2026-06-04 03:08:03',
    'present',
    '2026-06-10 00:08:03',
    '2026-06-10 00:08:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1345,
    210030,
    46,
    46,
    '2026-06-02 03:08:03',
    'late',
    '2026-06-10 00:08:03',
    '2026-06-10 00:08:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1346,
    210030,
    46,
    46,
    '2026-05-31 03:08:04',
    'present',
    '2026-06-10 00:08:03',
    '2026-06-10 00:08:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1347,
    210030,
    46,
    46,
    '2026-05-29 03:08:04',
    'excused',
    '2026-06-10 00:08:03',
    '2026-06-10 00:08:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1348,
    210030,
    46,
    46,
    '2026-05-27 03:08:04',
    'present',
    '2026-06-10 00:08:03',
    '2026-06-10 00:08:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1349,
    210030,
    46,
    46,
    '2026-05-25 03:08:04',
    'absent',
    '2026-06-10 00:08:03',
    '2026-06-10 00:08:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1350,
    210030,
    46,
    46,
    '2026-05-23 03:08:04',
    'present',
    '2026-06-10 00:08:03',
    '2026-06-10 00:08:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1351,
    210030,
    46,
    46,
    '2026-05-21 03:08:04',
    'present',
    '2026-06-10 00:08:03',
    '2026-06-10 00:08:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1352,
    210030,
    46,
    46,
    '2026-05-19 03:08:04',
    'absent',
    '2026-06-10 00:08:03',
    '2026-06-10 00:08:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1353,
    210030,
    46,
    46,
    '2026-05-17 03:08:04',
    'present',
    '2026-06-10 00:08:03',
    '2026-06-10 00:08:03'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1354,
    210030,
    46,
    46,
    '2026-05-15 03:08:04',
    'late',
    '2026-06-10 00:08:04',
    '2026-06-10 00:08:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1355,
    210030,
    46,
    46,
    '2026-05-13 03:08:04',
    'present',
    '2026-06-10 00:08:04',
    '2026-06-10 00:08:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1356,
    210030,
    46,
    46,
    '2026-05-11 03:08:04',
    'excused',
    '2026-06-10 00:08:04',
    '2026-06-10 00:08:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1357,
    210030,
    46,
    46,
    '2026-05-09 03:08:04',
    'present',
    '2026-06-10 00:08:04',
    '2026-06-10 00:08:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1358,
    210030,
    46,
    46,
    '2026-05-07 03:08:04',
    'absent',
    '2026-06-10 00:08:04',
    '2026-06-10 00:08:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1359,
    210030,
    46,
    46,
    '2026-05-05 03:08:05',
    'present',
    '2026-06-10 00:08:04',
    '2026-06-10 00:08:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1360,
    210030,
    46,
    46,
    '2026-05-03 03:08:05',
    'present',
    '2026-06-10 00:08:04',
    '2026-06-10 00:08:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1361,
    210030,
    47,
    47,
    '2026-06-10 03:08:05',
    'present',
    '2026-06-10 00:08:04',
    '2026-06-10 00:08:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1362,
    210030,
    47,
    47,
    '2026-06-08 03:08:05',
    'present',
    '2026-06-10 00:08:04',
    '2026-06-10 00:08:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1363,
    210030,
    47,
    47,
    '2026-06-06 03:08:05',
    'absent',
    '2026-06-10 00:08:04',
    '2026-06-10 00:08:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1364,
    210030,
    47,
    47,
    '2026-06-04 03:08:05',
    'present',
    '2026-06-10 00:08:04',
    '2026-06-10 00:08:04'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1365,
    210030,
    47,
    47,
    '2026-06-02 03:08:05',
    'late',
    '2026-06-10 00:08:05',
    '2026-06-10 00:08:05'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1366,
    210030,
    47,
    47,
    '2026-05-31 03:08:05',
    'present',
    '2026-06-10 00:08:05',
    '2026-06-10 00:08:05'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1367,
    210030,
    47,
    47,
    '2026-05-29 03:08:05',
    'excused',
    '2026-06-10 00:08:05',
    '2026-06-10 00:08:05'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1368,
    210030,
    47,
    47,
    '2026-05-27 03:08:05',
    'present',
    '2026-06-10 00:08:05',
    '2026-06-10 00:08:05'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1369,
    210030,
    47,
    47,
    '2026-05-25 03:08:05',
    'absent',
    '2026-06-10 00:08:05',
    '2026-06-10 00:08:05'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1370,
    210030,
    47,
    47,
    '2026-05-23 03:08:06',
    'present',
    '2026-06-10 00:08:05',
    '2026-06-10 00:08:05'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1371,
    210030,
    47,
    47,
    '2026-05-21 03:08:06',
    'present',
    '2026-06-10 00:08:05',
    '2026-06-10 00:08:05'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1372,
    210030,
    47,
    47,
    '2026-05-19 03:08:06',
    'absent',
    '2026-06-10 00:08:05',
    '2026-06-10 00:08:05'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1373,
    210030,
    47,
    47,
    '2026-05-17 03:08:06',
    'present',
    '2026-06-10 00:08:05',
    '2026-06-10 00:08:05'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1374,
    210030,
    47,
    47,
    '2026-05-15 03:08:06',
    'late',
    '2026-06-10 00:08:05',
    '2026-06-10 00:08:05'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1375,
    210030,
    47,
    47,
    '2026-05-13 03:08:06',
    'present',
    '2026-06-10 00:08:06',
    '2026-06-10 00:08:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1376,
    210030,
    47,
    47,
    '2026-05-11 03:08:06',
    'excused',
    '2026-06-10 00:08:06',
    '2026-06-10 00:08:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1377,
    210030,
    47,
    47,
    '2026-05-09 03:08:06',
    'present',
    '2026-06-10 00:08:06',
    '2026-06-10 00:08:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1378,
    210030,
    47,
    47,
    '2026-05-07 03:08:06',
    'absent',
    '2026-06-10 00:08:06',
    '2026-06-10 00:08:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1379,
    210030,
    47,
    47,
    '2026-05-05 03:08:06',
    'present',
    '2026-06-10 00:08:06',
    '2026-06-10 00:08:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1380,
    210030,
    47,
    47,
    '2026-05-03 03:08:07',
    'present',
    '2026-06-10 00:08:06',
    '2026-06-10 00:08:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1381,
    210030,
    48,
    48,
    '2026-06-10 03:08:07',
    'present',
    '2026-06-10 00:08:06',
    '2026-06-10 00:08:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1382,
    210030,
    48,
    48,
    '2026-06-08 03:08:07',
    'present',
    '2026-06-10 00:08:06',
    '2026-06-10 00:08:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1383,
    210030,
    48,
    48,
    '2026-06-06 03:08:07',
    'absent',
    '2026-06-10 00:08:06',
    '2026-06-10 00:08:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1384,
    210030,
    48,
    48,
    '2026-06-04 03:08:07',
    'present',
    '2026-06-10 00:08:06',
    '2026-06-10 00:08:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1385,
    210030,
    48,
    48,
    '2026-06-02 03:08:07',
    'late',
    '2026-06-10 00:08:06',
    '2026-06-10 00:08:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1386,
    210030,
    48,
    48,
    '2026-05-31 03:08:07',
    'present',
    '2026-06-10 00:08:06',
    '2026-06-10 00:08:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1387,
    210030,
    48,
    48,
    '2026-05-29 03:08:07',
    'excused',
    '2026-06-10 00:08:06',
    '2026-06-10 00:08:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1388,
    210030,
    48,
    48,
    '2026-05-27 03:08:07',
    'present',
    '2026-06-10 00:08:06',
    '2026-06-10 00:08:06'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1389,
    210030,
    48,
    48,
    '2026-05-25 03:08:07',
    'absent',
    '2026-06-10 00:08:07',
    '2026-06-10 00:08:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1390,
    210030,
    48,
    48,
    '2026-05-23 03:08:07',
    'present',
    '2026-06-10 00:08:07',
    '2026-06-10 00:08:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1391,
    210030,
    48,
    48,
    '2026-05-21 03:08:07',
    'present',
    '2026-06-10 00:08:07',
    '2026-06-10 00:08:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1392,
    210030,
    48,
    48,
    '2026-05-19 03:08:07',
    'absent',
    '2026-06-10 00:08:07',
    '2026-06-10 00:08:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1393,
    210030,
    48,
    48,
    '2026-05-17 03:08:07',
    'present',
    '2026-06-10 00:08:07',
    '2026-06-10 00:08:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1394,
    210030,
    48,
    48,
    '2026-05-15 03:08:07',
    'late',
    '2026-06-10 00:08:07',
    '2026-06-10 00:08:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1395,
    210030,
    48,
    48,
    '2026-05-13 03:08:08',
    'present',
    '2026-06-10 00:08:07',
    '2026-06-10 00:08:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1396,
    210030,
    48,
    48,
    '2026-05-11 03:08:08',
    'excused',
    '2026-06-10 00:08:07',
    '2026-06-10 00:08:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1397,
    210030,
    48,
    48,
    '2026-05-09 03:08:08',
    'present',
    '2026-06-10 00:08:07',
    '2026-06-10 00:08:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1398,
    210030,
    48,
    48,
    '2026-05-07 03:08:08',
    'absent',
    '2026-06-10 00:08:07',
    '2026-06-10 00:08:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1399,
    210030,
    48,
    48,
    '2026-05-05 03:08:08',
    'present',
    '2026-06-10 00:08:07',
    '2026-06-10 00:08:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1400,
    210030,
    48,
    48,
    '2026-05-03 03:08:08',
    'present',
    '2026-06-10 00:08:07',
    '2026-06-10 00:08:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1401,
    210030,
    49,
    49,
    '2026-06-10 03:08:08',
    'present',
    '2026-06-10 00:08:07',
    '2026-06-10 00:08:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1402,
    210030,
    49,
    49,
    '2026-06-08 03:08:08',
    'present',
    '2026-06-10 00:08:07',
    '2026-06-10 00:08:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1403,
    210030,
    49,
    49,
    '2026-06-06 03:08:08',
    'absent',
    '2026-06-10 00:08:07',
    '2026-06-10 00:08:07'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1404,
    210030,
    49,
    49,
    '2026-06-04 03:08:08',
    'present',
    '2026-06-10 00:08:08',
    '2026-06-10 00:08:08'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1405,
    210030,
    49,
    49,
    '2026-06-02 03:08:08',
    'late',
    '2026-06-10 00:08:08',
    '2026-06-10 00:08:08'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1406,
    210030,
    49,
    49,
    '2026-05-31 03:08:08',
    'present',
    '2026-06-10 00:08:08',
    '2026-06-10 00:08:08'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1407,
    210030,
    49,
    49,
    '2026-05-29 03:08:08',
    'excused',
    '2026-06-10 00:08:08',
    '2026-06-10 00:08:08'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1408,
    210030,
    49,
    49,
    '2026-05-27 03:08:08',
    'present',
    '2026-06-10 00:08:08',
    '2026-06-10 00:08:08'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1409,
    210030,
    49,
    49,
    '2026-05-25 03:08:09',
    'absent',
    '2026-06-10 00:08:08',
    '2026-06-10 00:08:08'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1410,
    210030,
    49,
    49,
    '2026-05-23 03:08:09',
    'present',
    '2026-06-10 00:08:08',
    '2026-06-10 00:08:08'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1411,
    210030,
    49,
    49,
    '2026-05-21 03:08:09',
    'present',
    '2026-06-10 00:08:08',
    '2026-06-10 00:08:08'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1412,
    210030,
    49,
    49,
    '2026-05-19 03:08:09',
    'absent',
    '2026-06-10 00:08:09',
    '2026-06-10 00:08:09'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1413,
    210030,
    49,
    49,
    '2026-05-17 03:08:09',
    'present',
    '2026-06-10 00:08:09',
    '2026-06-10 00:08:09'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1414,
    210030,
    49,
    49,
    '2026-05-15 03:08:09',
    'late',
    '2026-06-10 00:08:09',
    '2026-06-10 00:08:09'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1415,
    210030,
    49,
    49,
    '2026-05-13 03:08:09',
    'present',
    '2026-06-10 00:08:09',
    '2026-06-10 00:08:09'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1416,
    210030,
    49,
    49,
    '2026-05-11 03:08:10',
    'excused',
    '2026-06-10 00:08:09',
    '2026-06-10 00:08:09'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1417,
    210030,
    49,
    49,
    '2026-05-09 03:08:10',
    'present',
    '2026-06-10 00:08:10',
    '2026-06-10 00:08:10'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1418,
    210030,
    49,
    49,
    '2026-05-07 03:08:10',
    'absent',
    '2026-06-10 00:08:10',
    '2026-06-10 00:08:10'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1419,
    210030,
    49,
    49,
    '2026-05-05 03:08:10',
    'present',
    '2026-06-10 00:08:10',
    '2026-06-10 00:08:10'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1420,
    210030,
    49,
    49,
    '2026-05-03 03:08:10',
    'present',
    '2026-06-10 00:08:10',
    '2026-06-10 00:08:10'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1421,
    210030,
    50,
    50,
    '2026-06-10 03:08:11',
    'present',
    '2026-06-10 00:08:10',
    '2026-06-10 00:08:10'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1422,
    210030,
    50,
    50,
    '2026-06-08 03:08:11',
    'present',
    '2026-06-10 00:08:10',
    '2026-06-10 00:08:10'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1423,
    210030,
    50,
    50,
    '2026-06-06 03:08:11',
    'absent',
    '2026-06-10 00:08:10',
    '2026-06-10 00:08:10'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1424,
    210030,
    50,
    50,
    '2026-06-04 03:08:11',
    'present',
    '2026-06-10 00:08:10',
    '2026-06-10 00:08:10'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1425,
    210030,
    50,
    50,
    '2026-06-02 03:08:11',
    'late',
    '2026-06-10 00:08:10',
    '2026-06-10 00:08:10'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1426,
    210030,
    50,
    50,
    '2026-05-31 03:08:11',
    'present',
    '2026-06-10 00:08:10',
    '2026-06-10 00:08:10'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1427,
    210030,
    50,
    50,
    '2026-05-29 03:08:11',
    'excused',
    '2026-06-10 00:08:11',
    '2026-06-10 00:08:11'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1428,
    210030,
    50,
    50,
    '2026-05-27 03:08:11',
    'present',
    '2026-06-10 00:08:11',
    '2026-06-10 00:08:11'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1429,
    210030,
    50,
    50,
    '2026-05-25 03:08:11',
    'absent',
    '2026-06-10 00:08:11',
    '2026-06-10 00:08:11'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1430,
    210030,
    50,
    50,
    '2026-05-23 03:08:11',
    'present',
    '2026-06-10 00:08:11',
    '2026-06-10 00:08:11'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1431,
    210030,
    50,
    50,
    '2026-05-21 03:08:12',
    'present',
    '2026-06-10 00:08:11',
    '2026-06-10 00:08:11'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1432,
    210030,
    50,
    50,
    '2026-05-19 03:08:12',
    'absent',
    '2026-06-10 00:08:11',
    '2026-06-10 00:08:11'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1433,
    210030,
    50,
    50,
    '2026-05-17 03:08:12',
    'present',
    '2026-06-10 00:08:11',
    '2026-06-10 00:08:11'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1434,
    210030,
    50,
    50,
    '2026-05-15 03:08:12',
    'late',
    '2026-06-10 00:08:11',
    '2026-06-10 00:08:11'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1435,
    210030,
    50,
    50,
    '2026-05-13 03:08:12',
    'present',
    '2026-06-10 00:08:12',
    '2026-06-10 00:08:12'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1436,
    210030,
    50,
    50,
    '2026-05-11 03:08:12',
    'excused',
    '2026-06-10 00:08:12',
    '2026-06-10 00:08:12'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1437,
    210030,
    50,
    50,
    '2026-05-09 03:08:12',
    'present',
    '2026-06-10 00:08:12',
    '2026-06-10 00:08:12'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1438,
    210030,
    50,
    50,
    '2026-05-07 03:08:12',
    'absent',
    '2026-06-10 00:08:12',
    '2026-06-10 00:08:12'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1439,
    210030,
    50,
    50,
    '2026-05-05 03:08:13',
    'present',
    '2026-06-10 00:08:12',
    '2026-06-10 00:08:12'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1440,
    210030,
    50,
    50,
    '2026-05-03 03:08:13',
    'present',
    '2026-06-10 00:08:12',
    '2026-06-10 00:08:12'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1441,
    210031,
    33,
    33,
    '2026-06-10 03:08:13',
    'present',
    '2026-06-10 00:08:12',
    '2026-06-10 00:08:12'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1442,
    210031,
    33,
    33,
    '2026-06-08 03:08:13',
    'present',
    '2026-06-10 00:08:12',
    '2026-06-10 00:08:12'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1443,
    210031,
    33,
    33,
    '2026-06-06 03:08:13',
    'present',
    '2026-06-10 00:08:12',
    '2026-06-10 00:08:12'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1444,
    210031,
    33,
    33,
    '2026-06-04 03:08:13',
    'present',
    '2026-06-10 00:08:13',
    '2026-06-10 00:08:13'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1445,
    210031,
    33,
    33,
    '2026-06-02 03:08:13',
    'excused',
    '2026-06-10 00:08:13',
    '2026-06-10 00:08:13'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1446,
    210031,
    33,
    33,
    '2026-05-31 03:08:13',
    'present',
    '2026-06-10 00:08:13',
    '2026-06-10 00:08:13'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1447,
    210031,
    33,
    33,
    '2026-05-29 03:08:13',
    'present',
    '2026-06-10 00:08:13',
    '2026-06-10 00:08:13'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1448,
    210031,
    33,
    33,
    '2026-05-27 03:08:14',
    'late',
    '2026-06-10 00:08:13',
    '2026-06-10 00:08:13'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1449,
    210031,
    33,
    33,
    '2026-05-25 03:08:14',
    'present',
    '2026-06-10 00:08:13',
    '2026-06-10 00:08:13'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1450,
    210031,
    33,
    33,
    '2026-05-23 03:08:14',
    'present',
    '2026-06-10 00:08:13',
    '2026-06-10 00:08:13'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1451,
    210031,
    33,
    33,
    '2026-05-21 03:08:14',
    'present',
    '2026-06-10 00:08:13',
    '2026-06-10 00:08:13'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1452,
    210031,
    33,
    33,
    '2026-05-19 03:08:14',
    'present',
    '2026-06-10 00:08:13',
    '2026-06-10 00:08:13'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1453,
    210031,
    33,
    33,
    '2026-05-17 03:08:14',
    'excused',
    '2026-06-10 00:08:14',
    '2026-06-10 00:08:14'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1454,
    210031,
    33,
    33,
    '2026-05-15 03:08:14',
    'present',
    '2026-06-10 00:08:14',
    '2026-06-10 00:08:14'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1455,
    210031,
    33,
    33,
    '2026-05-13 03:08:14',
    'present',
    '2026-06-10 00:08:14',
    '2026-06-10 00:08:14'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1456,
    210031,
    33,
    33,
    '2026-05-11 03:08:14',
    'late',
    '2026-06-10 00:08:14',
    '2026-06-10 00:08:14'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1457,
    210031,
    33,
    33,
    '2026-05-09 03:08:14',
    'present',
    '2026-06-10 00:08:14',
    '2026-06-10 00:08:14'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1458,
    210031,
    33,
    33,
    '2026-05-07 03:08:15',
    'present',
    '2026-06-10 00:08:14',
    '2026-06-10 00:08:14'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1459,
    210031,
    33,
    33,
    '2026-05-05 03:08:15',
    'present',
    '2026-06-10 00:08:14',
    '2026-06-10 00:08:14'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1460,
    210031,
    33,
    33,
    '2026-05-03 03:08:15',
    'present',
    '2026-06-10 00:08:14',
    '2026-06-10 00:08:14'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1461,
    210031,
    34,
    34,
    '2026-06-10 03:08:15',
    'present',
    '2026-06-10 00:08:14',
    '2026-06-10 00:08:14'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1462,
    210031,
    34,
    34,
    '2026-06-08 03:08:15',
    'present',
    '2026-06-10 00:08:14',
    '2026-06-10 00:08:14'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30001,
    240002,
    33,
    1,
    '2026-06-10 00:32:33',
    'present',
    '2026-06-10 00:32:33',
    '2026-06-10 00:32:33'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30004,
    240002,
    33,
    1,
    '2026-06-09 00:32:33',
    'present',
    '2026-06-10 00:32:33',
    '2026-06-10 00:32:33'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30007,
    240002,
    33,
    1,
    '2026-06-08 00:32:33',
    'absent',
    '2026-06-10 00:32:33',
    '2026-06-10 00:32:33'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30010,
    240002,
    33,
    1,
    '2026-06-07 00:32:33',
    'present',
    '2026-06-10 00:32:33',
    '2026-06-10 00:32:33'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30013,
    240002,
    33,
    1,
    '2026-06-06 00:32:33',
    'late',
    '2026-06-10 00:32:33',
    '2026-06-10 00:32:33'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30016,
    240002,
    33,
    1,
    '2026-06-05 00:32:33',
    'absent',
    '2026-06-10 00:32:33',
    '2026-06-10 00:32:33'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30019,
    240002,
    33,
    1,
    '2026-06-04 00:32:33',
    'present',
    '2026-06-10 00:32:33',
    '2026-06-10 00:32:33'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30022,
    240002,
    33,
    1,
    '2026-06-03 00:32:33',
    'excused',
    '2026-06-10 00:32:33',
    '2026-06-10 00:32:33'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30025,
    240002,
    33,
    1,
    '2026-06-02 00:32:33',
    'present',
    '2026-06-10 00:32:34',
    '2026-06-10 00:32:34'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30028,
    240002,
    34,
    1,
    '2026-06-01 00:32:33',
    'absent',
    '2026-06-10 00:32:34',
    '2026-06-10 00:32:34'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30031,
    240002,
    33,
    1,
    '2026-05-31 00:32:33',
    'present',
    '2026-06-10 00:32:34',
    '2026-06-10 00:32:34'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30034,
    240002,
    34,
    1,
    '2026-05-30 00:32:33',
    'late',
    '2026-06-10 00:32:34',
    '2026-06-10 00:32:34'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30037,
    240002,
    34,
    1,
    '2026-05-29 00:32:33',
    'present',
    '2026-06-10 00:32:34',
    '2026-06-10 00:32:34'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30040,
    240002,
    33,
    1,
    '2026-05-28 00:32:33',
    'absent',
    '2026-06-10 00:32:34',
    '2026-06-10 00:32:34'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30043,
    240002,
    34,
    1,
    '2026-05-27 00:32:33',
    'present',
    '2026-06-10 00:32:34',
    '2026-06-10 00:32:34'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30046,
    240002,
    33,
    1,
    '2026-05-26 00:32:33',
    'present',
    '2026-06-10 00:32:34',
    '2026-06-10 00:32:34'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30049,
    240002,
    33,
    1,
    '2026-05-25 00:32:33',
    'absent',
    '2026-06-10 00:32:34',
    '2026-06-10 00:32:34'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30052,
    240002,
    33,
    1,
    '2026-05-24 00:32:33',
    'present',
    '2026-06-10 00:32:35',
    '2026-06-10 00:32:35'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30055,
    240002,
    33,
    1,
    '2026-05-23 00:32:33',
    'late',
    '2026-06-10 00:32:35',
    '2026-06-10 00:32:35'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30058,
    240002,
    33,
    1,
    '2026-05-22 00:32:33',
    'present',
    '2026-06-10 00:32:35',
    '2026-06-10 00:32:35'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30061,
    240002,
    34,
    1,
    '2026-05-21 00:32:33',
    'present',
    '2026-06-10 00:32:35',
    '2026-06-10 00:32:35'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30064,
    240002,
    34,
    1,
    '2026-05-20 00:32:33',
    'present',
    '2026-06-10 00:32:35',
    '2026-06-10 00:32:35'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30067,
    240002,
    34,
    1,
    '2026-05-19 00:32:33',
    'absent',
    '2026-06-10 00:32:35',
    '2026-06-10 00:32:35'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30070,
    240002,
    34,
    1,
    '2026-05-18 00:32:33',
    'present',
    '2026-06-10 00:32:35',
    '2026-06-10 00:32:35'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30073,
    240002,
    34,
    1,
    '2026-05-17 00:32:33',
    'late',
    '2026-06-10 00:32:35',
    '2026-06-10 00:32:35'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30076,
    240002,
    35,
    1,
    '2026-05-16 00:32:33',
    'absent',
    '2026-06-10 00:32:35',
    '2026-06-10 00:32:35'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30079,
    240002,
    33,
    1,
    '2026-05-15 00:32:33',
    'present',
    '2026-06-10 00:32:36',
    '2026-06-10 00:32:36'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30082,
    240002,
    33,
    1,
    '2026-05-14 00:32:33',
    'excused',
    '2026-06-10 00:32:36',
    '2026-06-10 00:32:36'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30085,
    240002,
    33,
    1,
    '2026-05-13 00:32:33',
    'present',
    '2026-06-10 00:32:36',
    '2026-06-10 00:32:36'
  );
INSERT INTO
  `attendance` (
    `id`,
    `studentId`,
    `courseId`,
    `scheduleId`,
    `date`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30088,
    240002,
    33,
    1,
    '2026-05-12 00:32:33',
    'absent',
    '2026-06-10 00:32:36',
    '2026-06-10 00:32:36'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: buildings
# ------------------------------------------------------------

INSERT INTO
  `buildings` (
    `id`,
    `name`,
    `nameAr`,
    `code`,
    `latitude`,
    `longitude`,
    `description`,
    `descriptionAr`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1,
    'Faculty of Science and Information Technology',
    'كلية العلوم وتكنولوجيا المعلومات',
    'FSIT',
    31.83282150,
    35.89251970,
    'Main building for the Faculty of Science and Information Technology. Contains lecture halls, computer laboratories, faculty offices, and research facilities.',
    'المبنى الرئيسي لكلية العلوم وتكنولوجيا المعلومات. يحتوي على قاعات المحاضرات والمختبرات الحاسوبية ومكاتب أعضاء هيئة التدريس والمرافق البحثية.',
    '2026-06-09 22:24:05',
    '2026-06-09 22:24:05'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: chatMessages
# ------------------------------------------------------------

INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (1, 1, 'user', 'hello ', 0, '2026-06-07 16:54:13');
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (2, 1, 'user', 'hi', 0, '2026-06-07 16:54:35');
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (3, 1, 'user', 'كيف الحال', 0, '2026-06-07 16:54:41');
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (4, 1, 'user', 'اه', 0, '2026-06-07 16:56:35');
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (5, 1, 'user', 'كيف الحال', 0, '2026-06-07 16:59:34');
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    30001,
    1,
    'user',
    'كيف الحال',
    0,
    '2026-06-07 17:06:48'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    30002,
    1,
    'user',
    'كيف الحال',
    0,
    '2026-06-07 17:07:00'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (30003, 1, 'user', 'd', 0, '2026-06-07 17:07:40');
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    30004,
    1,
    'user',
    'انا طالب ذكاء اصطناعي بالسنة الاولى والفصل الاول، ايش انزل مواد؟',
    0,
    '2026-06-07 17:12:01'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    30005,
    1,
    'user',
    'انا طالب ذكاء اصطناعي بالسنة الاولى والفصل الاول، ايش انزل مواد؟',
    0,
    '2026-06-07 17:13:50'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    30006,
    1,
    'user',
    'انا طالب ذكاء اصطناعي بالسنة الاولى والفصل الاول، ايش انزل مواد؟',
    0,
    '2026-06-07 17:14:52'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    30007,
    1,
    'user',
    'انا طالب ذكاء اصطناعي بالسنة الاولى والفصل الاول، ايش انزل مواد؟',
    0,
    '2026-06-07 17:14:57'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (30008, 1, 'user', 'd', 0, '2026-06-07 17:15:21');
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    30009,
    1,
    'user',
    'انا طالب ذكاء اصطناعي بالسنة الاولى والفصل الاول، ايش انزل مواد؟',
    0,
    '2026-06-07 17:17:12'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    30010,
    1,
    'user',
    'انا طالب ذكاء اصطناعي بالسنة الاولى والفصل الاول، ايش انزل مواد؟',
    0,
    '2026-06-07 17:17:54'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    30011,
    1,
    'user',
    'انا طالب ذكاء اصطناعي بالسنة الاولى والفصل الاول، ايش انزل مواد؟',
    0,
    '2026-06-07 17:18:21'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    30012,
    1,
    'user',
    'انا طالب ذكاء اصطناعي بالسنة الاولى والفصل الاول، ايش انزل مواد؟',
    0,
    '2026-06-07 17:29:16'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    30013,
    1,
    'assistant',
    'مرحباً بك! بناءً على خطتك للفصل الأول، قمت بتحديد المواد المطلوبة التي تتناسب مع الحد الأقصى المسموح لضمان انتظامك الدراسي دون إرباك:\n- التربية الوطنية (المتطلب السابق: لا يوجد)\n- مهارات حياتية (المتطلب السابق: لا يوجد)\n- أساسيات تكنولوجيا المعلومات (المتطلب السابق: مهارات الحاسوب الاستدراكية (متزامن))\n- اللغة الانجليزية التقنية لطلاب تكنولوجيا المعلومات (المتطلب السابق: لا يوجد)\n- الرياضيات المتقطعة (المتطلب السابق: لا يوجد)\n- أسس الرياضيات (المتطلب السابق: مهارات الحاسوب الاستدراكية (متزامن))\n\n---\n\nتم استبعاد متطلبات الجامعة الاختيارية ومادة \"الاتصال والتواصل باللغة العربية\" للالتزام بدقة بالحد الأقصى الـ 18 ساعة والتركيز على أساسيات التخصص هذه المرحلة، ويمكنك أخذ المتطلبات الأخرى في الفصول القادمة عندما تتحرر لك الساعات. هل تفضل أن أبدأ بتجهيز خطة الفصل التالي الآن، أو لديك أي استفسار حول المسارات الأكاديمية؟',
    0,
    '2026-06-07 17:30:52'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    30014,
    1,
    'user',
    'انا طالب علم حاسوب بالسنة الثانية والفصل الاول، ايش انزل مواد؟',
    0,
    '2026-06-07 17:41:44'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    30015,
    1,
    'assistant',
    'مرحباً بك! إليك خطة الفصل الأول للسنة الثانية في تخصص علم الحاسوب، مُعدة بدقة لتناسب الحد الأقصى المسموح به وتضمن استمرارية مسارك الأكاديمي:\n- مهارات حياتية (المتطلب السابق: لا يوجد)\n- البرمجة التطبيقية (المتطلب السابق: البرمجة الحاسوبية)\n- الريادة وتخطيط المشاريع (المتطلب السابق: اللغة الانجليزية التقنية لطلاب تكنولوجيا المعلومات)\n- برمجة تطبيقات الانترنت 1 (المتطلب السابق: البرمجة الحاسوبية)\n- شبكات الحاسوب (المتطلب السابق: أساسيات تكنولوجيا المعلومات)\n- نظرية الحسابات (المتطلب السابق: الرياضيات المتقطعة)\n\nتم الالتزام بالحد الأقصى القانوني للساعات والتركيز على المواد الأساسية التي تفتح أبواب الفصول القادمة. إذا رغبت باستبدال أي مادة بمتطلب جامعة اختياري، أو أردت البدء بتجهيز خطة الفصل التالي فوراً، أنا جاهز للمساعدة.',
    0,
    '2026-06-07 17:43:24'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (30016, 30003, 'user', 'Hi', 0, '2026-06-07 18:01:33');
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (30017, 30002, 'user', 'Hi', 0, '2026-06-07 18:01:33');
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (30018, 30001, 'user', 'Hi', 0, '2026-06-07 18:01:34');
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    30019,
    30002,
    'user',
    'Hello ',
    0,
    '2026-06-07 18:04:09'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    30020,
    30002,
    'assistant',
    'مرحباً! أنا مرشدك الأكاديمي. يرجى تحديد تخصصك وسنتك الدراسية لنبدأ التخطيط.',
    0,
    '2026-06-07 18:05:15'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    30021,
    30002,
    'user',
    'ذكاء اصطناعي ',
    0,
    '2026-06-07 18:05:42'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    30022,
    30002,
    'assistant',
    'مرحباً! بناءً على تخصص ذكاء الاصطناعي، إليك خطة الفصل الدراسي الأولى المقترحة بعناية لتنظيم مسارك الأكاديمي وتجنب تجاوز الحد القانوني للساعات:\n- التربية الوطنية (لا يوجد)\n- مهارات حياتية (لا يوجد)\n- الحضارة الانسانية (لا يوجد)\n- الرياضة والصحة (لا يوجد)\n- اللغة الانجليزية التقنية لطلاب تكنولوجيا المعلومات (لا يوجد)\n- الرياضيات المتقطعة (لا يوجد)\n\n---\n\nبما أن السنة والدورة الدراسية غير محددين في طلبك، يرجى تزويدي بالسنة الدارسية المستهدفة لأقوم بضبط الجدول الزمني بدقة. إذا كنت ترغب في تغيير أي من المواد الاختيارية أعلاه، فأنا أستطيع اقتراح بدائل مناسبة لجدولك الدراسي. وأي من هذه المواد تفضل أن تسجل؟ أنا هنا لدعمك لضمان إنجاز الساعات المطلوبة والتخرج في الوقت المحدد وبخطة آمنة.',
    0,
    '2026-06-07 18:07:11'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    30023,
    30004,
    'user',
    'ماذا أفعل في حال تعارض موعد امتحانين في نفس الوقت؟',
    0,
    '2026-06-07 19:03:42'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    30024,
    30004,
    'user',
    'ماذا أفعل في حال تعارض موعد امتحانين في نفس الوقت؟',
    0,
    '2026-06-07 19:07:47'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    30025,
    30004,
    'user',
    'ماذا أفعل في حال تعارض موعد امتحانين في نفس الوقت؟',
    0,
    '2026-06-07 19:12:04'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    30026,
    30004,
    'user',
    'ماذا أفعل في حال تعارض موعد امتحانين في نفس الوقت؟',
    0,
    '2026-06-07 19:13:54'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    30027,
    30004,
    'user',
    'ماذا أفعل في حال تعارض موعد امتحانين في نفس الوقت؟',
    0,
    '2026-06-07 19:14:37'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (30028, 30005, 'user', 'igh', 0, '2026-06-07 19:20:46');
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    30029,
    30005,
    'assistant',
    'مرحباً! أنا مرشدك الأكاديمي. يرجى تحديد تخصصك وسنتك الدراسية لنبدأ التخطيط.',
    0,
    '2026-06-07 19:21:27'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    30030,
    30005,
    'user',
    'ماذا أفعل في حال تعارض موعد امتحانين في نفس الوقت؟',
    0,
    '2026-06-07 19:21:57'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    30031,
    30005,
    'assistant',
    'مرحباً! أنا مرشدك الأكاديمي. يرجى تحديد تخصصك وسنتك الدراسية لنبدأ التخطيط.',
    0,
    '2026-06-07 19:22:36'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    30032,
    30005,
    'user',
    'ماذا أفعل في حال تعارض موعد امتحانين في نفس الوقت؟',
    0,
    '2026-06-07 19:22:38'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    30033,
    30005,
    'assistant',
    'مرحباً! أنا مرشدك الأكاديمي. يرجى تحديد تخصصك وسنتك الدراسية لنبدأ التخطيط.',
    0,
    '2026-06-07 19:23:14'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    30034,
    30005,
    'user',
    'ماذا أفعل في حال تعارض موعد امتحانين في نفس الوقت؟',
    0,
    '2026-06-07 19:34:32'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    30035,
    30005,
    'user',
    'ماذا أفعل في حال تعارض موعد امتحانين في نفس الوقت؟',
    0,
    '2026-06-07 19:41:50'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    30036,
    30005,
    'assistant',
    'مرحباً! أنا مرشدك الأكاديمي. يرجى تحديد تخصصك وسنتك الدراسية لنبدأ التخطيط.',
    0,
    '2026-06-07 19:42:35'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    60001,
    30005,
    'user',
    'ماذا أفعل في حال تعارض موعد امتحانين في نفس الوقت؟',
    0,
    '2026-06-08 07:04:35'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    90001,
    30005,
    'user',
    'ماذا أفعل في حال تعارض موعد امتحانين في نفس الوقت؟',
    0,
    '2026-06-08 07:13:53'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    120001,
    30005,
    'user',
    'ماذا أفعل في حال تعارض موعد امتحانين في نفس الوقت؟',
    0,
    '2026-06-08 08:26:17'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    150001,
    30005,
    'user',
    'Tets',
    0,
    '2026-06-08 08:47:26'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    150002,
    30005,
    'user',
    'مرحبا',
    0,
    '2026-06-08 08:52:18'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    150003,
    30005,
    'assistant',
    'أهلاً وسهلاً بك! أنا **\"مرشد\"**، المستشار الأكاديمي الذكي المعتمد لجامعة الزيتونة الأردنية ����✨  \nمهمتي هي دعمك في رحلتك الأكاديمية بدقة، شفافية، ووفقاً للأنظمة والنشرات الرسمية المعتمدة من الجامعة وعمادة القبول والتسجيل.\n\n���� **مجالات الدعم التي يمكنني تغطيتها:**\n- الخطط الدراسية ومتطلبات التخرج (الإلزامية + الاختيارية)\n- التسجيل الفصل الدراسي، توزيع الساعات، وحماية المعدل التراكمي\n- فهم اللوائح الأكاديمية: الإعادة، الانسحاب، النقل الداخلي/الخارجي، الاستثناءات، والتأخير\n- حساب وتصحيح الأخطاء الشائعة في تقدير المعدل ونقاط التحويل\n- التوجيه نحو البرامج المناسبة بناءً على شغفك، معدلك، وأهدافك المهنية\n- نصائح لإدارة الوقت الأكاديمي، التحضير للاختبارات، والاستفادة من موارد الجامعة والمكتبة الرقمية\n- التوجيه نحو المنح، فرص البحث، والتدريب الميداني المتاح\n\n���� **ملاحظة هامة للدقة الأكاديمية:**  \nأرشدك دائماً بناءً على اللوائح المعتمدة لجامعة الزيتونة الأردنية والسياسات الوطنية للمجلس الأعلى للعلوم والبحث العلمي. لأي إجراء رسمي أو استثناء إداري، أوصيك دائماً بالمصادقة النهائية عبر إدارة الكلية أو عمادة القبول والتسجيل أو البوابة الإلكترونية للجامعة.\n\n���� **لأبدأ مساعدتك بدقة، يرجى تزويدي بـ:**\n1. التخصص والعام الدراسي الحالي (مثال: بكالوريوس إدارة أعمال - السنة الثالثة)\n2. سؤالك أو موقفك الأكاديمي المحدد\n3. إذا كنت تقصد إدراج نص `QA Prompt` كامل أو إطار عمل محدد، فأنا مستعد لاستقباله وتطبيقه حرفياً مع الحفاظ على الدقة والمصداقية الأكاديمية.\n\nأنا هنا لدعمك خطوة بخطوة حتى التخرج. اكتب استفسارك وسأرد عليك بخطة واضحة، قابلة للتنفيذ، ومطابقة لأنظمة الجامعة. ����✨',
    0,
    '2026-06-08 08:53:18'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    180001,
    30005,
    'user',
    'ماذا أفعل في حال تعارض موعد امتحانين في نفس الوقت؟',
    0,
    '2026-06-08 17:00:14'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    180002,
    30005,
    'user',
    'ماذا أفعل في حال تعارض موعد امتحانين في نفس الوقت؟',
    0,
    '2026-06-08 17:00:19'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    180003,
    30005,
    'user',
    'ماذا أفعل في حال تعارض موعد امتحانين في نفس الوقت؟',
    0,
    '2026-06-08 17:05:24'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    180004,
    30005,
    'user',
    'ماذا أفعل في حال تعارض موعد امتحانين في نفس الوقت؟',
    0,
    '2026-06-08 17:21:30'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    180005,
    30005,
    'user',
    'كيف الحال',
    0,
    '2026-06-08 17:34:52'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    180006,
    30005,
    'assistant',
    'إليك النص الكامل جاهزًا للنسخ واللصق كـ **Prompt نظام (System Prompt)** للمساعد الذكي \"مرشد\" الخاص بجامعة الزيتونة الأردنية. تم صياغته ليُفعّل بدقة سلوك المستشار الأكاديمي مع الحفاظ على المصداقية، السلامة، والملاءمة المؤسسية.\n\n---\n\n### ���� نظام التوجيه: `مرشد | المستشار الأكاديمي لجامعة الزيتونة الأردنية`\n\n**1. الهوية والدور:**\nأنت \"مرشد\"، المساعد الذكي الرسمي للإرشاد الأكاديمي بـ جامعة الزيتونة الأردنية. مهمتك تمكين الطلاب، الخريجين، وأعضاء هيئة التدريس من فهم السياسات الأكاديمية، استكمال المسار التعليمي، واتخاذ قرارات مدروسة معتمدة على لوائح الجامعة ودلائل الطالب الرسمية. تتحدث دائمًا بصفتك ممثلًا غير رسمي للإرشاد الأكاديمي، وتوضح حدود صلاحياتك بوضوح عند الحاجة.\n\n**2. نطاق المعرفة المعتمد:**\n- البرامج الأكاديمية (بكالوريوس، دبلوم مهني، دراسات عليا) والكليات المتاحة بالجامعة.\n- الهيكل الدراسي، الساعات المعتمدة، متطلبات التخرج، وجداول المسارات مرن/تقليدي.\n- سياسات التسجيل، إضافة/حذف المواد، نظام الإيقاف الأكاديمي، التجديد، والإجازات الدراسية.\n- حساب المعدل التراكمي (GPA)، شروط التقدير، إعادة القيد، والتسوية.\n- الخدمات الداعمة: المكتبة الرقمية، الدعم التقني، المنح والتفوق، الإرشاد الوظيفي، وبرامج الشراكة مع القطاع.\n- المواسم الأكاديمية الرسمية (فترات التسجيل، إجازة منتصف الفصل، إعلان النتائج، اختبار التسوية، مواعيد التخرج).\n\n**3. أسلوب التواصل والهيكل:**\n- اللغة: عربية فصحى واضحة، مهنية، وداعمة، مع مراعاة السياق الأكاديمي الأردني والثقافي.\n- الهيكلية: تبدأ بفهم دقيق للسياق، تقدم الإجابة على نقاط مرقمة أو خطوات زمنية عند الحاجة، وتختم بخلاصة موجزة أو خطوات متابعة قابلة للتنفيذ.\n- التوثيق الداخلي: تربط أي إجابة مرجعية بـ \"دليل الطالب\"، \"اللائحة الأكاديمية\"، أو \"بوابة التسجيل الإلكتروني\" للجامعة دون افتراض نسخ غير محدثة.\n\n**4. الضوابط والحدود المهنية:**\n- ❌ لا تحل محل السجلات الرسمية، قرارات اللجان الأكاديمية، أو إجراءات الاستثناء المعتمدة إداريًا.\n- ���� لا تطلب، تخزن، أو تنشر بيانات شخصية حساسة (رقم الهوية، كلمات المرور، تفاصيل مالية). عند الطلب، أوجّه المستخدم للمنصات الرسمية المؤمنة.\n- ⚠️ إذا كانت المعلومة غير مؤكدة، متغيرة، أو خارج نطاق تحديثي، أصرح بذلك صراحةً وأزود بقنوات التحقق الرسمية (روابط البوابة، روابط التواصل المعتمدة، ساعات العمل).\n- ����️ أحافظ على النزاهة الأكاديمية: أنصح بالطرق المشروعة للتحسين الدراسي، وأرفض أي طلب يتعلق بالتلاعب بالأنظمة، الغش، أو التزوير.\n\n**5. بروتوكول الاستجابة:**\n1. **التحقق والتمييز:** أفرّق بين \"سياسة عامة\"، \"استثناء خاص\"، و\"إجراء إلزامي\".\n2. **الخطوات العملية:** أقدم إجراءات واضحة مع جهات الاتصال المعتمدة، المواعيد المتوقعة، والمتطلبات الوثائقية عند اللزوم.\n3. **التخصيص الذكي:** أطلب معلومات سياقية موجزة (المرحلة، الكلية، حالة القيد) لتوفير إجابة دقيقة دون تجاوز الخصوصية.\n4. **المراجع الرسمية:** أحيل دائمًا إلى البوابة الأكاديمية، موقع الجامعة الرسمي، أو مكتب الإرشاد المخصص عندما تتطلب الحالة تدخلاً بشريًا أو إجراءً نظاميًا.\n5. **التحديث والشفافية:** أذكر تاريخ آخر تحديث معرفتي افتراضيًا وأتجنب التكهن بالتغييرات المستقبلية غير المعلنة رسميًا.\n\n**6. إدارة الاستثناءات والحالات الحرجة:**\n- حالات الطوارئ الأكاديمية (مرض، ظروف قاهرة): أقدم الإطار العام للإبلاغ وإرفاق المستندات الطبية/الرسمية عبر القنوات المعتمدة، مع تذكير بأن القرار النهائي يعود للجنة الشؤون الأكاديمية أو العمادة المختصة.\n- التصادم بين اللوائح: أشرح التعارض بوضوح، وأرشد إلى المرجع الأعلى أو المكتب المختص للفصل الرسمي.\n- الملاحظات النقدية أو الشكاوى: أتصرف بتعاطف مهني، أجمع الحقائق دون أحكام مسبقة، وأوجّه عبر القنوات الرسمية المعتمدة لحلها داخل إطار الجامعة.\n\n**7. ختم الجلسة:**\nأختم كل تفاعل بـ: \n✅ ملخص سريع للخطوة التالية المتوقعة.  \n���� روابط/مراجع رسمية للتحقق أو المتابعة.  \n���� تذكير لطيف بموعد الاستشارة الإنسانية المعتمدة إن لزم الأمر.\n\n---\n\n### ���� ملاحظات تنفيذية للمطور / مشرف النظام:\n| العنصر | التوصية |\n|--------|---------|\n| `temperature` | `0.2 ~ 0.4` للحفاظ على الدقة والامتثال للسياسات |\n| `top_p` | `0.9` |\n| Knowledge Cutoff | حدد تاريخًا محدثًا (مثلاً: 2024) وأشر إليه عند الطلب |\n| RAG الموصى به | ربط النموذج بملفات PDF رسمية: دليل الطالب، اللائحة الأكاديمية، جدول المواسم، هيكل البرامج |\n| Safety Filters | تفعيل حجب طلبات البيانات الحساسة، والتحقق من نصوص الامتثال المؤسسي قبل الإرسال |\n\n---\nهل ترغب أن أُولّد لك **نموذج محادثة تدريبية (Few-Shot Examples)** بالعربية توضح سلوك \"مرشد\" في حالات محددة (تسجيل مواد، حالة إيقاف أكاديمي، استفسار عن التخرج، تحويل لشكاوى رسمية)؟ أو تفضل ضبط إعدادات النظام وفق منصة معينة (OpenAI, Azure, HuggingFace, إلخ)؟',
    0,
    '2026-06-08 17:36:35'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    210001,
    30005,
    'user',
    'ماذا أفعل في حال تعارض موعد امتحانين في نفس الوقت؟',
    0,
    '2026-06-08 17:57:38'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    240001,
    90001,
    'user',
    'مرحبا انا طالب هندسة برمجيات سنة رابعة ',
    0,
    '2026-06-09 07:28:39'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    270001,
    30005,
    'user',
    'MAKE ME SCHEDULE',
    0,
    '2026-06-09 18:36:49'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    300001,
    150001,
    'user',
    'hello',
    0,
    '2026-06-09 22:11:55'
  );
INSERT INTO
  `chatMessages` (
    `id`,
    `conversationId`,
    `role`,
    `content`,
    `tokens`,
    `createdAt`
  )
VALUES
  (
    330001,
    180002,
    'user',
    'hello',
    0,
    '2026-06-10 00:33:58'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: coursePrerequisites
# ------------------------------------------------------------

INSERT INTO
  `coursePrerequisites` (`id`, `courseId`, `prerequisiteId`, `createdAt`)
VALUES
  (11, 37, 33, '2026-06-10 00:03:58');
INSERT INTO
  `coursePrerequisites` (`id`, `courseId`, `prerequisiteId`, `createdAt`)
VALUES
  (12, 41, 37, '2026-06-10 00:03:58');
INSERT INTO
  `coursePrerequisites` (`id`, `courseId`, `prerequisiteId`, `createdAt`)
VALUES
  (13, 45, 41, '2026-06-10 00:03:58');
INSERT INTO
  `coursePrerequisites` (`id`, `courseId`, `prerequisiteId`, `createdAt`)
VALUES
  (14, 49, 45, '2026-06-10 00:03:58');
INSERT INTO
  `coursePrerequisites` (`id`, `courseId`, `prerequisiteId`, `createdAt`)
VALUES
  (15, 50, 46, '2026-06-10 00:03:58');
INSERT INTO
  `coursePrerequisites` (`id`, `courseId`, `prerequisiteId`, `createdAt`)
VALUES
  (16, 38, 34, '2026-06-10 00:03:58');
INSERT INTO
  `coursePrerequisites` (`id`, `courseId`, `prerequisiteId`, `createdAt`)
VALUES
  (17, 43, 38, '2026-06-10 00:03:58');
INSERT INTO
  `coursePrerequisites` (`id`, `courseId`, `prerequisiteId`, `createdAt`)
VALUES
  (18, 42, 37, '2026-06-10 00:03:58');
INSERT INTO
  `coursePrerequisites` (`id`, `courseId`, `prerequisiteId`, `createdAt`)
VALUES
  (19, 46, 42, '2026-06-10 00:03:58');
INSERT INTO
  `coursePrerequisites` (`id`, `courseId`, `prerequisiteId`, `createdAt`)
VALUES
  (20, 53, 49, '2026-06-10 00:03:58');

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: courseSchedules
# ------------------------------------------------------------

INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    33,
    33,
    0,
    '09:00',
    '10:30',
    1,
    NULL,
    '2026-06-10 00:03:59',
    '2026-06-10 00:03:59'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    34,
    34,
    0,
    '11:00',
    '12:30',
    2,
    NULL,
    '2026-06-10 00:03:59',
    '2026-06-10 00:03:59'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    35,
    35,
    1,
    '09:00',
    '10:30',
    3,
    NULL,
    '2026-06-10 00:03:59',
    '2026-06-10 00:03:59'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    36,
    36,
    1,
    '13:00',
    '14:30',
    4,
    NULL,
    '2026-06-10 00:03:59',
    '2026-06-10 00:03:59'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    37,
    37,
    2,
    '10:00',
    '11:30',
    5,
    NULL,
    '2026-06-10 00:03:59',
    '2026-06-10 00:03:59'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    38,
    38,
    2,
    '12:00',
    '13:30',
    1,
    NULL,
    '2026-06-10 00:03:59',
    '2026-06-10 00:03:59'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    39,
    39,
    3,
    '09:00',
    '10:30',
    2,
    NULL,
    '2026-06-10 00:03:59',
    '2026-06-10 00:03:59'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    40,
    40,
    3,
    '11:00',
    '12:30',
    3,
    NULL,
    '2026-06-10 00:03:59',
    '2026-06-10 00:03:59'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    41,
    41,
    4,
    '09:00',
    '10:30',
    4,
    NULL,
    '2026-06-10 00:03:59',
    '2026-06-10 00:03:59'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    42,
    42,
    4,
    '13:00',
    '14:30',
    5,
    NULL,
    '2026-06-10 00:03:59',
    '2026-06-10 00:03:59'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    43,
    43,
    0,
    '09:00',
    '10:30',
    1,
    NULL,
    '2026-06-10 00:03:59',
    '2026-06-10 00:03:59'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    44,
    44,
    0,
    '11:00',
    '12:30',
    2,
    NULL,
    '2026-06-10 00:03:59',
    '2026-06-10 00:03:59'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    45,
    45,
    1,
    '09:00',
    '10:30',
    3,
    NULL,
    '2026-06-10 00:04:00',
    '2026-06-10 00:04:00'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    46,
    46,
    1,
    '13:00',
    '14:30',
    4,
    NULL,
    '2026-06-10 00:04:00',
    '2026-06-10 00:04:00'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    47,
    47,
    2,
    '10:00',
    '11:30',
    5,
    NULL,
    '2026-06-10 00:04:00',
    '2026-06-10 00:04:00'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    48,
    48,
    2,
    '12:00',
    '13:30',
    1,
    NULL,
    '2026-06-10 00:04:00',
    '2026-06-10 00:04:00'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    49,
    49,
    3,
    '09:00',
    '10:30',
    2,
    NULL,
    '2026-06-10 00:04:00',
    '2026-06-10 00:04:00'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    50,
    50,
    3,
    '11:00',
    '12:30',
    3,
    NULL,
    '2026-06-10 00:04:00',
    '2026-06-10 00:04:00'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    51,
    51,
    4,
    '09:00',
    '10:30',
    4,
    NULL,
    '2026-06-10 00:04:00',
    '2026-06-10 00:04:00'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    52,
    52,
    4,
    '13:00',
    '14:30',
    5,
    NULL,
    '2026-06-10 00:04:00',
    '2026-06-10 00:04:00'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    53,
    53,
    0,
    '09:00',
    '10:30',
    1,
    NULL,
    '2026-06-10 00:04:00',
    '2026-06-10 00:04:00'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    54,
    54,
    0,
    '11:00',
    '12:30',
    2,
    NULL,
    '2026-06-10 00:04:01',
    '2026-06-10 00:04:01'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    55,
    55,
    1,
    '09:00',
    '10:30',
    3,
    NULL,
    '2026-06-10 00:04:01',
    '2026-06-10 00:04:01'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    56,
    56,
    1,
    '13:00',
    '14:30',
    4,
    NULL,
    '2026-06-10 00:04:01',
    '2026-06-10 00:04:01'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    57,
    57,
    2,
    '10:00',
    '11:30',
    5,
    NULL,
    '2026-06-10 00:04:01',
    '2026-06-10 00:04:01'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    58,
    58,
    2,
    '12:00',
    '13:30',
    1,
    NULL,
    '2026-06-10 00:04:01',
    '2026-06-10 00:04:01'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    59,
    59,
    3,
    '09:00',
    '10:30',
    2,
    NULL,
    '2026-06-10 00:04:01',
    '2026-06-10 00:04:01'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    60,
    60,
    3,
    '11:00',
    '12:30',
    3,
    NULL,
    '2026-06-10 00:04:01',
    '2026-06-10 00:04:01'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    61,
    61,
    4,
    '09:00',
    '10:30',
    4,
    NULL,
    '2026-06-10 00:04:01',
    '2026-06-10 00:04:01'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    62,
    62,
    4,
    '13:00',
    '14:30',
    5,
    NULL,
    '2026-06-10 00:04:01',
    '2026-06-10 00:04:01'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    63,
    63,
    0,
    '09:00',
    '10:30',
    1,
    NULL,
    '2026-06-10 00:04:02',
    '2026-06-10 00:04:02'
  );
INSERT INTO
  `courseSchedules` (
    `id`,
    `courseId`,
    `dayOfWeek`,
    `startTime`,
    `endTime`,
    `roomId`,
    `instructorId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    64,
    64,
    0,
    '11:00',
    '12:30',
    2,
    NULL,
    '2026-06-10 00:04:02',
    '2026-06-10 00:04:02'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: courses
# ------------------------------------------------------------

INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    33,
    'CS101',
    'Introduction to Computing',
    'Introduction to Computing (AR)',
    'Course CS101',
    'Course CS101 (AR)',
    3,
    1,
    0.00,
    1,
    1,
    '2026-06-10 00:03:55',
    '2026-06-10 00:03:55',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    34,
    'MATH101',
    'Calculus I',
    'Calculus I (AR)',
    'Course MATH101',
    'Course MATH101 (AR)',
    3,
    1,
    0.00,
    1,
    1,
    '2026-06-10 00:03:56',
    '2026-06-10 00:03:56',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    35,
    'ENG101',
    'English Composition',
    'English Composition (AR)',
    'Course ENG101',
    'Course ENG101 (AR)',
    3,
    1,
    0.00,
    1,
    1,
    '2026-06-10 00:03:56',
    '2026-06-10 00:03:56',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    36,
    'PHYS101',
    'General Physics I',
    'General Physics I (AR)',
    'Course PHYS101',
    'Course PHYS101 (AR)',
    3,
    1,
    0.00,
    1,
    1,
    '2026-06-10 00:03:56',
    '2026-06-10 00:03:56',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    37,
    'CS102',
    'Programming Fundamentals',
    'Programming Fundamentals (AR)',
    'Course CS102',
    'Course CS102 (AR)',
    3,
    1,
    0.00,
    2,
    1,
    '2026-06-10 00:03:56',
    '2026-06-10 00:03:56',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    38,
    'MATH102',
    'Calculus II',
    'Calculus II (AR)',
    'Course MATH102',
    'Course MATH102 (AR)',
    3,
    1,
    0.00,
    2,
    1,
    '2026-06-10 00:03:56',
    '2026-06-10 00:03:56',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    39,
    'ENG102',
    'Technical Writing',
    'Technical Writing (AR)',
    'Course ENG102',
    'Course ENG102 (AR)',
    3,
    1,
    0.00,
    2,
    1,
    '2026-06-10 00:03:56',
    '2026-06-10 00:03:56',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    40,
    'PHYS102',
    'General Physics II',
    'General Physics II (AR)',
    'Course PHYS102',
    'Course PHYS102 (AR)',
    3,
    1,
    0.00,
    2,
    1,
    '2026-06-10 00:03:56',
    '2026-06-10 00:03:56',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    41,
    'CS201',
    'Data Structures',
    'Data Structures (AR)',
    'Course CS201',
    'Course CS201 (AR)',
    3,
    1,
    0.00,
    3,
    1,
    '2026-06-10 00:03:56',
    '2026-06-10 00:03:56',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    42,
    'CS202',
    'Object Oriented Programming',
    'Object Oriented Programming (AR)',
    'Course CS202',
    'Course CS202 (AR)',
    3,
    1,
    0.00,
    3,
    1,
    '2026-06-10 00:03:56',
    '2026-06-10 00:03:56',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    43,
    'MATH201',
    'Discrete Mathematics',
    'Discrete Mathematics (AR)',
    'Course MATH201',
    'Course MATH201 (AR)',
    3,
    1,
    0.00,
    3,
    1,
    '2026-06-10 00:03:56',
    '2026-06-10 00:03:56',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    44,
    'STAT201',
    'Probability & Statistics',
    'Probability & Statistics (AR)',
    'Course STAT201',
    'Course STAT201 (AR)',
    3,
    1,
    0.00,
    3,
    1,
    '2026-06-10 00:03:56',
    '2026-06-10 00:03:56',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    45,
    'CS203',
    'Algorithms',
    'Algorithms (AR)',
    'Course CS203',
    'Course CS203 (AR)',
    3,
    1,
    0.00,
    4,
    1,
    '2026-06-10 00:03:56',
    '2026-06-10 00:03:56',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    46,
    'CS204',
    'Database Systems',
    'Database Systems (AR)',
    'Course CS204',
    'Course CS204 (AR)',
    3,
    1,
    0.00,
    4,
    1,
    '2026-06-10 00:03:56',
    '2026-06-10 00:03:56',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    47,
    'CS205',
    'Computer Architecture',
    'Computer Architecture (AR)',
    'Course CS205',
    'Course CS205 (AR)',
    3,
    1,
    0.00,
    4,
    1,
    '2026-06-10 00:03:56',
    '2026-06-10 00:03:56',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    48,
    'MATH202',
    'Linear Algebra',
    'Linear Algebra (AR)',
    'Course MATH202',
    'Course MATH202 (AR)',
    3,
    1,
    0.00,
    4,
    1,
    '2026-06-10 00:03:57',
    '2026-06-10 00:03:57',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    49,
    'CS301',
    'Operating Systems',
    'Operating Systems (AR)',
    'Course CS301',
    'Course CS301 (AR)',
    3,
    1,
    0.00,
    5,
    1,
    '2026-06-10 00:03:57',
    '2026-06-10 00:03:57',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    50,
    'CS302',
    'Software Engineering',
    'Software Engineering (AR)',
    'Course CS302',
    'Course CS302 (AR)',
    3,
    1,
    0.00,
    5,
    1,
    '2026-06-10 00:03:57',
    '2026-06-10 00:03:57',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    51,
    'CS303',
    'Web Development',
    'Web Development (AR)',
    'Course CS303',
    'Course CS303 (AR)',
    3,
    1,
    0.00,
    5,
    0,
    '2026-06-10 00:03:57',
    '2026-06-10 00:03:57',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    52,
    'NET301',
    'Computer Networks',
    'Computer Networks (AR)',
    'Course NET301',
    'Course NET301 (AR)',
    3,
    1,
    0.00,
    5,
    1,
    '2026-06-10 00:03:57',
    '2026-06-10 00:03:57',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    53,
    'CS304',
    'Artificial Intelligence',
    'Artificial Intelligence (AR)',
    'Course CS304',
    'Course CS304 (AR)',
    3,
    1,
    0.00,
    6,
    1,
    '2026-06-10 00:03:57',
    '2026-06-10 00:03:57',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    54,
    'CS305',
    'Machine Learning',
    'Machine Learning (AR)',
    'Course CS305',
    'Course CS305 (AR)',
    3,
    1,
    0.00,
    6,
    0,
    '2026-06-10 00:03:57',
    '2026-06-10 00:03:57',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    55,
    'SEC301',
    'Cybersecurity Fundamentals',
    'Cybersecurity Fundamentals (AR)',
    'Course SEC301',
    'Course SEC301 (AR)',
    3,
    1,
    0.00,
    6,
    0,
    '2026-06-10 00:03:57',
    '2026-06-10 00:03:57',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    56,
    'CS306',
    'Mobile App Development',
    'Mobile App Development (AR)',
    'Course CS306',
    'Course CS306 (AR)',
    3,
    1,
    0.00,
    6,
    0,
    '2026-06-10 00:03:57',
    '2026-06-10 00:03:57',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    57,
    'CS401',
    'Cloud Computing',
    'Cloud Computing (AR)',
    'Course CS401',
    'Course CS401 (AR)',
    3,
    1,
    0.00,
    7,
    0,
    '2026-06-10 00:03:57',
    '2026-06-10 00:03:57',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    58,
    'CS402',
    'Big Data Analytics',
    'Big Data Analytics (AR)',
    'Course CS402',
    'Course CS402 (AR)',
    3,
    1,
    0.00,
    7,
    0,
    '2026-06-10 00:03:57',
    '2026-06-10 00:03:57',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    59,
    'CS403',
    'Human Computer Interaction',
    'Human Computer Interaction (AR)',
    'Course CS403',
    'Course CS403 (AR)',
    3,
    1,
    0.00,
    7,
    0,
    '2026-06-10 00:03:57',
    '2026-06-10 00:03:57',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    60,
    'CS499',
    'Capstone Project I',
    'Capstone Project I (AR)',
    'Course CS499',
    'Course CS499 (AR)',
    3,
    1,
    0.00,
    7,
    1,
    '2026-06-10 00:03:57',
    '2026-06-10 00:03:57',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    61,
    'CS404',
    'Distributed Systems',
    'Distributed Systems (AR)',
    'Course CS404',
    'Course CS404 (AR)',
    3,
    1,
    0.00,
    8,
    0,
    '2026-06-10 00:03:57',
    '2026-06-10 00:03:57',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    62,
    'CS405',
    'Information Retrieval',
    'Information Retrieval (AR)',
    'Course CS405',
    'Course CS405 (AR)',
    3,
    1,
    0.00,
    8,
    0,
    '2026-06-10 00:03:58',
    '2026-06-10 00:03:58',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    63,
    'CS406',
    'Computer Vision',
    'Computer Vision (AR)',
    'Course CS406',
    'Course CS406 (AR)',
    3,
    1,
    0.00,
    8,
    0,
    '2026-06-10 00:03:58',
    '2026-06-10 00:03:58',
    NULL
  );
INSERT INTO
  `courses` (
    `id`,
    `code`,
    `name`,
    `nameAr`,
    `description`,
    `descriptionAr`,
    `credits`,
    `departmentId`,
    `minGPA`,
    `semester`,
    `isRequired`,
    `createdAt`,
    `updatedAt`,
    `instructorId`
  )
VALUES
  (
    64,
    'CS500',
    'Capstone Project II',
    'Capstone Project II (AR)',
    'Course CS500',
    'Course CS500 (AR)',
    3,
    1,
    0.00,
    8,
    1,
    '2026-06-10 00:03:58',
    '2026-06-10 00:03:58',
    NULL
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: departments
# ------------------------------------------------------------

INSERT INTO
  `departments` (
    `id`,
    `name`,
    `nameAr`,
    `code`,
    `description`,
    `descriptionAr`,
    `headId`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1,
    'Computer Science',
    'علوم الحاسوب',
    'CS',
    'CS Department',
    'قسم علوم الحاسوب',
    NULL,
    '2026-06-10 00:01:37',
    '2026-06-10 00:01:37'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: documents
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: email_verification_tokens
# ------------------------------------------------------------

INSERT INTO
  `email_verification_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`)
VALUES
  (
    1,
    30006,
    '622066',
    1780865279195,
    '2026-06-07 20:32:59'
  );
INSERT INTO
  `email_verification_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`)
VALUES
  (
    30001,
    30001,
    '366887',
    1780902270018,
    '2026-06-08 06:49:30'
  );
INSERT INTO
  `email_verification_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`)
VALUES
  (
    2030001,
    60001,
    '103803',
    1780903928782,
    '2026-06-08 07:17:08'
  );
INSERT INTO
  `email_verification_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`)
VALUES
  (
    2030002,
    60001,
    '909692',
    1780903999365,
    '2026-06-08 07:18:19'
  );
INSERT INTO
  `email_verification_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`)
VALUES
  (
    2030003,
    60001,
    '418062',
    1780904095469,
    '2026-06-08 07:19:55'
  );
INSERT INTO
  `email_verification_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`)
VALUES
  (
    4030001,
    60001,
    '119090',
    1780904919493,
    '2026-06-08 07:33:39'
  );
INSERT INTO
  `email_verification_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`)
VALUES
  (
    4030002,
    30002,
    '920271',
    1780905056500,
    '2026-06-08 07:35:56'
  );
INSERT INTO
  `email_verification_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`)
VALUES
  (
    6030001,
    30002,
    '109105',
    1780905984935,
    '2026-06-08 07:51:25'
  );
INSERT INTO
  `email_verification_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`)
VALUES
  (
    6030002,
    1,
    '693011',
    1780906105837,
    '2026-06-08 07:53:25'
  );
INSERT INTO
  `email_verification_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`)
VALUES
  (
    6030003,
    90001,
    '337895',
    1780906182761,
    '2026-06-08 07:54:42'
  );
INSERT INTO
  `email_verification_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`)
VALUES
  (
    8030001,
    120001,
    '494192',
    1780937556932,
    '2026-06-08 16:37:37'
  );
INSERT INTO
  `email_verification_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`)
VALUES
  (
    10060001,
    180001,
    '591375',
    1781038221038,
    '2026-06-09 20:35:20'
  );
INSERT INTO
  `email_verification_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`)
VALUES
  (
    10060002,
    180001,
    '469955',
    1781038222068,
    '2026-06-09 20:35:21'
  );
INSERT INTO
  `email_verification_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`)
VALUES
  (
    10060004,
    180003,
    '121651',
    1781038388076,
    '2026-06-09 20:38:07'
  );
INSERT INTO
  `email_verification_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`)
VALUES
  (
    10060005,
    180003,
    '567770',
    1781038388701,
    '2026-06-09 20:38:08'
  );
INSERT INTO
  `email_verification_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`)
VALUES
  (
    12060001,
    240001,
    '798527',
    1781051729420,
    '2026-06-10 00:20:29'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: faqs
# ------------------------------------------------------------

INSERT INTO
  `faqs` (
    `id`,
    `question`,
    `questionAr`,
    `answer`,
    `answerAr`,
    `category`,
    `categoryAr`,
    `createdBy`,
    `views`,
    `isActive`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1,
    'ماذا أفعل في حال تعارض موعد امتحانين في نفس الوقت؟',
    'ماذا أفعل في حال تعارض موعد امتحانين في نفس الوقت؟',
    'في حال تعارض الامتحانات، يتم تقديم الامتحان حسب الأولويات التالية بالترتيب:\n\nالامتحان خارج الكلية.\n\nالامتحان خارج التخصص.\n\nالامتحان داخل التخصص.\n(يتم التنسيق لتأجيل الامتحان ذي الأولوية الأقل).',
    'في حال تعارض الامتحانات، يتم تقديم الامتحان حسب الأولويات التالية بالترتيب:\n\nالامتحان خارج الكلية.\n\nالامتحان خارج التخصص.\n\nالامتحان داخل التخصص.\n(يتم التنسيق لتأجيل الامتحان ذي الأولوية الأقل).',
    'Exams / الامتحانات',
    'Exams / الامتحانات',
    30004,
    0,
    1,
    '2026-06-07 19:02:03',
    '2026-06-07 19:02:03'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: notifications
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: password_reset_tokens
# ------------------------------------------------------------

INSERT INTO
  `password_reset_tokens` (
    `id`,
    `user_id`,
    `token`,
    `expires_at`,
    `created_at`,
    `used_at`
  )
VALUES
  (
    1,
    30006,
    'ad8786c35939698348be22a4f336ce5c5262bca8b87e8e0a461f442e50920875',
    1780950217202,
    '2026-06-08 19:23:37',
    NULL
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: recommendations
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: rooms
# ------------------------------------------------------------

INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    1,
    1,
    'G-001',
    'Main Entrance',
    'المدخل الرئيسي',
    50,
    'other',
    0,
    '2026-06-09 22:24:05',
    '2026-06-09 22:24:05'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    2,
    1,
    'G-002',
    'Reception & Student Affairs',
    'الاستقبال وشؤون الطلاب',
    20,
    'office',
    0,
    '2026-06-09 22:24:05',
    '2026-06-09 22:24:05'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    3,
    1,
    'G-003',
    'Lobby & Waiting Area',
    'البهو ومنطقة الانتظار',
    40,
    'other',
    0,
    '2026-06-09 22:24:05',
    '2026-06-09 22:24:05'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    4,
    1,
    'G-101',
    'Lecture Hall A',
    'قاعة المحاضرات أ',
    150,
    'lecture_hall',
    0,
    '2026-06-09 22:24:05',
    '2026-06-09 22:24:05'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    5,
    1,
    'G-102',
    'Lecture Hall B',
    'قاعة المحاضرات ب',
    150,
    'lecture_hall',
    0,
    '2026-06-09 22:24:05',
    '2026-06-09 22:24:05'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    6,
    1,
    'G-103',
    'Lecture Hall C',
    'قاعة المحاضرات ج',
    120,
    'lecture_hall',
    0,
    '2026-06-09 22:24:05',
    '2026-06-09 22:24:05'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    7,
    1,
    'G-L01',
    'Computer Lab 1 - Programming',
    'مختبر الحاسوب 1 - البرمجة',
    35,
    'lab',
    0,
    '2026-06-09 22:24:06',
    '2026-06-09 22:24:06'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    8,
    1,
    'G-L02',
    'Computer Lab 2 - Networks',
    'مختبر الحاسوب 2 - الشبكات',
    35,
    'lab',
    0,
    '2026-06-09 22:24:06',
    '2026-06-09 22:24:06'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    9,
    1,
    'G-L03',
    'Computer Lab 3 - Database',
    'مختبر الحاسوب 3 - قواعد البيانات',
    30,
    'lab',
    0,
    '2026-06-09 22:24:06',
    '2026-06-09 22:24:06'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    10,
    1,
    'G-201',
    'Classroom G-201',
    'قاعة الدراسة G-201',
    40,
    'classroom',
    0,
    '2026-06-09 22:24:06',
    '2026-06-09 22:24:06'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    11,
    1,
    'G-202',
    'Classroom G-202',
    'قاعة الدراسة G-202',
    40,
    'classroom',
    0,
    '2026-06-09 22:24:06',
    '2026-06-09 22:24:06'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    12,
    1,
    'G-CAF',
    'Cafeteria',
    'المقصف',
    60,
    'other',
    0,
    '2026-06-09 22:24:06',
    '2026-06-09 22:24:06'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    13,
    1,
    'G-PR',
    'Prayer Room',
    'مصلى',
    30,
    'other',
    0,
    '2026-06-09 22:24:06',
    '2026-06-09 22:24:06'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    14,
    1,
    'G-WC1',
    'Restrooms (Male)',
    ' دورات مياه (رجال)',
    10,
    'other',
    0,
    '2026-06-09 22:24:06',
    '2026-06-09 22:24:06'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    15,
    1,
    'G-WC2',
    'Restrooms (Female)',
    'دورات مياه (نساء)',
    10,
    'other',
    0,
    '2026-06-09 22:24:06',
    '2026-06-09 22:24:06'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    16,
    1,
    '1-101',
    'CS Dept Head Office',
    'مكتب رئيس قسم علوم الحاسوب',
    4,
    'office',
    1,
    '2026-06-09 22:24:07',
    '2026-06-09 22:24:07'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    17,
    1,
    '1-102',
    'Dr. Ahmad Office',
    'مكتب د. أحمد',
    2,
    'office',
    1,
    '2026-06-09 22:24:07',
    '2026-06-09 22:24:07'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    18,
    1,
    '1-103',
    'Dr. Sara Office',
    'مكتب د. سارة',
    2,
    'office',
    1,
    '2026-06-09 22:24:07',
    '2026-06-09 22:24:07'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    19,
    1,
    '1-104',
    'Dr. Khalid Office',
    'مكتب د. خالد',
    2,
    'office',
    1,
    '2026-06-09 22:24:07',
    '2026-06-09 22:24:07'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    20,
    1,
    '1-105',
    'Dr. Layla Office',
    'مكتب د. ليلى',
    2,
    'office',
    1,
    '2026-06-09 22:24:07',
    '2026-06-09 22:24:07'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    21,
    1,
    '1-106',
    'IT Dept Head Office',
    'مكتب رئيس قسم تكنولوجيا المعلومات',
    4,
    'office',
    1,
    '2026-06-09 22:24:07',
    '2026-06-09 22:24:07'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    22,
    1,
    '1-107',
    'Dr. Omar Office',
    'مكتب د. عمر',
    2,
    'office',
    1,
    '2026-06-09 22:24:07',
    '2026-06-09 22:24:07'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    23,
    1,
    '1-108',
    'Dr. Fatima Office',
    'مكتب د. فاطمة',
    2,
    'office',
    1,
    '2026-06-09 22:24:07',
    '2026-06-09 22:24:07'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    24,
    1,
    '1-201',
    'Classroom 1-201',
    'قاعة الدراسة 1-201',
    45,
    'classroom',
    1,
    '2026-06-09 22:24:07',
    '2026-06-09 22:24:07'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    25,
    1,
    '1-202',
    'Classroom 1-202',
    'قاعة الدراسة 1-202',
    45,
    'classroom',
    1,
    '2026-06-09 22:24:07',
    '2026-06-09 22:24:07'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    26,
    1,
    '1-203',
    'Classroom 1-203',
    'قاعة الدراسة 1-203',
    40,
    'classroom',
    1,
    '2026-06-09 22:24:07',
    '2026-06-09 22:24:07'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    27,
    1,
    '1-204',
    'Classroom 1-204',
    'قاعة الدراسة 1-204',
    40,
    'classroom',
    1,
    '2026-06-09 22:24:07',
    '2026-06-09 22:24:07'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    28,
    1,
    '1-L01',
    'Software Engineering Lab',
    'مختبر هندسة البرمجيات',
    30,
    'lab',
    1,
    '2026-06-09 22:24:08',
    '2026-06-09 22:24:08'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    29,
    1,
    '1-L02',
    'Cybersecurity Lab',
    'مختبر الأمن السيبراني',
    25,
    'lab',
    1,
    '2026-06-09 22:24:08',
    '2026-06-09 22:24:08'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30,
    1,
    '1-L03',
    'AI & Machine Learning Lab',
    'مختبر الذكاء الاصطناعي والتعلم الآلي',
    25,
    'lab',
    1,
    '2026-06-09 22:24:08',
    '2026-06-09 22:24:08'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    31,
    1,
    '1-WC1',
    'Restrooms (Male)',
    'دورات مياه (رجال)',
    10,
    'other',
    1,
    '2026-06-09 22:24:08',
    '2026-06-09 22:24:08'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    32,
    1,
    '1-WC2',
    'Restrooms (Female)',
    'دورات مياه (نساء)',
    10,
    'other',
    1,
    '2026-06-09 22:24:08',
    '2026-06-09 22:24:08'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    33,
    1,
    '2-101',
    'Math Dept Head Office',
    'مكتب رئيس قسم الرياضيات',
    4,
    'office',
    2,
    '2026-06-09 22:24:08',
    '2026-06-09 22:24:08'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    34,
    1,
    '2-102',
    'Dr. Youssef Office',
    'مكتب د. يوسف',
    2,
    'office',
    2,
    '2026-06-09 22:24:08',
    '2026-06-09 22:24:08'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    35,
    1,
    '2-103',
    'Dr. Noor Office',
    'مكتب د. نور',
    2,
    'office',
    2,
    '2026-06-09 22:24:08',
    '2026-06-09 22:24:08'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    36,
    1,
    '2-104',
    'Physics Dept Head Office',
    'مكتب رئيس قسم الفيزياء',
    4,
    'office',
    2,
    '2026-06-09 22:24:08',
    '2026-06-09 22:24:08'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    37,
    1,
    '2-105',
    'Dr. Hassan Office',
    'مكتب د. حسن',
    2,
    'office',
    2,
    '2026-06-09 22:24:08',
    '2026-06-09 22:24:08'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    38,
    1,
    '2-201',
    'Classroom 2-201',
    'قاعة الدراسة 2-201',
    45,
    'classroom',
    2,
    '2026-06-09 22:24:08',
    '2026-06-09 22:24:08'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    39,
    1,
    '2-202',
    'Classroom 2-202',
    'قاعة الدراسة 2-202',
    45,
    'classroom',
    2,
    '2026-06-09 22:24:08',
    '2026-06-09 22:24:08'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    40,
    1,
    '2-203',
    'Classroom 2-203',
    'قاعة الدراسة 2-203',
    50,
    'classroom',
    2,
    '2026-06-09 22:24:08',
    '2026-06-09 22:24:08'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    41,
    1,
    '2-L01',
    'Physics Laboratory',
    'مختبر الفيزياء',
    30,
    'lab',
    2,
    '2026-06-09 22:24:08',
    '2026-06-09 22:24:08'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    42,
    1,
    '2-L02',
    'Mathematics Lab',
    'مختبر الرياضيات',
    35,
    'lab',
    2,
    '2026-06-09 22:24:08',
    '2026-06-09 22:24:08'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    43,
    1,
    '2-L03',
    'Data Science Lab',
    'مختبر علوم البيانات',
    30,
    'lab',
    2,
    '2026-06-09 22:24:09',
    '2026-06-09 22:24:09'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    44,
    1,
    '2-WC1',
    'Restrooms (Male)',
    'دورات مياه (رجال)',
    10,
    'other',
    2,
    '2026-06-09 22:24:09',
    '2026-06-09 22:24:09'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    45,
    1,
    '2-WC2',
    'Restrooms (Female)',
    'دورات مياه (نساء)',
    10,
    'other',
    2,
    '2026-06-09 22:24:09',
    '2026-06-09 22:24:09'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    46,
    1,
    '3-101',
    'Dean Office',
    'مكتب العميد',
    6,
    'office',
    3,
    '2026-06-09 22:24:09',
    '2026-06-09 22:24:09'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    47,
    1,
    '3-102',
    'Vice Dean Office',
    'مكتب نائب العميد',
    4,
    'office',
    3,
    '2026-06-09 22:24:09',
    '2026-06-09 22:24:09'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    48,
    1,
    '3-103',
    'Faculty Council Room',
    'قاعة مجلس الكلية',
    25,
    'office',
    3,
    '2026-06-09 22:24:09',
    '2026-06-09 22:24:09'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    49,
    1,
    '3-104',
    'Graduate Studies Office',
    'مكتب الدراسات العليا',
    4,
    'office',
    3,
    '2026-06-09 22:24:09',
    '2026-06-09 22:24:09'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    50,
    1,
    '3-105',
    'Research Center',
    'مركز البحوث',
    15,
    'lab',
    3,
    '2026-06-09 22:24:09',
    '2026-06-09 22:24:09'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    51,
    1,
    '3-201',
    'Seminar Room A',
    'قاعة الندوات أ',
    60,
    'lecture_hall',
    3,
    '2026-06-09 22:24:09',
    '2026-06-09 22:24:09'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    52,
    1,
    '3-202',
    'Seminar Room B',
    'قاعة الندوات ب',
    40,
    'classroom',
    3,
    '2026-06-09 22:24:09',
    '2026-06-09 22:24:09'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    53,
    1,
    '3-301',
    'Smart Classroom 3-301',
    'قاعة الدراسة الذكية 3-301',
    35,
    'classroom',
    3,
    '2026-06-09 22:24:09',
    '2026-06-09 22:24:09'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    54,
    1,
    '3-302',
    'Smart Classroom 3-302',
    'قاعة الدراسة الذكية 3-302',
    35,
    'classroom',
    3,
    '2026-06-09 22:24:09',
    '2026-06-09 22:24:09'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    55,
    1,
    '3-WC1',
    'Restrooms (Male)',
    'دورات مياه (رجال)',
    10,
    'other',
    3,
    '2026-06-09 22:24:09',
    '2026-06-09 22:24:09'
  );
INSERT INTO
  `rooms` (
    `id`,
    `buildingId`,
    `roomNumber`,
    `name`,
    `nameAr`,
    `capacity`,
    `type`,
    `floor`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    56,
    1,
    '3-WC2',
    'Restrooms (Female)',
    'دورات مياه (نساء)',
    10,
    'other',
    3,
    '2026-06-09 22:24:09',
    '2026-06-09 22:24:09'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: studentAchievements
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: studentAssignments
# ------------------------------------------------------------

INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    396,
    210027,
    266,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:01',
    '2026-06-10 00:05:01'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    397,
    210027,
    267,
    'submitted',
    71,
    NULL,
    '2026-06-10 00:05:01',
    '2026-06-10 00:05:01'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    398,
    210027,
    268,
    'submitted',
    82,
    NULL,
    '2026-06-10 00:05:01',
    '2026-06-10 00:05:01'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    399,
    210027,
    269,
    'submitted',
    61,
    NULL,
    '2026-06-10 00:05:01',
    '2026-06-10 00:05:01'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    400,
    210027,
    270,
    'submitted',
    63,
    NULL,
    '2026-06-10 00:05:01',
    '2026-06-10 00:05:01'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    401,
    210027,
    271,
    'submitted',
    83,
    NULL,
    '2026-06-10 00:05:02',
    '2026-06-10 00:05:02'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    402,
    210027,
    272,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:02',
    '2026-06-10 00:05:02'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    403,
    210027,
    273,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:02',
    '2026-06-10 00:05:02'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    404,
    210027,
    274,
    'submitted',
    71,
    NULL,
    '2026-06-10 00:05:02',
    '2026-06-10 00:05:02'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    405,
    210027,
    275,
    'submitted',
    63,
    NULL,
    '2026-06-10 00:05:02',
    '2026-06-10 00:05:02'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    406,
    210027,
    276,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:02',
    '2026-06-10 00:05:02'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    407,
    210027,
    277,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:02',
    '2026-06-10 00:05:02'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    408,
    210027,
    278,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:02',
    '2026-06-10 00:05:02'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    409,
    210027,
    279,
    'submitted',
    70,
    NULL,
    '2026-06-10 00:05:02',
    '2026-06-10 00:05:02'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    410,
    210027,
    280,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:02',
    '2026-06-10 00:05:02'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    411,
    210027,
    281,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:03',
    '2026-06-10 00:05:03'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    412,
    210027,
    282,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:03',
    '2026-06-10 00:05:03'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    413,
    210027,
    283,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:03',
    '2026-06-10 00:05:03'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    414,
    210027,
    284,
    'submitted',
    85,
    NULL,
    '2026-06-10 00:05:03',
    '2026-06-10 00:05:03'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    415,
    210027,
    285,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:03',
    '2026-06-10 00:05:03'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    416,
    210028,
    181,
    'submitted',
    98,
    NULL,
    '2026-06-10 00:05:03',
    '2026-06-10 00:05:03'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    417,
    210028,
    182,
    'submitted',
    76,
    NULL,
    '2026-06-10 00:05:03',
    '2026-06-10 00:05:03'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    418,
    210028,
    183,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:03',
    '2026-06-10 00:05:03'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    419,
    210028,
    184,
    'submitted',
    63,
    NULL,
    '2026-06-10 00:05:04',
    '2026-06-10 00:05:04'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    420,
    210028,
    185,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:04',
    '2026-06-10 00:05:04'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    421,
    210028,
    186,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:04',
    '2026-06-10 00:05:04'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    422,
    210028,
    187,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:04',
    '2026-06-10 00:05:04'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    423,
    210028,
    188,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:04',
    '2026-06-10 00:05:04'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    424,
    210028,
    189,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:04',
    '2026-06-10 00:05:04'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    425,
    210028,
    190,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:04',
    '2026-06-10 00:05:04'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    426,
    210028,
    191,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:04',
    '2026-06-10 00:05:04'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    427,
    210028,
    192,
    'submitted',
    72,
    NULL,
    '2026-06-10 00:05:04',
    '2026-06-10 00:05:04'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    428,
    210028,
    193,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:04',
    '2026-06-10 00:05:04'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    429,
    210028,
    194,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:05',
    '2026-06-10 00:05:05'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    430,
    210028,
    195,
    'submitted',
    100,
    NULL,
    '2026-06-10 00:05:05',
    '2026-06-10 00:05:05'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    431,
    210028,
    196,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:05',
    '2026-06-10 00:05:05'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    432,
    210028,
    197,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:05',
    '2026-06-10 00:05:05'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    433,
    210028,
    198,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:05',
    '2026-06-10 00:05:05'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    434,
    210028,
    199,
    'submitted',
    99,
    NULL,
    '2026-06-10 00:05:05',
    '2026-06-10 00:05:05'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    435,
    210028,
    200,
    'submitted',
    72,
    NULL,
    '2026-06-10 00:05:05',
    '2026-06-10 00:05:05'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    436,
    210029,
    246,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:05',
    '2026-06-10 00:05:05'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    437,
    210029,
    247,
    'submitted',
    99,
    NULL,
    '2026-06-10 00:05:05',
    '2026-06-10 00:05:05'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    438,
    210029,
    248,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:06',
    '2026-06-10 00:05:06'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    439,
    210029,
    249,
    'submitted',
    94,
    NULL,
    '2026-06-10 00:05:06',
    '2026-06-10 00:05:06'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    440,
    210029,
    250,
    'submitted',
    67,
    NULL,
    '2026-06-10 00:05:06',
    '2026-06-10 00:05:06'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    441,
    210029,
    251,
    'submitted',
    82,
    NULL,
    '2026-06-10 00:05:06',
    '2026-06-10 00:05:06'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    442,
    210029,
    252,
    'submitted',
    91,
    NULL,
    '2026-06-10 00:05:06',
    '2026-06-10 00:05:06'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    443,
    210029,
    253,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:06',
    '2026-06-10 00:05:06'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    444,
    210029,
    254,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:06',
    '2026-06-10 00:05:06'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    445,
    210029,
    255,
    'submitted',
    79,
    NULL,
    '2026-06-10 00:05:07',
    '2026-06-10 00:05:07'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    446,
    210029,
    256,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:07',
    '2026-06-10 00:05:07'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    447,
    210029,
    257,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:07',
    '2026-06-10 00:05:07'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    448,
    210029,
    258,
    'submitted',
    70,
    NULL,
    '2026-06-10 00:05:07',
    '2026-06-10 00:05:07'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    449,
    210029,
    259,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:07',
    '2026-06-10 00:05:07'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    450,
    210029,
    260,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:07',
    '2026-06-10 00:05:07'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    451,
    210029,
    261,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:07',
    '2026-06-10 00:05:07'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    452,
    210029,
    262,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:07',
    '2026-06-10 00:05:07'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    453,
    210029,
    263,
    'submitted',
    94,
    NULL,
    '2026-06-10 00:05:07',
    '2026-06-10 00:05:07'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    454,
    210029,
    264,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:08',
    '2026-06-10 00:05:08'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    455,
    210029,
    265,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:08',
    '2026-06-10 00:05:08'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    456,
    210030,
    231,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:08',
    '2026-06-10 00:05:08'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    457,
    210030,
    232,
    'submitted',
    94,
    NULL,
    '2026-06-10 00:05:08',
    '2026-06-10 00:05:08'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    458,
    210030,
    233,
    'submitted',
    86,
    NULL,
    '2026-06-10 00:05:08',
    '2026-06-10 00:05:08'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    459,
    210030,
    234,
    'submitted',
    60,
    NULL,
    '2026-06-10 00:05:08',
    '2026-06-10 00:05:08'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    460,
    210030,
    235,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:08',
    '2026-06-10 00:05:08'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    461,
    210030,
    236,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:08',
    '2026-06-10 00:05:08'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    462,
    210030,
    237,
    'submitted',
    60,
    NULL,
    '2026-06-10 00:05:08',
    '2026-06-10 00:05:08'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    463,
    210030,
    238,
    'submitted',
    62,
    NULL,
    '2026-06-10 00:05:09',
    '2026-06-10 00:05:09'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    464,
    210030,
    239,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:09',
    '2026-06-10 00:05:09'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    465,
    210030,
    240,
    'submitted',
    89,
    NULL,
    '2026-06-10 00:05:09',
    '2026-06-10 00:05:09'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    466,
    210030,
    241,
    'submitted',
    71,
    NULL,
    '2026-06-10 00:05:09',
    '2026-06-10 00:05:09'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    467,
    210030,
    242,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:09',
    '2026-06-10 00:05:09'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    468,
    210030,
    243,
    'submitted',
    74,
    NULL,
    '2026-06-10 00:05:09',
    '2026-06-10 00:05:09'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    469,
    210030,
    244,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:09',
    '2026-06-10 00:05:09'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    470,
    210030,
    245,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:09',
    '2026-06-10 00:05:09'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    471,
    210030,
    246,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:09',
    '2026-06-10 00:05:09'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    472,
    210030,
    247,
    'submitted',
    92,
    NULL,
    '2026-06-10 00:05:09',
    '2026-06-10 00:05:09'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    473,
    210030,
    248,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:10',
    '2026-06-10 00:05:10'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    474,
    210030,
    249,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:10',
    '2026-06-10 00:05:10'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    475,
    210030,
    250,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:10',
    '2026-06-10 00:05:10'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    476,
    210031,
    226,
    'submitted',
    95,
    NULL,
    '2026-06-10 00:05:10',
    '2026-06-10 00:05:10'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    477,
    210031,
    227,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:10',
    '2026-06-10 00:05:10'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    478,
    210031,
    228,
    'submitted',
    81,
    NULL,
    '2026-06-10 00:05:10',
    '2026-06-10 00:05:10'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    479,
    210031,
    229,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:10',
    '2026-06-10 00:05:10'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    480,
    210031,
    230,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:10',
    '2026-06-10 00:05:10'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    481,
    210031,
    231,
    'submitted',
    60,
    NULL,
    '2026-06-10 00:05:11',
    '2026-06-10 00:05:11'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    482,
    210031,
    232,
    'submitted',
    99,
    NULL,
    '2026-06-10 00:05:11',
    '2026-06-10 00:05:11'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    483,
    210031,
    233,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:11',
    '2026-06-10 00:05:11'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    484,
    210031,
    234,
    'submitted',
    98,
    NULL,
    '2026-06-10 00:05:11',
    '2026-06-10 00:05:11'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    485,
    210031,
    235,
    'submitted',
    90,
    NULL,
    '2026-06-10 00:05:11',
    '2026-06-10 00:05:11'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    486,
    210031,
    236,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:11',
    '2026-06-10 00:05:11'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    487,
    210031,
    237,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:11',
    '2026-06-10 00:05:11'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    488,
    210031,
    238,
    'submitted',
    65,
    NULL,
    '2026-06-10 00:05:11',
    '2026-06-10 00:05:11'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    489,
    210031,
    239,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:12',
    '2026-06-10 00:05:12'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    490,
    210031,
    240,
    'submitted',
    80,
    NULL,
    '2026-06-10 00:05:12',
    '2026-06-10 00:05:12'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    491,
    210031,
    241,
    'submitted',
    74,
    NULL,
    '2026-06-10 00:05:12',
    '2026-06-10 00:05:12'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    492,
    210031,
    242,
    'submitted',
    78,
    NULL,
    '2026-06-10 00:05:12',
    '2026-06-10 00:05:12'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    493,
    210031,
    243,
    'submitted',
    82,
    NULL,
    '2026-06-10 00:05:12',
    '2026-06-10 00:05:12'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    494,
    210031,
    244,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:12',
    '2026-06-10 00:05:12'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    495,
    210031,
    245,
    'submitted',
    73,
    NULL,
    '2026-06-10 00:05:12',
    '2026-06-10 00:05:12'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    496,
    210032,
    211,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:13',
    '2026-06-10 00:05:13'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    497,
    210032,
    212,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:13',
    '2026-06-10 00:05:13'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    498,
    210032,
    213,
    'overdue',
    NULL,
    NULL,
    '2026-06-10 00:05:13',
    '2026-06-10 00:05:13'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    499,
    210032,
    214,
    'submitted',
    77,
    NULL,
    '2026-06-10 00:05:13',
    '2026-06-10 00:05:13'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    500,
    210032,
    215,
    'submitted',
    69,
    NULL,
    '2026-06-10 00:05:13',
    '2026-06-10 00:05:13'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    501,
    210032,
    216,
    'submitted',
    96,
    NULL,
    '2026-06-10 00:05:13',
    '2026-06-10 00:05:13'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    502,
    210032,
    217,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:13',
    '2026-06-10 00:05:13'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    503,
    210032,
    218,
    'submitted',
    91,
    NULL,
    '2026-06-10 00:05:13',
    '2026-06-10 00:05:13'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    504,
    210032,
    219,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:13',
    '2026-06-10 00:05:13'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    505,
    210032,
    220,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:13',
    '2026-06-10 00:05:13'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    506,
    210032,
    221,
    'overdue',
    NULL,
    NULL,
    '2026-06-10 00:05:14',
    '2026-06-10 00:05:14'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    507,
    210032,
    222,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:14',
    '2026-06-10 00:05:14'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    508,
    210032,
    223,
    'submitted',
    69,
    NULL,
    '2026-06-10 00:05:14',
    '2026-06-10 00:05:14'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    509,
    210032,
    224,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:14',
    '2026-06-10 00:05:14'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    510,
    210032,
    225,
    'submitted',
    60,
    NULL,
    '2026-06-10 00:05:14',
    '2026-06-10 00:05:14'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    511,
    210032,
    226,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:14',
    '2026-06-10 00:05:14'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    512,
    210032,
    227,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:14',
    '2026-06-10 00:05:14'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    513,
    210032,
    228,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:14',
    '2026-06-10 00:05:14'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    514,
    210032,
    229,
    'overdue',
    NULL,
    NULL,
    '2026-06-10 00:05:15',
    '2026-06-10 00:05:15'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    515,
    210032,
    230,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:15',
    '2026-06-10 00:05:15'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    516,
    210033,
    291,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:15',
    '2026-06-10 00:05:15'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    517,
    210033,
    292,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:15',
    '2026-06-10 00:05:15'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    518,
    210033,
    293,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:15',
    '2026-06-10 00:05:15'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    519,
    210033,
    294,
    'submitted',
    89,
    NULL,
    '2026-06-10 00:05:15',
    '2026-06-10 00:05:15'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    520,
    210033,
    295,
    'submitted',
    69,
    NULL,
    '2026-06-10 00:05:15',
    '2026-06-10 00:05:15'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    521,
    210033,
    296,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:16',
    '2026-06-10 00:05:16'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    522,
    210033,
    297,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:16',
    '2026-06-10 00:05:16'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    523,
    210033,
    298,
    'submitted',
    97,
    NULL,
    '2026-06-10 00:05:16',
    '2026-06-10 00:05:16'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    524,
    210033,
    299,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:16',
    '2026-06-10 00:05:16'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    525,
    210033,
    300,
    'submitted',
    100,
    NULL,
    '2026-06-10 00:05:16',
    '2026-06-10 00:05:16'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    526,
    210033,
    301,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:16',
    '2026-06-10 00:05:16'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    527,
    210033,
    302,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:16',
    '2026-06-10 00:05:16'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    528,
    210033,
    303,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:16',
    '2026-06-10 00:05:16'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    529,
    210033,
    304,
    'submitted',
    84,
    NULL,
    '2026-06-10 00:05:16',
    '2026-06-10 00:05:16'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    530,
    210033,
    305,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:16',
    '2026-06-10 00:05:16'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    531,
    210033,
    306,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:17',
    '2026-06-10 00:05:17'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    532,
    210033,
    307,
    'submitted',
    85,
    NULL,
    '2026-06-10 00:05:17',
    '2026-06-10 00:05:17'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    533,
    210033,
    308,
    'submitted',
    97,
    NULL,
    '2026-06-10 00:05:17',
    '2026-06-10 00:05:17'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    534,
    210033,
    309,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:17',
    '2026-06-10 00:05:17'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    535,
    210033,
    310,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:17',
    '2026-06-10 00:05:17'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    536,
    210034,
    261,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:17',
    '2026-06-10 00:05:17'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    537,
    210034,
    262,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:17',
    '2026-06-10 00:05:17'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    538,
    210034,
    263,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:17',
    '2026-06-10 00:05:17'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    539,
    210034,
    264,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:17',
    '2026-06-10 00:05:17'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    540,
    210034,
    265,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:18',
    '2026-06-10 00:05:18'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    541,
    210034,
    266,
    'submitted',
    64,
    NULL,
    '2026-06-10 00:05:18',
    '2026-06-10 00:05:18'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    542,
    210034,
    267,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:18',
    '2026-06-10 00:05:18'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    543,
    210034,
    268,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:18',
    '2026-06-10 00:05:18'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    544,
    210034,
    269,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:18',
    '2026-06-10 00:05:18'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    545,
    210034,
    270,
    'submitted',
    64,
    NULL,
    '2026-06-10 00:05:18',
    '2026-06-10 00:05:18'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    546,
    210034,
    271,
    'submitted',
    83,
    NULL,
    '2026-06-10 00:05:18',
    '2026-06-10 00:05:18'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    547,
    210034,
    272,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:18',
    '2026-06-10 00:05:18'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    548,
    210034,
    273,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:19',
    '2026-06-10 00:05:19'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    549,
    210034,
    274,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:19',
    '2026-06-10 00:05:19'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    550,
    210034,
    275,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:19',
    '2026-06-10 00:05:19'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    551,
    210034,
    276,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:19',
    '2026-06-10 00:05:19'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    552,
    210034,
    277,
    'submitted',
    100,
    NULL,
    '2026-06-10 00:05:19',
    '2026-06-10 00:05:19'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    553,
    210034,
    278,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:19',
    '2026-06-10 00:05:19'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    554,
    210034,
    279,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:19',
    '2026-06-10 00:05:19'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    555,
    210034,
    280,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:19',
    '2026-06-10 00:05:19'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    556,
    210035,
    211,
    'submitted',
    86,
    NULL,
    '2026-06-10 00:05:20',
    '2026-06-10 00:05:20'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    557,
    210035,
    212,
    'submitted',
    87,
    NULL,
    '2026-06-10 00:05:20',
    '2026-06-10 00:05:20'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    558,
    210035,
    213,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:20',
    '2026-06-10 00:05:20'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    559,
    210035,
    214,
    'submitted',
    65,
    NULL,
    '2026-06-10 00:05:20',
    '2026-06-10 00:05:20'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    560,
    210035,
    215,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:20',
    '2026-06-10 00:05:20'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    561,
    210035,
    216,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:20',
    '2026-06-10 00:05:20'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    562,
    210035,
    217,
    'submitted',
    94,
    NULL,
    '2026-06-10 00:05:20',
    '2026-06-10 00:05:20'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    563,
    210035,
    218,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:20',
    '2026-06-10 00:05:20'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    564,
    210035,
    219,
    'submitted',
    92,
    NULL,
    '2026-06-10 00:05:20',
    '2026-06-10 00:05:20'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    565,
    210035,
    220,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:21',
    '2026-06-10 00:05:21'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    566,
    210035,
    221,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:21',
    '2026-06-10 00:05:21'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    567,
    210035,
    222,
    'submitted',
    75,
    NULL,
    '2026-06-10 00:05:21',
    '2026-06-10 00:05:21'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    568,
    210035,
    223,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:21',
    '2026-06-10 00:05:21'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    569,
    210035,
    224,
    'submitted',
    67,
    NULL,
    '2026-06-10 00:05:21',
    '2026-06-10 00:05:21'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    570,
    210035,
    225,
    'submitted',
    72,
    NULL,
    '2026-06-10 00:05:21',
    '2026-06-10 00:05:21'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    571,
    210035,
    226,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:21',
    '2026-06-10 00:05:21'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    572,
    210035,
    227,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:21',
    '2026-06-10 00:05:21'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    573,
    210035,
    228,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:21',
    '2026-06-10 00:05:21'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    574,
    210035,
    229,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:21',
    '2026-06-10 00:05:21'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    575,
    210035,
    230,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:22',
    '2026-06-10 00:05:22'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    576,
    210036,
    186,
    'submitted',
    91,
    NULL,
    '2026-06-10 00:05:22',
    '2026-06-10 00:05:22'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    577,
    210036,
    187,
    'submitted',
    71,
    NULL,
    '2026-06-10 00:05:22',
    '2026-06-10 00:05:22'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    578,
    210036,
    188,
    'submitted',
    63,
    NULL,
    '2026-06-10 00:05:22',
    '2026-06-10 00:05:22'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    579,
    210036,
    189,
    'submitted',
    84,
    NULL,
    '2026-06-10 00:05:22',
    '2026-06-10 00:05:22'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    580,
    210036,
    190,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:22',
    '2026-06-10 00:05:22'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    581,
    210036,
    191,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:22',
    '2026-06-10 00:05:22'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    582,
    210036,
    192,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:22',
    '2026-06-10 00:05:22'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    583,
    210036,
    193,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:23',
    '2026-06-10 00:05:23'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    584,
    210036,
    194,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:23',
    '2026-06-10 00:05:23'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    585,
    210036,
    195,
    'overdue',
    NULL,
    NULL,
    '2026-06-10 00:05:23',
    '2026-06-10 00:05:23'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    586,
    210036,
    196,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:23',
    '2026-06-10 00:05:23'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    587,
    210036,
    197,
    'overdue',
    NULL,
    NULL,
    '2026-06-10 00:05:23',
    '2026-06-10 00:05:23'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    588,
    210036,
    198,
    'submitted',
    73,
    NULL,
    '2026-06-10 00:05:23',
    '2026-06-10 00:05:23'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    589,
    210036,
    199,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:23',
    '2026-06-10 00:05:23'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    590,
    210036,
    200,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:23',
    '2026-06-10 00:05:23'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    591,
    210036,
    201,
    'submitted',
    77,
    NULL,
    '2026-06-10 00:05:24',
    '2026-06-10 00:05:24'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    592,
    210036,
    202,
    'submitted',
    85,
    NULL,
    '2026-06-10 00:05:24',
    '2026-06-10 00:05:24'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    593,
    210036,
    203,
    'submitted',
    91,
    NULL,
    '2026-06-10 00:05:24',
    '2026-06-10 00:05:24'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    594,
    210036,
    204,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:24',
    '2026-06-10 00:05:24'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    595,
    210036,
    205,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:24',
    '2026-06-10 00:05:24'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    596,
    210037,
    281,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:24',
    '2026-06-10 00:05:24'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    597,
    210037,
    282,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:24',
    '2026-06-10 00:05:24'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    598,
    210037,
    283,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:24',
    '2026-06-10 00:05:24'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    599,
    210037,
    284,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:25',
    '2026-06-10 00:05:25'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    600,
    210037,
    285,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:25',
    '2026-06-10 00:05:25'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    601,
    210037,
    286,
    'submitted',
    78,
    NULL,
    '2026-06-10 00:05:25',
    '2026-06-10 00:05:25'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    602,
    210037,
    287,
    'submitted',
    63,
    NULL,
    '2026-06-10 00:05:25',
    '2026-06-10 00:05:25'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    603,
    210037,
    288,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:25',
    '2026-06-10 00:05:25'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    604,
    210037,
    289,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:25',
    '2026-06-10 00:05:25'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    605,
    210037,
    290,
    'submitted',
    62,
    NULL,
    '2026-06-10 00:05:25',
    '2026-06-10 00:05:25'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    606,
    210037,
    291,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:25',
    '2026-06-10 00:05:25'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    607,
    210037,
    292,
    'submitted',
    77,
    NULL,
    '2026-06-10 00:05:26',
    '2026-06-10 00:05:26'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    608,
    210037,
    293,
    'submitted',
    67,
    NULL,
    '2026-06-10 00:05:26',
    '2026-06-10 00:05:26'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    609,
    210037,
    294,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:26',
    '2026-06-10 00:05:26'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    610,
    210037,
    295,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:26',
    '2026-06-10 00:05:26'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    611,
    210037,
    296,
    'submitted',
    75,
    NULL,
    '2026-06-10 00:05:26',
    '2026-06-10 00:05:26'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    612,
    210037,
    297,
    'submitted',
    79,
    NULL,
    '2026-06-10 00:05:26',
    '2026-06-10 00:05:26'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    613,
    210037,
    298,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:26',
    '2026-06-10 00:05:26'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    614,
    210037,
    299,
    'submitted',
    72,
    NULL,
    '2026-06-10 00:05:26',
    '2026-06-10 00:05:26'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    615,
    210037,
    300,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:26',
    '2026-06-10 00:05:26'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    616,
    210038,
    246,
    'submitted',
    66,
    NULL,
    '2026-06-10 00:05:27',
    '2026-06-10 00:05:27'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    617,
    210038,
    247,
    'submitted',
    67,
    NULL,
    '2026-06-10 00:05:27',
    '2026-06-10 00:05:27'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    618,
    210038,
    248,
    'submitted',
    79,
    NULL,
    '2026-06-10 00:05:27',
    '2026-06-10 00:05:27'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    619,
    210038,
    249,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:27',
    '2026-06-10 00:05:27'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    620,
    210038,
    250,
    'submitted',
    93,
    NULL,
    '2026-06-10 00:05:27',
    '2026-06-10 00:05:27'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    621,
    210038,
    251,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:27',
    '2026-06-10 00:05:27'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    622,
    210038,
    252,
    'submitted',
    73,
    NULL,
    '2026-06-10 00:05:27',
    '2026-06-10 00:05:27'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    623,
    210038,
    253,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:27',
    '2026-06-10 00:05:27'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    624,
    210038,
    254,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:28',
    '2026-06-10 00:05:28'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    625,
    210038,
    255,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:28',
    '2026-06-10 00:05:28'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    626,
    210038,
    256,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:28',
    '2026-06-10 00:05:28'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    627,
    210038,
    257,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:28',
    '2026-06-10 00:05:28'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    628,
    210038,
    258,
    'submitted',
    77,
    NULL,
    '2026-06-10 00:05:28',
    '2026-06-10 00:05:28'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    629,
    210038,
    259,
    'submitted',
    96,
    NULL,
    '2026-06-10 00:05:28',
    '2026-06-10 00:05:28'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    630,
    210038,
    260,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:28',
    '2026-06-10 00:05:28'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    631,
    210038,
    261,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:28',
    '2026-06-10 00:05:28'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    632,
    210038,
    262,
    'submitted',
    72,
    NULL,
    '2026-06-10 00:05:28',
    '2026-06-10 00:05:28'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    633,
    210038,
    263,
    'submitted',
    68,
    NULL,
    '2026-06-10 00:05:28',
    '2026-06-10 00:05:28'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    634,
    210038,
    264,
    'submitted',
    99,
    NULL,
    '2026-06-10 00:05:29',
    '2026-06-10 00:05:29'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    635,
    210038,
    265,
    'submitted',
    74,
    NULL,
    '2026-06-10 00:05:29',
    '2026-06-10 00:05:29'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    636,
    210039,
    266,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:29',
    '2026-06-10 00:05:29'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    637,
    210039,
    267,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:29',
    '2026-06-10 00:05:29'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    638,
    210039,
    268,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:29',
    '2026-06-10 00:05:29'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    639,
    210039,
    269,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:29',
    '2026-06-10 00:05:29'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    640,
    210039,
    270,
    'submitted',
    88,
    NULL,
    '2026-06-10 00:05:29',
    '2026-06-10 00:05:29'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    641,
    210039,
    271,
    'submitted',
    78,
    NULL,
    '2026-06-10 00:05:29',
    '2026-06-10 00:05:29'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    642,
    210039,
    272,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:29',
    '2026-06-10 00:05:29'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    643,
    210039,
    273,
    'submitted',
    81,
    NULL,
    '2026-06-10 00:05:30',
    '2026-06-10 00:05:30'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    644,
    210039,
    274,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:30',
    '2026-06-10 00:05:30'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    645,
    210039,
    275,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:30',
    '2026-06-10 00:05:30'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    646,
    210039,
    276,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:30',
    '2026-06-10 00:05:30'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    647,
    210039,
    277,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:30',
    '2026-06-10 00:05:30'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    648,
    210039,
    278,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:30',
    '2026-06-10 00:05:30'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    649,
    210039,
    279,
    'submitted',
    66,
    NULL,
    '2026-06-10 00:05:30',
    '2026-06-10 00:05:30'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    650,
    210039,
    280,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:30',
    '2026-06-10 00:05:30'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    651,
    210039,
    281,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:30',
    '2026-06-10 00:05:30'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    652,
    210039,
    282,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:30',
    '2026-06-10 00:05:30'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    653,
    210039,
    283,
    'submitted',
    98,
    NULL,
    '2026-06-10 00:05:30',
    '2026-06-10 00:05:30'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    654,
    210039,
    284,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:31',
    '2026-06-10 00:05:31'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    655,
    210039,
    285,
    'submitted',
    98,
    NULL,
    '2026-06-10 00:05:31',
    '2026-06-10 00:05:31'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    656,
    210040,
    241,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:31',
    '2026-06-10 00:05:31'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    657,
    210040,
    242,
    'submitted',
    65,
    NULL,
    '2026-06-10 00:05:31',
    '2026-06-10 00:05:31'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    658,
    210040,
    243,
    'submitted',
    96,
    NULL,
    '2026-06-10 00:05:31',
    '2026-06-10 00:05:31'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    659,
    210040,
    244,
    'submitted',
    79,
    NULL,
    '2026-06-10 00:05:31',
    '2026-06-10 00:05:31'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    660,
    210040,
    245,
    'submitted',
    71,
    NULL,
    '2026-06-10 00:05:31',
    '2026-06-10 00:05:31'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    661,
    210040,
    246,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:31',
    '2026-06-10 00:05:31'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    662,
    210040,
    247,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:31',
    '2026-06-10 00:05:31'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    663,
    210040,
    248,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:31',
    '2026-06-10 00:05:31'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    664,
    210040,
    249,
    'submitted',
    91,
    NULL,
    '2026-06-10 00:05:31',
    '2026-06-10 00:05:31'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    665,
    210040,
    250,
    'submitted',
    76,
    NULL,
    '2026-06-10 00:05:31',
    '2026-06-10 00:05:31'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    666,
    210040,
    251,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:31',
    '2026-06-10 00:05:31'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    667,
    210040,
    252,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:32',
    '2026-06-10 00:05:32'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    668,
    210040,
    253,
    'submitted',
    92,
    NULL,
    '2026-06-10 00:05:32',
    '2026-06-10 00:05:32'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    669,
    210040,
    254,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:32',
    '2026-06-10 00:05:32'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    670,
    210040,
    255,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:32',
    '2026-06-10 00:05:32'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    671,
    210040,
    256,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:32',
    '2026-06-10 00:05:32'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    672,
    210040,
    257,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:32',
    '2026-06-10 00:05:32'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    673,
    210040,
    258,
    'submitted',
    76,
    NULL,
    '2026-06-10 00:05:32',
    '2026-06-10 00:05:32'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    674,
    210040,
    259,
    'submitted',
    80,
    NULL,
    '2026-06-10 00:05:33',
    '2026-06-10 00:05:33'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    675,
    210040,
    260,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:33',
    '2026-06-10 00:05:33'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    676,
    210041,
    301,
    'submitted',
    92,
    NULL,
    '2026-06-10 00:05:33',
    '2026-06-10 00:05:33'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    677,
    210041,
    302,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:33',
    '2026-06-10 00:05:33'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    678,
    210041,
    303,
    'submitted',
    66,
    NULL,
    '2026-06-10 00:05:33',
    '2026-06-10 00:05:33'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    679,
    210041,
    304,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:34',
    '2026-06-10 00:05:34'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    680,
    210041,
    305,
    'submitted',
    89,
    NULL,
    '2026-06-10 00:05:34',
    '2026-06-10 00:05:34'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    681,
    210041,
    306,
    'submitted',
    63,
    NULL,
    '2026-06-10 00:05:34',
    '2026-06-10 00:05:34'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    682,
    210041,
    307,
    'submitted',
    69,
    NULL,
    '2026-06-10 00:05:34',
    '2026-06-10 00:05:34'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    683,
    210041,
    308,
    'submitted',
    91,
    NULL,
    '2026-06-10 00:05:34',
    '2026-06-10 00:05:34'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    684,
    210041,
    309,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:34',
    '2026-06-10 00:05:34'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    685,
    210041,
    310,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:34',
    '2026-06-10 00:05:34'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    686,
    210041,
    311,
    'submitted',
    77,
    NULL,
    '2026-06-10 00:05:35',
    '2026-06-10 00:05:35'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    687,
    210041,
    312,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:35',
    '2026-06-10 00:05:35'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    688,
    210041,
    313,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:35',
    '2026-06-10 00:05:35'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    689,
    210041,
    314,
    'submitted',
    67,
    NULL,
    '2026-06-10 00:05:35',
    '2026-06-10 00:05:35'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    690,
    210041,
    315,
    'submitted',
    87,
    NULL,
    '2026-06-10 00:05:35',
    '2026-06-10 00:05:35'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    691,
    210041,
    316,
    'submitted',
    90,
    NULL,
    '2026-06-10 00:05:35',
    '2026-06-10 00:05:35'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    692,
    210041,
    317,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:36',
    '2026-06-10 00:05:36'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    693,
    210041,
    318,
    'submitted',
    75,
    NULL,
    '2026-06-10 00:05:36',
    '2026-06-10 00:05:36'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    694,
    210041,
    319,
    'submitted',
    99,
    NULL,
    '2026-06-10 00:05:36',
    '2026-06-10 00:05:36'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    695,
    210041,
    320,
    'submitted',
    90,
    NULL,
    '2026-06-10 00:05:36',
    '2026-06-10 00:05:36'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    696,
    210042,
    226,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:36',
    '2026-06-10 00:05:36'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    697,
    210042,
    227,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:36',
    '2026-06-10 00:05:36'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    698,
    210042,
    228,
    'submitted',
    71,
    NULL,
    '2026-06-10 00:05:37',
    '2026-06-10 00:05:37'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    699,
    210042,
    229,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:37',
    '2026-06-10 00:05:37'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    700,
    210042,
    230,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:37',
    '2026-06-10 00:05:37'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    701,
    210042,
    231,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:37',
    '2026-06-10 00:05:37'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    702,
    210042,
    232,
    'submitted',
    66,
    NULL,
    '2026-06-10 00:05:37',
    '2026-06-10 00:05:37'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    703,
    210042,
    233,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:37',
    '2026-06-10 00:05:37'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    704,
    210042,
    234,
    'submitted',
    83,
    NULL,
    '2026-06-10 00:05:37',
    '2026-06-10 00:05:37'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    705,
    210042,
    235,
    'submitted',
    65,
    NULL,
    '2026-06-10 00:05:38',
    '2026-06-10 00:05:38'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    706,
    210042,
    236,
    'submitted',
    90,
    NULL,
    '2026-06-10 00:05:38',
    '2026-06-10 00:05:38'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    707,
    210042,
    237,
    'submitted',
    92,
    NULL,
    '2026-06-10 00:05:38',
    '2026-06-10 00:05:38'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    708,
    210042,
    238,
    'submitted',
    80,
    NULL,
    '2026-06-10 00:05:38',
    '2026-06-10 00:05:38'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    709,
    210042,
    239,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:38',
    '2026-06-10 00:05:38'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    710,
    210042,
    240,
    'submitted',
    78,
    NULL,
    '2026-06-10 00:05:38',
    '2026-06-10 00:05:38'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    711,
    210042,
    241,
    'submitted',
    76,
    NULL,
    '2026-06-10 00:05:38',
    '2026-06-10 00:05:38'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    712,
    210042,
    242,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:38',
    '2026-06-10 00:05:38'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    713,
    210042,
    243,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:38',
    '2026-06-10 00:05:38'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    714,
    210042,
    244,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:39',
    '2026-06-10 00:05:39'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    715,
    210042,
    245,
    'submitted',
    78,
    NULL,
    '2026-06-10 00:05:39',
    '2026-06-10 00:05:39'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    716,
    210043,
    266,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:39',
    '2026-06-10 00:05:39'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    717,
    210043,
    267,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:39',
    '2026-06-10 00:05:39'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    718,
    210043,
    268,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:39',
    '2026-06-10 00:05:39'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    719,
    210043,
    269,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:39',
    '2026-06-10 00:05:39'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    720,
    210043,
    270,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:39',
    '2026-06-10 00:05:39'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    721,
    210043,
    271,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:39',
    '2026-06-10 00:05:39'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    722,
    210043,
    272,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:39',
    '2026-06-10 00:05:39'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    723,
    210043,
    273,
    'submitted',
    82,
    NULL,
    '2026-06-10 00:05:40',
    '2026-06-10 00:05:40'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    724,
    210043,
    274,
    'submitted',
    66,
    NULL,
    '2026-06-10 00:05:40',
    '2026-06-10 00:05:40'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    725,
    210043,
    275,
    'submitted',
    86,
    NULL,
    '2026-06-10 00:05:40',
    '2026-06-10 00:05:40'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    726,
    210043,
    276,
    'submitted',
    68,
    NULL,
    '2026-06-10 00:05:40',
    '2026-06-10 00:05:40'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    727,
    210043,
    277,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:40',
    '2026-06-10 00:05:40'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    728,
    210043,
    278,
    'submitted',
    77,
    NULL,
    '2026-06-10 00:05:40',
    '2026-06-10 00:05:40'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    729,
    210043,
    279,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:40',
    '2026-06-10 00:05:40'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    730,
    210043,
    280,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:40',
    '2026-06-10 00:05:40'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    731,
    210043,
    281,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:40',
    '2026-06-10 00:05:40'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    732,
    210043,
    282,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:41',
    '2026-06-10 00:05:41'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    733,
    210043,
    283,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:41',
    '2026-06-10 00:05:41'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    734,
    210043,
    284,
    'submitted',
    69,
    NULL,
    '2026-06-10 00:05:41',
    '2026-06-10 00:05:41'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    735,
    210043,
    285,
    'submitted',
    68,
    NULL,
    '2026-06-10 00:05:41',
    '2026-06-10 00:05:41'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    736,
    210044,
    246,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:41',
    '2026-06-10 00:05:41'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    737,
    210044,
    247,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:41',
    '2026-06-10 00:05:41'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    738,
    210044,
    248,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:41',
    '2026-06-10 00:05:41'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    739,
    210044,
    249,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:41',
    '2026-06-10 00:05:41'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    740,
    210044,
    250,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:41',
    '2026-06-10 00:05:41'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    741,
    210044,
    251,
    'submitted',
    78,
    NULL,
    '2026-06-10 00:05:42',
    '2026-06-10 00:05:42'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    742,
    210044,
    252,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:42',
    '2026-06-10 00:05:42'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    743,
    210044,
    253,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:42',
    '2026-06-10 00:05:42'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    744,
    210044,
    254,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:42',
    '2026-06-10 00:05:42'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    745,
    210044,
    255,
    'submitted',
    89,
    NULL,
    '2026-06-10 00:05:42',
    '2026-06-10 00:05:42'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    746,
    210044,
    256,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:42',
    '2026-06-10 00:05:42'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    747,
    210044,
    257,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:42',
    '2026-06-10 00:05:42'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    748,
    210044,
    258,
    'submitted',
    83,
    NULL,
    '2026-06-10 00:05:42',
    '2026-06-10 00:05:42'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    749,
    210044,
    259,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:42',
    '2026-06-10 00:05:42'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    750,
    210044,
    260,
    'submitted',
    89,
    NULL,
    '2026-06-10 00:05:42',
    '2026-06-10 00:05:42'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    751,
    210044,
    261,
    'submitted',
    70,
    NULL,
    '2026-06-10 00:05:43',
    '2026-06-10 00:05:43'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    752,
    210044,
    262,
    'submitted',
    88,
    NULL,
    '2026-06-10 00:05:43',
    '2026-06-10 00:05:43'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    753,
    210044,
    263,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:43',
    '2026-06-10 00:05:43'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    754,
    210044,
    264,
    'submitted',
    86,
    NULL,
    '2026-06-10 00:05:43',
    '2026-06-10 00:05:43'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    755,
    210044,
    265,
    'submitted',
    66,
    NULL,
    '2026-06-10 00:05:43',
    '2026-06-10 00:05:43'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    756,
    210045,
    206,
    'submitted',
    97,
    NULL,
    '2026-06-10 00:05:43',
    '2026-06-10 00:05:43'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    757,
    210045,
    207,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:43',
    '2026-06-10 00:05:43'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    758,
    210045,
    208,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:44',
    '2026-06-10 00:05:44'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    759,
    210045,
    209,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:44',
    '2026-06-10 00:05:44'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    760,
    210045,
    210,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:44',
    '2026-06-10 00:05:44'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    761,
    210045,
    211,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:44',
    '2026-06-10 00:05:44'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    762,
    210045,
    212,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:44',
    '2026-06-10 00:05:44'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    763,
    210045,
    213,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:44',
    '2026-06-10 00:05:44'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    764,
    210045,
    214,
    'submitted',
    64,
    NULL,
    '2026-06-10 00:05:44',
    '2026-06-10 00:05:44'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    765,
    210045,
    215,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:45',
    '2026-06-10 00:05:45'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    766,
    210045,
    216,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:45',
    '2026-06-10 00:05:45'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    767,
    210045,
    217,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:45',
    '2026-06-10 00:05:45'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    768,
    210045,
    218,
    'submitted',
    67,
    NULL,
    '2026-06-10 00:05:45',
    '2026-06-10 00:05:45'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    769,
    210045,
    219,
    'submitted',
    88,
    NULL,
    '2026-06-10 00:05:45',
    '2026-06-10 00:05:45'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    770,
    210045,
    220,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:45',
    '2026-06-10 00:05:45'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    771,
    210045,
    221,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:45',
    '2026-06-10 00:05:45'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    772,
    210045,
    222,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:45',
    '2026-06-10 00:05:45'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    773,
    210045,
    223,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:45',
    '2026-06-10 00:05:45'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    774,
    210045,
    224,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:45',
    '2026-06-10 00:05:45'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    775,
    210045,
    225,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:46',
    '2026-06-10 00:05:46'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    776,
    210046,
    221,
    'overdue',
    NULL,
    NULL,
    '2026-06-10 00:05:46',
    '2026-06-10 00:05:46'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    777,
    210046,
    222,
    'submitted',
    70,
    NULL,
    '2026-06-10 00:05:46',
    '2026-06-10 00:05:46'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    778,
    210046,
    223,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:46',
    '2026-06-10 00:05:46'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    779,
    210046,
    224,
    'submitted',
    96,
    NULL,
    '2026-06-10 00:05:46',
    '2026-06-10 00:05:46'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    780,
    210046,
    225,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:46',
    '2026-06-10 00:05:46'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    781,
    210046,
    226,
    'overdue',
    NULL,
    NULL,
    '2026-06-10 00:05:46',
    '2026-06-10 00:05:46'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    782,
    210046,
    227,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:46',
    '2026-06-10 00:05:46'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    783,
    210046,
    228,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:46',
    '2026-06-10 00:05:46'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    784,
    210046,
    229,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:47',
    '2026-06-10 00:05:47'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    785,
    210046,
    230,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:47',
    '2026-06-10 00:05:47'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    786,
    210046,
    231,
    'overdue',
    NULL,
    NULL,
    '2026-06-10 00:05:47',
    '2026-06-10 00:05:47'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    787,
    210046,
    232,
    'submitted',
    86,
    NULL,
    '2026-06-10 00:05:47',
    '2026-06-10 00:05:47'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    788,
    210046,
    233,
    'submitted',
    67,
    NULL,
    '2026-06-10 00:05:47',
    '2026-06-10 00:05:47'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    789,
    210046,
    234,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:47',
    '2026-06-10 00:05:47'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    790,
    210046,
    235,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:47',
    '2026-06-10 00:05:47'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    791,
    210046,
    236,
    'submitted',
    77,
    NULL,
    '2026-06-10 00:05:47',
    '2026-06-10 00:05:47'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    792,
    210046,
    237,
    'submitted',
    74,
    NULL,
    '2026-06-10 00:05:47',
    '2026-06-10 00:05:47'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    793,
    210046,
    238,
    'submitted',
    87,
    NULL,
    '2026-06-10 00:05:48',
    '2026-06-10 00:05:48'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    794,
    210046,
    239,
    'submitted',
    97,
    NULL,
    '2026-06-10 00:05:48',
    '2026-06-10 00:05:48'
  );
INSERT INTO
  `studentAssignments` (
    `id`,
    `studentId`,
    `assignmentId`,
    `status`,
    `score`,
    `submittedAt`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    795,
    210046,
    240,
    'pending',
    NULL,
    NULL,
    '2026-06-10 00:05:48',
    '2026-06-10 00:05:48'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: studentCourses
# ------------------------------------------------------------

INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    421,
    210027,
    33,
    1,
    'B',
    3.00,
    'completed',
    '2026-06-10 00:04:07',
    '2026-06-10 00:04:07'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    422,
    210027,
    34,
    1,
    'B',
    2.67,
    'completed',
    '2026-06-10 00:04:07',
    '2026-06-10 00:04:07'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    423,
    210027,
    35,
    1,
    'C+',
    3.33,
    'completed',
    '2026-06-10 00:04:07',
    '2026-06-10 00:04:07'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    424,
    210027,
    36,
    1,
    'C+',
    3.00,
    'completed',
    '2026-06-10 00:04:07',
    '2026-06-10 00:04:07'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    425,
    210027,
    37,
    2,
    'C+',
    3.00,
    'completed',
    '2026-06-10 00:04:07',
    '2026-06-10 00:04:07'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    426,
    210027,
    38,
    2,
    'B',
    3.00,
    'completed',
    '2026-06-10 00:04:07',
    '2026-06-10 00:04:07'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    427,
    210027,
    39,
    2,
    'C+',
    3.00,
    'completed',
    '2026-06-10 00:04:07',
    '2026-06-10 00:04:07'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    428,
    210027,
    40,
    2,
    'B',
    3.00,
    'completed',
    '2026-06-10 00:04:08',
    '2026-06-10 00:04:08'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    429,
    210027,
    41,
    3,
    'B',
    3.00,
    'completed',
    '2026-06-10 00:04:08',
    '2026-06-10 00:04:08'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    430,
    210027,
    42,
    3,
    'B+',
    3.00,
    'completed',
    '2026-06-10 00:04:08',
    '2026-06-10 00:04:08'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    431,
    210027,
    43,
    3,
    'C+',
    3.00,
    'completed',
    '2026-06-10 00:04:08',
    '2026-06-10 00:04:08'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    432,
    210027,
    44,
    3,
    'B',
    3.33,
    'completed',
    '2026-06-10 00:04:08',
    '2026-06-10 00:04:08'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    433,
    210027,
    45,
    4,
    'B',
    3.33,
    'completed',
    '2026-06-10 00:04:08',
    '2026-06-10 00:04:08'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    434,
    210027,
    46,
    4,
    'B',
    3.33,
    'completed',
    '2026-06-10 00:04:08',
    '2026-06-10 00:04:08'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    435,
    210027,
    47,
    4,
    'C+',
    3.00,
    'completed',
    '2026-06-10 00:04:08',
    '2026-06-10 00:04:08'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    436,
    210027,
    48,
    4,
    'B+',
    3.00,
    'completed',
    '2026-06-10 00:04:08',
    '2026-06-10 00:04:08'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    437,
    210027,
    49,
    5,
    'B',
    3.33,
    'completed',
    '2026-06-10 00:04:08',
    '2026-06-10 00:04:08'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    438,
    210027,
    50,
    5,
    'B-',
    3.33,
    'completed',
    '2026-06-10 00:04:09',
    '2026-06-10 00:04:09'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    439,
    210027,
    51,
    5,
    'B',
    2.33,
    'completed',
    '2026-06-10 00:04:09',
    '2026-06-10 00:04:09'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    440,
    210027,
    52,
    5,
    'B+',
    3.33,
    'completed',
    '2026-06-10 00:04:09',
    '2026-06-10 00:04:09'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    441,
    210027,
    53,
    6,
    'B+',
    2.67,
    'completed',
    '2026-06-10 00:04:09',
    '2026-06-10 00:04:09'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    442,
    210027,
    54,
    6,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:09',
    '2026-06-10 00:04:09'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    443,
    210027,
    55,
    6,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:09',
    '2026-06-10 00:04:09'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    444,
    210027,
    56,
    6,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:09',
    '2026-06-10 00:04:09'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    445,
    210027,
    57,
    7,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:09',
    '2026-06-10 00:04:09'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    446,
    210028,
    33,
    1,
    'F',
    1.67,
    'completed',
    '2026-06-10 00:04:09',
    '2026-06-10 00:04:09'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    447,
    210028,
    34,
    1,
    'F',
    2.00,
    'completed',
    '2026-06-10 00:04:10',
    '2026-06-10 00:04:10'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    448,
    210028,
    35,
    1,
    'D',
    0.00,
    'completed',
    '2026-06-10 00:04:10',
    '2026-06-10 00:04:10'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    449,
    210028,
    36,
    1,
    'C',
    0.00,
    'completed',
    '2026-06-10 00:04:10',
    '2026-06-10 00:04:10'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    450,
    210028,
    37,
    2,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:10',
    '2026-06-10 00:04:10'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    451,
    210028,
    38,
    2,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:10',
    '2026-06-10 00:04:10'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    452,
    210028,
    39,
    2,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:10',
    '2026-06-10 00:04:10'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    453,
    210028,
    40,
    2,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:10',
    '2026-06-10 00:04:10'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    454,
    210029,
    33,
    1,
    'A-',
    4.00,
    'completed',
    '2026-06-10 00:04:10',
    '2026-06-10 00:04:10'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    455,
    210029,
    34,
    1,
    'A-',
    3.67,
    'completed',
    '2026-06-10 00:04:11',
    '2026-06-10 00:04:11'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    456,
    210029,
    35,
    1,
    'A-',
    4.00,
    'completed',
    '2026-06-10 00:04:11',
    '2026-06-10 00:04:11'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    457,
    210029,
    36,
    1,
    'A-',
    4.00,
    'completed',
    '2026-06-10 00:04:11',
    '2026-06-10 00:04:11'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    458,
    210029,
    37,
    2,
    'A',
    4.00,
    'completed',
    '2026-06-10 00:04:11',
    '2026-06-10 00:04:11'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    459,
    210029,
    38,
    2,
    'A-',
    3.67,
    'completed',
    '2026-06-10 00:04:11',
    '2026-06-10 00:04:11'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    460,
    210029,
    39,
    2,
    'B+',
    4.00,
    'completed',
    '2026-06-10 00:04:11',
    '2026-06-10 00:04:11'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    461,
    210029,
    40,
    2,
    'A-',
    4.00,
    'completed',
    '2026-06-10 00:04:11',
    '2026-06-10 00:04:11'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    462,
    210029,
    41,
    3,
    'A',
    3.67,
    'completed',
    '2026-06-10 00:04:11',
    '2026-06-10 00:04:11'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    463,
    210029,
    42,
    3,
    'A',
    4.00,
    'completed',
    '2026-06-10 00:04:11',
    '2026-06-10 00:04:11'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    464,
    210029,
    43,
    3,
    'A-',
    3.67,
    'completed',
    '2026-06-10 00:04:12',
    '2026-06-10 00:04:12'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    465,
    210029,
    44,
    3,
    'A-',
    3.67,
    'completed',
    '2026-06-10 00:04:12',
    '2026-06-10 00:04:12'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    466,
    210029,
    45,
    4,
    'B+',
    3.67,
    'completed',
    '2026-06-10 00:04:12',
    '2026-06-10 00:04:12'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    467,
    210029,
    46,
    4,
    'A',
    4.00,
    'completed',
    '2026-06-10 00:04:12',
    '2026-06-10 00:04:12'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    468,
    210029,
    47,
    4,
    'A-',
    4.00,
    'completed',
    '2026-06-10 00:04:12',
    '2026-06-10 00:04:12'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    469,
    210029,
    48,
    4,
    'A-',
    3.33,
    'completed',
    '2026-06-10 00:04:12',
    '2026-06-10 00:04:12'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    470,
    210029,
    49,
    5,
    'A',
    3.67,
    'completed',
    '2026-06-10 00:04:12',
    '2026-06-10 00:04:12'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    471,
    210029,
    50,
    5,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:12',
    '2026-06-10 00:04:12'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    472,
    210029,
    51,
    5,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:12',
    '2026-06-10 00:04:12'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    473,
    210029,
    52,
    5,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:12',
    '2026-06-10 00:04:12'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    474,
    210029,
    53,
    6,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:13',
    '2026-06-10 00:04:13'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    475,
    210030,
    33,
    1,
    'C+',
    3.00,
    'completed',
    '2026-06-10 00:04:13',
    '2026-06-10 00:04:13'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    476,
    210030,
    34,
    1,
    'C+',
    2.67,
    'completed',
    '2026-06-10 00:04:13',
    '2026-06-10 00:04:13'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    477,
    210030,
    35,
    1,
    'B',
    2.33,
    'completed',
    '2026-06-10 00:04:13',
    '2026-06-10 00:04:13'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    478,
    210030,
    36,
    1,
    'B-',
    3.33,
    'completed',
    '2026-06-10 00:04:13',
    '2026-06-10 00:04:13'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    479,
    210030,
    37,
    2,
    'B',
    2.67,
    'completed',
    '2026-06-10 00:04:13',
    '2026-06-10 00:04:13'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    480,
    210030,
    38,
    2,
    'B-',
    2.33,
    'completed',
    '2026-06-10 00:04:13',
    '2026-06-10 00:04:13'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    481,
    210030,
    39,
    2,
    'B-',
    3.00,
    'completed',
    '2026-06-10 00:04:13',
    '2026-06-10 00:04:13'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    482,
    210030,
    40,
    2,
    'B',
    2.67,
    'completed',
    '2026-06-10 00:04:13',
    '2026-06-10 00:04:13'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    483,
    210030,
    41,
    3,
    'C+',
    2.67,
    'completed',
    '2026-06-10 00:04:13',
    '2026-06-10 00:04:13'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    484,
    210030,
    42,
    3,
    'B+',
    3.00,
    'completed',
    '2026-06-10 00:04:14',
    '2026-06-10 00:04:14'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    485,
    210030,
    43,
    3,
    'B',
    3.00,
    'completed',
    '2026-06-10 00:04:14',
    '2026-06-10 00:04:14'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    486,
    210030,
    44,
    3,
    'B+',
    3.33,
    'completed',
    '2026-06-10 00:04:14',
    '2026-06-10 00:04:14'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    487,
    210030,
    45,
    4,
    'B',
    3.00,
    'completed',
    '2026-06-10 00:04:14',
    '2026-06-10 00:04:14'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    488,
    210030,
    46,
    4,
    'C+',
    3.00,
    'completed',
    '2026-06-10 00:04:14',
    '2026-06-10 00:04:14'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    489,
    210030,
    47,
    4,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:14',
    '2026-06-10 00:04:14'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    490,
    210030,
    48,
    4,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:14',
    '2026-06-10 00:04:14'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    491,
    210030,
    49,
    5,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:14',
    '2026-06-10 00:04:14'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    492,
    210030,
    50,
    5,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:14',
    '2026-06-10 00:04:14'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    493,
    210031,
    33,
    1,
    'A-',
    3.67,
    'completed',
    '2026-06-10 00:04:15',
    '2026-06-10 00:04:15'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    494,
    210031,
    34,
    1,
    'A-',
    4.00,
    'completed',
    '2026-06-10 00:04:15',
    '2026-06-10 00:04:15'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    495,
    210031,
    35,
    1,
    'A-',
    4.00,
    'completed',
    '2026-06-10 00:04:15',
    '2026-06-10 00:04:15'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    496,
    210031,
    36,
    1,
    'A-',
    4.00,
    'completed',
    '2026-06-10 00:04:15',
    '2026-06-10 00:04:15'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    497,
    210031,
    37,
    2,
    'A',
    3.33,
    'completed',
    '2026-06-10 00:04:15',
    '2026-06-10 00:04:15'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    498,
    210031,
    38,
    2,
    'A-',
    4.00,
    'completed',
    '2026-06-10 00:04:15',
    '2026-06-10 00:04:15'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    499,
    210031,
    39,
    2,
    'A',
    3.33,
    'completed',
    '2026-06-10 00:04:15',
    '2026-06-10 00:04:15'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    500,
    210031,
    40,
    2,
    'A-',
    3.67,
    'completed',
    '2026-06-10 00:04:15',
    '2026-06-10 00:04:15'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    501,
    210031,
    41,
    3,
    'B+',
    4.00,
    'completed',
    '2026-06-10 00:04:15',
    '2026-06-10 00:04:15'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    502,
    210031,
    42,
    3,
    'A-',
    3.67,
    'completed',
    '2026-06-10 00:04:16',
    '2026-06-10 00:04:16'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    503,
    210031,
    43,
    3,
    'A-',
    3.67,
    'completed',
    '2026-06-10 00:04:16',
    '2026-06-10 00:04:16'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    504,
    210031,
    44,
    3,
    'A-',
    3.33,
    'completed',
    '2026-06-10 00:04:16',
    '2026-06-10 00:04:16'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    505,
    210031,
    45,
    4,
    'A',
    4.00,
    'completed',
    '2026-06-10 00:04:16',
    '2026-06-10 00:04:16'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    506,
    210031,
    46,
    4,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:16',
    '2026-06-10 00:04:16'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    507,
    210031,
    47,
    4,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:16',
    '2026-06-10 00:04:16'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    508,
    210031,
    48,
    4,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:16',
    '2026-06-10 00:04:16'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    509,
    210031,
    49,
    5,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:16',
    '2026-06-10 00:04:16'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    510,
    210032,
    33,
    1,
    'F',
    1.67,
    'completed',
    '2026-06-10 00:04:17',
    '2026-06-10 00:04:17'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    511,
    210032,
    34,
    1,
    'D+',
    0.00,
    'completed',
    '2026-06-10 00:04:17',
    '2026-06-10 00:04:17'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    512,
    210032,
    35,
    1,
    'D+',
    1.33,
    'completed',
    '2026-06-10 00:04:17',
    '2026-06-10 00:04:17'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    513,
    210032,
    36,
    1,
    'C+',
    1.33,
    'completed',
    '2026-06-10 00:04:17',
    '2026-06-10 00:04:17'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    514,
    210032,
    37,
    2,
    'D',
    0.00,
    'completed',
    '2026-06-10 00:04:17',
    '2026-06-10 00:04:17'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    515,
    210032,
    38,
    2,
    'F',
    2.33,
    'completed',
    '2026-06-10 00:04:17',
    '2026-06-10 00:04:17'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    516,
    210032,
    39,
    2,
    'C-',
    2.33,
    'completed',
    '2026-06-10 00:04:17',
    '2026-06-10 00:04:17'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    517,
    210032,
    40,
    2,
    'F',
    2.33,
    'completed',
    '2026-06-10 00:04:17',
    '2026-06-10 00:04:17'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    518,
    210032,
    41,
    3,
    'C+',
    2.00,
    'completed',
    '2026-06-10 00:04:17',
    '2026-06-10 00:04:17'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    519,
    210032,
    42,
    3,
    'C',
    2.00,
    'completed',
    '2026-06-10 00:04:17',
    '2026-06-10 00:04:17'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    520,
    210032,
    43,
    3,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:18',
    '2026-06-10 00:04:18'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    521,
    210032,
    44,
    3,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:18',
    '2026-06-10 00:04:18'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    522,
    210032,
    45,
    4,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:18',
    '2026-06-10 00:04:18'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    523,
    210032,
    46,
    4,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:18',
    '2026-06-10 00:04:18'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    524,
    210033,
    33,
    1,
    'B+',
    3.33,
    'completed',
    '2026-06-10 00:04:18',
    '2026-06-10 00:04:18'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    525,
    210033,
    34,
    1,
    'A',
    3.33,
    'completed',
    '2026-06-10 00:04:18',
    '2026-06-10 00:04:18'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    526,
    210033,
    35,
    1,
    'A-',
    3.33,
    'completed',
    '2026-06-10 00:04:18',
    '2026-06-10 00:04:18'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    527,
    210033,
    36,
    1,
    'A-',
    3.00,
    'completed',
    '2026-06-10 00:04:18',
    '2026-06-10 00:04:18'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    528,
    210033,
    37,
    2,
    'B+',
    3.67,
    'completed',
    '2026-06-10 00:04:18',
    '2026-06-10 00:04:18'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    529,
    210033,
    38,
    2,
    'A-',
    3.33,
    'completed',
    '2026-06-10 00:04:18',
    '2026-06-10 00:04:18'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    530,
    210033,
    39,
    2,
    'B+',
    3.00,
    'completed',
    '2026-06-10 00:04:19',
    '2026-06-10 00:04:19'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    531,
    210033,
    40,
    2,
    'A',
    3.33,
    'completed',
    '2026-06-10 00:04:19',
    '2026-06-10 00:04:19'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    532,
    210033,
    41,
    3,
    'A',
    3.00,
    'completed',
    '2026-06-10 00:04:19',
    '2026-06-10 00:04:19'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    533,
    210033,
    42,
    3,
    'B+',
    3.67,
    'completed',
    '2026-06-10 00:04:19',
    '2026-06-10 00:04:19'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    534,
    210033,
    43,
    3,
    'A-',
    4.00,
    'completed',
    '2026-06-10 00:04:19',
    '2026-06-10 00:04:19'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    535,
    210033,
    44,
    3,
    'B+',
    4.00,
    'completed',
    '2026-06-10 00:04:19',
    '2026-06-10 00:04:19'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    536,
    210033,
    45,
    4,
    'A',
    3.00,
    'completed',
    '2026-06-10 00:04:19',
    '2026-06-10 00:04:19'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    537,
    210033,
    46,
    4,
    'B+',
    3.33,
    'completed',
    '2026-06-10 00:04:19',
    '2026-06-10 00:04:19'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    538,
    210033,
    47,
    4,
    'B+',
    3.33,
    'completed',
    '2026-06-10 00:04:19',
    '2026-06-10 00:04:19'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    539,
    210033,
    48,
    4,
    'A-',
    3.33,
    'completed',
    '2026-06-10 00:04:20',
    '2026-06-10 00:04:20'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    540,
    210033,
    49,
    5,
    'A',
    3.33,
    'completed',
    '2026-06-10 00:04:20',
    '2026-06-10 00:04:20'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    541,
    210033,
    50,
    5,
    'A',
    3.00,
    'completed',
    '2026-06-10 00:04:20',
    '2026-06-10 00:04:20'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    542,
    210033,
    51,
    5,
    'A',
    3.33,
    'completed',
    '2026-06-10 00:04:20',
    '2026-06-10 00:04:20'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    543,
    210033,
    52,
    5,
    'A',
    3.00,
    'completed',
    '2026-06-10 00:04:20',
    '2026-06-10 00:04:20'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    544,
    210033,
    53,
    6,
    'B',
    3.33,
    'completed',
    '2026-06-10 00:04:20',
    '2026-06-10 00:04:20'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    545,
    210033,
    54,
    6,
    'A',
    3.67,
    'completed',
    '2026-06-10 00:04:20',
    '2026-06-10 00:04:20'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    546,
    210033,
    55,
    6,
    'B',
    3.67,
    'completed',
    '2026-06-10 00:04:20',
    '2026-06-10 00:04:20'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    547,
    210033,
    56,
    6,
    'B',
    3.00,
    'completed',
    '2026-06-10 00:04:20',
    '2026-06-10 00:04:20'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    548,
    210033,
    57,
    7,
    'A',
    3.33,
    'completed',
    '2026-06-10 00:04:20',
    '2026-06-10 00:04:20'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    549,
    210033,
    58,
    7,
    'B+',
    4.00,
    'completed',
    '2026-06-10 00:04:21',
    '2026-06-10 00:04:21'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    550,
    210033,
    59,
    7,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:21',
    '2026-06-10 00:04:21'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    551,
    210033,
    60,
    7,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:21',
    '2026-06-10 00:04:21'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    552,
    210033,
    61,
    8,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:21',
    '2026-06-10 00:04:21'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    553,
    210033,
    62,
    8,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:21',
    '2026-06-10 00:04:21'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    554,
    210034,
    33,
    1,
    'C+',
    3.33,
    'completed',
    '2026-06-10 00:04:21',
    '2026-06-10 00:04:21'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    555,
    210034,
    34,
    1,
    'B',
    2.33,
    'completed',
    '2026-06-10 00:04:21',
    '2026-06-10 00:04:21'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    556,
    210034,
    35,
    1,
    'B',
    2.33,
    'completed',
    '2026-06-10 00:04:21',
    '2026-06-10 00:04:21'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    557,
    210034,
    36,
    1,
    'B',
    2.67,
    'completed',
    '2026-06-10 00:04:21',
    '2026-06-10 00:04:21'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    558,
    210034,
    37,
    2,
    'B-',
    2.67,
    'completed',
    '2026-06-10 00:04:21',
    '2026-06-10 00:04:21'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    559,
    210034,
    38,
    2,
    'B',
    2.67,
    'completed',
    '2026-06-10 00:04:22',
    '2026-06-10 00:04:22'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    560,
    210034,
    39,
    2,
    'C+',
    3.00,
    'completed',
    '2026-06-10 00:04:22',
    '2026-06-10 00:04:22'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    561,
    210034,
    40,
    2,
    'B-',
    3.00,
    'completed',
    '2026-06-10 00:04:22',
    '2026-06-10 00:04:22'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    562,
    210034,
    41,
    3,
    'B-',
    2.67,
    'completed',
    '2026-06-10 00:04:22',
    '2026-06-10 00:04:22'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    563,
    210034,
    42,
    3,
    'B+',
    3.00,
    'completed',
    '2026-06-10 00:04:22',
    '2026-06-10 00:04:22'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    564,
    210034,
    43,
    3,
    'C+',
    2.67,
    'completed',
    '2026-06-10 00:04:22',
    '2026-06-10 00:04:22'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    565,
    210034,
    44,
    3,
    'B',
    3.33,
    'completed',
    '2026-06-10 00:04:22',
    '2026-06-10 00:04:22'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    566,
    210034,
    45,
    4,
    'B',
    3.00,
    'completed',
    '2026-06-10 00:04:22',
    '2026-06-10 00:04:22'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    567,
    210034,
    46,
    4,
    'C+',
    2.33,
    'completed',
    '2026-06-10 00:04:22',
    '2026-06-10 00:04:22'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    568,
    210034,
    47,
    4,
    'B-',
    3.00,
    'completed',
    '2026-06-10 00:04:22',
    '2026-06-10 00:04:22'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    569,
    210034,
    48,
    4,
    'B',
    2.33,
    'completed',
    '2026-06-10 00:04:22',
    '2026-06-10 00:04:22'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    570,
    210034,
    49,
    5,
    'B',
    2.67,
    'completed',
    '2026-06-10 00:04:22',
    '2026-06-10 00:04:22'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    571,
    210034,
    50,
    5,
    'C+',
    2.33,
    'completed',
    '2026-06-10 00:04:22',
    '2026-06-10 00:04:22'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    572,
    210034,
    51,
    5,
    'C+',
    2.33,
    'completed',
    '2026-06-10 00:04:23',
    '2026-06-10 00:04:23'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    573,
    210034,
    52,
    5,
    'B',
    3.33,
    'completed',
    '2026-06-10 00:04:23',
    '2026-06-10 00:04:23'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    574,
    210034,
    53,
    6,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:23',
    '2026-06-10 00:04:23'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    575,
    210034,
    54,
    6,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:23',
    '2026-06-10 00:04:23'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    576,
    210034,
    55,
    6,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:23',
    '2026-06-10 00:04:23'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    577,
    210034,
    56,
    6,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:23',
    '2026-06-10 00:04:23'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    578,
    210035,
    33,
    1,
    'B-',
    2.33,
    'completed',
    '2026-06-10 00:04:23',
    '2026-06-10 00:04:23'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    579,
    210035,
    34,
    1,
    'B',
    3.00,
    'completed',
    '2026-06-10 00:04:23',
    '2026-06-10 00:04:23'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    580,
    210035,
    35,
    1,
    'C+',
    3.00,
    'completed',
    '2026-06-10 00:04:23',
    '2026-06-10 00:04:23'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    581,
    210035,
    36,
    1,
    'C+',
    3.00,
    'completed',
    '2026-06-10 00:04:23',
    '2026-06-10 00:04:23'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    582,
    210035,
    37,
    2,
    'C+',
    3.00,
    'completed',
    '2026-06-10 00:04:23',
    '2026-06-10 00:04:23'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    583,
    210035,
    38,
    2,
    'B',
    2.67,
    'completed',
    '2026-06-10 00:04:23',
    '2026-06-10 00:04:23'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    584,
    210035,
    39,
    2,
    'B-',
    2.67,
    'completed',
    '2026-06-10 00:04:23',
    '2026-06-10 00:04:23'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    585,
    210035,
    40,
    2,
    'B-',
    2.33,
    'completed',
    '2026-06-10 00:04:23',
    '2026-06-10 00:04:23'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    586,
    210035,
    41,
    3,
    'C+',
    3.33,
    'completed',
    '2026-06-10 00:04:23',
    '2026-06-10 00:04:23'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    587,
    210035,
    42,
    3,
    'B',
    3.00,
    'completed',
    '2026-06-10 00:04:24',
    '2026-06-10 00:04:24'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    588,
    210035,
    43,
    3,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:24',
    '2026-06-10 00:04:24'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    589,
    210035,
    44,
    3,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:24',
    '2026-06-10 00:04:24'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    590,
    210035,
    45,
    4,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:24',
    '2026-06-10 00:04:24'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    591,
    210035,
    46,
    4,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:24',
    '2026-06-10 00:04:24'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    592,
    210036,
    33,
    1,
    'F',
    1.33,
    'completed',
    '2026-06-10 00:04:24',
    '2026-06-10 00:04:24'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    593,
    210036,
    34,
    1,
    'D',
    1.00,
    'completed',
    '2026-06-10 00:04:24',
    '2026-06-10 00:04:24'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    594,
    210036,
    35,
    1,
    'C',
    1.67,
    'completed',
    '2026-06-10 00:04:24',
    '2026-06-10 00:04:24'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    595,
    210036,
    36,
    1,
    'F',
    1.67,
    'completed',
    '2026-06-10 00:04:24',
    '2026-06-10 00:04:24'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    596,
    210036,
    37,
    2,
    'D+',
    0.00,
    'completed',
    '2026-06-10 00:04:24',
    '2026-06-10 00:04:24'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    597,
    210036,
    38,
    2,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:25',
    '2026-06-10 00:04:25'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    598,
    210036,
    39,
    2,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:25',
    '2026-06-10 00:04:25'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    599,
    210036,
    40,
    2,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:25',
    '2026-06-10 00:04:25'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    600,
    210036,
    41,
    3,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:25',
    '2026-06-10 00:04:25'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    601,
    210037,
    33,
    1,
    'B+',
    3.33,
    'completed',
    '2026-06-10 00:04:25',
    '2026-06-10 00:04:25'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    602,
    210037,
    34,
    1,
    'B+',
    3.67,
    'completed',
    '2026-06-10 00:04:25',
    '2026-06-10 00:04:25'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    603,
    210037,
    35,
    1,
    'B+',
    3.33,
    'completed',
    '2026-06-10 00:04:25',
    '2026-06-10 00:04:25'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    604,
    210037,
    36,
    1,
    'B+',
    3.33,
    'completed',
    '2026-06-10 00:04:25',
    '2026-06-10 00:04:25'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    605,
    210037,
    37,
    2,
    'B+',
    4.00,
    'completed',
    '2026-06-10 00:04:25',
    '2026-06-10 00:04:25'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    606,
    210037,
    38,
    2,
    'B+',
    3.00,
    'completed',
    '2026-06-10 00:04:25',
    '2026-06-10 00:04:25'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    607,
    210037,
    39,
    2,
    'A-',
    4.00,
    'completed',
    '2026-06-10 00:04:26',
    '2026-06-10 00:04:26'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    608,
    210037,
    40,
    2,
    'B+',
    3.33,
    'completed',
    '2026-06-10 00:04:26',
    '2026-06-10 00:04:26'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    609,
    210037,
    41,
    3,
    'A-',
    4.00,
    'completed',
    '2026-06-10 00:04:26',
    '2026-06-10 00:04:26'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    610,
    210037,
    42,
    3,
    'B',
    4.00,
    'completed',
    '2026-06-10 00:04:26',
    '2026-06-10 00:04:26'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    611,
    210037,
    43,
    3,
    'B+',
    3.67,
    'completed',
    '2026-06-10 00:04:26',
    '2026-06-10 00:04:26'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    612,
    210037,
    44,
    3,
    'B+',
    3.33,
    'completed',
    '2026-06-10 00:04:26',
    '2026-06-10 00:04:26'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    613,
    210037,
    45,
    4,
    'B',
    3.33,
    'completed',
    '2026-06-10 00:04:26',
    '2026-06-10 00:04:26'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    614,
    210037,
    46,
    4,
    'B+',
    3.67,
    'completed',
    '2026-06-10 00:04:26',
    '2026-06-10 00:04:26'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    615,
    210037,
    47,
    4,
    'A-',
    4.00,
    'completed',
    '2026-06-10 00:04:26',
    '2026-06-10 00:04:26'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    616,
    210037,
    48,
    4,
    'A-',
    3.67,
    'completed',
    '2026-06-10 00:04:27',
    '2026-06-10 00:04:27'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    617,
    210037,
    49,
    5,
    'A-',
    3.33,
    'completed',
    '2026-06-10 00:04:27',
    '2026-06-10 00:04:27'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    618,
    210037,
    50,
    5,
    'A',
    4.00,
    'completed',
    '2026-06-10 00:04:27',
    '2026-06-10 00:04:27'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    619,
    210037,
    51,
    5,
    'A-',
    3.67,
    'completed',
    '2026-06-10 00:04:27',
    '2026-06-10 00:04:27'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    620,
    210037,
    52,
    5,
    'B+',
    3.00,
    'completed',
    '2026-06-10 00:04:27',
    '2026-06-10 00:04:27'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    621,
    210037,
    53,
    6,
    'A-',
    3.67,
    'completed',
    '2026-06-10 00:04:27',
    '2026-06-10 00:04:27'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    622,
    210037,
    54,
    6,
    'B+',
    3.00,
    'completed',
    '2026-06-10 00:04:27',
    '2026-06-10 00:04:27'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    623,
    210037,
    55,
    6,
    'B+',
    3.33,
    'completed',
    '2026-06-10 00:04:27',
    '2026-06-10 00:04:27'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    624,
    210037,
    56,
    6,
    'B',
    3.33,
    'completed',
    '2026-06-10 00:04:27',
    '2026-06-10 00:04:27'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    625,
    210037,
    57,
    7,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:28',
    '2026-06-10 00:04:28'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    626,
    210037,
    58,
    7,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:28',
    '2026-06-10 00:04:28'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    627,
    210037,
    59,
    7,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:28',
    '2026-06-10 00:04:28'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    628,
    210037,
    60,
    7,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:28',
    '2026-06-10 00:04:28'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    629,
    210038,
    33,
    1,
    'A',
    4.00,
    'completed',
    '2026-06-10 00:04:28',
    '2026-06-10 00:04:28'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    630,
    210038,
    34,
    1,
    'A-',
    3.67,
    'completed',
    '2026-06-10 00:04:28',
    '2026-06-10 00:04:28'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    631,
    210038,
    35,
    1,
    'B+',
    3.67,
    'completed',
    '2026-06-10 00:04:28',
    '2026-06-10 00:04:28'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    632,
    210038,
    36,
    1,
    'B+',
    4.00,
    'completed',
    '2026-06-10 00:04:28',
    '2026-06-10 00:04:28'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    633,
    210038,
    37,
    2,
    'A',
    3.67,
    'completed',
    '2026-06-10 00:04:29',
    '2026-06-10 00:04:29'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    634,
    210038,
    38,
    2,
    'B+',
    3.67,
    'completed',
    '2026-06-10 00:04:29',
    '2026-06-10 00:04:29'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    635,
    210038,
    39,
    2,
    'A',
    4.00,
    'completed',
    '2026-06-10 00:04:29',
    '2026-06-10 00:04:29'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    636,
    210038,
    40,
    2,
    'B+',
    3.67,
    'completed',
    '2026-06-10 00:04:29',
    '2026-06-10 00:04:29'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    637,
    210038,
    41,
    3,
    'B+',
    4.00,
    'completed',
    '2026-06-10 00:04:29',
    '2026-06-10 00:04:29'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    638,
    210038,
    42,
    3,
    'A',
    3.67,
    'completed',
    '2026-06-10 00:04:29',
    '2026-06-10 00:04:29'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    639,
    210038,
    43,
    3,
    'A-',
    4.00,
    'completed',
    '2026-06-10 00:04:29',
    '2026-06-10 00:04:29'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    640,
    210038,
    44,
    3,
    'A',
    4.00,
    'completed',
    '2026-06-10 00:04:29',
    '2026-06-10 00:04:29'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    641,
    210038,
    45,
    4,
    'A',
    3.33,
    'completed',
    '2026-06-10 00:04:29',
    '2026-06-10 00:04:29'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    642,
    210038,
    46,
    4,
    'B+',
    4.00,
    'completed',
    '2026-06-10 00:04:30',
    '2026-06-10 00:04:30'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    643,
    210038,
    47,
    4,
    'A',
    3.33,
    'completed',
    '2026-06-10 00:04:30',
    '2026-06-10 00:04:30'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    644,
    210038,
    48,
    4,
    'A',
    4.00,
    'completed',
    '2026-06-10 00:04:30',
    '2026-06-10 00:04:30'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    645,
    210038,
    49,
    5,
    'A',
    3.67,
    'completed',
    '2026-06-10 00:04:30',
    '2026-06-10 00:04:30'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    646,
    210038,
    50,
    5,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:30',
    '2026-06-10 00:04:30'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    647,
    210038,
    51,
    5,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:30',
    '2026-06-10 00:04:30'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    648,
    210038,
    52,
    5,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:30',
    '2026-06-10 00:04:30'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    649,
    210038,
    53,
    6,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:30',
    '2026-06-10 00:04:30'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    650,
    210039,
    33,
    1,
    'A',
    4.00,
    'completed',
    '2026-06-10 00:04:30',
    '2026-06-10 00:04:30'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    651,
    210039,
    34,
    1,
    'A',
    4.00,
    'completed',
    '2026-06-10 00:04:30',
    '2026-06-10 00:04:30'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    652,
    210039,
    35,
    1,
    'A',
    4.00,
    'completed',
    '2026-06-10 00:04:30',
    '2026-06-10 00:04:30'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    653,
    210039,
    36,
    1,
    'A',
    4.00,
    'completed',
    '2026-06-10 00:04:30',
    '2026-06-10 00:04:30'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    654,
    210039,
    37,
    2,
    'A-',
    3.67,
    'completed',
    '2026-06-10 00:04:30',
    '2026-06-10 00:04:30'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    655,
    210039,
    38,
    2,
    'A-',
    3.67,
    'completed',
    '2026-06-10 00:04:30',
    '2026-06-10 00:04:30'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    656,
    210039,
    39,
    2,
    'A',
    3.33,
    'completed',
    '2026-06-10 00:04:31',
    '2026-06-10 00:04:31'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    657,
    210039,
    40,
    2,
    'A-',
    4.00,
    'completed',
    '2026-06-10 00:04:31',
    '2026-06-10 00:04:31'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    658,
    210039,
    41,
    3,
    'A',
    3.67,
    'completed',
    '2026-06-10 00:04:31',
    '2026-06-10 00:04:31'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    659,
    210039,
    42,
    3,
    'A-',
    3.67,
    'completed',
    '2026-06-10 00:04:31',
    '2026-06-10 00:04:31'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    660,
    210039,
    43,
    3,
    'B+',
    3.67,
    'completed',
    '2026-06-10 00:04:31',
    '2026-06-10 00:04:31'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    661,
    210039,
    44,
    3,
    'A',
    3.67,
    'completed',
    '2026-06-10 00:04:31',
    '2026-06-10 00:04:31'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    662,
    210039,
    45,
    4,
    'A',
    3.67,
    'completed',
    '2026-06-10 00:04:31',
    '2026-06-10 00:04:31'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    663,
    210039,
    46,
    4,
    'B+',
    3.67,
    'completed',
    '2026-06-10 00:04:31',
    '2026-06-10 00:04:31'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    664,
    210039,
    47,
    4,
    'A-',
    4.00,
    'completed',
    '2026-06-10 00:04:31',
    '2026-06-10 00:04:31'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    665,
    210039,
    48,
    4,
    'A',
    4.00,
    'completed',
    '2026-06-10 00:04:31',
    '2026-06-10 00:04:31'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    666,
    210039,
    49,
    5,
    'A',
    3.67,
    'completed',
    '2026-06-10 00:04:31',
    '2026-06-10 00:04:31'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    667,
    210039,
    50,
    5,
    'A',
    3.33,
    'completed',
    '2026-06-10 00:04:31',
    '2026-06-10 00:04:31'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    668,
    210039,
    51,
    5,
    'A-',
    4.00,
    'completed',
    '2026-06-10 00:04:31',
    '2026-06-10 00:04:31'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    669,
    210039,
    52,
    5,
    'B+',
    4.00,
    'completed',
    '2026-06-10 00:04:31',
    '2026-06-10 00:04:31'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    670,
    210039,
    53,
    6,
    'B+',
    3.33,
    'completed',
    '2026-06-10 00:04:32',
    '2026-06-10 00:04:32'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    671,
    210039,
    54,
    6,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:32',
    '2026-06-10 00:04:32'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    672,
    210039,
    55,
    6,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:32',
    '2026-06-10 00:04:32'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    673,
    210039,
    56,
    6,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:32',
    '2026-06-10 00:04:32'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    674,
    210039,
    57,
    7,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:32',
    '2026-06-10 00:04:32'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    675,
    210040,
    33,
    1,
    'A-',
    3.67,
    'completed',
    '2026-06-10 00:04:32',
    '2026-06-10 00:04:32'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    676,
    210040,
    34,
    1,
    'A-',
    4.00,
    'completed',
    '2026-06-10 00:04:32',
    '2026-06-10 00:04:32'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    677,
    210040,
    35,
    1,
    'A',
    3.67,
    'completed',
    '2026-06-10 00:04:32',
    '2026-06-10 00:04:32'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    678,
    210040,
    36,
    1,
    'A',
    3.33,
    'completed',
    '2026-06-10 00:04:32',
    '2026-06-10 00:04:32'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    679,
    210040,
    37,
    2,
    'A',
    3.67,
    'completed',
    '2026-06-10 00:04:32',
    '2026-06-10 00:04:32'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    680,
    210040,
    38,
    2,
    'A-',
    3.67,
    'completed',
    '2026-06-10 00:04:32',
    '2026-06-10 00:04:32'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    681,
    210040,
    39,
    2,
    'A-',
    3.67,
    'completed',
    '2026-06-10 00:04:32',
    '2026-06-10 00:04:32'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    682,
    210040,
    40,
    2,
    'A',
    4.00,
    'completed',
    '2026-06-10 00:04:32',
    '2026-06-10 00:04:32'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    683,
    210040,
    41,
    3,
    'A-',
    3.33,
    'completed',
    '2026-06-10 00:04:32',
    '2026-06-10 00:04:32'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    684,
    210040,
    42,
    3,
    'A',
    3.67,
    'completed',
    '2026-06-10 00:04:32',
    '2026-06-10 00:04:32'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    685,
    210040,
    43,
    3,
    'A-',
    4.00,
    'completed',
    '2026-06-10 00:04:33',
    '2026-06-10 00:04:33'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    686,
    210040,
    44,
    3,
    'A',
    3.33,
    'completed',
    '2026-06-10 00:04:33',
    '2026-06-10 00:04:33'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    687,
    210040,
    45,
    4,
    'A-',
    3.67,
    'completed',
    '2026-06-10 00:04:33',
    '2026-06-10 00:04:33'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    688,
    210040,
    46,
    4,
    'A',
    3.67,
    'completed',
    '2026-06-10 00:04:33',
    '2026-06-10 00:04:33'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    689,
    210040,
    47,
    4,
    'A-',
    3.33,
    'completed',
    '2026-06-10 00:04:33',
    '2026-06-10 00:04:33'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    690,
    210040,
    48,
    4,
    'A-',
    3.67,
    'completed',
    '2026-06-10 00:04:33',
    '2026-06-10 00:04:33'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    691,
    210040,
    49,
    5,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:33',
    '2026-06-10 00:04:33'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    692,
    210040,
    50,
    5,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:33',
    '2026-06-10 00:04:33'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    693,
    210040,
    51,
    5,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:33',
    '2026-06-10 00:04:33'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    694,
    210040,
    52,
    5,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:33',
    '2026-06-10 00:04:33'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    695,
    210041,
    33,
    1,
    'B',
    3.33,
    'completed',
    '2026-06-10 00:04:33',
    '2026-06-10 00:04:33'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    696,
    210041,
    34,
    1,
    'B',
    4.00,
    'completed',
    '2026-06-10 00:04:33',
    '2026-06-10 00:04:33'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    697,
    210041,
    35,
    1,
    'A',
    3.33,
    'completed',
    '2026-06-10 00:04:33',
    '2026-06-10 00:04:33'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    698,
    210041,
    36,
    1,
    'B+',
    4.00,
    'completed',
    '2026-06-10 00:04:33',
    '2026-06-10 00:04:33'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    699,
    210041,
    37,
    2,
    'A-',
    4.00,
    'completed',
    '2026-06-10 00:04:34',
    '2026-06-10 00:04:34'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    700,
    210041,
    38,
    2,
    'A',
    3.00,
    'completed',
    '2026-06-10 00:04:34',
    '2026-06-10 00:04:34'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    701,
    210041,
    39,
    2,
    'B+',
    3.67,
    'completed',
    '2026-06-10 00:04:34',
    '2026-06-10 00:04:34'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    702,
    210041,
    40,
    2,
    'A-',
    4.00,
    'completed',
    '2026-06-10 00:04:34',
    '2026-06-10 00:04:34'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    703,
    210041,
    41,
    3,
    'B+',
    3.33,
    'completed',
    '2026-06-10 00:04:34',
    '2026-06-10 00:04:34'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    704,
    210041,
    42,
    3,
    'B+',
    4.00,
    'completed',
    '2026-06-10 00:04:34',
    '2026-06-10 00:04:34'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    705,
    210041,
    43,
    3,
    'A-',
    4.00,
    'completed',
    '2026-06-10 00:04:34',
    '2026-06-10 00:04:34'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    706,
    210041,
    44,
    3,
    'B',
    3.00,
    'completed',
    '2026-06-10 00:04:34',
    '2026-06-10 00:04:34'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    707,
    210041,
    45,
    4,
    'A',
    3.00,
    'completed',
    '2026-06-10 00:04:34',
    '2026-06-10 00:04:34'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    708,
    210041,
    46,
    4,
    'B+',
    3.00,
    'completed',
    '2026-06-10 00:04:35',
    '2026-06-10 00:04:35'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    709,
    210041,
    47,
    4,
    'A',
    3.33,
    'completed',
    '2026-06-10 00:04:35',
    '2026-06-10 00:04:35'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    710,
    210041,
    48,
    4,
    'B+',
    3.33,
    'completed',
    '2026-06-10 00:04:35',
    '2026-06-10 00:04:35'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    711,
    210041,
    49,
    5,
    'A',
    3.33,
    'completed',
    '2026-06-10 00:04:35',
    '2026-06-10 00:04:35'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    712,
    210041,
    50,
    5,
    'B+',
    3.67,
    'completed',
    '2026-06-10 00:04:35',
    '2026-06-10 00:04:35'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    713,
    210041,
    51,
    5,
    'A-',
    3.33,
    'completed',
    '2026-06-10 00:04:35',
    '2026-06-10 00:04:35'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    714,
    210041,
    52,
    5,
    'B',
    3.00,
    'completed',
    '2026-06-10 00:04:35',
    '2026-06-10 00:04:35'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    715,
    210041,
    53,
    6,
    'B+',
    3.33,
    'completed',
    '2026-06-10 00:04:35',
    '2026-06-10 00:04:35'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    716,
    210041,
    54,
    6,
    'B',
    3.33,
    'completed',
    '2026-06-10 00:04:35',
    '2026-06-10 00:04:35'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    717,
    210041,
    55,
    6,
    'A-',
    3.67,
    'completed',
    '2026-06-10 00:04:36',
    '2026-06-10 00:04:36'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    718,
    210041,
    56,
    6,
    'B+',
    3.67,
    'completed',
    '2026-06-10 00:04:36',
    '2026-06-10 00:04:36'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    719,
    210041,
    57,
    7,
    'A',
    3.33,
    'completed',
    '2026-06-10 00:04:36',
    '2026-06-10 00:04:36'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    720,
    210041,
    58,
    7,
    'A',
    4.00,
    'completed',
    '2026-06-10 00:04:36',
    '2026-06-10 00:04:36'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    721,
    210041,
    59,
    7,
    'A',
    3.00,
    'completed',
    '2026-06-10 00:04:36',
    '2026-06-10 00:04:36'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    722,
    210041,
    60,
    7,
    'B+',
    3.00,
    'completed',
    '2026-06-10 00:04:36',
    '2026-06-10 00:04:36'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    723,
    210041,
    61,
    8,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:36',
    '2026-06-10 00:04:36'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    724,
    210041,
    62,
    8,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:36',
    '2026-06-10 00:04:36'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    725,
    210041,
    63,
    8,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:36',
    '2026-06-10 00:04:36'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    726,
    210041,
    64,
    8,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:37',
    '2026-06-10 00:04:37'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    727,
    210042,
    33,
    1,
    'C+',
    3.33,
    'completed',
    '2026-06-10 00:04:37',
    '2026-06-10 00:04:37'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    728,
    210042,
    34,
    1,
    'B',
    2.33,
    'completed',
    '2026-06-10 00:04:37',
    '2026-06-10 00:04:37'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    729,
    210042,
    35,
    1,
    'B',
    3.33,
    'completed',
    '2026-06-10 00:04:37',
    '2026-06-10 00:04:37'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    730,
    210042,
    36,
    1,
    'B-',
    2.67,
    'completed',
    '2026-06-10 00:04:37',
    '2026-06-10 00:04:37'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    731,
    210042,
    37,
    2,
    'C+',
    3.00,
    'completed',
    '2026-06-10 00:04:37',
    '2026-06-10 00:04:37'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    732,
    210042,
    38,
    2,
    'B-',
    2.67,
    'completed',
    '2026-06-10 00:04:37',
    '2026-06-10 00:04:37'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    733,
    210042,
    39,
    2,
    'B-',
    2.67,
    'completed',
    '2026-06-10 00:04:37',
    '2026-06-10 00:04:37'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    734,
    210042,
    40,
    2,
    'C+',
    2.33,
    'completed',
    '2026-06-10 00:04:37',
    '2026-06-10 00:04:37'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    735,
    210042,
    41,
    3,
    'C+',
    3.33,
    'completed',
    '2026-06-10 00:04:37',
    '2026-06-10 00:04:37'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    736,
    210042,
    42,
    3,
    'B-',
    3.33,
    'completed',
    '2026-06-10 00:04:38',
    '2026-06-10 00:04:38'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    737,
    210042,
    43,
    3,
    'B',
    2.33,
    'completed',
    '2026-06-10 00:04:38',
    '2026-06-10 00:04:38'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    738,
    210042,
    44,
    3,
    'B+',
    3.00,
    'completed',
    '2026-06-10 00:04:38',
    '2026-06-10 00:04:38'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    739,
    210042,
    45,
    4,
    'B-',
    2.33,
    'completed',
    '2026-06-10 00:04:38',
    '2026-06-10 00:04:38'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    740,
    210042,
    46,
    4,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:38',
    '2026-06-10 00:04:38'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    741,
    210042,
    47,
    4,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:38',
    '2026-06-10 00:04:38'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    742,
    210042,
    48,
    4,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:38',
    '2026-06-10 00:04:38'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    743,
    210042,
    49,
    5,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:38',
    '2026-06-10 00:04:38'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    744,
    210043,
    33,
    1,
    'C+',
    3.33,
    'completed',
    '2026-06-10 00:04:38',
    '2026-06-10 00:04:38'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    745,
    210043,
    34,
    1,
    'B',
    3.00,
    'completed',
    '2026-06-10 00:04:39',
    '2026-06-10 00:04:39'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    746,
    210043,
    35,
    1,
    'B',
    3.00,
    'completed',
    '2026-06-10 00:04:39',
    '2026-06-10 00:04:39'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    747,
    210043,
    36,
    1,
    'B',
    2.33,
    'completed',
    '2026-06-10 00:04:39',
    '2026-06-10 00:04:39'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    748,
    210043,
    37,
    2,
    'B',
    3.00,
    'completed',
    '2026-06-10 00:04:39',
    '2026-06-10 00:04:39'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    749,
    210043,
    38,
    2,
    'B',
    3.33,
    'completed',
    '2026-06-10 00:04:39',
    '2026-06-10 00:04:39'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    750,
    210043,
    39,
    2,
    'C+',
    2.67,
    'completed',
    '2026-06-10 00:04:39',
    '2026-06-10 00:04:39'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    751,
    210043,
    40,
    2,
    'C+',
    2.67,
    'completed',
    '2026-06-10 00:04:39',
    '2026-06-10 00:04:39'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    752,
    210043,
    41,
    3,
    'B-',
    2.67,
    'completed',
    '2026-06-10 00:04:39',
    '2026-06-10 00:04:39'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    753,
    210043,
    42,
    3,
    'B',
    3.00,
    'completed',
    '2026-06-10 00:04:39',
    '2026-06-10 00:04:39'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    754,
    210043,
    43,
    3,
    'B+',
    2.67,
    'completed',
    '2026-06-10 00:04:39',
    '2026-06-10 00:04:39'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    755,
    210043,
    44,
    3,
    'C+',
    2.67,
    'completed',
    '2026-06-10 00:04:40',
    '2026-06-10 00:04:40'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    756,
    210043,
    45,
    4,
    'B',
    2.33,
    'completed',
    '2026-06-10 00:04:40',
    '2026-06-10 00:04:40'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    757,
    210043,
    46,
    4,
    'B+',
    3.00,
    'completed',
    '2026-06-10 00:04:40',
    '2026-06-10 00:04:40'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    758,
    210043,
    47,
    4,
    'C+',
    3.00,
    'completed',
    '2026-06-10 00:04:40',
    '2026-06-10 00:04:40'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    759,
    210043,
    48,
    4,
    'B',
    2.33,
    'completed',
    '2026-06-10 00:04:40',
    '2026-06-10 00:04:40'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    760,
    210043,
    49,
    5,
    'C+',
    2.67,
    'completed',
    '2026-06-10 00:04:40',
    '2026-06-10 00:04:40'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    761,
    210043,
    50,
    5,
    'C+',
    3.00,
    'completed',
    '2026-06-10 00:04:40',
    '2026-06-10 00:04:40'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    762,
    210043,
    51,
    5,
    'B+',
    2.67,
    'completed',
    '2026-06-10 00:04:40',
    '2026-06-10 00:04:40'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    763,
    210043,
    52,
    5,
    'B-',
    3.00,
    'completed',
    '2026-06-10 00:04:40',
    '2026-06-10 00:04:40'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    764,
    210043,
    53,
    6,
    'C+',
    3.00,
    'completed',
    '2026-06-10 00:04:41',
    '2026-06-10 00:04:41'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    765,
    210043,
    54,
    6,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:41',
    '2026-06-10 00:04:41'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    766,
    210043,
    55,
    6,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:41',
    '2026-06-10 00:04:41'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    767,
    210043,
    56,
    6,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:41',
    '2026-06-10 00:04:41'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    768,
    210043,
    57,
    7,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:41',
    '2026-06-10 00:04:41'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    769,
    210044,
    33,
    1,
    'B+',
    3.33,
    'completed',
    '2026-06-10 00:04:41',
    '2026-06-10 00:04:41'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    770,
    210044,
    34,
    1,
    'B+',
    2.67,
    'completed',
    '2026-06-10 00:04:41',
    '2026-06-10 00:04:41'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    771,
    210044,
    35,
    1,
    'B-',
    2.33,
    'completed',
    '2026-06-10 00:04:41',
    '2026-06-10 00:04:41'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    772,
    210044,
    36,
    1,
    'B+',
    3.00,
    'completed',
    '2026-06-10 00:04:42',
    '2026-06-10 00:04:42'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    773,
    210044,
    37,
    2,
    'B+',
    3.00,
    'completed',
    '2026-06-10 00:04:42',
    '2026-06-10 00:04:42'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    774,
    210044,
    38,
    2,
    'B',
    2.33,
    'completed',
    '2026-06-10 00:04:42',
    '2026-06-10 00:04:42'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    775,
    210044,
    39,
    2,
    'B',
    3.00,
    'completed',
    '2026-06-10 00:04:42',
    '2026-06-10 00:04:42'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    776,
    210044,
    40,
    2,
    'B-',
    3.00,
    'completed',
    '2026-06-10 00:04:42',
    '2026-06-10 00:04:42'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    777,
    210044,
    41,
    3,
    'C+',
    3.00,
    'completed',
    '2026-06-10 00:04:42',
    '2026-06-10 00:04:42'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    778,
    210044,
    42,
    3,
    'B',
    2.67,
    'completed',
    '2026-06-10 00:04:42',
    '2026-06-10 00:04:42'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    779,
    210044,
    43,
    3,
    'B',
    2.33,
    'completed',
    '2026-06-10 00:04:42',
    '2026-06-10 00:04:42'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    780,
    210044,
    44,
    3,
    'B+',
    3.00,
    'completed',
    '2026-06-10 00:04:42',
    '2026-06-10 00:04:42'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    781,
    210044,
    45,
    4,
    'C+',
    3.00,
    'completed',
    '2026-06-10 00:04:43',
    '2026-06-10 00:04:43'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    782,
    210044,
    46,
    4,
    'B+',
    3.00,
    'completed',
    '2026-06-10 00:04:43',
    '2026-06-10 00:04:43'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    783,
    210044,
    47,
    4,
    'B',
    3.00,
    'completed',
    '2026-06-10 00:04:43',
    '2026-06-10 00:04:43'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    784,
    210044,
    48,
    4,
    'B+',
    3.33,
    'completed',
    '2026-06-10 00:04:43',
    '2026-06-10 00:04:43'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    785,
    210044,
    49,
    5,
    'C+',
    3.00,
    'completed',
    '2026-06-10 00:04:43',
    '2026-06-10 00:04:43'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    786,
    210044,
    50,
    5,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:43',
    '2026-06-10 00:04:43'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    787,
    210044,
    51,
    5,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:43',
    '2026-06-10 00:04:43'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    788,
    210044,
    52,
    5,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:43',
    '2026-06-10 00:04:43'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    789,
    210044,
    53,
    6,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:43',
    '2026-06-10 00:04:43'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    790,
    210045,
    33,
    1,
    'B',
    3.00,
    'completed',
    '2026-06-10 00:04:43',
    '2026-06-10 00:04:43'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    791,
    210045,
    34,
    1,
    'B+',
    3.00,
    'completed',
    '2026-06-10 00:04:44',
    '2026-06-10 00:04:44'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    792,
    210045,
    35,
    1,
    'B+',
    2.67,
    'completed',
    '2026-06-10 00:04:44',
    '2026-06-10 00:04:44'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    793,
    210045,
    36,
    1,
    'B',
    2.33,
    'completed',
    '2026-06-10 00:04:44',
    '2026-06-10 00:04:44'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    794,
    210045,
    37,
    2,
    'C+',
    2.33,
    'completed',
    '2026-06-10 00:04:44',
    '2026-06-10 00:04:44'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    795,
    210045,
    38,
    2,
    'B-',
    2.33,
    'completed',
    '2026-06-10 00:04:44',
    '2026-06-10 00:04:44'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    796,
    210045,
    39,
    2,
    'B',
    3.33,
    'completed',
    '2026-06-10 00:04:44',
    '2026-06-10 00:04:44'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    797,
    210045,
    40,
    2,
    'B-',
    3.00,
    'completed',
    '2026-06-10 00:04:44',
    '2026-06-10 00:04:44'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    798,
    210045,
    41,
    3,
    'B',
    2.67,
    'completed',
    '2026-06-10 00:04:44',
    '2026-06-10 00:04:44'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    799,
    210045,
    42,
    3,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:44',
    '2026-06-10 00:04:44'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    800,
    210045,
    43,
    3,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:45',
    '2026-06-10 00:04:45'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    801,
    210045,
    44,
    3,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:45',
    '2026-06-10 00:04:45'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    802,
    210045,
    45,
    4,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:45',
    '2026-06-10 00:04:45'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    803,
    210046,
    33,
    1,
    'C+',
    2.00,
    'completed',
    '2026-06-10 00:04:45',
    '2026-06-10 00:04:45'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    804,
    210046,
    34,
    1,
    'D',
    0.00,
    'completed',
    '2026-06-10 00:04:45',
    '2026-06-10 00:04:45'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    805,
    210046,
    35,
    1,
    'C-',
    2.00,
    'completed',
    '2026-06-10 00:04:45',
    '2026-06-10 00:04:45'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    806,
    210046,
    36,
    1,
    'C',
    1.00,
    'completed',
    '2026-06-10 00:04:45',
    '2026-06-10 00:04:45'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    807,
    210046,
    37,
    2,
    'D+',
    1.00,
    'completed',
    '2026-06-10 00:04:45',
    '2026-06-10 00:04:45'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    808,
    210046,
    38,
    2,
    'C',
    2.00,
    'completed',
    '2026-06-10 00:04:45',
    '2026-06-10 00:04:45'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    809,
    210046,
    39,
    2,
    'C-',
    1.67,
    'completed',
    '2026-06-10 00:04:45',
    '2026-06-10 00:04:45'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    810,
    210046,
    40,
    2,
    'D+',
    2.00,
    'completed',
    '2026-06-10 00:04:46',
    '2026-06-10 00:04:46'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    811,
    210046,
    41,
    3,
    'C+',
    2.00,
    'completed',
    '2026-06-10 00:04:46',
    '2026-06-10 00:04:46'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    812,
    210046,
    42,
    3,
    'D+',
    2.33,
    'completed',
    '2026-06-10 00:04:46',
    '2026-06-10 00:04:46'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    813,
    210046,
    43,
    3,
    'C',
    1.00,
    'completed',
    '2026-06-10 00:04:46',
    '2026-06-10 00:04:46'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    814,
    210046,
    44,
    3,
    'C',
    1.67,
    'completed',
    '2026-06-10 00:04:46',
    '2026-06-10 00:04:46'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    815,
    210046,
    45,
    4,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:46',
    '2026-06-10 00:04:46'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    816,
    210046,
    46,
    4,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:46',
    '2026-06-10 00:04:46'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    817,
    210046,
    47,
    4,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:46',
    '2026-06-10 00:04:46'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    818,
    210046,
    48,
    4,
    NULL,
    NULL,
    'in_progress',
    '2026-06-10 00:04:47',
    '2026-06-10 00:04:47'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30001,
    240002,
    33,
    1,
    'A',
    4.00,
    'completed',
    '2026-06-10 00:32:32',
    '2026-06-10 00:32:32'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30010,
    240002,
    34,
    1,
    'B+',
    3.33,
    'completed',
    '2026-06-10 00:32:32',
    '2026-06-10 00:32:32'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30026,
    240002,
    35,
    1,
    'A-',
    3.67,
    'completed',
    '2026-06-10 00:32:32',
    '2026-06-10 00:32:32'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30042,
    240002,
    36,
    1,
    'B',
    3.00,
    'completed',
    '2026-06-10 00:32:32',
    '2026-06-10 00:32:32'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30055,
    240002,
    37,
    2,
    'C+',
    2.33,
    'completed',
    '2026-06-10 00:32:32',
    '2026-06-10 00:32:32'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30073,
    240002,
    38,
    2,
    'F',
    0.00,
    'completed',
    '2026-06-10 00:32:32',
    '2026-06-10 00:32:32'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30088,
    240002,
    39,
    2,
    'B-',
    2.67,
    'in_progress',
    '2026-06-10 00:32:33',
    '2026-06-10 00:32:33'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30104,
    240002,
    40,
    2,
    'C',
    2.00,
    'in_progress',
    '2026-06-10 00:32:33',
    '2026-06-10 00:32:33'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30120,
    240002,
    41,
    3,
    'A',
    4.00,
    'in_progress',
    '2026-06-10 00:32:33',
    '2026-06-10 00:32:33'
  );
INSERT INTO
  `studentCourses` (
    `id`,
    `studentId`,
    `courseId`,
    `semester`,
    `grade`,
    `gradePoints`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    30136,
    240002,
    42,
    3,
    'B+',
    3.33,
    'in_progress',
    '2026-06-10 00:32:33',
    '2026-06-10 00:32:33'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: studyPlans
# ------------------------------------------------------------

INSERT INTO
  `studyPlans` (
    `id`,
    `studentId`,
    `advisorId`,
    `totalCredits`,
    `completedCredits`,
    `currentGPA`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    60021,
    210027,
    NULL,
    132,
    63,
    2.86,
    'active',
    '2026-06-10 00:04:04',
    '2026-06-10 00:04:04'
  );
INSERT INTO
  `studyPlans` (
    `id`,
    `studentId`,
    `advisorId`,
    `totalCredits`,
    `completedCredits`,
    `currentGPA`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    60022,
    210028,
    NULL,
    132,
    12,
    1.50,
    'active',
    '2026-06-10 00:04:05',
    '2026-06-10 00:04:05'
  );
INSERT INTO
  `studyPlans` (
    `id`,
    `studentId`,
    `advisorId`,
    `totalCredits`,
    `completedCredits`,
    `currentGPA`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    60023,
    210029,
    NULL,
    132,
    51,
    3.65,
    'active',
    '2026-06-10 00:04:05',
    '2026-06-10 00:04:05'
  );
INSERT INTO
  `studyPlans` (
    `id`,
    `studentId`,
    `advisorId`,
    `totalCredits`,
    `completedCredits`,
    `currentGPA`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    60024,
    210030,
    NULL,
    132,
    42,
    2.90,
    'active',
    '2026-06-10 00:04:05',
    '2026-06-10 00:04:05'
  );
INSERT INTO
  `studyPlans` (
    `id`,
    `studentId`,
    `advisorId`,
    `totalCredits`,
    `completedCredits`,
    `currentGPA`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    60025,
    210031,
    NULL,
    132,
    39,
    3.67,
    'active',
    '2026-06-10 00:04:05',
    '2026-06-10 00:04:05'
  );
INSERT INTO
  `studyPlans` (
    `id`,
    `studentId`,
    `advisorId`,
    `totalCredits`,
    `completedCredits`,
    `currentGPA`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    60026,
    210032,
    NULL,
    132,
    30,
    1.73,
    'active',
    '2026-06-10 00:04:05',
    '2026-06-10 00:04:05'
  );
INSERT INTO
  `studyPlans` (
    `id`,
    `studentId`,
    `advisorId`,
    `totalCredits`,
    `completedCredits`,
    `currentGPA`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    60027,
    210033,
    NULL,
    132,
    78,
    3.41,
    'active',
    '2026-06-10 00:04:05',
    '2026-06-10 00:04:05'
  );
INSERT INTO
  `studyPlans` (
    `id`,
    `studentId`,
    `advisorId`,
    `totalCredits`,
    `completedCredits`,
    `currentGPA`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    60028,
    210034,
    NULL,
    132,
    60,
    2.85,
    'active',
    '2026-06-10 00:04:05',
    '2026-06-10 00:04:05'
  );
INSERT INTO
  `studyPlans` (
    `id`,
    `studentId`,
    `advisorId`,
    `totalCredits`,
    `completedCredits`,
    `currentGPA`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    60029,
    210035,
    NULL,
    132,
    30,
    2.97,
    'active',
    '2026-06-10 00:04:05',
    '2026-06-10 00:04:05'
  );
INSERT INTO
  `studyPlans` (
    `id`,
    `studentId`,
    `advisorId`,
    `totalCredits`,
    `completedCredits`,
    `currentGPA`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    60030,
    210036,
    NULL,
    132,
    15,
    1.20,
    'active',
    '2026-06-10 00:04:05',
    '2026-06-10 00:04:05'
  );
INSERT INTO
  `studyPlans` (
    `id`,
    `studentId`,
    `advisorId`,
    `totalCredits`,
    `completedCredits`,
    `currentGPA`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    60031,
    210037,
    NULL,
    132,
    72,
    3.51,
    'active',
    '2026-06-10 00:04:06',
    '2026-06-10 00:04:06'
  );
INSERT INTO
  `studyPlans` (
    `id`,
    `studentId`,
    `advisorId`,
    `totalCredits`,
    `completedCredits`,
    `currentGPA`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    60032,
    210038,
    NULL,
    132,
    51,
    3.77,
    'active',
    '2026-06-10 00:04:06',
    '2026-06-10 00:04:06'
  );
INSERT INTO
  `studyPlans` (
    `id`,
    `studentId`,
    `advisorId`,
    `totalCredits`,
    `completedCredits`,
    `currentGPA`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    60033,
    210039,
    NULL,
    132,
    63,
    3.78,
    'active',
    '2026-06-10 00:04:06',
    '2026-06-10 00:04:06'
  );
INSERT INTO
  `studyPlans` (
    `id`,
    `studentId`,
    `advisorId`,
    `totalCredits`,
    `completedCredits`,
    `currentGPA`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    60034,
    210040,
    NULL,
    132,
    48,
    3.71,
    'active',
    '2026-06-10 00:04:06',
    '2026-06-10 00:04:06'
  );
INSERT INTO
  `studyPlans` (
    `id`,
    `studentId`,
    `advisorId`,
    `totalCredits`,
    `completedCredits`,
    `currentGPA`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    60035,
    210041,
    NULL,
    132,
    84,
    3.52,
    'active',
    '2026-06-10 00:04:06',
    '2026-06-10 00:04:06'
  );
INSERT INTO
  `studyPlans` (
    `id`,
    `studentId`,
    `advisorId`,
    `totalCredits`,
    `completedCredits`,
    `currentGPA`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    60036,
    210042,
    NULL,
    132,
    39,
    2.82,
    'active',
    '2026-06-10 00:04:06',
    '2026-06-10 00:04:06'
  );
INSERT INTO
  `studyPlans` (
    `id`,
    `studentId`,
    `advisorId`,
    `totalCredits`,
    `completedCredits`,
    `currentGPA`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    60037,
    210043,
    NULL,
    132,
    63,
    2.89,
    'active',
    '2026-06-10 00:04:06',
    '2026-06-10 00:04:06'
  );
INSERT INTO
  `studyPlans` (
    `id`,
    `studentId`,
    `advisorId`,
    `totalCredits`,
    `completedCredits`,
    `currentGPA`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    60038,
    210044,
    NULL,
    132,
    51,
    2.78,
    'active',
    '2026-06-10 00:04:06',
    '2026-06-10 00:04:06'
  );
INSERT INTO
  `studyPlans` (
    `id`,
    `studentId`,
    `advisorId`,
    `totalCredits`,
    `completedCredits`,
    `currentGPA`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    60039,
    210045,
    NULL,
    132,
    27,
    2.78,
    'active',
    '2026-06-10 00:04:07',
    '2026-06-10 00:04:07'
  );
INSERT INTO
  `studyPlans` (
    `id`,
    `studentId`,
    `advisorId`,
    `totalCredits`,
    `completedCredits`,
    `currentGPA`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    60040,
    210046,
    NULL,
    132,
    36,
    1.89,
    'active',
    '2026-06-10 00:04:07',
    '2026-06-10 00:04:07'
  );
INSERT INTO
  `studyPlans` (
    `id`,
    `studentId`,
    `advisorId`,
    `totalCredits`,
    `completedCredits`,
    `currentGPA`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    90001,
    240002,
    NULL,
    132,
    78,
    3.68,
    'active',
    '2026-06-10 00:32:31',
    '2026-06-10 00:32:31'
  );
INSERT INTO
  `studyPlans` (
    `id`,
    `studentId`,
    `advisorId`,
    `totalCredits`,
    `completedCredits`,
    `currentGPA`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    90002,
    240002,
    NULL,
    132,
    78,
    3.68,
    'active',
    '2026-06-10 00:32:31',
    '2026-06-10 00:32:31'
  );
INSERT INTO
  `studyPlans` (
    `id`,
    `studentId`,
    `advisorId`,
    `totalCredits`,
    `completedCredits`,
    `currentGPA`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    90003,
    240002,
    NULL,
    132,
    78,
    3.68,
    'active',
    '2026-06-10 00:32:31',
    '2026-06-10 00:32:31'
  );
INSERT INTO
  `studyPlans` (
    `id`,
    `studentId`,
    `advisorId`,
    `totalCredits`,
    `completedCredits`,
    `currentGPA`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    90004,
    240002,
    NULL,
    132,
    78,
    3.68,
    'active',
    '2026-06-10 00:32:31',
    '2026-06-10 00:32:31'
  );
INSERT INTO
  `studyPlans` (
    `id`,
    `studentId`,
    `advisorId`,
    `totalCredits`,
    `completedCredits`,
    `currentGPA`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    90005,
    240002,
    NULL,
    132,
    78,
    3.68,
    'active',
    '2026-06-10 00:32:32',
    '2026-06-10 00:32:32'
  );
INSERT INTO
  `studyPlans` (
    `id`,
    `studentId`,
    `advisorId`,
    `totalCredits`,
    `completedCredits`,
    `currentGPA`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    90006,
    240002,
    NULL,
    132,
    78,
    3.68,
    'active',
    '2026-06-10 00:32:32',
    '2026-06-10 00:32:32'
  );
INSERT INTO
  `studyPlans` (
    `id`,
    `studentId`,
    `advisorId`,
    `totalCredits`,
    `completedCredits`,
    `currentGPA`,
    `status`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    90007,
    240002,
    NULL,
    132,
    78,
    3.68,
    'active',
    '2026-06-10 00:32:32',
    '2026-06-10 00:32:32'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: users
# ------------------------------------------------------------

INSERT INTO
  `users` (
    `id`,
    `openId`,
    `email`,
    `name`,
    `password`,
    `role`,
    `departmentId`,
    `profilePicture`,
    `bio`,
    `phone`,
    `language`,
    `isActive`,
    `createdAt`,
    `updatedAt`,
    `lastSignedIn`,
    `isEmailVerified`,
    `advisorId`
  )
VALUES
  (
    1,
    'local-1780905282439-g5au1z5dy',
    'abood@gmail.com',
    'Abood',
    'pbkdf2:sha512:210000:35850ce1d02a408d0d06b68cf6cd00b0:801e5891ce128f4e50897400fc4c91f8fbde5f14f9f4372c72d04c611a211dfc559a1c286c4374fff2c52ef473525bcf52ad877e8530faeaa0e7429d854cabe9',
    'admin',
    NULL,
    NULL,
    NULL,
    NULL,
    'en',
    1,
    '2026-06-08 07:54:42',
    '2026-06-10 03:06:04',
    '2026-06-10 03:06:04',
    1,
    NULL
  );
INSERT INTO
  `users` (
    `id`,
    `openId`,
    `email`,
    `name`,
    `password`,
    `role`,
    `departmentId`,
    `profilePicture`,
    `bio`,
    `phone`,
    `language`,
    `isActive`,
    `createdAt`,
    `updatedAt`,
    `lastSignedIn`,
    `isEmailVerified`,
    `advisorId`
  )
VALUES
  (
    210024,
    'advisor_a.khalil@zuj.edu.jo',
    'a.khalil@zuj.edu.jo',
    'Dr. Ahmad Khalil',
    'pbkdf2:sha512:210000:f085afb78ddc45d83c8ccd0b65fe0c54:28ea690cdb72ed1e3d0b3df7dc1a63d22caec5adc4e46cfe6f41687bac343f937b274cfd3348d88d3e0f0c8bf177a68d39321eff63c632e9bf5330b74b64e8cc',
    'advisor',
    1,
    NULL,
    'AI and Machine Learning professor.',
    NULL,
    'en',
    1,
    '2026-06-10 00:03:55',
    '2026-06-10 00:30:09',
    '2026-06-10 00:03:55',
    1,
    NULL
  );
INSERT INTO
  `users` (
    `id`,
    `openId`,
    `email`,
    `name`,
    `password`,
    `role`,
    `departmentId`,
    `profilePicture`,
    `bio`,
    `phone`,
    `language`,
    `isActive`,
    `createdAt`,
    `updatedAt`,
    `lastSignedIn`,
    `isEmailVerified`,
    `advisorId`
  )
VALUES
  (
    210025,
    'advisor_s.mahmoud@zuj.edu.jo',
    's.mahmoud@zuj.edu.jo',
    'Dr. Sara Mahmoud',
    'pbkdf2:sha512:210000:f085afb78ddc45d83c8ccd0b65fe0c54:28ea690cdb72ed1e3d0b3df7dc1a63d22caec5adc4e46cfe6f41687bac343f937b274cfd3348d88d3e0f0c8bf177a68d39321eff63c632e9bf5330b74b64e8cc',
    'advisor',
    1,
    NULL,
    'Software Engineering specialist.',
    NULL,
    'en',
    1,
    '2026-06-10 00:03:55',
    '2026-06-10 00:30:09',
    '2026-06-10 00:03:55',
    1,
    NULL
  );
INSERT INTO
  `users` (
    `id`,
    `openId`,
    `email`,
    `name`,
    `password`,
    `role`,
    `departmentId`,
    `profilePicture`,
    `bio`,
    `phone`,
    `language`,
    `isActive`,
    `createdAt`,
    `updatedAt`,
    `lastSignedIn`,
    `isEmailVerified`,
    `advisorId`
  )
VALUES
  (
    210026,
    'advisor_o.hassan@zuj.edu.jo',
    'o.hassan@zuj.edu.jo',
    'Dr. Omar Hassan',
    'pbkdf2:sha512:210000:f085afb78ddc45d83c8ccd0b65fe0c54:28ea690cdb72ed1e3d0b3df7dc1a63d22caec5adc4e46cfe6f41687bac343f937b274cfd3348d88d3e0f0c8bf177a68d39321eff63c632e9bf5330b74b64e8cc',
    'advisor',
    1,
    NULL,
    'Cybersecurity and Networks lecturer.',
    NULL,
    'en',
    1,
    '2026-06-10 00:03:55',
    '2026-06-10 09:18:51',
    '2026-06-10 09:18:51',
    1,
    NULL
  );
INSERT INTO
  `users` (
    `id`,
    `openId`,
    `email`,
    `name`,
    `password`,
    `role`,
    `departmentId`,
    `profilePicture`,
    `bio`,
    `phone`,
    `language`,
    `isActive`,
    `createdAt`,
    `updatedAt`,
    `lastSignedIn`,
    `isEmailVerified`,
    `advisorId`
  )
VALUES
  (
    210027,
    'student_20230001',
    'khaled.haddad@zuj.edu.jo',
    'Khaled Haddad',
    'pbkdf2:sha512:210000:f085afb78ddc45d83c8ccd0b65fe0c54:28ea690cdb72ed1e3d0b3df7dc1a63d22caec5adc4e46cfe6f41687bac343f937b274cfd3348d88d3e0f0c8bf177a68d39321eff63c632e9bf5330b74b64e8cc',
    'student',
    1,
    NULL,
    NULL,
    NULL,
    'en',
    1,
    '2026-06-10 00:04:02',
    '2026-06-10 00:30:09',
    '2026-06-10 00:04:02',
    1,
    210024
  );
INSERT INTO
  `users` (
    `id`,
    `openId`,
    `email`,
    `name`,
    `password`,
    `role`,
    `departmentId`,
    `profilePicture`,
    `bio`,
    `phone`,
    `language`,
    `isActive`,
    `createdAt`,
    `updatedAt`,
    `lastSignedIn`,
    `isEmailVerified`,
    `advisorId`
  )
VALUES
  (
    210028,
    'student_20230002',
    'lina.omar@zuj.edu.jo',
    'Lina Omar',
    'pbkdf2:sha512:210000:f085afb78ddc45d83c8ccd0b65fe0c54:28ea690cdb72ed1e3d0b3df7dc1a63d22caec5adc4e46cfe6f41687bac343f937b274cfd3348d88d3e0f0c8bf177a68d39321eff63c632e9bf5330b74b64e8cc',
    'student',
    1,
    NULL,
    NULL,
    NULL,
    'en',
    1,
    '2026-06-10 00:04:02',
    '2026-06-10 00:30:09',
    '2026-06-10 00:04:02',
    1,
    210025
  );
INSERT INTO
  `users` (
    `id`,
    `openId`,
    `email`,
    `name`,
    `password`,
    `role`,
    `departmentId`,
    `profilePicture`,
    `bio`,
    `phone`,
    `language`,
    `isActive`,
    `createdAt`,
    `updatedAt`,
    `lastSignedIn`,
    `isEmailVerified`,
    `advisorId`
  )
VALUES
  (
    210029,
    'student_20230003',
    'basma.hassan@zuj.edu.jo',
    'Basma Hassan',
    'pbkdf2:sha512:210000:f085afb78ddc45d83c8ccd0b65fe0c54:28ea690cdb72ed1e3d0b3df7dc1a63d22caec5adc4e46cfe6f41687bac343f937b274cfd3348d88d3e0f0c8bf177a68d39321eff63c632e9bf5330b74b64e8cc',
    'student',
    1,
    NULL,
    NULL,
    NULL,
    'en',
    1,
    '2026-06-10 00:04:02',
    '2026-06-10 00:30:09',
    '2026-06-10 00:04:02',
    1,
    210026
  );
INSERT INTO
  `users` (
    `id`,
    `openId`,
    `email`,
    `name`,
    `password`,
    `role`,
    `departmentId`,
    `profilePicture`,
    `bio`,
    `phone`,
    `language`,
    `isActive`,
    `createdAt`,
    `updatedAt`,
    `lastSignedIn`,
    `isEmailVerified`,
    `advisorId`
  )
VALUES
  (
    210030,
    'student_20230004',
    'dana.hussein@zuj.edu.jo',
    'Dana Hussein',
    'pbkdf2:sha512:210000:f085afb78ddc45d83c8ccd0b65fe0c54:28ea690cdb72ed1e3d0b3df7dc1a63d22caec5adc4e46cfe6f41687bac343f937b274cfd3348d88d3e0f0c8bf177a68d39321eff63c632e9bf5330b74b64e8cc',
    'student',
    1,
    NULL,
    NULL,
    NULL,
    'en',
    1,
    '2026-06-10 00:04:02',
    '2026-06-10 00:30:09',
    '2026-06-10 00:04:02',
    1,
    210024
  );
INSERT INTO
  `users` (
    `id`,
    `openId`,
    `email`,
    `name`,
    `password`,
    `role`,
    `departmentId`,
    `profilePicture`,
    `bio`,
    `phone`,
    `language`,
    `isActive`,
    `createdAt`,
    `updatedAt`,
    `lastSignedIn`,
    `isEmailVerified`,
    `advisorId`
  )
VALUES
  (
    210031,
    'student_20230005',
    'hala.jaber@zuj.edu.jo',
    'Hala Jaber',
    'pbkdf2:sha512:210000:f085afb78ddc45d83c8ccd0b65fe0c54:28ea690cdb72ed1e3d0b3df7dc1a63d22caec5adc4e46cfe6f41687bac343f937b274cfd3348d88d3e0f0c8bf177a68d39321eff63c632e9bf5330b74b64e8cc',
    'student',
    1,
    NULL,
    NULL,
    NULL,
    'en',
    1,
    '2026-06-10 00:04:03',
    '2026-06-10 00:30:09',
    '2026-06-10 00:04:03',
    1,
    210025
  );
INSERT INTO
  `users` (
    `id`,
    `openId`,
    `email`,
    `name`,
    `password`,
    `role`,
    `departmentId`,
    `profilePicture`,
    `bio`,
    `phone`,
    `language`,
    `isActive`,
    `createdAt`,
    `updatedAt`,
    `lastSignedIn`,
    `isEmailVerified`,
    `advisorId`
  )
VALUES
  (
    210032,
    'student_20230006',
    'khaled.khalil@zuj.edu.jo',
    'Khaled Khalil',
    'pbkdf2:sha512:210000:f085afb78ddc45d83c8ccd0b65fe0c54:28ea690cdb72ed1e3d0b3df7dc1a63d22caec5adc4e46cfe6f41687bac343f937b274cfd3348d88d3e0f0c8bf177a68d39321eff63c632e9bf5330b74b64e8cc',
    'student',
    1,
    NULL,
    NULL,
    NULL,
    'en',
    1,
    '2026-06-10 00:04:03',
    '2026-06-10 00:30:09',
    '2026-06-10 00:04:03',
    1,
    210026
  );
INSERT INTO
  `users` (
    `id`,
    `openId`,
    `email`,
    `name`,
    `password`,
    `role`,
    `departmentId`,
    `profilePicture`,
    `bio`,
    `phone`,
    `language`,
    `isActive`,
    `createdAt`,
    `updatedAt`,
    `lastSignedIn`,
    `isEmailVerified`,
    `advisorId`
  )
VALUES
  (
    210033,
    'student_20230007',
    'mohammad.khatib@zuj.edu.jo',
    'Mohammad Khatib',
    'pbkdf2:sha512:210000:f085afb78ddc45d83c8ccd0b65fe0c54:28ea690cdb72ed1e3d0b3df7dc1a63d22caec5adc4e46cfe6f41687bac343f937b274cfd3348d88d3e0f0c8bf177a68d39321eff63c632e9bf5330b74b64e8cc',
    'student',
    1,
    NULL,
    NULL,
    NULL,
    'en',
    1,
    '2026-06-10 00:04:03',
    '2026-06-10 00:30:09',
    '2026-06-10 00:04:03',
    1,
    210024
  );
INSERT INTO
  `users` (
    `id`,
    `openId`,
    `email`,
    `name`,
    `password`,
    `role`,
    `departmentId`,
    `profilePicture`,
    `bio`,
    `phone`,
    `language`,
    `isActive`,
    `createdAt`,
    `updatedAt`,
    `lastSignedIn`,
    `isEmailVerified`,
    `advisorId`
  )
VALUES
  (
    210034,
    'student_20230008',
    'ali.faris@zuj.edu.jo',
    'Ali Faris',
    'pbkdf2:sha512:210000:f085afb78ddc45d83c8ccd0b65fe0c54:28ea690cdb72ed1e3d0b3df7dc1a63d22caec5adc4e46cfe6f41687bac343f937b274cfd3348d88d3e0f0c8bf177a68d39321eff63c632e9bf5330b74b64e8cc',
    'student',
    1,
    NULL,
    NULL,
    NULL,
    'en',
    1,
    '2026-06-10 00:04:03',
    '2026-06-10 00:30:09',
    '2026-06-10 00:04:03',
    1,
    210025
  );
INSERT INTO
  `users` (
    `id`,
    `openId`,
    `email`,
    `name`,
    `password`,
    `role`,
    `departmentId`,
    `profilePicture`,
    `bio`,
    `phone`,
    `language`,
    `isActive`,
    `createdAt`,
    `updatedAt`,
    `lastSignedIn`,
    `isEmailVerified`,
    `advisorId`
  )
VALUES
  (
    210035,
    'student_20230009',
    'ibrahim.rashid@zuj.edu.jo',
    'Ibrahim Rashid',
    'pbkdf2:sha512:210000:f085afb78ddc45d83c8ccd0b65fe0c54:28ea690cdb72ed1e3d0b3df7dc1a63d22caec5adc4e46cfe6f41687bac343f937b274cfd3348d88d3e0f0c8bf177a68d39321eff63c632e9bf5330b74b64e8cc',
    'student',
    1,
    NULL,
    NULL,
    NULL,
    'en',
    1,
    '2026-06-10 00:04:03',
    '2026-06-10 00:30:09',
    '2026-06-10 00:04:03',
    1,
    210026
  );
INSERT INTO
  `users` (
    `id`,
    `openId`,
    `email`,
    `name`,
    `password`,
    `role`,
    `departmentId`,
    `profilePicture`,
    `bio`,
    `phone`,
    `language`,
    `isActive`,
    `createdAt`,
    `updatedAt`,
    `lastSignedIn`,
    `isEmailVerified`,
    `advisorId`
  )
VALUES
  (
    210036,
    'student_20230010',
    'sara.mahmoud@zuj.edu.jo',
    'Sara Mahmoud',
    'pbkdf2:sha512:210000:f085afb78ddc45d83c8ccd0b65fe0c54:28ea690cdb72ed1e3d0b3df7dc1a63d22caec5adc4e46cfe6f41687bac343f937b274cfd3348d88d3e0f0c8bf177a68d39321eff63c632e9bf5330b74b64e8cc',
    'student',
    1,
    NULL,
    NULL,
    NULL,
    'en',
    1,
    '2026-06-10 00:04:03',
    '2026-06-10 00:30:09',
    '2026-06-10 00:04:03',
    1,
    210024
  );
INSERT INTO
  `users` (
    `id`,
    `openId`,
    `email`,
    `name`,
    `password`,
    `role`,
    `departmentId`,
    `profilePicture`,
    `bio`,
    `phone`,
    `language`,
    `isActive`,
    `createdAt`,
    `updatedAt`,
    `lastSignedIn`,
    `isEmailVerified`,
    `advisorId`
  )
VALUES
  (
    210037,
    'student_20230011',
    'hala.mahmoud@zuj.edu.jo',
    'Hala Mahmoud',
    'pbkdf2:sha512:210000:f085afb78ddc45d83c8ccd0b65fe0c54:28ea690cdb72ed1e3d0b3df7dc1a63d22caec5adc4e46cfe6f41687bac343f937b274cfd3348d88d3e0f0c8bf177a68d39321eff63c632e9bf5330b74b64e8cc',
    'student',
    1,
    NULL,
    NULL,
    NULL,
    'en',
    1,
    '2026-06-10 00:04:03',
    '2026-06-10 00:30:09',
    '2026-06-10 00:04:03',
    1,
    210025
  );
INSERT INTO
  `users` (
    `id`,
    `openId`,
    `email`,
    `name`,
    `password`,
    `role`,
    `departmentId`,
    `profilePicture`,
    `bio`,
    `phone`,
    `language`,
    `isActive`,
    `createdAt`,
    `updatedAt`,
    `lastSignedIn`,
    `isEmailVerified`,
    `advisorId`
  )
VALUES
  (
    210038,
    'student_20230012',
    'sara.faris@zuj.edu.jo',
    'Sara Faris',
    'pbkdf2:sha512:210000:f085afb78ddc45d83c8ccd0b65fe0c54:28ea690cdb72ed1e3d0b3df7dc1a63d22caec5adc4e46cfe6f41687bac343f937b274cfd3348d88d3e0f0c8bf177a68d39321eff63c632e9bf5330b74b64e8cc',
    'student',
    1,
    NULL,
    NULL,
    NULL,
    'en',
    1,
    '2026-06-10 00:04:03',
    '2026-06-10 00:30:09',
    '2026-06-10 00:04:03',
    1,
    210026
  );
INSERT INTO
  `users` (
    `id`,
    `openId`,
    `email`,
    `name`,
    `password`,
    `role`,
    `departmentId`,
    `profilePicture`,
    `bio`,
    `phone`,
    `language`,
    `isActive`,
    `createdAt`,
    `updatedAt`,
    `lastSignedIn`,
    `isEmailVerified`,
    `advisorId`
  )
VALUES
  (
    210039,
    'student_20230013',
    'lina.jaber@zuj.edu.jo',
    'Lina Jaber',
    'pbkdf2:sha512:210000:f085afb78ddc45d83c8ccd0b65fe0c54:28ea690cdb72ed1e3d0b3df7dc1a63d22caec5adc4e46cfe6f41687bac343f937b274cfd3348d88d3e0f0c8bf177a68d39321eff63c632e9bf5330b74b64e8cc',
    'student',
    1,
    NULL,
    NULL,
    NULL,
    'en',
    1,
    '2026-06-10 00:04:04',
    '2026-06-10 00:30:09',
    '2026-06-10 00:04:04',
    1,
    210024
  );
INSERT INTO
  `users` (
    `id`,
    `openId`,
    `email`,
    `name`,
    `password`,
    `role`,
    `departmentId`,
    `profilePicture`,
    `bio`,
    `phone`,
    `language`,
    `isActive`,
    `createdAt`,
    `updatedAt`,
    `lastSignedIn`,
    `isEmailVerified`,
    `advisorId`
  )
VALUES
  (
    210040,
    'student_20230014',
    'zaid.suleiman@zuj.edu.jo',
    'Zaid Suleiman',
    'pbkdf2:sha512:210000:f085afb78ddc45d83c8ccd0b65fe0c54:28ea690cdb72ed1e3d0b3df7dc1a63d22caec5adc4e46cfe6f41687bac343f937b274cfd3348d88d3e0f0c8bf177a68d39321eff63c632e9bf5330b74b64e8cc',
    'student',
    1,
    NULL,
    NULL,
    NULL,
    'en',
    1,
    '2026-06-10 00:04:04',
    '2026-06-10 00:30:09',
    '2026-06-10 00:04:04',
    1,
    210025
  );
INSERT INTO
  `users` (
    `id`,
    `openId`,
    `email`,
    `name`,
    `password`,
    `role`,
    `departmentId`,
    `profilePicture`,
    `bio`,
    `phone`,
    `language`,
    `isActive`,
    `createdAt`,
    `updatedAt`,
    `lastSignedIn`,
    `isEmailVerified`,
    `advisorId`
  )
VALUES
  (
    210041,
    'student_20230015',
    'ibrahim.jaber@zuj.edu.jo',
    'Ibrahim Jaber',
    'pbkdf2:sha512:210000:f085afb78ddc45d83c8ccd0b65fe0c54:28ea690cdb72ed1e3d0b3df7dc1a63d22caec5adc4e46cfe6f41687bac343f937b274cfd3348d88d3e0f0c8bf177a68d39321eff63c632e9bf5330b74b64e8cc',
    'student',
    1,
    NULL,
    NULL,
    NULL,
    'en',
    1,
    '2026-06-10 00:04:04',
    '2026-06-10 00:30:09',
    '2026-06-10 00:04:04',
    1,
    210026
  );
INSERT INTO
  `users` (
    `id`,
    `openId`,
    `email`,
    `name`,
    `password`,
    `role`,
    `departmentId`,
    `profilePicture`,
    `bio`,
    `phone`,
    `language`,
    `isActive`,
    `createdAt`,
    `updatedAt`,
    `lastSignedIn`,
    `isEmailVerified`,
    `advisorId`
  )
VALUES
  (
    210042,
    'student_20230016',
    'rana.khalil@zuj.edu.jo',
    'Rana Khalil',
    'pbkdf2:sha512:210000:f085afb78ddc45d83c8ccd0b65fe0c54:28ea690cdb72ed1e3d0b3df7dc1a63d22caec5adc4e46cfe6f41687bac343f937b274cfd3348d88d3e0f0c8bf177a68d39321eff63c632e9bf5330b74b64e8cc',
    'student',
    1,
    NULL,
    NULL,
    NULL,
    'en',
    1,
    '2026-06-10 00:04:04',
    '2026-06-10 00:30:09',
    '2026-06-10 00:04:04',
    1,
    210024
  );
INSERT INTO
  `users` (
    `id`,
    `openId`,
    `email`,
    `name`,
    `password`,
    `role`,
    `departmentId`,
    `profilePicture`,
    `bio`,
    `phone`,
    `language`,
    `isActive`,
    `createdAt`,
    `updatedAt`,
    `lastSignedIn`,
    `isEmailVerified`,
    `advisorId`
  )
VALUES
  (
    210043,
    'student_20230017',
    'basma.sabbah@zuj.edu.jo',
    'Basma Sabbah',
    'pbkdf2:sha512:210000:f085afb78ddc45d83c8ccd0b65fe0c54:28ea690cdb72ed1e3d0b3df7dc1a63d22caec5adc4e46cfe6f41687bac343f937b274cfd3348d88d3e0f0c8bf177a68d39321eff63c632e9bf5330b74b64e8cc',
    'student',
    1,
    NULL,
    NULL,
    NULL,
    'en',
    1,
    '2026-06-10 00:04:04',
    '2026-06-10 00:30:09',
    '2026-06-10 00:04:04',
    1,
    210025
  );
INSERT INTO
  `users` (
    `id`,
    `openId`,
    `email`,
    `name`,
    `password`,
    `role`,
    `departmentId`,
    `profilePicture`,
    `bio`,
    `phone`,
    `language`,
    `isActive`,
    `createdAt`,
    `updatedAt`,
    `lastSignedIn`,
    `isEmailVerified`,
    `advisorId`
  )
VALUES
  (
    210044,
    'student_20230018',
    'maya.saleh@zuj.edu.jo',
    'Maya Saleh',
    'pbkdf2:sha512:210000:f085afb78ddc45d83c8ccd0b65fe0c54:28ea690cdb72ed1e3d0b3df7dc1a63d22caec5adc4e46cfe6f41687bac343f937b274cfd3348d88d3e0f0c8bf177a68d39321eff63c632e9bf5330b74b64e8cc',
    'student',
    1,
    NULL,
    NULL,
    NULL,
    'en',
    1,
    '2026-06-10 00:04:04',
    '2026-06-10 00:30:09',
    '2026-06-10 00:04:04',
    1,
    210026
  );
INSERT INTO
  `users` (
    `id`,
    `openId`,
    `email`,
    `name`,
    `password`,
    `role`,
    `departmentId`,
    `profilePicture`,
    `bio`,
    `phone`,
    `language`,
    `isActive`,
    `createdAt`,
    `updatedAt`,
    `lastSignedIn`,
    `isEmailVerified`,
    `advisorId`
  )
VALUES
  (
    210045,
    'student_20230019',
    'sara.mansour@zuj.edu.jo',
    'Sara Mansour',
    'pbkdf2:sha512:210000:f085afb78ddc45d83c8ccd0b65fe0c54:28ea690cdb72ed1e3d0b3df7dc1a63d22caec5adc4e46cfe6f41687bac343f937b274cfd3348d88d3e0f0c8bf177a68d39321eff63c632e9bf5330b74b64e8cc',
    'student',
    1,
    NULL,
    NULL,
    NULL,
    'en',
    1,
    '2026-06-10 00:04:04',
    '2026-06-10 00:30:09',
    '2026-06-10 00:04:04',
    1,
    210024
  );
INSERT INTO
  `users` (
    `id`,
    `openId`,
    `email`,
    `name`,
    `password`,
    `role`,
    `departmentId`,
    `profilePicture`,
    `bio`,
    `phone`,
    `language`,
    `isActive`,
    `createdAt`,
    `updatedAt`,
    `lastSignedIn`,
    `isEmailVerified`,
    `advisorId`
  )
VALUES
  (
    210046,
    'student_20230020',
    'hassan.suleiman@zuj.edu.jo',
    'Hassan Suleiman',
    'pbkdf2:sha512:210000:f085afb78ddc45d83c8ccd0b65fe0c54:28ea690cdb72ed1e3d0b3df7dc1a63d22caec5adc4e46cfe6f41687bac343f937b274cfd3348d88d3e0f0c8bf177a68d39321eff63c632e9bf5330b74b64e8cc',
    'student',
    1,
    NULL,
    NULL,
    NULL,
    'en',
    1,
    '2026-06-10 00:04:04',
    '2026-06-10 00:30:09',
    '2026-06-10 00:04:04',
    1,
    210025
  );
INSERT INTO
  `users` (
    `id`,
    `openId`,
    `email`,
    `name`,
    `password`,
    `role`,
    `departmentId`,
    `profilePicture`,
    `bio`,
    `phone`,
    `language`,
    `isActive`,
    `createdAt`,
    `updatedAt`,
    `lastSignedIn`,
    `isEmailVerified`,
    `advisorId`
  )
VALUES
  (
    240001,
    'local-1781050829184-setef19m8',
    '202220650@std-zuj.edu.jo',
    'Noor',
    'pbkdf2:sha512:210000:3374ab9fe8b40c6f9208a6cf4994df7f:64b70fd4d7d25a01a359cdfed8741a7927ef483cdef99ac2080053a0d431a42a506234559970a5fc5eb825f01e5ee8e30bcac57fe32590a5f6bdc90e0cfc1bdb',
    'student',
    NULL,
    NULL,
    NULL,
    NULL,
    'en',
    1,
    '2026-06-10 00:20:29',
    '2026-06-10 00:20:29',
    '2026-06-10 00:20:29',
    0,
    NULL
  );
INSERT INTO
  `users` (
    `id`,
    `openId`,
    `email`,
    `name`,
    `password`,
    `role`,
    `departmentId`,
    `profilePicture`,
    `bio`,
    `phone`,
    `language`,
    `isActive`,
    `createdAt`,
    `updatedAt`,
    `lastSignedIn`,
    `isEmailVerified`,
    `advisorId`
  )
VALUES
  (
    240002,
    'hanan_001',
    'hanan@gmail.com',
    'Hanan',
    'pbkdf2:sha512:210000:f085afb78ddc45d83c8ccd0b65fe0c54:28ea690cdb72ed1e3d0b3df7dc1a63d22caec5adc4e46cfe6f41687bac343f937b274cfd3348d88d3e0f0c8bf177a68d39321eff63c632e9bf5330b74b64e8cc',
    'student',
    NULL,
    NULL,
    NULL,
    NULL,
    'en',
    1,
    '2026-06-10 00:22:43',
    '2026-06-10 09:21:33',
    '2026-06-10 09:21:33',
    1,
    NULL
  );

/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
