import React from 'react';

/**
 * Performance Utilities
 * Helper functions for optimizing application performance
 */

/**
 * Debounce function to limit the rate of function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Whether to execute immediately
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

/**
 * Throttle function to limit function execution frequency
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Memoization function for expensive calculations
 * @param {Function} fn - Function to memoize
 * @returns {Function} Memoized function
 */
export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

/**
 * Lazy loading utility for components
 * @param {Function} importFunc - Dynamic import function
 * @returns {React.Component} Lazy component
 */
export const lazyLoad = (importFunc) => {
  return React.lazy(importFunc);
};

/**
 * Virtual scrolling helper for large lists
 * @param {Array} items - Array of items
 * @param {number} containerHeight - Height of container
 * @param {number} itemHeight - Height of each item
 * @param {number} scrollTop - Current scroll position
 * @returns {Object} Visible items and scroll info
 */
export const getVisibleItems = (items, containerHeight, itemHeight, scrollTop) => {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  return {
    startIndex,
    endIndex,
    visibleItems: items.slice(startIndex, endIndex),
    totalHeight: items.length * itemHeight,
    offsetY: startIndex * itemHeight
  };
};

/**
 * Performance monitoring utility
 */
export const performanceMonitor = {
  /**
   * Mark the start of a performance measurement
   * @param {string} name - Name of the measurement
   */
  start: (name) => {
    if (performance && performance.mark) {
      performance.mark(`${name}-start`);
    }
  },

  /**
   * Mark the end of a performance measurement and log the duration
   * @param {string} name - Name of the measurement
   */
  end: (name) => {
    if (performance && performance.mark && performance.measure) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measure = performance.getEntriesByName(name)[0];
      if (measure) {
        console.log(`Performance: ${name} took ${measure.duration.toFixed(2)}ms`);
      }
    }
  },

  /**
   * Log component render time
   * @param {string} componentName - Name of the component
   * @param {Function} renderFunction - Function to measure
   */
  measureRender: (componentName, renderFunction) => {
    performanceMonitor.start(`render-${componentName}`);
    const result = renderFunction();
    performanceMonitor.end(`render-${componentName}`);
    return result;
  }
};

/**
 * Memory usage monitoring (for development)
 */
export const memoryMonitor = {
  /**
   * Log current memory usage
   * @param {string} label - Label for the measurement
   */
  log: (label = 'Memory Usage') => {
    if (performance && performance.memory) {
      console.log(`${label}:`, {
        used: `${(performance.memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
        total: `${(performance.memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
        limit: `${(performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
      });
    }
  }
};

/**
 * Image lazy loading utility
 * @param {string} src - Image source URL
 * @param {string} placeholder - Placeholder image URL
 * @returns {Object} Image loading state and handlers
 */
export const useImageLazyLoad = (src, placeholder = '') => {
  const [imageSrc, setImageSrc] = React.useState(placeholder);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  React.useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
    img.onerror = () => {
      setIsError(true);
    };
    img.src = src;
  }, [src]);

  return { imageSrc, isLoaded, isError };
};
