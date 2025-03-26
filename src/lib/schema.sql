-- Create the database
CREATE DATABASE IF NOT EXISTS beep_boop_chat;
USE beep_boop_chat;

-- Create USERS table
CREATE TABLE IF NOT EXISTS USERS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    credits FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create LLM_MODELS table
CREATE TABLE IF NOT EXISTS LLM_MODELS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    token_cost FLOAT,
    model_path VARCHAR(255),
    parameters VARCHAR(255),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create CHATS table
CREATE TABLE IF NOT EXISTS CHATS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    title VARCHAR(255),
    chat_data JSON,
    FOREIGN KEY(user_id) REFERENCES USERS(id) ON DELETE CASCADE
);

-- Create CHAT_MODELS table
CREATE TABLE IF NOT EXISTS CHAT_MODELS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id INT NOT NULL,
    model_id INT NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(chat_id) REFERENCES CHATS(id) ON DELETE CASCADE,
    FOREIGN KEY(model_id) REFERENCES LLM_MODELS(id) ON DELETE CASCADE
);

-- Create BOOKMARKS table
CREATE TABLE IF NOT EXISTS BOOKMARKS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    position_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(chat_id) REFERENCES CHATS(id) ON DELETE CASCADE
);

-- Insert initial LLM models
INSERT INTO LLM_MODELS (name, description, token_cost, model_path) VALUES
('phi-4-mini-instruct', 'Microsoft Phi-4 Mini Instruct Model - Efficient and compact language model', 0.5, 'microsoft/phi-4-mini-instruct'),
('gemma-3-4b-it', 'Google Gemma 3.4B Instruct Tuned - Balanced performance and efficiency', 1.0, 'google/gemma-3-4b-it'),
('deepseek-r1-distill-qwen-7b', 'DeepSeek R1 Distilled Qwen 7B - High performance large language model', 1.5, 'deepseek/r1-distill-qwen-7b');

-- Create an index on chat_data for better performance
ALTER TABLE CHATS ADD FULLTEXT INDEX chat_data_idx (chat_data);

-- Create an index on bookmarks for limiting to 10 per chat
CREATE INDEX idx_chat_bookmarks ON BOOKMARKS(chat_id);

-- Create a trigger to enforce max 10 bookmarks per chat
DELIMITER //
CREATE TRIGGER check_bookmark_limit
BEFORE INSERT ON BOOKMARKS
FOR EACH ROW
BEGIN
    DECLARE bookmark_count INT;
    SELECT COUNT(*) INTO bookmark_count
    FROM BOOKMARKS
    WHERE chat_id = NEW.chat_id;
    
    IF bookmark_count >= 10 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Maximum limit of 10 bookmarks per chat reached';
    END IF;
END;//
DELIMITER ;
