-- English Leap Database Schema
-- This schema represents the logical data structure for English Leap
-- Currently implemented using browser localStorage, but designed for future database migration

-- ============================================================================
-- DICTIONARY TABLES
-- ============================================================================

-- Main vocabulary words table
CREATE TABLE words (
    id INTEGER PRIMARY KEY,
    word VARCHAR(100) NOT NULL UNIQUE,
    part_of_speech VARCHAR(20) NOT NULL,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    frequency_rank INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Word definitions table (supports multiple definitions per word)
CREATE TABLE definitions (
    id INTEGER PRIMARY KEY,
    word_id INTEGER NOT NULL,
    definition TEXT NOT NULL,
    definition_order INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
);

-- Example sentences for words
CREATE TABLE examples (
    id INTEGER PRIMARY KEY,
    word_id INTEGER NOT NULL,
    example_text TEXT NOT NULL,
    example_order INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
);

-- Synonyms and antonyms
CREATE TABLE word_relations (
    id INTEGER PRIMARY KEY,
    word_id INTEGER NOT NULL,
    related_word_id INTEGER NOT NULL,
    relation_type VARCHAR(20) NOT NULL CHECK (relation_type IN ('synonym', 'antonym')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
    FOREIGN KEY (related_word_id) REFERENCES words(id) ON DELETE CASCADE,
    UNIQUE(word_id, related_word_id, relation_type)
);

-- Audio files for pronunciation
CREATE TABLE audio_files (
    id INTEGER PRIMARY KEY,
    word_id INTEGER NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    voice_type VARCHAR(50) DEFAULT 'default',
    file_size INTEGER,
    duration_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
);

-- ============================================================================
-- USER DATA TABLES
-- ============================================================================

-- User profiles (for future multi-user support)
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE,
    display_name VARCHAR(100),
    learning_goal_daily INTEGER DEFAULT 10,
    learning_goal_weekly INTEGER DEFAULT 50,
    proficiency_level VARCHAR(20) DEFAULT 'intermediate',
    preferred_voice VARCHAR(50) DEFAULT 'default',
    font_size_preference DECIMAL(3,1) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User progress tracking for individual words
CREATE TABLE user_word_progress (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    word_id INTEGER NOT NULL,
    mastery_level INTEGER DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 5),
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_reviewed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    review_count INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    incorrect_count INTEGER DEFAULT 0,
    next_review TIMESTAMP,
    is_mastered BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
    UNIQUE(user_id, word_id)
);

-- Learning sessions tracking
CREATE TABLE learning_sessions (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('flashcard', 'quiz', 'training')),
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    words_studied INTEGER DEFAULT 0,
    words_mastered INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    total_answers INTEGER DEFAULT 0,
    session_data JSON, -- Additional session-specific data
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Quiz results and performance tracking
CREATE TABLE quiz_results (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    session_id INTEGER,
    word_id INTEGER NOT NULL,
    question_type VARCHAR(50),
    user_answer TEXT,
    correct_answer TEXT,
    is_correct BOOLEAN NOT NULL,
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES learning_sessions(id) ON DELETE SET NULL,
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
);

-- User achievements and badges
CREATE TABLE user_achievements (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    achievement_type VARCHAR(50) NOT NULL,
    achievement_name VARCHAR(100) NOT NULL,
    description TEXT,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON, -- Additional achievement data
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- SYSTEM TABLES
-- ============================================================================

-- Application settings and configuration
CREATE TABLE app_settings (
    id INTEGER PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type VARCHAR(20) DEFAULT 'string',
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data migration tracking
CREATE TABLE schema_migrations (
    version VARCHAR(50) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Word lookup indexes
CREATE INDEX idx_words_word ON words(word);
CREATE INDEX idx_words_part_of_speech ON words(part_of_speech);
CREATE INDEX idx_words_difficulty ON words(difficulty_level);
CREATE INDEX idx_words_frequency ON words(frequency_rank);

-- Definition lookup
CREATE INDEX idx_definitions_word_id ON definitions(word_id);

-- Example lookup
CREATE INDEX idx_examples_word_id ON examples(word_id);

-- Word relations lookup
CREATE INDEX idx_word_relations_word_id ON word_relations(word_id);
CREATE INDEX idx_word_relations_related_id ON word_relations(related_word_id);
CREATE INDEX idx_word_relations_type ON word_relations(relation_type);

-- Audio file lookup
CREATE INDEX idx_audio_files_word_id ON audio_files(word_id);

-- User progress indexes
CREATE INDEX idx_user_word_progress_user_id ON user_word_progress(user_id);
CREATE INDEX idx_user_word_progress_word_id ON user_word_progress(word_id);
CREATE INDEX idx_user_word_progress_mastered ON user_word_progress(is_mastered);
CREATE INDEX idx_user_word_progress_next_review ON user_word_progress(next_review);

-- Session tracking indexes
CREATE INDEX idx_learning_sessions_user_id ON learning_sessions(user_id);
CREATE INDEX idx_learning_sessions_type ON learning_sessions(session_type);
CREATE INDEX idx_learning_sessions_start_time ON learning_sessions(start_time);

-- Quiz results indexes
CREATE INDEX idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX idx_quiz_results_word_id ON quiz_results(word_id);
CREATE INDEX idx_quiz_results_session_id ON quiz_results(session_id);
CREATE INDEX idx_quiz_results_created_at ON quiz_results(created_at);

-- Achievement indexes
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_type ON user_achievements(achievement_type);

-- ============================================================================
-- SAMPLE DATA INSERTS
-- ============================================================================

-- Insert sample application settings
INSERT INTO app_settings (setting_key, setting_value, setting_type, description) VALUES
('app_version', '1.0.0', 'string', 'Current application version'),
('default_daily_goal', '10', 'integer', 'Default daily learning goal'),
('default_weekly_goal', '50', 'integer', 'Default weekly learning goal'),
('spaced_repetition_enabled', 'true', 'boolean', 'Enable spaced repetition algorithm'),
('max_quiz_questions', '50', 'integer', 'Maximum questions per quiz session');

-- Insert schema migration record
INSERT INTO schema_migrations (version, description) VALUES
('1.0.0', 'Initial schema creation with core tables and indexes');

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for complete word information
CREATE VIEW word_details AS
SELECT 
    w.id,
    w.word,
    w.part_of_speech,
    w.difficulty_level,
    w.frequency_rank,
    GROUP_CONCAT(d.definition, ' | ') as definitions,
    GROUP_CONCAT(e.example_text, ' | ') as examples
FROM words w
LEFT JOIN definitions d ON w.id = d.word_id
LEFT JOIN examples e ON w.id = e.word_id
GROUP BY w.id, w.word, w.part_of_speech, w.difficulty_level, w.frequency_rank;

-- View for user learning statistics
CREATE VIEW user_learning_stats AS
SELECT 
    u.id as user_id,
    u.username,
    COUNT(uwp.word_id) as total_words_studied,
    SUM(CASE WHEN uwp.is_mastered = TRUE THEN 1 ELSE 0 END) as words_mastered,
    AVG(uwp.mastery_level) as average_mastery_level,
    MAX(uwp.last_reviewed) as last_study_date
FROM users u
LEFT JOIN user_word_progress uwp ON u.id = uwp.user_id
GROUP BY u.id, u.username;
