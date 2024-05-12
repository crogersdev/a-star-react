export const offsetToRowCol = (offset, gridSize = 8) => {
  const row = Math.floor(offset / gridSize);
  const col = offset % gridSize;
  return [row, col];
};

export const rowColToOffset = (row, col, gridSize = 8) => {
  return row * gridSize + col;
};

export const computeNeighbors = (candidateOffset, walls, open, closed, gridSize = 8) => {
  const [row, col] = offsetToRowCol(candidateOffset);
  let neighbors = [];

  for (let r = -1; r < 2; r++) {
    for (let c = -1; c < 2; c++) {
      if (r === 0 && c === 0) continue;
      const cc = col + c;
      const rr = row + r;
      const neighborOffset = rowColToOffset(rr, cc);
      if (walls.includes(neighborOffset)) continue;
      if (open.map((o) => o.offset).includes(neighborOffset)) continue;
      if (closed.map((c) => c.offset).includes(neighborOffset)) continue;
      if (rr >= 0 && cc >= 0 && rr < gridSize && cc < gridSize) {
        neighbors.push({ col: cc, row: rr });
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

  while (Math.abs(currentRow - endRow) > 0 && Math.abs(currentCol - endCol) > 0) {
    h_cost += 14;
    currentRow > endRow ? currentRow -= 1 : currentRow += 1;
    currentCol > endCol ? currentCol -= 1 : currentCol += 1;
  }

  if (currentRow !== endRow) h_cost += 10 * Math.abs(currentRow - endRow);
  if (currentCol !== endCol) h_cost += 10 * Math.abs(currentCol - endCol);

  return h_cost;
};