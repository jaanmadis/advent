const fs = require("fs");

function writeOutput(fileName, output) {
  return fs.writeFileSync(fileName, output.join("\r\n"));
}

export function visualizePart1(coords, input) {
  let maxRow = 0;
  let minRow = 0;
  let maxCol = 0;
  let minCol = 0;
  coords.forEach((coord) => {
    maxRow = Math.max(maxRow, coord.row);
    minRow = Math.min(minRow, coord.row);
    maxCol = Math.max(maxCol, coord.col);
    minCol = Math.min(minCol, coord.col);
  });

  const visual = new Array(maxRow - minRow + 1)
    .fill("")
    .map(() => new Array(maxCol - minCol + 1).fill("."));
  let currRow = 0 - minRow;
  let currCol = 0 - minCol;

  input.forEach((line) => {
    const splits = line.split(" ");
    let dr = 0;
    let dc = 0;
    let tr = currRow;
    let tc = currCol;
    switch (splits[0]) {
      case "R":
        dc = 1;
        tc += +splits[1];
        break;
      case "D":
        dr = 1;
        tr += +splits[1];
        break;
      case "U":
        dr = -1;
        tr -= +splits[1];
        break;
      case "L":
        dc = -1;
        tc -= +splits[1];
        break;
    }
    while (currRow !== tr || currCol !== tc) {
      visual[currRow][currCol] = "#";
      currRow += dr;
      currCol += dc;
    }
  });
  visual.forEach((line) => console.log(line.join("")));
  writeOutput(
    "out.txt",
    visual.map((line) => line.join(""))
  );
}
