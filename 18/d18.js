const fs = require("fs");

function readInput(fileName) {
  return fs
    .readFileSync(fileName, { encoding: "utf8", flag: "r" })
    .split("\r\n");
}

function decodeForPart1(splits) {
  const direction = splits[0];
  const steps = +splits[1];
  return { direction, steps };
}

function decodeForPart2(splits) {
  let direction = splits[2].substring(7, 8);
  const steps = parseInt(splits[2].substring(2, 7), 16);
  switch (direction) {
    case "0": // right
      direction = "R";
      break;
    case "1": // down
      direction = "D";
      break;
    case "3": // up
      direction = "U";
      break;
    case "2": // left
      direction = "L";
      break;
  }
  return { direction, steps };
}

/**
 * The logic is visualized and documented in d18.png
 */

function puzzle(input, decoder) {
  let Ag = 0;
  const coords = [{ row: 0, col: 0 }];
  input.forEach((line) => {
    const splits = line.split(" ");
    const { direction, steps } = decoder(splits);
    const prevCoord = coords[coords.length - 1];
    const nextCoord = { row: prevCoord.row, col: prevCoord.col };
    Ag += steps;
    switch (direction) {
      case "R":
        nextCoord.col += steps;
        break;
      case "D":
        nextCoord.row += steps;
        break;
      case "U":
        nextCoord.row -= steps;
        break;
      case "L":
        nextCoord.col -= steps;
        break;
    }
    coords.push(nextCoord);
  });
  console.log("Ag (trench):", Ag);

  const Ap = shoelace(coords);
  console.log("Ap (shoelace):", Ap);

  const Ao = Ag / 2 - 1;
  console.log("Ap (overlap):", Ao);

  const A = Ag - Ao + Ap;
  console.log("Puzzle Result:", A);
}

function shoelace(coords) {
  let result = 0;
  coords.forEach((coord, idx) => {
    if (idx < coords.length - 1) {
      result += coord.row * coords[idx + 1].col;
    }
    if (0 < idx) {
      result -= coord.row * coords[idx - 1].col;
    }
  });
  return Math.abs(result) / 2;
}

// const input = readInput("d18-input-smol.txt");
const input = readInput("d18-input.txt");
puzzle(input, decodeForPart1); // 62, 41019
puzzle(input, decodeForPart2); // 952408144115, 96116995735219
