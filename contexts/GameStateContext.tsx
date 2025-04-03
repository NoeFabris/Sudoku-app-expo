import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Board, type Difficulty } from '@/utils/sudoku';

// Define the type for cell notes
type CellNotes = Record<string, Set<number>>;

// Convert Set to Array for storage
const setToArray = (set: Set<number>): number[] => Array.from(set);

// Convert Array back to Set when retrieving
const arrayToSet = (array: number[]): Set<number> => new Set(array);

// Define the game state structure
interface GameState {
  board: Board;
  initialBoard: Board;
  solution: Board;
  selectedCell: [number, number] | null;
  timer: number;
  difficulty: Difficulty;
  mistakes: string[]; // Stored as array in AsyncStorage
  errorCount: number;
  isComplete: boolean;
  gameStarted: boolean;
  notes: Record<string, number[]>; // Store as arrays for AsyncStorage
  isNoteMode: boolean;
}

// Runtime state used in the app
interface RuntimeGameState {
  board: Board;
  initialBoard: Board;
  solution: Board;
  selectedCell: [number, number] | null;
  timer: number;
  difficulty: Difficulty;
  mistakes: Set<string>; // Used as Set in runtime
  errorCount: number;
  isComplete: boolean;
  gameStarted: boolean;
  notes: CellNotes; // Used as CellNotes with Sets in runtime
  isNoteMode: boolean;
}

// Define the context type
interface GameStateContextType {
  gameState: RuntimeGameState | null;
  saveGameState: (state: RuntimeGameState) => Promise<void>;
  loadGameState: () => Promise<RuntimeGameState | null>;
  clearGameState: () => Promise<void>;
}

// Create the context with default values
const GameStateContext = createContext<GameStateContextType>({
  gameState: null,
  saveGameState: async () => {},
  loadGameState: async () => null,
  clearGameState: async () => {},
});

// Convert notes with Sets to notes with Arrays for storage
const prepareNotesForStorage = (notes: CellNotes): Record<string, number[]> => {
  const result: Record<string, number[]> = {};
  for (const [key, value] of Object.entries(notes)) {
    result[key] = setToArray(value);
  }
  return result;
};

// Convert stored notes arrays back to Sets
const prepareNotesFromStorage = (notes: Record<string, number[]>): CellNotes => {
  const result: CellNotes = {};
  for (const [key, value] of Object.entries(notes)) {
    result[key] = arrayToSet(value);
  }
  return result;
};

// Convert mistakes Set to array for storage
const mistakesSetToArray = (mistakes: Set<string>): string[] => Array.from(mistakes);

// Convert mistakes array back to Set
const mistakesArrayToSet = (mistakes: string[]): Set<string> => new Set(mistakes);

// Convert runtime state to storage state
const runtimeToStorageState = (state: RuntimeGameState): GameState => {
  return {
    ...state,
    mistakes: mistakesSetToArray(state.mistakes),
    notes: prepareNotesForStorage(state.notes),
  };
};

// Convert storage state to runtime state
const storageToRuntimeState = (state: GameState): RuntimeGameState => {
  return {
    ...state,
    mistakes: mistakesArrayToSet(state.mistakes),
    notes: prepareNotesFromStorage(state.notes),
  };
};

// Provider component
export const GameStateProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<RuntimeGameState | null>(null);

  // Save the current game state to AsyncStorage
  const saveGameState = async (state: RuntimeGameState) => {
    try {
      // Convert runtime state to storage state
      const storageState = runtimeToStorageState(state);
      
      const jsonValue = JSON.stringify(storageState);
      await AsyncStorage.setItem('sudokuGameState', jsonValue);
      setGameState(state);
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  };

  // Load the game state from AsyncStorage
  const loadGameState = async (): Promise<RuntimeGameState | null> => {
    try {
      const jsonValue = await AsyncStorage.getItem('sudokuGameState');
      if (jsonValue === null) return null;
      
      const loadedState = JSON.parse(jsonValue) as GameState;
      
      // Convert storage state to runtime state
      const runtimeState = storageToRuntimeState(loadedState);
      
      setGameState(runtimeState);
      return runtimeState;
    } catch (error) {
      console.error('Error loading game state:', error);
      return null;
    }
  };

  // Clear the game state from AsyncStorage
  const clearGameState = async () => {
    try {
      await AsyncStorage.removeItem('sudokuGameState');
      setGameState(null);
    } catch (error) {
      console.error('Error clearing game state:', error);
    }
  };

  // Load game state when component mounts
  useEffect(() => {
    loadGameState();
  }, []);

  return (
    <GameStateContext.Provider
      value={{
        gameState,
        saveGameState,
        loadGameState,
        clearGameState,
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
};

// Custom hook to use the game state context
export const useGameState = () => useContext(GameStateContext); 