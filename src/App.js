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

  // so apparently we don't just 2D array with 2 for loops"
  // to create a grid in javascript. silly me!
  // this is the prefered way:
  const gridTemplateColumnsVal = `repeat(${gridSize}, ${gapVal + squareSize}px)`;

  const initialSquareState = {
    offset: -1,
    state: 0,
    g_cost: "",
    h_cost: "",
    f_cost: "",
  };

  const [squareStates, setSquareStates] = useState(
    Array(totalSquares).fill(initialSquareState),
  );

  const [walls, setWalls] = useState([]);
  const [start, setStart] = useState([]);
  const [end, setEnd] = useState([]);
  const [open, setOpen] = useState([]);
  const [closed, setClosed] = useState([]);

  const [path, setPath] = useState({ path: [], cost: 0 });

  useEffect(() => {
    console.log("open", open)
    let g_costs = []
    for 
  }, [open])
  useEffect(() => {console.log("closed", closed)}, [closed])
  useEffect(() => {console.log("path", path)}, [path])

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
      idx === offset ? { ...square, state: nextState } : square,
    );

    setSquareStates(newSquareStates);
  };

  const computeNeighborCosts = () => {
    if (start.length !== 1)
      toast.error("Please select one and only one start tile.");
    if (end.length !== 1)
      toast.error("Please select one and only one end tile.");

    if (path.path.length === 0) path.path.push(start[0]);

    let currentSquare = path.path[path.path.length - 1];
    let tmp = computeNeighbors(currentSquare, walls);
    let neighbor_offsets = tmp.map((n) => rowColToOffset(n.row, n.col));

    const newSquareStates = squareStates.map((square, idx) => {
      if (neighbor_offsets.includes(idx)) {
        return {
          ...square,
          state: 10,
          h_cost: computeHeuristic(idx, end[0]),
          g_cost: computeHeuristic(currentSquare, idx) + squareStates[path.path[path.path.length - 1]].g_cost,
          f_cost:
            computeHeuristic(idx, end[0]) + computeHeuristic(start[0], idx),
        };
      }

      return square;
    });

    setOpen(neighbor_offsets);
    setClosed([...closed, currentSquare])
    setSquareStates(newSquareStates);
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
            computeNeighborCosts();
          }}
        >
          take a step
        </button>
        <button
          onClick={() => {
            setSquareStates(Array(totalSquares).fill(initialSquareState));
            setPath({ path: [], cost: 0 });
            setStart([]);
            setEnd([]);
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
