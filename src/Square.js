import React from "react";
import { offsetToRowCol } from "./Pathfinding";
import "./Square.css";

function Square(props) {
  const bgColors = {
    0: "#212121",
    1: "red",
    2: "green",
    3: "blue",
    7: "orange",
    10: "#a17800",
  };

  const [row, col] = offsetToRowCol(props.state.offset);

  const squareClick = () => {
    props.squareClick(props.state.offset, props.state.state);
  };

  let borderColor;
  if (props.state.isCurrent) {
     borderColor = "magenta"
   } else {
     borderColor = props.borderColor;
   }

  return (
    <div
      className="square"
      onClick={() => squareClick()}
      style={{
        backgroundColor: bgColors[props.state.state],
        border: `2px solid ${borderColor}`,
        width: `${props.width}px`,
        height: `${props.height}px`,
      }}
    >
      <div className="text-area top-left">{props.state.gCost < 0 ? "" : props.state.gCost}</div>
      <div className="text-area top-right">{props.state.hCost < 0 ? "" : props.state.hCost}</div>
      <div className="text-area center">{props.state.fCost < 0 ? "" : props.state.fCost}</div>
      <div className="text-area bottom-right">{props.state.offset}</div>
      <div className="text-area bottom-left">{col + ", " + row}</div>
    </div>
  );
}

export default Square;
