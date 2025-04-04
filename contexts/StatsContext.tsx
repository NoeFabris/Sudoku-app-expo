import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the statistics structure
interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  bestTime: Record<string, number>; // Best time for each difficulty level
  averageTime: Record<string, number>; // Average time for each difficulty level
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null; // Store the last completed game date
}

// Define the context type
interface StatsContextType {
  stats: GameStats;
  updateGamePlayed: (won: boolean, difficulty: string, time: number) => Promise<void>;
  resetStats: () => Promise<void>;
  checkAndUpdateStreak: () => Promise<void>; // New function to check streak on app open
}

// Default statistics
const defaultStats: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  winRate: 0,
  bestTime: {
    Beginner: 0,
    Easy: 0,
    Medium: 0,
    Hard: 0,
    Expert: 0,
  },
  averageTime: {
    Beginner: 0,
    Easy: 0,
    Medium: 0,
    Hard: 0,
    Expert: 0,
  },
  currentStreak: 0,
  longestStreak: 0,
  lastPlayedDate: null,
};

// Create the context
const StatsContext = createContext<StatsContextType>({
  stats: defaultStats,
  updateGamePlayed: async () => {},
  resetStats: async () => {},
  checkAndUpdateStreak: async () => {},
});

// Helper to get today's date string in YYYY-MM-DD format
const getTodayDateString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Helper to get yesterday's date string in YYYY-MM-DD format
const getYesterdayDateString = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

// Provider component
export const StatsProvider = ({ children }: { children: ReactNode }) => {
  const [stats, setStats] = useState<GameStats>(defaultStats);

  // Load stats from AsyncStorage when component mounts
  useEffect(() => {
    const initialize = async () => {
      await loadStats();
      // Check streak status when app opens
      await checkAndUpdateStreak();
    };
    
    initialize();
  }, []);

  // Load statistics from AsyncStorage
  const loadStats = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('sudokuStats');
      if (jsonValue !== null) {
        setStats(JSON.parse(jsonValue));
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  // Save statistics to AsyncStorage
  const saveStats = async (newStats: GameStats) => {
    try {
      const jsonValue = JSON.stringify(newStats);
      await AsyncStorage.setItem('sudokuStats', jsonValue);
    } catch (error) {
      console.error('Error saving statistics:', error);
    }
  };

  // Check and update streak based on time between games
  const checkAndUpdateStreak = async () => {
    const newStats = { ...stats };
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();
    
    // If already played today, nothing to update
    if (newStats.lastPlayedDate === today) {
      return;
    }
    
    // If never played before or streak was already broken (last played was before yesterday)
    if (!newStats.lastPlayedDate || (newStats.lastPlayedDate < yesterday)) {
      // Reset streak if it's not already 0
      if (newStats.currentStreak !== 0) {
        newStats.currentStreak = 0;
        setStats(newStats);
        await saveStats(newStats);
      }
    }
    // If played yesterday, streak continues but doesn't increment yet
    // (will increment when they complete a game today)
  };

  // Update game statistics
  const updateGamePlayed = async (won: boolean, difficulty: string, time: number) => {
    const newStats = { ...stats };
    const today = getTodayDateString();
    
    // Update games played and won
    newStats.gamesPlayed += 1;
    
    if (won) {
      newStats.gamesWon += 1;
      
      // Update best time if this is better (or first) for this difficulty
      if (
        newStats.bestTime[difficulty] === 0 || 
        time < newStats.bestTime[difficulty]
      ) {
        newStats.bestTime[difficulty] = time;
      }
      
      // Update average time
      if (newStats.averageTime[difficulty] === 0) {
        newStats.averageTime[difficulty] = time;
      } else {
        // Calculate new average time
        const totalGamesForDifficulty = newStats.gamesPlayed * (newStats.gamesWon / newStats.gamesPlayed);
        const totalTimeSpent = newStats.averageTime[difficulty] * (totalGamesForDifficulty - 1);
        newStats.averageTime[difficulty] = Math.round((totalTimeSpent + time) / totalGamesForDifficulty);
      }
    }
    
    // Daily streak logic: 
    // If this is the first completed game today, update streak
    if (newStats.lastPlayedDate !== today) {
      const yesterday = getYesterdayDateString();
      
      // If last played was yesterday or this is the first game ever (continuing streak)
      if (newStats.lastPlayedDate === yesterday || newStats.lastPlayedDate === null) {
        // Increment streak for a new day's play
        newStats.currentStreak += 1;
        
        // Update longest streak if current streak is longer
        if (newStats.currentStreak > newStats.longestStreak) {
          newStats.longestStreak = newStats.currentStreak;
        }
      } else {
        // Streak was broken (no play yesterday), start a new streak at 1
        newStats.currentStreak = 1;
      }
      
      // Update last played date to today
      newStats.lastPlayedDate = today;
    }
    
    // Calculate win rate
    newStats.winRate = Math.round((newStats.gamesWon / newStats.gamesPlayed) * 100);
    
    // Update state and save to storage
    setStats(newStats);
    await saveStats(newStats);
  };

  // Reset all statistics
  const resetStats = async () => {
    setStats(defaultStats);
    await saveStats(defaultStats);
  };

  return (
    <StatsContext.Provider
      value={{
        stats,
        updateGamePlayed,
        resetStats,
        checkAndUpdateStreak,
      }}
    >
      {children}
    </StatsContext.Provider>
  );
};

// Custom hook to use the stats context
export const useStats = () => useContext(StatsContext); 