const offsetToRowCol = (offset, gridSize = 8) => {
  const row = Math.floor(offset / gridSize)
  const col = offset % gridSize
  return [row, col]
}

export default offsetToRowCol
