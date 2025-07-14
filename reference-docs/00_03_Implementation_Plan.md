# English Leap - Implementation Plan

## 0. Introduction

This document provides a systematic, step-by-step plan for constructing the **English Leap** application. It is designed to be executed by a coding assistant (e.g., Gemini CLI, Cursor) and is based on the specifications in the `00_Requirements_Document.md` and the `00_Software_Architecture.md`.

Each step contains a clear instruction for the assistant.

---

## Phase 1: Project Setup & Foundation

**Objective:** Initialize the React project, install dependencies, and create the core directory structure.

- **Step 1.1: Initialize React Application**
  - **Instruction:** "Using the command line, generate a new React application named `english-leap` using `create-react-app`."
  ```bash
  npx create-react-app english-leap
  cd english-leap
  ```

- **Step 1.2: Install Dependencies**
  - **Instruction:** "Install the necessary npm packages: `react-router-dom` for routing, and Material-UI for the component library."
  ```bash
  npm install react-router-dom @mui/material @emotion/react @emotion/styled @mui/icons-material
  ```

- **Step 1.3: Clean Up Project**
  - **Instruction:** "Delete the default files from the `src` directory: `App.css`, `App.test.js`, `logo.svg`, and `setupTests.js`. Clean up the `App.js` and `index.css` files to be minimal."

- **Step 1.4: Create Directory Structure**
  - **Instruction:** "Based on the software architecture, create the following directory structure inside the `src` folder."
  ```bash
  mkdir -p src/assets src/components/layout src/components/ui src/components/dashboard src/components/flashcards src/components/quiz src/components/training src/context src/hooks src/pages src/services
  ```

- **Step 1.5: Add Data Asset**
  - **Instruction:** "Move the dictionary file `99_02_comprehensive_english_dict.json` into the `src/assets` directory."

---

## Phase 2: Core Services & Data Context

**Objective:** Set up the data loading and state management foundation.

- **Step 2.1: Create Local Storage Hook**
  - **Instruction:** "Create a new file `src/hooks/useLocalStorage.js`. Implement a custom hook named `useLocalStorage` that takes a `key` and an `initialValue`. This hook should manage state with `useState` and use `useEffect` to persist the state to the browser's local storage whenever it changes."

- **Step 2.2: Create Dictionary Service**
  - **Instruction:** "Create a new file `src/services/DictionaryService.js`. This file should handle loading and transforming the JSON data. Implement the following functions:"
    - `loadDictionary()`: Fetches `../assets/99_02_comprehensive_english_dict.json` and transforms the nested structure.
    - **Data Transformation Logic:** Convert `{A: {words: {Abase: {...}, Abate: {...}}}}` to `[{word: "Abase", letter: "A", ...}, {word: "Abate", letter: "A", ...}]`
    - `getWordsByLetter(words, letter)`: Filters the flattened array by starting letter.
    - `getWordsByComplexity(words, complexity)`: Filters by complexity level ("Advanced", "Intermediate").
    - `searchWords(words, query)`: Performs case-insensitive search across word names and definitions.
    - `generateQuizChoices(words, correctWord, count=4)`: Generates multiple choice options for quizzes by randomly selecting incorrect definitions from other words.

- **Step 2.3: Create Dictionary Context**
  - **Instruction:** "Create the file `src/context/DictionaryContext.js`. Implement a `DictionaryProvider` component. This provider should use the `loadDictionary` service on mount to fetch the data and store it in a state. It must provide the list of words, a loading status, and any potential error to its children."

---

## Phase 3: Layout, Routing, and User Progress

**Objective:** Build the main application shell, navigation, and user data management.

- **Step 3.1: Create Layout Components**
  - **Instruction:** "Create the main layout in `src/components/layout/Layout.js`. It should include a `NavigationBar` component and a main content area to render child routes. Create the `src/components/layout/NavigationBar.js` component using Material-UI's `AppBar`, `Toolbar`, and `Button` components to create navigation links for `/`, `/training`, `/flashcards`, and `/quiz`."

- **Step 3.2: Set Up Application Routing**
  - **Instruction:** "In `src/App.js`, set up `react-router-dom`. Wrap the application with the `DictionaryProvider`. Use the `Layout` component to structure the app. Define the primary routes for the application as specified in the architecture document."

