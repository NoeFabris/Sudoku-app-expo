import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RotateCcw, Check } from 'lucide-react-native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { SpaceMono_400Regular } from '@expo-google-fonts/space-mono';
import DifficultySelector from '@/components/DifficultySelector';
import {
  type Board,
  type Difficulty,
  generatePuzzle,
  checkMove,
  checkWin,
} from '@/utils/sudoku';

export default function GameScreen() {
  const [board, setBoard] = useState<Board>([]);
  const [initialBoard, setInitialBoard] = useState<Board>([]);
  const [solution, setSolution] = useState<Board>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [timer, setTimer] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [mistakes, setMistakes] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
    'SpaceMono-Regular': SpaceMono_400Regular,
  });

  const startNewGame = useCallback((diff: Difficulty) => {
    const { initial, solution: newSolution } = generatePuzzle(diff);
    setBoard(initial.map(row => [...row]));
    setInitialBoard(initial.map(row => [...row]));
    setSolution(newSolution);
    setSelectedCell(null);
    setTimer(0);
    setMistakes(new Set());
    setIsComplete(false);
  }, []);

  useEffect(() => {
    if (!fontsLoaded) return;
    startNewGame(difficulty);
  }, [fontsLoaded, difficulty, startNewGame]);

  useEffect(() => {
    if (!fontsLoaded || isComplete) return;
    const interval = setInterval(() => {
      setTimer(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [fontsLoaded, isComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCellPress = (row: number, col: number) => {
    if (initialBoard[row][col] !== null) return;
    setSelectedCell([row, col]);
  };

  const handleNumberPress = (number: number) => {
    if (!selectedCell) return;
    const [row, col] = selectedCell;
    
    // Handle eraser (0)
    if (number === 0) {
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = null;
      setBoard(newBoard);
      const newMistakes = new Set(mistakes);
      newMistakes.delete(`${row},${col}`);
      setMistakes(newMistakes);
      return;
    }

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = number;
    setBoard(newBoard);

    // Check if the move is correct
    const isCorrect = checkMove(newBoard, solution, [row, col], number);
    const newMistakes = new Set(mistakes);
    if (!isCorrect) {
      newMistakes.add(`${row},${col}`);
    } else {
      newMistakes.delete(`${row},${col}`);
    }
    setMistakes(newMistakes);

    // Check if the puzzle is complete
    if (checkWin(newBoard, solution)) {
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    setBoard(initialBoard.map(row => [...row]));
    setSelectedCell(null);
    setMistakes(new Set());
    setIsComplete(false);
    setTimer(0);
  };

  const renderCell = useCallback((value: number | null, row: number, col: number) => {
    const isSelected = selectedCell?.[0] === row && selectedCell?.[1] === col;
    const isInitial = initialBoard[row][col] !== null;
    const isMistake = mistakes.has(`${row},${col}`);
    const borderStyles = {
      borderRightWidth: (col + 1) % 3 === 0 ? 2 : 1,
      borderBottomWidth: (row + 1) % 3 === 0 ? 2 : 1,
    };

    return (
      <Pressable
        key={`${row}-${col}`}
        style={[
          styles.cell,
          borderStyles,
          isSelected && styles.selectedCell,
          isInitial && styles.initialCell,
          isMistake && styles.mistakeCell,
        ]}
        onPress={() => handleCellPress(row, col)}>
        <Text
          style={[
            styles.cellText,
            isInitial && styles.initialCellText,
            isMistake && styles.mistakeCellText,
          ]}>
          {value || ''}
        </Text>
      </Pressable>
    );
  }, [selectedCell, initialBoard, mistakes]);

  if (!fontsLoaded || !board.length) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sudoku</Text>
        <Text style={styles.timer}>{formatTime(timer)}</Text>
      </View>

      {isComplete && (
        <View style={styles.completeMessage}>
          <Text style={styles.completeText}>Puzzle Complete!</Text>
          <Text style={styles.completeTime}>Time: {formatTime(timer)}</Text>
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
        <View style={styles.numberPad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
            <Pressable
              key={number}
              style={styles.numberButton}
              onPress={() => handleNumberPress(number)}>
              <Text style={styles.numberButtonText}>{number}</Text>
            </Pressable>
          ))}
          <Pressable
            style={styles.numberButton}
            onPress={() => handleNumberPress(0)}>
            <Text style={styles.numberButtonText}>×</Text>
          </Pressable>
        </View>

        <View style={styles.gameActions}>
          <Pressable style={styles.actionButton} onPress={handleRestart}>
            <RotateCcw size={24} color="#000" />
          </Pressable>
          <Pressable
            style={[styles.actionButton, isComplete && styles.actionButtonComplete]}
            disabled={!isComplete}>
            <Check size={24} color={isComplete ? '#fff' : '#000'} />
          </Pressable>
        </View>
      </View>

      <DifficultySelector
        difficulty={difficulty}
        onSelect={setDifficulty}
      />
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
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#000',
  },
  timer: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 24,
    color: '#666',
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
  board: {
    padding: 10,
    alignSelf: 'center',
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
    backgroundColor: '#f0f0f0',
  },
  initialCell: {
    backgroundColor: '#f8f8f8',
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
    fontWeight: '600',
  },
  mistakeCellText: {
    color: '#f44336',
  },
  controls: {
    padding: 20,
    marginTop: 'auto',
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
  actionButtonComplete: {
    backgroundColor: '#4CAF50',
  },
});