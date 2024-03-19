export const offsetToRowCol = (offset, gridSize=8) => {
    const row = Math.floor(offset / gridSize);
    const col = offset % gridSize;
    return [row, col];
};

export const rowColToOffset = (row, col, gridSize=8) => {
  return col * gridSize + row;
};

export const computeNeighbors = (offset, walls, gridSize=8) => {
  const [row, col] = offsetToRowCol(offset);
  let neighbors = [];

  for (let r = -1; r < 2; r++) {
    for (let c = -1; c < 2; c++)
    {
      let cc = col + c;
      let rr = row + r;
      if (r === 0 && c === 0) continue;
      if (walls.includes(rowColToOffset(rr, cc))) continue;
      if ((rr >= 0 && cc >= 0) && (rr < gridSize && cc < gridSize)) {
        neighbors.push({ col: rr, row: cc });
      }
    }
  }
  return neighbors;
};

export const computeHeuristic = (s, e) => {
  let h_cost = 0;
  if (s === e) return h_cost;
  if (s === -1 || e === -1) return -1;
  let [startRow, startCol] = offsetToRowCol(s);
  let [endRow, endCol] = offsetToRowCol(e);
  let currentRow = startRow;
  let currentCol = startCol;

  while(Math.abs(currentRow - endRow) > 0 && Math.abs(currentCol - endCol) > 0) {
    h_cost += 14;
    if (currentRow > endRow) currentRow -= 1;
    else currentRow += 1;

    if (currentCol > endCol) currentCol -= 1;
    else currentCol += 1;
  }

  if (currentRow !== endRow) h_cost += 10 * Math.abs(currentRow - endRow);
  if (currentCol !== endCol) h_cost += 10 * Math.abs(currentCol - endCol);

  return h_cost;
};

