import React, { useState } from 'react';
import offsetToRowCol from './Convert';
import './Square.css';

function Square(props) {

  const bgColors = {
    0: "#212121",
    1: "red",
    2: "green",
    3: "blue"
  }

  const [row, col] = offsetToRowCol(props.state.offset);

  const squareClick = () => {
    props.squareClick(props.state.offset, props.state.state);
  };

  let borderColor = props.borderColor;
  return (
    <div className="square"
         onClick={() => squareClick()}
         style={{ 
                  backgroundColor: bgColors[props.state.state],
                  borderColor: borderColor,
                  width: `${props.width}px`,
                  height: `${props.height}px`
                }}
    >
        <div className="text-area top-left">{props.state.h_cost}</div>
        <div className="text-area top-right">{props.state.g_cost}</div>
        <div className="text-area center">{props.state.f_cost}</div>
        <div className="text-area bottom-right">{props.state.offset}</div>
        <div className="text-area bottom-left">{col + ", " + row}</div>
    </div>
  );
}

export default Square;