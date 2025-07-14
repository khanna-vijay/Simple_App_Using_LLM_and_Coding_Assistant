# Gemini Project: English Leap

This document provides a comprehensive guide for the Gemini CLI to understand and assist in the development of the "English Leap" application.

## 1. Project Overview

The **English Leap** is a desktop application built with React, designed to help users improve their English vocabulary. It provides interactive learning modules like flashcards, word training, and quizzes, with progress tracking stored locally in the browser.

- **Data Source:** The application's content is powered by the `99_02_comprehensive_english_dict.json` file.
- **Target Audience:** Learners preparing for standardized tests (SAT, GRE) and professionals seeking to enhance their business communication.

## 2. Core Technologies

- **Frontend Framework:** React.js
- **Routing:** React Router
- **State Management:** React Context API
- **Styling:** Material-UI
- **Development Environment:** Node.js and npm

## 3. Project Structure

The project will follow a standard `create-react-app` directory structure.

```
/
|-- public/
|   |-- index.html
|-- src/
|   |-- assets/
|   |   |-- 99_02_comprehensive_english_dict.json
|   |-- components/
|   |   |-- layout/
|   |   |   |-- Layout.js
|   |   |   |-- NavigationBar.js
|   |   |-- ui/
|   |   |   |-- Button.js
|   |   |   |-- Card.js
|   |   |   |-- SearchBar.js
|   |   |-- dashboard/
|   |   |   |-- StatisticsCard.js
|   |   |   |-- StruggledWordsList.js
|   |   |   |-- QuizHistory.js
|   |   |-- flashcards/
|   |   |   |-- DeckOptions.js
|   |   |   |-- Flashcard.js
|   |   |   |-- FlashcardControls.js
|   |   |-- quiz/
|   |   |   |-- QuizOptions.js
|   |   |   |-- Question.js
|   |   |   |-- QuizResult.js
|   |   |-- training/
|   |   |   |-- WordList.js
|   |   |   |-- WordDetail.js
|   |-- context/
|   |   |-- DictionaryContext.js
|   |   |-- UserProgressContext.js
|   |-- hooks/
|   |   |-- useLocalStorage.js
|   |   |-- useUserProgress.js
|   |-- pages/
|   |   |-- DashboardPage.js
|   |   |-- WordTrainingPage.js
|   |   |-- WordDetailPage.js
|   |   |-- FlashcardsPage.js
|   |   |-- QuizPage.js
|   |-- services/
|   |   |-- DictionaryService.js
|   |-- App.js
|   |-- index.js
|-- .gitignore
|-- package.json
|-- README.md
|-- GEMINI.md
```

- **`src/assets`**: Contains the main JSON dictionary file.
- **`src/components`**: Reusable UI components, organized by feature:
  - `layout/`: Application shell components (Layout, NavigationBar)
  - `ui/`: Generic reusable components (Button, Card, SearchBar)
  - `dashboard/`: Dashboard-specific components
  - `flashcards/`: Flashcard module components
  - `quiz/`: Quiz module components
  - `training/`: Word training module components
- **`src/context`**: React Context providers for global state management.
- **`src/hooks`**: Custom React hooks for local storage and user progress.
- **`src/pages`**: Top-level page components for each main view.
- **`src/services`**: Data handling modules for dictionary processing.

## 4. Development Commands

- **Install Dependencies:**
  ```bash
  npm install
  ```
- **Run Development Server:**
  ```bash
  npm start
  ```
- **Create Production Build:**
  ```bash
  npm run build
  ```
- **Run Tests:**
  ```bash
  npm test
  ```

## 5. Architectural & Style Conventions

- **Component Naming:** Use PascalCase for React components (e.g., `WordCard.js`).
- **File Naming:** Use kebab-case for non-component files (e.g., `api-client.js`).
- **Styling:** Adhere to Material-UI conventions for consistent design.
- **State Management:**
  - Use React Context API for global state management.
  - Use local component state (`useState`, `useReducer`) for component-specific logic.
- **Data Fetching:** The main dictionary JSON should be loaded once and provided through a React Context to avoid redundant processing.
- **Local Storage:** All user progress (quiz scores, struggled words) will be saved to the browser's local storage. Create a dedicated hook or service to manage this interaction.
- **Code Quality:** Adhere to standard ESLint and Prettier rules for React/JavaScript.

## 6. Key Functionality Mapping

- **Flashcards (Module 1):**
  - Implement a `Flashcard` component.
  - Allow users to select word sets by letter or complexity.
  - State should track "Known" vs. "Needs Practice" words.
- **Word Training (Module 2):**
  - Create a searchable list component.
  - Develop a `WordDetail` view to display all information from the JSON for a selected word.
- **Quizzes (Module 3):**
  - Build a `Quiz` component that generates multiple-choice questions.
  - Automatically add incorrectly answered words to a "Struggled Words" list in local storage.
- **Dashboard:**
  - Display statistics from local storage.
  - Show the "Struggled Words" list.
