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
  useEffect(() => { console.log("end: ", end) }, [end]);
  */

  const squareClick = (offset, state) => {
    let isEndSelected   = squareStates.filter((state) => { return state.state === 1; }).length === 1 ? true : false;
    let isStartSelected = squareStates.filter((state) => { return state.state === 2; }).length === 1 ? true : false;
    let availableStates = Array(0, 1, 2, 3);
    if (isEndSelected)   availableStates = availableStates.filter((n) => { return n === 1 });
    if (isStartSelected) availableStates = availableStates.filter((n) => { return n === 2 });

    // 0 = nothing
    // 1 = start 
    // 2 = end
    // 3 = wall

    let nextState = -1;
    if (state === 0) {
      
    }
 
    const newSquareStates = squareStates.map((square, idx) => {
      if (idx === offset) {
        nextState === 2 ? square = { ...square, gCost: 0, hCost: 0, fCost: 0} : square = { ...square, gCost: -1 }
        return {...square, state: nextState } 
      } else {
        return square;
      }
    });

    setSquareStates(newSquareStates);
  };

  const takeStep = () => {
    if (start === defaultStart || end === defaultEnd) {
      toast.error("Please select one and only one start tile.");
      return;
    }

    let currentSquareOffset;
    if (open.length === 0) {
      currentSquareOffset = start;
    } else {
      currentSquareOffset = open.pop().offset;
    }

    if (currentSquareOffset === end) {
      toast.success("all done!");
      setOpen(squareStates.filter((s) => (s.offset === end)))
      return;
    }

    let neighborOffsets = computeNeighbors(currentSquareOffset, walls, open, closed).map((n) => rowColToOffset(n.row, n.col));
    let squareStatesWithCost = computeNeighborCosts(currentSquareOffset, neighborOffsets);

    setSquareStates(squareStatesWithCost);

    let neighborOffsetsByLowestFCost = squareStatesWithCost.filter((_, idx) => neighborOffsets.includes(idx)).sort((a, b) => b.fCost - a.fCost)
    setOpen([...open, ...neighborOffsetsByLowestFCost]);
    setClosed([...closed, squareStatesWithCost[currentSquareOffset]])
    console.log("current square info: ", squareStatesWithCost[currentSquareOffset])
    setPath(prevPath => {
      const newPath = [...prevPath.path, currentSquareOffset];
      const newCost = prevPath.cost + squareStatesWithCost[currentSquareOffset].fCost;
      return { path: newPath, cost: newCost };
    });
  };

  const computeNeighborCosts = (currentSquareOffset, neighborOffsets) => { 
    console.log("current square  :", currentSquareOffset);
    return squareStates.map((square, idx) => {
      if (idx === currentSquareOffset) {
        square = {...square, isCurrent: true };
      }
      else if (neighborOffsets.includes(idx)) {
       
        let gCost;
        path.path.length > 0 ? gCost = squareStates[path.path[path.path.length - 1]].gCost : gCost = 0;
        
        let bar = computeHeuristic(currentSquareOffset, idx);
        console.log("current neighbor:", idx, "heuristic between the two:", bar, "cumulative gCost:", gCost)
        console.log("path: ", path)

        let foo = {
          ...square,
          state: 10,
          hCost: computeHeuristic(idx, end),
          gCost: computeHeuristic(currentSquareOffset, idx) + gCost,
          fCost: computeHeuristic(idx, end) + gCost,
        };

        return foo;
      }
      return square;
   })};

  return (
    <div className="container">
      <div className="sampleSquare">
        <div className="text-area top-left">g</div>
        <div className="text-area top-right">h</div>
        <div className="text-area center">f</div>
        <div className="text-area bottom-right">offset</div>
        <div className="text-area bottom-left">col, row</div>
      </div>

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