- **Step 3.3: Create User Progress Hook & Context**
  - **Instruction:** "Create the `src/hooks/useUserProgress.js` custom hook. It should use your `useLocalStorage` hook to manage three pieces of state: `knownWords` (an array of word strings), `struggledWords` (an array of word strings), and `quizHistory` (an array of objects). Export functions to add/remove words and add quiz results."
  - **Instruction:** "Create `src/context/UserProgressContext.js`. This provider should use the `useUserProgress` hook and provide the progress data and update functions to its children."

- **Step 3.4: Integrate User Progress Provider**
  - **Instruction:** "In `src/App.js`, wrap the application's routes with the `UserProgressProvider` inside the `DictionaryProvider`."

---

## Phase 4: Feature Implementation

**Objective:** Build the core user-facing features one by one.

- **Step 4.1: Build the Dashboard**
  - **Instruction:** "Create the `src/pages/DashboardPage.js`. This page should consume the `UserProgressContext`. Create the necessary child components inside `src/components/dashboard/`: `StatisticsCard.js` to show counts of known/struggled words, and `StruggledWordsList.js` to display the list of words the user has struggled with."

- **Step 4.2: Build the Word Training Module**
  - **Instruction:** "Create the `src/pages/WordTrainingPage.js`. It should contain a search bar and the `WordList` component. Create `src/components/training/WordList.js` which consumes `DictionaryContext` to display a virtualized list of all words. Implement filtering based on the search bar input. Each item should link to a detail page."
  - **Instruction:** "Create the `src/pages/WordDetailPage.js`. This page will display all information for a single word, identified by a URL parameter. Fetch the word data from the `DictionaryContext`."

- **Step 4.3: Build the Flashcards Module**
  - **Instruction:** "Create `src/pages/FlashcardsPage.js`. It should contain `DeckOptions` and the `Flashcard` viewer. Create `src/components/flashcards/DeckOptions.js` to allow users to select a word set (e.g., by letter, by complexity). Create `src/components/flashcards/Flashcard.js`, a component that shows a word on the front and its details on the back. Add controls (`FlashcardControls.js`) to flip the card and mark it as 'Known' or 'Needs Practice', which should interact with the `UserProgressContext`."

- **Step 4.4: Build the Quiz Module**
  - **Instruction:** "Create `src/pages/QuizPage.js`. It should manage the quiz state. Create the following components:"
    - `src/components/quiz/QuizOptions.js`: Form to configure quiz (word set, number of questions).
    - `src/components/quiz/Question.js`: Displays a word and 4 definition choices.
    - **Quiz Generation Logic:** Use `DictionaryService.generateQuizChoices()` to create multiple choice questions. For each question, show the word and 4 definitions (1 correct + 3 random incorrect from other words).
    - **Answer Feedback:** Provide immediate visual feedback (correct/incorrect) after each answer.
    - **Progress Tracking:** If answer is incorrect, automatically add the word to `struggledWords` via `UserProgressContext`.
    - `src/components/quiz/QuizResult.js`: Shows final score, percentage, and list of incorrectly answered words with option to review them.

---

## Phase 5: Finalization & Polish

**Objective:** Refine the application, handle edge cases, and ensure all requirements are met.

- **Step 5.1: Add Loading and Empty States**
  - **Instruction:** "Throughout the application, add loading indicators (e.g., Material-UI `CircularProgress`) where data is being fetched. Add user-friendly messages for empty states (e.g., 'No struggled words yet', 'No results found')."

- **Step 5.2: Theming and Styling**
  - **Instruction:** "Create a global theme using Material-UI's `createTheme` to ensure consistent colors, typography, and spacing. Apply this theme at the root of the application."

- **Step 5.3: Final Review**
  - **Instruction:** "Review the entire application against the `00_Requirements_Document.md`. Verify that all functional requirements are implemented correctly. Test all user flows and interactions."

- **Step 5.4: Create README**
  - **Instruction:** "Create a final `README.md` file for the project. Include a brief description, a list of the technologies used, and clear instructions on how to install dependencies (`npm install`) and run the project (`npm start`)."
