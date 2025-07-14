# English Leap - Software Architecture

## 1. Introduction

This document outlines the software architecture for the **English Leap**, a React-based desktop application designed for vocabulary improvement. It details the application's structure, components, data flow, and technology stack, serving as a blueprint for development.

The architecture is designed to meet the functional and non-functional requirements specified in the `00_Requirements_Document.md`.

## 2. Architectural Style

The application will be a **Single-Page Application (SPA)** built using a **Component-Based Architecture**. This approach leverages React's strengths, promoting reusability, maintainability, and a clear separation of concerns.

- **Client-Side Rendering:** The UI will be rendered entirely in the browser.
- **State Management:** A centralized approach using React Context will manage shared application state, while local component state will handle UI-specific logic.
- **Data Persistence:** All user-specific data (progress, scores, etc.) will be persisted locally in the browser's Local Storage, ensuring data is available across sessions without a backend.

## 3. Technology Stack

- **Frontend Framework:** **React.js**
- **UI Library:** **Material-UI** (Chosen for its comprehensive set of pre-built components that align with a modern, clean aesthetic).
- **Routing:** **React Router** for declarative routing and navigation between different modules of the application.
- **State Management:** **React Context API** for managing global state like the word dictionary and user progress.
- **Development Tooling:** **Create React App**, **npm**, **ESLint**, **Prettier**.

## 4. Component Breakdown

The application is broken down into several key components, organized by feature and responsibility.

### 4.1. Core & Shared Components (`src/components/ui/` & `src/components/layout/`)

- **`Layout.js`**: The main application shell, including the header/navigation bar and a main content area. It will render the different page components based on the current route.
- **`NavigationBar.js`**: A persistent navigation component providing links to the Dashboard, Word Training, Flashcards, and Quiz modules.
- **`Button.js`**: A customizable button component to ensure consistent styling.
- **`Card.js`**: A generic card component for use in flashcards, dashboards, and lists.
- **`SearchBar.js`**: A reusable search input component.

### 4.2. Services & Hooks (`src/services/` & `src/hooks/`)

- **`DictionaryService.js`**:
    - **Responsibility:** To fetch, parse, and process the `99_02_comprehensive_english_dict.json` file.
    - **Data Structure Transformation:**
        - **Input JSON Structure:** `{A: {words: {Abase: {...}, Abate: {...}}}, B: {...}}`
        - **Output Flattened Structure:** `[{word: "Abase", letter: "A", complexity: "Advanced", ...}, {word: "Abate", letter: "A", complexity: "Intermediate", ...}]`
    - **Functions:**
        - `loadWords()`: Fetches the JSON file and transforms nested structure to flat array.
        - `getWordsByLetter(letter)`: Filters words by the starting letter.
        - `getWordsByComplexity(level)`: Filters words by complexity ("Advanced", "Intermediate").
        - `getAllWords()`: Returns the complete flattened list of all words for searching.
        - `searchWords(query)`: Performs case-insensitive search across word names and definitions.
- **`useLocalStorage.js` (Custom Hook)**:
    - **Responsibility:** To abstract the logic for reading from and writing to the browser's Local Storage.
    - **Functions:** Provides a state-like interface `[value, setValue]` that automatically syncs with Local Storage.
- **`useUserProgress.js` (Custom Hook)**:
    - **Responsibility:** Manages all user-specific data using `useLocalStorage`.
    - **State Managed:**
        - `knownWords`: A list of words marked as "Known".
        - `struggledWords`: A list of words the user has answered incorrectly.
        - `quizHistory`: An array of objects containing quiz scores and dates.
    - **Functions:** `addStruggledWord()`, `markAsKnown()`, `addQuizResult()`.

### 4.3. Context Providers (`src/context/`)

- **`DictionaryContext.js`**:
    - **Responsibility:** To load the dictionary data once and provide it to the entire component tree, avoiding redundant loading and processing.
    - **Value Provided:** The full word list, loading status, and any potential errors.
- **`UserProgressContext.js`**:
    - **Responsibility:** To provide the user's progress data and the functions to update it to any component that needs it.
    - **Value Provided:** The state and functions from the `useUserProgress` hook.

