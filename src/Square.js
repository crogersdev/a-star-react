import React from "react";
import { offsetToRowCol } from "./Pathfinding";
import "./Square.css";

function Square(props) {
  const bgColors = {
    0: "#212121",     // empty; nothing
    1: "green",       // start
    2: "red",         // end
    3: "blue",        // wall
    10: "goldenrod",  // neighbor
  };

  const [row, col] = offsetToRowCol(props.state.offset);

  const squareClick = () => {
    props.squareClick(props.state.offset, props.state.state);
  };

  let borderColor, borderWidth;
  if (props.state.isCurrent) {
    borderColor = "magenta";
    borderWidth = "5px";
  } else {
    borderColor = props.borderColor;
    borderWidth = "2px";
  }

  let fCostText;
  props.state.fCost > 0 ? fCostText = props.state.fCost : fCostText = "";
  let gCostText;
  props.state.gCost > 0 ? gCostText = props.state.gCost : gCostText = "";
  let hCostText;
  props.state.hCost > 0 ? hCostText = props.state.hCost : hCostText = "";

  return (
    <div
      className="square"
      onClick={() => squareClick()}
      style={{
        backgroundColor: bgColors[props.state.state],
        border: `${borderWidth} solid ${borderColor}`,
        width: `${props.width}px`,
        height: `${props.height}px`,
      }}
    >
      <div className="text-area top-left">{gCostText}</div>
      <div className="text-area top-right">{hCostText}</div>
      <div className="text-area center">{fCostText}</div>
      <div className="text-area bottom-right">{props.state.offset}</div>
      <div className="text-area bottom-left">{col + ", " + row}</div>
    </div>
  );
}

export default Square;
