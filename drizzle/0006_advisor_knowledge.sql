ALTER TABLE `documents` ADD `description` varchar(500);
ALTER TABLE `documents` ADD `processingStatus` enum('pending','processing','indexed','failed') DEFAULT 'pending' NOT NULL;
