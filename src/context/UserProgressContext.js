import React, { createContext, useContext } from 'react';
import useUserProgress from '../hooks/useUserProgress';

/**
 * User Progress Context - Provides user progress data and functions to the entire application
 */
const UserProgressContext = createContext();

/**
 * Custom hook to use the User Progress Context
 * @returns {Object} User progress context value
 */
export const useUserProgressContext = () => {
  const context = useContext(UserProgressContext);
  if (!context) {
    throw new Error('useUserProgressContext must be used within a UserProgressProvider');
  }
  return context;
};

/**
 * User Progress Provider Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const UserProgressProvider = ({ children }) => {
  const userProgress = useUserProgress();

  return (
    <UserProgressContext.Provider value={userProgress}>
      {children}
    </UserProgressContext.Provider>
  );
};
