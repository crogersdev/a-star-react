import './App.css';
import Square from './Square.js';
import offsetToRowCol from './Convert.js';
import { useEffect, useState } from 'react';

function App() {
  const totalSquares = 64;
  const gapVal = 3;
  const squareSize = 70;
  const gridSize = Math.sqrt(totalSquares);

  // so apparently we don't just 2D array with 2 for loops"
  // to create a grid in javascript. silly me!
  // this is the prefered way:
  const gridTemplateColumnsVal = `repeat(${gridSize}, ${gapVal + squareSize}px)`;

  const initialSquareState = {
      offset: -1,
      state: 0,
      g_cost: -1,
      h_cost: -1,
      f_cost: 9
  };

  const [squareStates, setSquareStates] = useState(Array(totalSquares).fill(initialSquareState));
  const [walls, setWalls] = useState([]);
  const [start, setStart] = useState([]);
  const [end, setEnd] = useState([]);

  let g_cost = "";
  let h_cost = "";
  let f_cost = g_cost + h_cost;

  useEffect(() => {
    console.log("walls:", walls);
    console.log("start is: ", start);
    console.log("end is: ", end);
  });

  const computeNeighbors = (offset) => {
    const [row, col] = offsetToRowCol(offset);
    let neighbors = [];

    for (let r = -1; r < 2; r++) {
      for (let c = -1; c < 2; c++)
      {
        let cc = col + c;
        let rr = row + r;
        if (r === 0 && c === 0) continue;
        if (walls.includes(offset)) continue;
        if ((rr >= 0 && cc >= 0) && (rr < gridSize && cc < gridSize)) {
          neighbors.push({ col: rr, row: cc });
        }
      }
    }
    return neighbors;
  };

  const computeHeuristic = (s, e) => {
    let h_cost = 0;
    if (s == e) return h_cost;
    if (s == -1 || e == -1) return -1;
    let [startRow, startCol] = offsetToRowCol(s);
    let [endRow, endCol] = offsetToRowCol(e);
    let currentRow = startRow;
    let currentCol = startCol;

    while(Math.abs(currentRow - endRow) > 0 && Math.abs(currentCol - endCol) > 0) {
      h_cost += 14;
      currentRow -= 1;
      currentCol -= 1;
    }

    if (currentRow != endRow) h_cost += 10 * Math.abs(currentRow - endRow);
    if (currentCol != endCol) h_cost += 10 * Math.abs(currentCol - endCol);

    return h_cost;
  };

  const squareClick = (offset, state) => {
    const nextState = state >= 3 ? 0 : state + 1;

    switch (nextState) {
      case 1:
        setStart((currentStart) => currentStart.filter((s) => s !== offset));
        setEnd([...end, offset]);
        setWalls((currentWalls) => currentWalls.filter((w) => w !== offset)); 
        break;
      case 2:
        setStart([...start, offset]);
        setEnd((currentEnd) => currentEnd.filter((e) => e !== offset));
        setWalls((currentWalls) => currentWalls.filter((w) => w !== offset)); 
        break;
      case 3:
        setStart((currentStart) => currentStart.filter((s) => s !== offset));
        setEnd((currentEnd) => currentEnd.filter((e) => e !== offset));
        setWalls([...walls, offset]);
        break;
      default:
        setStart((currentStart) => currentStart.filter((s) => s !== offset));
        setEnd((currentEnd) => currentEnd.filter((e) => e !== offset));
        setWalls((currentWalls) => currentWalls.filter((w) => w !== offset)); 
    }
    
    const newSquareStates = squareStates.map((square, idx) => 
      idx === offset ? {...square, state: nextState} : square
    );

    setSquareStates(newSquareStates);
  };

  return (
    <div className="container">
    <div className="content" style={{
      gridTemplateColumns: gridTemplateColumnsVal,
      gap: gapVal
    }}>
      {squareStates.map((squareState, idx) => ( 
        <Square
          key={idx}
          squareClick={squareClick}
          state={{...squareState, offset: idx}}
          borderColor="white"
          width={squareSize}
          height={squareSize}
        />
      ))}
      </div>
      <div className="controls">
        <button onClick={() => {
          console.log("we have a start:", start);

        }}
        >take a step</button>
        <button onClick={() => {
          setSquareStates(Array(totalSquares).fill(initialSquareState));
          setWalls([]);
        }}>reset</button>
      </div>
    </div>
  )
}

export default App;
