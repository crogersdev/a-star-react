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
    isCurrent: false,
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

  /*
  useEffect(() => { console.log("open: ", open) }, [open])
  useEffect(() => { console.log("closed", closed) }, [closed])
  useEffect(() => { console.log("path", path) }, [path])
  useEffect(() => { console.log("start: ", start ) }, [start]);
  */

  const squareClick = (offset, state) => {
    let isEndSelected   = squareStates.filter((state) => { return state.state === 1; }).length === 1 ? true : false;
    let isStartSelected = squareStates.filter((state) => { return state.state === 2; }).length === 1 ? true : false;
    let availableStates = Array(0, 1, 2, 3);
    if (isEndSelected)   availableStates = availableStates.filter((n) => { return n === 1 });
    if (isStartSelected) availableStates = availableStates.filter((n) => { return n === 2 });

    // 0 = nothing
    // 1 = end
    // 2 = start
    // 3 = wall

    let nextState = -1;
    // going from wall to not wall
    if (state >= 3) { 
      nextState = 0;
    } else if (state === 0) {
      // going from nothing to potentially end, if end is available
      if (!isEndSelected) {
        setEnd(offset);
        nextState = 1;
      } else if (!isStartSelected) {
        setStart(offset);
        setPath(prevPath => ({ ...prevPath, path: [offset] }));
        nextState = 2;
      } else {
        setWalls(prevWalls => ([...prevWalls, offset]));
        nextState = 3;
      }
    } else if (state === 1) {
      if (!isStartSelected) {
        setStart(offset);
        setPath(prevPath => ({ ...prevPath, path: [offset] }));
        setEnd(-1);
        nextState = 2;
      } else {
        setWalls(prevWalls => ([...prevWalls, offset]));
        nextState = 3;
      }
    } else if (state === 2) {
      setStart(-1);
      setPath({ path: [], cost: 0 });
      setWalls(prevWalls => ([...prevWalls, offset]));
      nextState = 3;
    } else if (state === 3) {
      setWalls(prevWalls => (prevWalls.filter((w) => (w !== offset))));
    }

    let prevEnd, prevStart;
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
    if (start === defaultStart || end === defaultEnd)
      toast.error("Please select one and only one start tile.");

    let currentSquare;
    if (open.length === 0) {
      //console.log("starting at offset: ", start);
      currentSquare = start;
    } else {
      //console.log("taking from existing open");
      currentSquare = open.pop().offset;
    }

    if (currentSquare.offset === end) {
      toast.success("all done!");
      return;
    }

    //console.log("working with ", currentSquare)
    const newSquareStates = squareStates.map((square, idx) => {
      if (idx === currentSquare) {
        return { ...square, isCurrent: true };
      } 
      else {
        //return { ...square, isCurrent: false };
        return square;
      }
    });

    computeNeighborCosts(currentSquare, newSquareStates);
  };

  const computeNeighborCosts = (currentSquare, newSquareStates) => {
    let tmp = computeNeighbors(currentSquare, walls, open, closed);
    let neighborOffsets = tmp.map((n) => rowColToOffset(n.row, n.col));
    //console.log("neighboroffsets: ", neighborOffsets)
    //console.log("current path so far: ", path)

    const squareStatesWithCost = newSquareStates.map((square, idx) => {
      if (neighborOffsets.includes(idx)) {
        //console.log("path inside new square states: ", path);
        return {
          ...square,
          state: 10,
          hCost: computeHeuristic(idx, end),
          gCost: computeHeuristic(currentSquare, idx) + newSquareStates[path.path[path.path.length - 1]].gCost,
          fCost:
            computeHeuristic(idx, end) + newSquareStates[path.path[path.path.length - 1]].gCost,
        };
      }
      return square;
    });

    setSquareStates(squareStatesWithCost);

    let neighborOffsetsByLowestFCost = squareStatesWithCost.filter((_, idx) => neighborOffsets.includes(idx)).sort((a, b) => b.fCost - a.fCost)
    setOpen([...open, ...neighborOffsetsByLowestFCost]);
    setClosed([...closed, squareStatesWithCost[currentSquare]])
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