### 4.4. Page & Feature Components

#### 4.4.1. Dashboard (`src/pages/DashboardPage.js`)
- **Responsibility:** To display the user's learning summary.
- **Child Components:**
    - `StatisticsCard.js`: Displays metrics like "Words Mastered" and total quizzes taken.
    - `StruggledWordsList.js`: Lists words from the user's `struggledWords` list, with links to their detailed view.
    - `QuizHistory.js`: Shows a table or list of past quiz scores.
- **Data Source:** `UserProgressContext`.

#### 4.4.2. Word Training (`src/pages/WordTrainingPage.js`)
- **Responsibility:** To allow users to browse, search, and view detailed information for every word.
- **Child Components:**
    - `WordList.js`: Displays a searchable and filterable list of all words.
    - `WordDetail.js`: A detailed view showing pronunciation, meanings, examples, synonyms, antonyms, and origin for a selected word.
- **Data Source:** `DictionaryContext`.

#### 4.4.3. Flashcards (`src/pages/FlashcardsPage.js`)
- **Responsibility:** To provide a flashcard-based learning experience.
- **Child Components:**
    - `DeckOptions.js`: A form for the user to select the criteria for the flashcard deck (e.g., by letter 'A', by 'Advanced' complexity).
    - `Flashcard.js`: A flippable card component. The front shows the word; the back shows the details.
    - `FlashcardControls.js`: Buttons for "Flip", "Known", "Needs Practice", and navigating to the next/previous card.
- **Data Source:** `DictionaryContext` to get words, `UserProgressContext` to update `knownWords`.

#### 4.4.4. Quiz (`src/pages/QuizPage.js`)
- **Responsibility:** To test the user's knowledge with multiple-choice questions.
- **Child Components:**
    - `QuizOptions.js`: A form to configure the quiz (e.g., number of questions, word list to use).
    - `Question.js`: Displays the current question and multiple-choice answers.
    - `QuizResult.js`: Shows the final score and a list of incorrectly answered words.
- **Data Source:** `DictionaryContext` to generate questions, `UserProgressContext` to save scores and update `struggledWords`.

## 5. Data Flow

1.  **App Initialization:**
    - The root `App` component wraps the application in `DictionaryProvider` and `UserProgressProvider`.
    - `DictionaryProvider` fetches and parses the `99_02_comprehensive_english_dict.json` file, transforms the nested structure `{letter: {words: {...}}}` into a flattened array, and stores the result in its state.
    - `UserProgressProvider` initializes its state from Local Storage via the `useUserProgress` hook.
2.  **Navigation:**
    - `React Router` listens for URL changes and renders the appropriate page component (`DashboardPage`, `QuizPage`, etc.).
3.  **Component Rendering:**
    - Page components consume data from the `DictionaryContext` and `UserProgressContext` as needed.
4.  **User Interaction:**
    - When a user takes a quiz and answers incorrectly, the `Quiz` component calls a function from `UserProgressContext` (e.g., `addStruggledWord('Abate')`).
    - This function updates the state within the `UserProgressProvider`, which in turn triggers the `useLocalStorage` hook to write the new state to Local Storage.
    - The updated context value causes any subscribed components (like the `DashboardPage`) to re-render with the new data.

## 6. Routing (`src/App.js`)

```javascript
<Router>
  <Layout>
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/training" element={<WordTrainingPage />} />
      <Route path="/training/:word" element={<WordDetailPage />} />
      <Route path="/flashcards" element={<FlashcardsPage />} />
      <Route path="/quiz" element={<QuizPage />} />
    </Routes>
  </Layout>
</Router>
```

## 7. Non-Functional Requirements Alignment

- **Performance:** By loading the large JSON file once via a Context Provider, we avoid re-processing on every page navigation. The data is held in memory for fast access.
- **UI/UX:** The component-based structure allows for the creation of a consistent and clean UI. Using a library like Material-UI ensures a professional and modern look and feel, fulfilling the minimalist design requirement.
- **Maintainability:** The separation of concerns (UI components, services, state management) makes the codebase easier to understand, debug, and extend in the future.
