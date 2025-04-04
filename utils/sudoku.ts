import { Platform } from 'react-native';

export type Difficulty = 'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert';
export type Board = (number | null)[][];
export type Position = [number, number];

const DIFFICULTY_RANGES = {
  Beginner: { min: 45, max: 55 },
  Easy: { min: 35, max: 45 },
  Medium: { min: 25, max: 34 },
  Hard: { min: 17, max: 24 },
  Expert: { min: 13, max: 16 },
};

// Fisher-Yates shuffle algorithm
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function isValid(board: Board, pos: Position, num: number): boolean {
  const [row, col] = pos;

  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num && x !== col) return false;
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num && x !== row) return false;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (
        board[boxRow + i][boxCol + j] === num &&
        boxRow + i !== row &&
        boxCol + j !== col
      )
        return false;
    }
  }

  return true;
}

function findEmpty(board: Board): Position | null {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === null) return [i, j];
    }
  }
  return null;
}

function solve(board: Board): boolean {
  const find = findEmpty(board);
  if (!find) return true;

  const [row, col] = find;
  const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  for (const num of nums) {
    if (isValid(board, [row, col], num)) {
      board[row][col] = num;
      if (solve(board)) return true;
      board[row][col] = null;
    }
  }

  return false;
}

function generateSolvedBoard(): Board {
  const board: Board = Array(9)
    .fill(null)
    .map(() => Array(9).fill(null));

  solve(board);
  return board;
}

function removeNumbers(board: Board, difficulty: Difficulty): Board {
  const { min, max } = DIFFICULTY_RANGES[difficulty];
  const cellsToRemove = 81 - Math.floor(Math.random() * (max - min + 1) + min);
  const newBoard = board.map(row => [...row]);
  const positions = shuffle(
    Array.from({ length: 81 }, (_, i) => [
      Math.floor(i / 9),
      i % 9,
    ] as Position),
  );

  for (let i = 0; i < cellsToRemove; i++) {
    const [row, col] = positions[i];
    newBoard[row][col] = null;
  }

  return newBoard;
}

export function generatePuzzle(difficulty: Difficulty): {
  initial: Board;
  solution: Board;
} {
  const solution = generateSolvedBoard();
  const initial = removeNumbers(solution, difficulty);
  return { initial, solution };
}

export function checkWin(board: Board, solution: Board): boolean {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] !== solution[i][j]) return false;
    }
  }
  return true;
}

export function checkMove(
  board: Board,
  solution: Board,
  pos: Position,
  value: number,
): boolean {
  const [row, col] = pos;
  return solution[row][col] === value;
}

export function isBoardValid(board: Board): boolean {
  // Check rows
  for (let i = 0; i < 9; i++) {
    const row = board[i].filter(cell => cell !== null);
    if (new Set(row).size !== row.length) return false;
  }

  // Check columns
  for (let j = 0; j < 9; j++) {
    const col = board.map(row => row[j]).filter(cell => cell !== null);
    if (new Set(col).size !== col.length) return false;
  }

  // Check 3x3 boxes
  for (let box = 0; box < 9; box++) {
    const boxRow = Math.floor(box / 3) * 3;
    const boxCol = (box % 3) * 3;
    const cells = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const cell = board[boxRow + i][boxCol + j];
        if (cell !== null) cells.push(cell);
      }
    }
    if (new Set(cells).size !== cells.length) return false;
  }

  return true;
}