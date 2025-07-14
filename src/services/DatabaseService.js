/**
 * Database Service for English Leap
 * Handles user profiles, progress, and statistics using IndexedDB
 */

const DB_NAME = 'EnglishLeapDB';
const DB_VERSION = 1;

// Object stores
const STORES = {
  USERS: 'users',
  USER_PROGRESS: 'userProgress',
  QUIZ_HISTORY: 'quizHistory',
  SETTINGS: 'settings'
};

class DatabaseService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the database
   */
  async init() {
    if (this.isInitialized) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Database failed to open');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('Database opened successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        this.db = event.target.result;
        console.log('Database upgrade needed');

        // Create users store
        if (!this.db.objectStoreNames.contains(STORES.USERS)) {
          const usersStore = this.db.createObjectStore(STORES.USERS, {
            keyPath: 'id',
            autoIncrement: true
          });
          usersStore.createIndex('username', 'username', { unique: true });
          usersStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Create user progress store
        if (!this.db.objectStoreNames.contains(STORES.USER_PROGRESS)) {
          const progressStore = this.db.createObjectStore(STORES.USER_PROGRESS, {
            keyPath: 'id',
            autoIncrement: true
          });
          progressStore.createIndex('userId', 'userId', { unique: false });
          progressStore.createIndex('wordId', 'wordId', { unique: false });
        }

        // Create quiz history store
        if (!this.db.objectStoreNames.contains(STORES.QUIZ_HISTORY)) {
          const quizStore = this.db.createObjectStore(STORES.QUIZ_HISTORY, {
            keyPath: 'id',
            autoIncrement: true
          });
          quizStore.createIndex('userId', 'userId', { unique: false });
          quizStore.createIndex('date', 'date', { unique: false });
        }

        // Create settings store
        if (!this.db.objectStoreNames.contains(STORES.SETTINGS)) {
          const settingsStore = this.db.createObjectStore(STORES.SETTINGS, {
            keyPath: 'id',
            autoIncrement: true
          });
          settingsStore.createIndex('userId', 'userId', { unique: false });
          settingsStore.createIndex('key', 'key', { unique: false });
        }
      };
    });
  }

  /**
   * User Management
   */
  async createUser(username, avatar = null) {
    await this.init();
    
    const user = {
      username: username.trim(),
      avatar: avatar,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      totalWordsLearned: 0,
      totalQuizzesTaken: 0,
      averageScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      level: 'Beginner',
      experience: 0,
      goal: 50 // Default goal of 50 words to master
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.USERS], 'readwrite');
      const store = transaction.objectStore(STORES.USERS);
      const request = store.add(user);

      request.onsuccess = () => {
        user.id = request.result;
        resolve(user);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getAllUsers() {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.USERS], 'readonly');
      const store = transaction.objectStore(STORES.USERS);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getUserById(userId) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.USERS], 'readonly');
      const store = transaction.objectStore(STORES.USERS);
      const request = store.get(userId);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async updateUser(userId, updates) {
    await this.init();

    const user = await this.getUserById(userId);
    if (!user) throw new Error('User not found');

    const updatedUser = { ...user, ...updates, lastLoginAt: new Date().toISOString() };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.USERS], 'readwrite');
      const store = transaction.objectStore(STORES.USERS);
      const request = store.put(updatedUser);

      request.onsuccess = () => {
        resolve(updatedUser);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async deleteUser(userId) {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([
        STORES.USERS,
        STORES.USER_PROGRESS,
        STORES.QUIZ_HISTORY,
        STORES.SETTINGS
      ], 'readwrite');

      // Delete user
      const userStore = transaction.objectStore(STORES.USERS);
      const deleteUserRequest = userStore.delete(userId);

      // Delete user progress
      const progressStore = transaction.objectStore(STORES.USER_PROGRESS);
      const progressIndex = progressStore.index('userId');
      const progressRequest = progressIndex.getAll(userId);

      progressRequest.onsuccess = () => {
        const progressRecords = progressRequest.result;
        progressRecords.forEach(record => {
          progressStore.delete(record.id);
        });
      };

      // Delete quiz history
      const quizStore = transaction.objectStore(STORES.QUIZ_HISTORY);
      const quizIndex = quizStore.index('userId');
      const quizRequest = quizIndex.getAll(userId);

      quizRequest.onsuccess = () => {
        const quizRecords = quizRequest.result;
        quizRecords.forEach(record => {
          quizStore.delete(record.id);
        });
      };

      // Delete settings
      const settingsStore = transaction.objectStore(STORES.SETTINGS);
      const settingsIndex = settingsStore.index('userId');
      const settingsRequest = settingsIndex.getAll(userId);

      settingsRequest.onsuccess = () => {
        const settingsRecords = settingsRequest.result;
        settingsRecords.forEach(record => {
          settingsStore.delete(record.id);
        });
      };

      transaction.oncomplete = () => {
        resolve(true);
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  }

  /**
   * User Progress Management
   */
  async saveWordProgress(userId, wordId, status, difficulty = null) {
    await this.init();
    
    const progress = {
      userId: userId,
      wordId: wordId,
      status: status, // 'known', 'struggling', 'unknown'
      difficulty: difficulty,
      updatedAt: new Date().toISOString(),
      reviewCount: 1
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.USER_PROGRESS], 'readwrite');
      const store = transaction.objectStore(STORES.USER_PROGRESS);
      
      // Check if progress already exists
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => {
        const existingProgress = request.result.find(p => p.wordId === wordId);
        
        if (existingProgress) {
          // Update existing progress
          const updatedProgress = {
            ...existingProgress,
            status: status,
            difficulty: difficulty,
            updatedAt: new Date().toISOString(),
            reviewCount: existingProgress.reviewCount + 1
          };
          
          const updateRequest = store.put(updatedProgress);
          updateRequest.onsuccess = () => resolve(updatedProgress);
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          // Create new progress
          const addRequest = store.add(progress);
          addRequest.onsuccess = () => {
            progress.id = addRequest.result;
            resolve(progress);
          };
          addRequest.onerror = () => reject(addRequest.error);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getUserProgress(userId) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.USER_PROGRESS], 'readonly');
      const store = transaction.objectStore(STORES.USER_PROGRESS);
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Quiz History Management
   */
  async saveQuizResult(userId, quizData) {
    await this.init();
    
    const quizResult = {
      userId: userId,
      ...quizData,
      date: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.QUIZ_HISTORY], 'readwrite');
      const store = transaction.objectStore(STORES.QUIZ_HISTORY);
      const request = store.add(quizResult);

      request.onsuccess = () => {
        quizResult.id = request.result;
        resolve(quizResult);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getUserQuizHistory(userId, limit = 50) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.QUIZ_HISTORY], 'readonly');
      const store = transaction.objectStore(STORES.QUIZ_HISTORY);
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => {
        const results = request.result
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, limit);
        resolve(results);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Settings Management
   */
  async saveSetting(userId, key, value) {
    await this.init();
    
    const setting = {
      userId: userId,
      key: key,
      value: value,
      updatedAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.SETTINGS], 'readwrite');
      const store = transaction.objectStore(STORES.SETTINGS);
      
      // Check if setting already exists
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => {
        const existingSetting = request.result.find(s => s.key === key);
        
        if (existingSetting) {
          // Update existing setting
          const updatedSetting = { ...existingSetting, value: value, updatedAt: new Date().toISOString() };
          const updateRequest = store.put(updatedSetting);
          updateRequest.onsuccess = () => resolve(updatedSetting);
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          // Create new setting
          const addRequest = store.add(setting);
          addRequest.onsuccess = () => {
            setting.id = addRequest.result;
            resolve(setting);
          };
          addRequest.onerror = () => reject(addRequest.error);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getUserSettings(userId) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.SETTINGS], 'readonly');
      const store = transaction.objectStore(STORES.SETTINGS);
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => {
        const settings = {};
        request.result.forEach(setting => {
          settings[setting.key] = setting.value;
        });
        resolve(settings);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Utility Methods
   */
  async clearAllData() {
    await this.init();

    const stores = [STORES.USERS, STORES.USER_PROGRESS, STORES.QUIZ_HISTORY, STORES.SETTINGS];

    return Promise.all(stores.map(storeName => {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }));
  }

  /**
   * Reset all application data (database + localStorage)
   */
  async resetAllApplicationData() {
    try {
      // Clear database
      await this.clearAllData();

      // Clear localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('englishLeap_')) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Clear sessionStorage
      sessionStorage.removeItem('englishLeap_currentUserId');

      console.log('All application data has been reset');
      return true;
    } catch (error) {
      console.error('Error resetting application data:', error);
      throw error;
    }
  }
}

// Create singleton instance
const databaseService = new DatabaseService();

export default databaseService;
