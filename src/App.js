import "./App.css";
import Square from "./Square.js";
import { useEffect, useState } from "react";
import "./Pathfinding.js";
import {
  computeHeuristic,
  computeNeighbors,
  rowColToOffset,
} from "./Pathfinding.js";
import toast, { Toaster } from "react-hot-toast";

function App() {
  const totalSquares = 64;
  const gapVal = 3;
  const squareSize = 70;
  const gridSize = Math.sqrt(totalSquares);

  // so apparently we don't just 2D array with 2 for loops
  // to create a grid in javascript. silly me!
  // this is the prefered way:
  const gridTemplateColumnsVal = `repeat(${gridSize}, ${gapVal + squareSize}px)`;

  const initialSquareState = {
    offset: -1,
    state: 0,
    gCost: -1,
    hCost: -1,
    fCost: -1,
  };

  const initSquareStates = [...Array(totalSquares)].map((_, idx) => ({...initialSquareState, offset: idx}));
  const [squareStates, setSquareStates] = useState(initSquareStates);

  const defaultEnd = -1;
  const defaultStart = -1;

  const [walls, setWalls] = useState([]);
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const [open, setOpen] = useState([]);
  const [closed, setClosed] = useState([]);

  const [path, setPath] = useState({ path: [], cost: 0 });

  useEffect(() => { console.log("open: ", open) }, [open])
  useEffect(() => { console.log("closed", closed) }, [closed])
  useEffect(() => { console.log("path", path) }, [path])

  const squareClick = (offset, state) => {
    const availableStates = Array(0, 1, 2, 3).filter(
      (num) => {
        squareStates.includes(1) ? false : true;
        squareStates.includes(2) ? false : true;
      }
    );

    // 0 = nothing
    // 1 = end
    // 2 = start
    // 3 = wall
    const nextState = state >= 3 ? 0 : state + 1;
    const computeNextState = () => {
      // going from wall to not wall
      if (state >= 3) { 
        return 0;
      } else if (state === 0) {
        // going from nothing to potentially end, if end is available
        if (availableStates.includes(1)) {
          setEnd(offset);
          return 1;
        } else if (availableStates.includes(2)) {
          setStart(offset);
          return 2;
        } else {
          return 3;
        }
      } else if (state === 1) {
        if (availableStates.includes(2)) {
          setStart(offset);
          setEnd(-1);
          return 2;
        } else {
          return 3;
        }
      }
    };
    let prevEnd, prevStart;

    switch (nextState) {
      case 1:
        prevEnd = end;
        setEnd(offset);
        break;
      case 2:
        prevStart = start;
        setStart(offset);
        break;
      case 3:
        setWalls([...walls, offset]);
        break;
      default:
        setWalls((currentWalls) => currentWalls.filter((w) => w !== offset));
    }

    const newSquareStates = squareStates.map((square, idx) => {
      if (idx === prevEnd || idx === prevStart) {
        return { ...square, state: 0 }
      } else if (idx === offset) {
        return {...square, state: nextState } 
      } else {
        return square;
      }

    });

    setSquareStates(newSquareStates);
  };

  const takeStep = () => {
    if (start.length !== 1)
      toast.error("Please select one and only one start tile.");
    if (end.length !== 1)
      toast.error("Please select one and only one end tile.");

    let currentSquare;
    if (open.length === 0) {
      console.log("starting")
      currentSquare = start[0]
    } else {
      console.log("taking from existing open")
      currentSquare = open.pop().offset;
    }

    if (currentSquare.offset === end[0]) {
      toast.success("all done!");
      return;
    }

    console.log("working with ", currentSquare)
   
    computeNeighborCosts(currentSquare);
  };

  const computeNeighborCosts = (currentSquare) => {
    let tmp = computeNeighbors(currentSquare, walls, open, closed);
    let neighborOffsets = tmp.map((n) => rowColToOffset(n.row, n.col));
    console.log("neighboroffsets: ", neighborOffsets)
    console.log("current path so far: ", path)

    const newSquareStates = squareStates.map((square, idx) => {
      if (neighborOffsets.includes(idx)) {
        console.log("path inside new square states: ", path);
        return {
          ...square,
          state: 10,
          hCost: computeHeuristic(idx, end[0]),
          gCost: computeHeuristic(currentSquare, idx) + squareStates[path.path[path.path.length - 1]].gCost,
          fCost:
            computeHeuristic(idx, end[0]) + squareStates[path.path[path.path.length - 1]].gCost,
        };
      }
      return square;
    });

    let neighborOffsetsByLowestFCost = newSquareStates.filter((_, idx) => neighborOffsets.includes(idx)).sort((a, b) => b.fCost - a.fCost)

    setSquareStates(newSquareStates);
    setOpen([...open, ...neighborOffsetsByLowestFCost]);
    setClosed([...closed, newSquareStates[currentSquare]])
    setPath(prevPath => {
      const newPath = [...prevPath.path, currentSquare];
      const newCost = prevPath.cost + currentSquare.gCost;
      return { path: newPath, cost: newCost };
    });
  };

  return (
    <div className="container">
      <Toaster position="bottom-right" reverseOrder={false} />
      <div
        className="content"
        style={{
          gridTemplateColumns: gridTemplateColumnsVal,
          gap: gapVal,
        }}
      >
        {squareStates.map((squareState, idx) => (
          <Square
            key={idx}
            squareClick={squareClick}
            state={{ ...squareState, offset: idx }}
            borderColor="white"
            width={squareSize}
            height={squareSize}
          />
        ))}
      </div>
      <div className="controls">
        <button
          onClick={() => {
            takeStep();
          }}
        >
          take a step
        </button>
        <button
          onClick={() => {
            setSquareStates(initSquareStates);
            setPath({ path: [], cost: 0 });
            setOpen([]);
            setClosed([]);
            setStart(defaultStart);
            setEnd(defaultEnd);
            setWalls([]);
          }}
        >
          reset
        </button>
      </div>
    </div>
  );
}

export default App;
