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
  const [cameFrom, setCameFrom] = useState({});

  const [path, setPath] = useState({ path: [], cost: 0 });

  useEffect(() => { console.log("came from: ", cameFrom) }, [cameFrom])
  /*
  useEffect(() => { console.log("open: ", open) }, [open])
  useEffect(() => { console.log("closed", closed) }, [closed])
 
  useEffect(() => { console.log("path", path) }, [path])
  useEffect(() => { console.log("squareStates", squareStates)}, [squareStates])
  
  useEffect(() => { console.log("start: ", start ) }, [start]);
  useEffect(() => { console.log("end: ", end) }, [end]);
  */

  const squareClick = (offset, state) => {
    let availableStates = [0, 1, 2, 3];
    let isStartSelected = squareStates.filter((state) => { return state.state === 1; }).length === 1 ? true : false;
    let isEndSelected   = squareStates.filter((state) => { return state.state === 2; }).length === 1 ? true : false;
    if (isStartSelected) availableStates = availableStates.filter((n) => { return n === 1 });
    if (isEndSelected)   availableStates = availableStates.filter((n) => { return n === 2 });

    // 0 = nothing
    // 1 = start 
    // 2 = end
    // 3 = wall

    let nextState = -1;
    if (state === 0) {
      if (!isStartSelected) {
        nextState = 1;
        setStart(offset);
      } else if (!isEndSelected) {
        nextState = 2;
        setEnd(offset);
      } else {
        nextState = 3;
        setWalls(prevWalls => ([...prevWalls, offset]));
      }
    } else if (state === 1) {
      setStart(-1);
      if (!isEndSelected) {
        nextState = 2;
        setEnd(offset);
      } else {
        nextState = 3;
        setWalls(prevWalls => ([...prevWalls, offset]));
      }
    } else if (state === 2) {
      setEnd(-1)
      nextState = 3;
      setWalls(prevWalls => ([...prevWalls, offset]));
    } else if (state === 3) {
      nextState = 0;
      setWalls(prevWalls => (prevWalls.filter(w => w !== offset)))
    } else {
        nextState = 3;
        setWalls(prevWalls => ([...prevWalls, offset]));
    }
 
    const newSquareStates = squareStates.map((square, idx) => {
      if (idx === offset) {
        nextState === 1 ? square = { ...square, gCost: 0, hCost: 0, fCost: 0} : square = { ...square, gCost: -1 }
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
      setPath(prevPath => {
        const newPath = [...prevPath.path, currentSquareOffset]
        return { ...prevPath, path: newPath }
      });
      setOpen(squareStates.filter((s) => (s.offset === end)));
      return;
    }

    let neighborOffsets = computeNeighbors(currentSquareOffset, walls, open, closed).map((n) => rowColToOffset(n.row, n.col));
    let squareStatesWithCost = computeNeighborCosts(currentSquareOffset, neighborOffsets);

    setSquareStates(squareStatesWithCost);

    let neighborOffsetsByLowestFCost = squareStatesWithCost.filter((_, idx) => neighborOffsets.includes(idx)).sort((a, b) => b.fCost - a.fCost)

    // this will find the absolute lowest cost but you have to amend your path
    setOpen([...open, ...neighborOffsetsByLowestFCost].sort((a, b) => b.fCost - a.fCost));

    // this will find the lowest cost relative to where you 
    // but not intelligent, and you don't have to revisit your path
    //setOpen([...open, ...neighborOffsetsByLowestFCost]);

    setClosed([...closed, squareStatesWithCost[currentSquareOffset]])
    setPath(prevPath => {
      const newPath = [...prevPath.path, currentSquareOffset];
      const newCost = prevPath.cost + squareStatesWithCost[currentSquareOffset].fCost;
      return { path: newPath, cost: newCost };
    });
  };

  const computeNeighborCosts = (currentSquareOffset, neighborOffsets) => { 
    return squareStates.map((square, idx) => {
      if (idx === currentSquareOffset) {
        square = {...square, isCurrent: true };
      }
      else if (idx === end) {
        return square; 
      }
      else if (neighborOffsets.includes(idx)) {
        //let currentSquareGCost;
        //path.path.length > 0 ? currentSquareGCost = squareStates[path.path[path.path.length - 1]].gCost : currentSquareGCost = 0;
        
        let newHCost = computeHeuristic(idx, end);
        // note: gcost is the cost from the neighbor back to the current square but also including the current square's cost
        let newGCost = computeHeuristic(currentSquareOffset, idx) + squareStates[currentSquareOffset].gCost;
        let newFCost = newGCost + newHCost;

        let foo = {
          ...square,
          state: 10,
          hCost: newHCost,
          gCost: newGCost,
          fCost: newFCost,
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
