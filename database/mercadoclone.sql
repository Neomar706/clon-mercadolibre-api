CREATE TABLE `users` (
  `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(15) NOT NULL,
  `lastname` VARCHAR(15) NOT NULL,
  `username` VARCHAR(15) NOT NULL,
  `dni` INT NOT NULL,
  `email` VARCHAR(25) NOT NULL,
  `password` VARCHAR(60) NOT NULL,
  `phone` VARCHAR(15),
  `reset_pwd_token` VARCHAR(70) DEFAULT NULL,
  `reset_pwd_expire` TIMESTAMP DEFAULT NULL
)ENGINE=InnoDB;

CREATE TABLE `articles` (
  `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `title` VARCHAR(80) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `brand` VARCHAR(20) NOT NULL,
  `model` VARCHAR(20) NOT NULL,
  `is_new` BOOLEAN NOT NULL,
  `stock` INT NOT NULL,
  `price` FLOAT(2) NOT NULL,
  `shipment_type` BOOLEAN NOT NULL,
  `days_warranty` INT NOT NULL,
  `description` TEXT
)ENGINE=InnoDB;

CREATE TABLE `pictures` (
  `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `public_id` VARCHAR(20) NOT NULL,
  `article_id` INT NOT NULL,
  `link` TEXT NOT NULL
)ENGINE=InnoDB;

CREATE TABLE `favorites` (
  `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `article_id` INT NOT NULL,
  `link` TEXT NOT NULL
)ENGINE=InnoDB;

CREATE TABLE `addresses` (
  `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `state` VARCHAR(20) NOT NULL,
  `city` VARCHAR(20) NOT NULL,
  `municipality` VARCHAR(20) NOT NULL,
  `street` VARCHAR(20) NOT NULL,
  `house_number` int,
  `current_address` BOOLEAN NOT NULL
)ENGINE=InnoDB;

CREATE TABLE `history` (
  `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `article_id` INT NOT NULL,
  `date` TIMESTAMP NOT NULL,
  `link` TEXT NOT NULL
)ENGINE=InnoDB;

CREATE TABLE `purchases` (
  `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `article_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `delivered` BOOLEAN DEFAULT 0,
  `date` TIMESTAMP NOT NULL,
  `link` TEXT NOT NULL
)ENGINE=InnoDB;

CREATE TABLE `reviews` (
  `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `article_id` INT NOT NULL,
  `rating` INT NOT NULL,
  `review` TEXT NOT NULL,
  `date` TIMESTAMP NOT NULL
)ENGINE=InnoDB;

CREATE TABLE `questions_info` (
  `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `user_asks_id` INT NOT NULL,
  `article_id` INT NOT NULL,
  `link` TEXT NOT NULL
)ENGINE=InnoDB;

CREATE TABLE `questions` (
  `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `questions_info_id` INT NOT NULL,
  `question` TEXT NOT NULL,
  `question_date` TIMESTAMP NOT NULL,
  `answer` TEXT NOT NULL,
  `answer_date` TIMESTAMP NOT NULL
)ENGINE=InnoDB;

CREATE TABLE `messages` (
  `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `user_sender_id` INT NOT NULL,
  `purchase_id` INT NOT NULL,
  `message` TEXT NOT NULL,
  `date` TIMESTAMP NOT NULL
)ENGINE=InnoDB;

ALTER TABLE `articles` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `pictures` ADD FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `favorites` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `favorites` ADD FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`);

ALTER TABLE `addresses` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `history` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `history` ADD FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`);

ALTER TABLE `purchases` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `purchases` ADD FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`);

ALTER TABLE `reviews` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `reviews` ADD FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`);

ALTER TABLE `questions_info` ADD FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `questions_info` ADD FOREIGN KEY (`user_asks_id`) REFERENCES `users` (`id`);

ALTER TABLE `questions` ADD FOREIGN KEY (`questions_info_id`) REFERENCES `questions_info` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `messages` ADD FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `messages` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
