import { useState } from 'react';
import './App.css';

const GRID_SIZE = 9;

function App() {
  const [grid, setGrid] = useState(() => 
    Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(''))
  );
  const [userInputs, setUserInputs] = useState(() => 
    Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(false))
  );
  const [solvedCells, setSolvedCells] = useState(() => 
    Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(false))
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const validateInput = (row, col, value, currentGrid = grid) => {
    if (value === '') return true;
    
    const num = parseInt(value);
    if (num < 1 || num > 9) return false;

    for (let c = 0; c < GRID_SIZE; c++) {
      if (c !== col && currentGrid[row][c] === value) {
        return false;
      }
    }

    for (let r = 0; r < GRID_SIZE; r++) {
      if (r !== row && currentGrid[r][col] === value) {
        return false;
      }
    }

    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        if (r !== row && c !== col && currentGrid[r][c] === value) {
          return false;
        }
      }
    }

    return true;
  };

  const handleInputChange = (row, col, value) => {
    if (isAnimating || isSolved) return;

    setErrorMessage('');
    
    if (value === '') {
      const newGrid = [...grid];
      const newUserInputs = [...userInputs];
      
      newGrid[row][col] = '';
      newUserInputs[row][col] = false;
      
      setGrid(newGrid);
      setUserInputs(newUserInputs);
      return;
    }

    if (!validateInput(row, col, value)) {
      setErrorMessage(`Number ${value} conflicts with existing numbers in the same row, column, or 3×3 box!`);
      return;
    }
    
    const newGrid = [...grid];
    const newUserInputs = [...userInputs];
    
    newGrid[row][col] = value;
    newUserInputs[row][col] = true;
    
    setGrid(newGrid);
    setUserInputs(newUserInputs);
  };

  const isValidMove = (board, row, col, num) => {
    for (let i = 0; i < GRID_SIZE; i++) {
      if (board[row][i] === num || board[i][col] === num) {
        return false;
      }
    }

    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;

    for (let i = startRow; i < startRow + 3; i++) {
      for (let j = startCol; j < startCol + 3; j++) {
        if (board[i][j] === num) {
          return false;
        }
      }
    }

    return true;
  };

  const solveSudokuHelper = (board) => {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValidMove(board, row, col, num)) {
              board[row][col] = num;

              if (solveSudokuHelper(board)) {
                return true;
              }

              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  const solveSudoku = async () => {
    if (isAnimating || isSolved) return;
    
    setIsAnimating(true);
    setErrorMessage('');
    setSolvedCells(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(false)));

    const sudokuArray = grid.map(row => 
      row.map(cell => cell === '' ? 0 : parseInt(cell))
    );

    if (solveSudokuHelper(sudokuArray)) {
      const newGrid = [...grid];
      const newSolvedCells = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(false));

      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          if (!userInputs[row][col]) {
            newGrid[row][col] = sudokuArray[row][col].toString();
            newSolvedCells[row][col] = true;
            
            setGrid([...newGrid]);
            setSolvedCells([...newSolvedCells]);
            
            await sleep(30);
          }
        }
      }
      setIsSolved(true);
    } else {
      setErrorMessage("No solution exists for the given Sudoku puzzle!");
    }
    
    setIsAnimating(false);
  };

  const clearGrid = () => {
    if (isAnimating) return;
    
    setGrid(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill('')));
    setUserInputs(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(false)));
    setSolvedCells(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(false)));
    setIsSolved(false);
    setErrorMessage('');
  };

  
  const generateRandomPuzzle = (difficulty = 40) => {
    const solvedBoard = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
    
    for (let box = 0; box < GRID_SIZE; box += 3) {
      fillBox(solvedBoard, box, box);
    }
    
    solveSudokuHelper(solvedBoard);
    
    const puzzle = solvedBoard.map(row => [...row]);
    let cellsToRemove = difficulty;
    
    while (cellsToRemove > 0) {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      
      if (puzzle[row][col] !== 0) {
        puzzle[row][col] = 0;
        cellsToRemove--;
      }
    }
    
    const stringPuzzle = puzzle.map(row => row.map(cell => cell === 0 ? '' : cell.toString()));
    const newUserInputs = stringPuzzle.map(row => row.map(cell => cell !== ''));
    
    setGrid(stringPuzzle);
    setUserInputs(newUserInputs);
    setSolvedCells(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(false)));
    setIsSolved(false);
    setErrorMessage('');
  };

  const fillBox = (board, startRow, startCol) => {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    shuffleArray(nums);
    
    let index = 0;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        board[startRow + i][startCol + j] = nums[index++];
      }
    }
  };

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const getCellClassName = (row, col) => {
    let className = 'cell';
    
    if (userInputs[row][col]) {
      className += ' user-input';
    }
    
    if (solvedCells[row][col]) {
      className += ' solved';
    }
    
    if (row % 3 === 2 && row !== 8) {
      className += ' border-bottom-thick';
    }
    if (col % 3 === 2 && col !== 8) {
      className += ' border-right-thick';
    }
    
    return className;
  };

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">Sudoku Solver</h1>
        <p className="subtitle">Enter numbers in the grid and Click Solve</p>
        
        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}
        
        <div className="sudoku-container">
          <div className="grid">
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className="row">
                {row.map((cell, colIndex) => (
                  <input
                    key={`${rowIndex}-${colIndex}`}
                    type="number"
                    min="1"
                    max="9"
                    value={cell}
                    onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
                    className={getCellClassName(rowIndex, colIndex)}
                    disabled={isAnimating || isSolved}
                    readOnly={isSolved}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="controls">
          <button 
            onClick={solveSudoku} 
            className="btn btn-primary"
            disabled={isAnimating || isSolved}
          >
            {isAnimating ? 'Solving...' : 'Solve Puzzle'}
          </button>
          <button 
            onClick={() => generateRandomPuzzle(40)} 
            className="btn btn-secondary"
            disabled={isAnimating}
          >
            Random Puzzle
          </button>
          <button 
            onClick={clearGrid} 
            className="btn btn-outline"
            disabled={isAnimating}
          >
            Clear Grid
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
