import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RotateCcw, Pencil } from 'lucide-react-native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { SpaceMono_400Regular } from '@expo-google-fonts/space-mono';
import * as Haptics from 'expo-haptics';
import { useSettings } from '@/contexts/SettingsContext';
import { useGameState } from '@/contexts/GameStateContext';
import GameStartScreen from '@/components/GameStartScreen';
import {
  type Board,
  type Difficulty,
  generatePuzzle,
  checkMove,
  checkWin,
} from '@/utils/sudoku';

// Type for cell notes
type CellNotes = Record<string, Set<number>>;

export default function GameScreen() {
  const [board, setBoard] = useState<Board>([]);
  const [initialBoard, setInitialBoard] = useState<Board>([]);
  const [solution, setSolution] = useState<Board>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [timer, setTimer] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [mistakes, setMistakes] = useState<Set<string>>(new Set());
  const [errorCount, setErrorCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [numberCounts, setNumberCounts] = useState<Record<number, number>>({});
  // Add notes state
  const [notes, setNotes] = useState<CellNotes>({});
  const [isNoteMode, setIsNoteMode] = useState(false);
  // Flag to track if we're loading a saved game
  const [isLoadingSavedGame, setIsLoadingSavedGame] = useState(true);

  // Use the settings context to get the current settings
  const { highlightMatchingNumbers, showMistakes, autoCheck, hapticFeedback, notesEnabled } = useSettings();
  
  // Use the game state context
  const { gameState, saveGameState, loadGameState, clearGameState } = useGameState();

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
    'SpaceMono-Regular': SpaceMono_400Regular,
  });

  // Save game state when it changes
  useEffect(() => {
    // Don't save if we're loading a game or no game has started
    if (isLoadingSavedGame || !gameStarted || !board.length) return;

    // Save current game state
    saveGameState({
      board,
      initialBoard,
      solution,
      selectedCell,
      timer,
      difficulty,
      mistakes,
      errorCount,
      isComplete,
      gameStarted,
      notes,
      isNoteMode,
    });
  }, [
    board, 
    initialBoard, 
    solution, 
    selectedCell, 
    timer, 
    difficulty, 
    mistakes, 
    errorCount, 
    isComplete, 
    gameStarted, 
    notes, 
    isNoteMode, 
    saveGameState, 
    isLoadingSavedGame
  ]);

  // Load saved game state on first render
  useEffect(() => {
    const restoreSavedGame = async () => {
      // Try to load a saved game
      const savedState = await loadGameState();
      
      if (savedState && savedState.gameStarted && !savedState.isComplete) {
        // Restore the saved game state
        setBoard(savedState.board);
        setInitialBoard(savedState.initialBoard);
        setSolution(savedState.solution);
        setSelectedCell(savedState.selectedCell);
        setTimer(savedState.timer);
        setDifficulty(savedState.difficulty);
        setMistakes(savedState.mistakes);
        setErrorCount(savedState.errorCount);
        setIsComplete(savedState.isComplete);
        setGameStarted(savedState.gameStarted);
        setNotes(savedState.notes);
        setIsNoteMode(savedState.isNoteMode);
      }
      
      // Set loading state to false
      setIsLoadingSavedGame(false);
    };
    
    restoreSavedGame();
  }, [loadGameState]);

  const startNewGame = useCallback((diff: Difficulty) => {
    const { initial, solution: newSolution } = generatePuzzle(diff);
    setBoard(initial.map(row => [...row]));
    setInitialBoard(initial.map(row => [...row]));
    setSolution(newSolution);
    setSelectedCell(null);
    setTimer(0);
    setMistakes(new Set());
    setErrorCount(0);
    setIsComplete(false);
    setDifficulty(diff);
    setGameStarted(true);
    setNotes({});  // Clear notes when starting a new game
    setIsNoteMode(false); // Reset to regular mode
  }, []);

  const handleGameStart = (diff: Difficulty) => {
    startNewGame(diff);
  };

  useEffect(() => {
    if (!fontsLoaded || !gameStarted || isComplete) return;
    const interval = setInterval(() => {
      setTimer(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [fontsLoaded, gameStarted, isComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCellPress = (row: number, col: number) => {
    // Allow selection of any cell, including prefilled ones
    setSelectedCell([row, col]);
  };

  // Count the occurrences of each number in the board
  useEffect(() => {
    if (!board.length) return;
    
    const counts: Record<number, number> = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0};
    
    // Count filled numbers in the board
    board.forEach(row => {
      row.forEach(cell => {
        if (cell !== null) {
          counts[cell] += 1;
        }
      });
    });
    
    setNumberCounts(counts);
  }, [board]);

  // Toggle note mode
  const toggleNoteMode = () => {
    if (hapticFeedback && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsNoteMode(prev => !prev);
  };

  // Get the cell key string
  const cellKey = (row: number, col: number) => `${row},${col}`;
  
  // Get notes for a specific cell
  const getCellNotes = (row: number, col: number): Set<number> => {
    const key = cellKey(row, col);
    return notes[key] || new Set();
  };

  const handleNumberPress = (number: number) => {
    if (!selectedCell) return;
    const [row, col] = selectedCell;
    
    // Don't allow changes to prefilled cells
    if (initialBoard[row][col] !== null) return;
    
    // Trigger haptic feedback if enabled
    if (hapticFeedback && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const key = cellKey(row, col);
    
    // Handle eraser (0)
    if (number === 0) {
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = null;
      setBoard(newBoard);
      const newMistakes = new Set(mistakes);
      newMistakes.delete(key);
      setMistakes(newMistakes);
      
      // Also clear notes for this cell
      const newNotes = { ...notes };
      delete newNotes[key];
      setNotes(newNotes);
      return;
    }

    if (isNoteMode && notesEnabled) {
      // Handle note mode - toggle the note for this number
      const cellNotes = new Set(notes[key] || []);
      
      if (cellNotes.has(number)) {
        cellNotes.delete(number);
      } else {
        cellNotes.add(number);
      }
      
      const newNotes = { ...notes };
      if (cellNotes.size === 0) {
        delete newNotes[key];
      } else {
        newNotes[key] = cellNotes;
      }
      setNotes(newNotes);
      return;
    }

    // Regular mode - set the number in the cell and clear any notes
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = number;
    setBoard(newBoard);
    
    // Clear notes for this cell when a number is placed
    const newNotes = { ...notes };
    delete newNotes[key];
    setNotes(newNotes);

    // Check if the move is correct
    const isCorrect = checkMove(newBoard, solution, [row, col], number);
    const newMistakes = new Set(mistakes);
    if (!isCorrect) {
      newMistakes.add(key);
      setErrorCount(prev => prev + 1);
    } else {
      newMistakes.delete(key);
    }
    setMistakes(newMistakes);

    // Check if the puzzle is complete
    if (checkWin(newBoard, solution)) {
      setIsComplete(true);
      // Clear the saved game state when the game is complete
      clearGameState();
      if (hapticFeedback && Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const handleRestart = () => {
    // Clear the saved game and return to the game start screen
    setGameStarted(false);
    // Clear any saved game from storage
    if (gameState) {
      clearGameState();
    }
  };

  // Render notes inside a cell in a 3x3 grid
  const renderNotes = (cellNotes: Set<number>) => {
    return (
      <View style={styles.notesContainer}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
          <Text
            key={number}
            style={[
              styles.noteText,
              cellNotes.has(number) ? {} : styles.hiddenNote
            ]}
          >
            {number}
          </Text>
        ))}
      </View>
    );
  };

  const renderCell = useCallback((value: number | null, row: number, col: number) => {
    const isSelected = selectedCell?.[0] === row && selectedCell?.[1] === col;
    const isInitial = initialBoard[row][col] !== null;
    const isMistake = mistakes.has(`${row},${col}`);
    const cellNotes = getCellNotes(row, col);
    const hasNotes = cellNotes.size > 0;
    
    const borderStyles = {
      borderRightWidth: (col + 1) % 3 === 0 ? 2 : 1,
      borderBottomWidth: (row + 1) % 3 === 0 ? 2 : 1,
    };

    // Check if cell is in the same row, column, or 3x3 box as the selected cell
    const isSameRow = selectedCell && selectedCell[0] === row;
    const isSameColumn = selectedCell && selectedCell[1] === col;
    
    // Check if cell is in the same 3x3 box as the selected cell
    const isSameBox = selectedCell && 
      Math.floor(row / 3) === Math.floor(selectedCell[0] / 3) && 
      Math.floor(col / 3) === Math.floor(selectedCell[1] / 3);
      
    // Check if the cell has the same number as the selected cell
    const hasSameNumber = selectedCell && 
      board[selectedCell[0]][selectedCell[1]] !== null && 
      value === board[selectedCell[0]][selectedCell[1]];

    return (
      <Pressable
        key={`${row}-${col}`}
        style={[
          styles.cell,
          borderStyles,
          // Always apply selectedCell style first, regardless of whether it's initial or not
          isSelected && styles.selectedCell,
          // Only apply these highlights if not selected
          !isSelected && isSameRow && styles.highlightedRow,
          !isSelected && isSameColumn && styles.highlightedColumn,
          !isSelected && isSameBox && !isSameRow && !isSameColumn && styles.highlightedBox,
          highlightMatchingNumbers && !isSelected && hasSameNumber && styles.highlightedSameNumber,
          showMistakes && isMistake && styles.mistakeCell,
        ]}
        onPress={() => handleCellPress(row, col)}>
        {value !== null ? (
          <Text
            style={[
              styles.cellText,
              isInitial && styles.initialCellText,
              showMistakes && isMistake && styles.mistakeCellText,
            ]}>
            {value}
          </Text>
        ) : hasNotes && notesEnabled ? (
          renderNotes(cellNotes)
        ) : null}
      </Pressable>
    );
  }, [selectedCell, initialBoard, mistakes, board, highlightMatchingNumbers, showMistakes, notes, notesEnabled]);

  if (!fontsLoaded) {
    return null;
  }

  if (!gameStarted && !isLoadingSavedGame) {
    return <GameStartScreen onStart={handleGameStart} />;
  }

  // Check if a number is fully placed (9 times) in the grid
  const isNumberCompleted = (num: number): boolean => {
    return numberCounts[num] >= 9;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Sudoku</Text>
            <Text style={styles.difficulty}>{difficulty}</Text>
          </View>
          <Pressable style={styles.restartButton} onPress={handleRestart}>
            <RotateCcw size={24} color="#000" />
          </Pressable>
        </View>
        
        <View style={styles.headerRight}>
          <Text style={styles.timer}>{formatTime(timer)}</Text>
          <Text style={styles.errorCount}>Errors: {errorCount}</Text>
        </View>
      </View>

      {isComplete && (
        <View style={styles.completeMessage}>
          <Text style={styles.completeText}>Puzzle Complete!</Text>
          <Text style={styles.completeTime}>Time: {formatTime(timer)}</Text>
          <Text style={styles.completeErrors}>Errors: {errorCount}</Text>
        </View>
      )}

      <View style={styles.board}>
        {board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
          </View>
        ))}
      </View>

      <View style={styles.controls}>
        {notesEnabled && (
          <View style={styles.numberPadHeader}>
            <Pressable
              style={[styles.noteToggle, isNoteMode && styles.noteToggleActive]}
              onPress={toggleNoteMode}>
              <View style={styles.noteToggleContent}>
                <Pencil size={16} color={isNoteMode ? "#6a1b9a" : "#666"} />
                <Text style={[styles.noteToggleText, isNoteMode && styles.noteToggleTextActive]}>
                  Notes {isNoteMode ? "On" : "Off"}
                </Text>
              </View>
            </Pressable>
          </View>
        )}

        <View style={styles.numberPad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => {
            const isCompleted = !isNoteMode && isNumberCompleted(number);
            return (
              <Pressable
                key={number}
                style={[
                  styles.numberButton,
                  isCompleted && styles.numberButtonDisabled
                ]}
                onPress={() => !isCompleted && handleNumberPress(number)}
                disabled={isCompleted}>
                <Text style={[
                  styles.numberButtonText,
                  isCompleted && styles.numberButtonTextDisabled
                ]}>
                  {number}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            style={styles.numberButton}
            onPress={() => handleNumberPress(0)}>
            <Text style={styles.numberButtonText}>×</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  titleContainer: {
    flexDirection: 'column',
    marginRight: 12,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#000',
  },
  difficulty: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    marginTop: -4,
  },
  restartButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 20,
    color: '#666',
  },
  errorCount: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 14,
    color: '#f44336',
    marginTop: 2,
  },
  completeMessage: {
    backgroundColor: '#4CAF50',
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  completeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#fff',
    marginBottom: 4,
  },
  completeTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#fff',
  },
  completeErrors: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#fff',
    marginTop: 4,
  },
  board: {
    padding: 10,
    alignSelf: 'center',
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 40,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  selectedCell: {
    backgroundColor: '#b39ddb', // Deeper purple for selected cell
  },
  highlightedRow: {
    backgroundColor: '#e8e1f4', // More distinct light purple for the row
  },
  highlightedColumn: {
    backgroundColor: '#e8e1f4', // More distinct light purple for the column
  },
  highlightedBox: {
    backgroundColor: '#eee8f8', // More distinct very light purple for the box
  },
  highlightedSameNumber: {
    backgroundColor: '#d4c4ef', // More distinct medium purple for matching numbers
  },
  mistakeCell: {
    backgroundColor: '#ffebee',
  },
  cellText: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 20,
    color: '#666',
  },
  initialCellText: {
    color: '#000',
    fontWeight: '700', // Increased boldness for prefilled numbers
    fontSize: 22, // Slightly larger font size for prefilled numbers
  },
  mistakeCellText: {
    color: '#f44336',
  },
  notesContainer: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  noteText: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 10,
    color: '#666',
    width: '33%',
    height: '33%',
    textAlign: 'center',
  },
  hiddenNote: {
    opacity: 0,
  },
  controls: {
    padding: 20,
    marginTop: 'auto',
  },
  numberPadHeader: {
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  noteToggle: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  noteToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteToggleActive: {
    backgroundColor: '#f0e8f7', // Light purple background when active
  },
  noteToggleText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  noteToggleTextActive: {
    fontFamily: 'Inter-Bold',
    color: '#6a1b9a', // Purple text when active
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  numberButton: {
    width: 60,
    height: 60,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#000',
  },
  numberButtonDisabled: {
    backgroundColor: '#e0e0e0',
    opacity: 0.6,
  },
  numberButtonTextDisabled: {
    color: '#999',
  },
  gameActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  actionButton: {
    width: 44,
    height: 44,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});