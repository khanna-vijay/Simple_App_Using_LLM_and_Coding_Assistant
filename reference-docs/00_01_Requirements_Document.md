# English Leap - Software Requirements Specification

## 1. Introduction

### 1.1. Vision
The English Leap is a desktop application built with React, designed to help users significantly improve their English vocabulary. It targets learners preparing for standardized tests like the SAT and GRE, as well as professionals seeking to enhance their business communication skills. The application will provide a focused, interactive, and progress-oriented learning environment.

### 1.2. Scope
The initial version of this project will focus on delivering a core set of features for vocabulary building.

**In Scope:**
- Loading and processing words from the provided `99_02_comprehensive_english_dict.json` file.
- A clean, intuitive user interface that runs on modern web browsers on a Windows laptop.
- Core learning modules: Flashcards, Word Training, and Quizzes.
- User progress tracking, including scores and a list of challenging words.
- All user data will be stored locally in the browser.

**Out of Scope (for Version 1.0):**
- User account creation and cloud synchronization.
- Real-time multiplayer or social features.
- Content authoring (users cannot add their own words or definitions).
- Native mobile applications (iOS/Android).

## 2. User Personas

### 2.1. Priya, the GRE Aspirant
- **Goal:** Learn and memorize a large volume of difficult words for her upcoming GRE exam.
- **Needs:** Efficient study tools, rigorous testing, and detailed progress tracking to identify weaknesses.

### 2.2. John, the Business Professional
- **Goal:** Improve his vocabulary to communicate more effectively in meetings and emails.
- **Needs:** Clear definitions, contextual examples, and the ability to study in short, focused sessions.

## 3. Functional Requirements

### 3.1. Data Management
- The application MUST load and parse the `99_02_comprehensive_english_dict.json` file to populate its word database.
- The application MUST transform the nested JSON structure `{letter: {words: {wordName: {...}}}}` into a flattened array for efficient processing.
- The application MUST handle all word properties including meanings, pronunciations, examples, synonyms, antonyms, and word origins.
- **Complexity Levels:** The application MUST recognize and filter by two complexity levels:
  - "Advanced": Complex vocabulary suitable for GRE/SAT preparation
  - "Intermediate": Moderately difficult vocabulary for general improvement

### 3.2. Module 1: Flashcards
- **As a user, I want to select a letter or complexity level to generate a deck of flashcards.**
- **As a user, I want to see one side of the card with the word, and flip it to see the definition, example, and other details.**
- **As a user, I want to mark a card as "Known" or "Needs Practice" to influence future study sessions.**

### 3.3. Module 2: Word Training
- **As a user, I want a searchable list of all words in the dictionary.**
- **Search Functionality Requirements:**
  - Case-insensitive search across word names and definitions
  - Real-time filtering as user types
  - Support for partial word matching
  - Ability to filter by letter (A-Z) and complexity level
- **As a user, I want to click on a word to view a detailed page containing all its information:**
  - Pronunciation (text format, with placeholders for future audio).
  - All parts of speech and their corresponding definitions.
  - Synonyms and antonyms.
  - Example sentences for each meaning.
  - Word origin and root information.

### 3.4. Module 3: Testing & Assessment
- **As a user, I want to start a quiz based on specific word lists (e.g., by letter, complexity, or my "Needs Practice" list).**
- **Quiz Generation Algorithm Requirements:**
  - Each question shows a word and 4 definition choices (1 correct + 3 incorrect)
  - Incorrect choices are randomly selected from other words in the dictionary
  - Questions are presented in random order
  - Configurable number of questions (5, 10, 15, 20)
- **As a user, I want the quiz to be multiple-choice, testing me on word definitions.**
- **As a user, I want to receive immediate feedback on whether my answer was correct or incorrect.**
- **As a user, I want to see my final score (e.g., 8/10 correct) at the end of the quiz.**
- **Any word I answer incorrectly MUST be automatically added to my "Struggled Words" list.**

### 3.5. User Progress Tracking
- **As a user, I want a dedicated "Dashboard" or "Profile" section.**
- **This section MUST display my learning statistics, such as:**
  - Total words mastered (marked as "Known").
  - A list of my "Struggled Words".
  - Quiz history with scores.
- All progress data MUST be saved in the browser's local storage to persist between sessions.

## 4. Non-Functional Requirements

- **UI/UX:** The application will have a clean, modern, and minimalist design to ensure a distraction-free learning experience.
- **Performance:** The application must be highly responsive, with fast load times and smooth transitions. The large JSON file should be processed efficiently without freezing the UI. Search functionality must provide results within 100ms for optimal user experience.
- **Technology Stack:**
  - **Frontend:** React.js
  - **Styling:** Material-UI for a consistent and professional look.
  - **Routing:** React Router for seamless navigation between modules.
  - **State Management:** React Context API for managing application state.
- **Compatibility:** The web application must be fully functional on the latest versions of Google Chrome, Mozilla Firefox, and Microsoft Edge.

## 5. Additional Insights & Future Enhancements

To make the application more effective and engaging, the following enhancements should be considered for future versions:

- **Spaced Repetition System (SRS):** Instead of random flashcards, implement an SRS algorithm. Words the user struggles with will appear more frequently, while known words appear less often. This is a scientifically proven method for efficient long-term memorization.
- **Gamification:** Introduce elements like points, daily streaks, and achievement badges (e.g., "Mastered 50 Advanced Words," "5-Day Study Streak") to boost user motivation and engagement.
- **Audio Pronunciation:** Integrate MP3 files for each word, allowing users to hear the correct pronunciation. A play button would be placed next to the written phonetic spelling.
- **"Word of the Day":** A feature on the main dashboard that presents a new word each day to encourage regular engagement.
- **Advanced Filtering:** Allow users to create custom study sets by combining filters, such as "Advanced verbs starting with 'C'" or "Intermediate words with Latin roots."
- **Contextual Sentences:** Integrate with a third-party API to pull in more real-world example sentences from news articles or books, showing how words are used in different contexts.
- **Offline Mode:** Implement a service worker to cache the application and data, allowing users to continue learning even without an active internet connection.
