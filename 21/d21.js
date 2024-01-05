const fs = require("fs");

function readInput(fileName) {
  return fs
    .readFileSync(fileName, { encoding: "utf8", flag: "r" })
    .split("\r\n");
}

function createLargeFile(fileName, height, width) {
  const input = fs
    .readFileSync(fileName, { encoding: "utf8", flag: "r" })
    .split("\r\n");

  const output = [];
  for (let i = 0; i < height; i++) {
    input.forEach((line) => {
      const cleanLine = line.replace("S", ".");
      let uberLine = "";
      for (let j = 0; j < width; j++) {
        uberLine += cleanLine;
      }
      const newLine =
        uberLine + (i === ~~(height / 2) ? line : cleanLine) + uberLine;
      output.push(newLine);
    });
  }
  writeOutput(`large-${fileName}`, output);
}

function writeOutput(fileName, output) {
  return fs.writeFileSync(fileName, output.join("\r\n"));
}

function puzzle1(input, steps) {
  const points = [];
  const map = input.map((line, idxRow) => {
    const idxCol = line.indexOf("S");
    if (idxCol !== -1) {
      points.push({ row: idxRow, col: idxCol, remaining: steps });
    }
    return line.split("");
  });

  let result = 0;

  while (points.length > 0) {
    /**
     * Shift, because we want to procss the points with higher number of remaining steps first.
     */
    const { row, col, remaining } = points.shift();
    if (map[row][col] === "S") {
      if (remaining % 2 === 0) {
        map[row][col] = "O";
        result++;
      } else {
        map[row][col] = "X";
      }
    }
    if (remaining > 0) {
      if (row > 0 && map[row - 1][col] === ".") {
        map[row - 1][col] = "S";
        points.push({ row: row - 1, col, remaining: remaining - 1 });
      }
      if (row + 1 < map.length && map[row + 1][col] === ".") {
        map[row + 1][col] = "S";
        points.push({ row: row + 1, col, remaining: remaining - 1 });
      }
      if (col > 0 && map[row][col - 1] === ".") {
        map[row][col - 1] = "S";
        points.push({ row, col: col - 1, remaining: remaining - 1 });
      }
      if (col + 1 < map[row].length && map[row][col + 1] === ".") {
        map[row][col + 1] = "S";
        points.push({ row, col: col + 1, remaining: remaining - 1 });
      }
    }
  }

  writeOutput(
    "owt.txt",
    map.map((line) => line.join(""))
  );

  console.log("Puzzle 1", result);
}

/**
 * Test inputs
 */
createLargeFile("d21-input-smol.txt", 200, 200);
const inputTest = readInput("large-d21-input-smol.txt");
puzzle1(inputTest, 6); // 16
puzzle1(inputTest, 10); // 50
puzzle1(inputTest, 50); // 1594
puzzle1(inputTest, 100); // 6536
puzzle1(inputTest, 500); // 167004
puzzle1(inputTest, 1000); // 668697

/**
 * Puzzle 1
 */
const input1 = readInput("d21-input.txt");
puzzle1(input1, 64); // 3542

/**
 * Puzzle 2
 *
 * Not much programming, just observation and math.
 *
 * 1. Input is 131 x 131.
 * 2. We reach the borders of the input at 65 steps when we start from "S" and cover a diamond.
 * 4. With infinite space, we reach the borders of 3 x 3 map at 65 + 131 steps and cover 9 diamonds.
 * 5. With infinite space, we reach the borders of 5 x 5 map at 65 + 131 * 2 steps and cover 25 diamonds.
 * 6. With infinite space, we reach the borders of 7 x 7 map at 65 + 131 * 3 steps and cover 49 diamonds.
 * 7. Puzzle input number 26501365 is 65 + 131 * 202300
 *
 * Run the numbers though puzzle1:
 */
createLargeFile("d21-input.txt", 20, 20);
const input2 = readInput("large-d21-input.txt");
puzzle1(input2, 65 + 131 * 0); // f(0) = 3725 -- one diamond:     (1 x A)
puzzle1(input2, 65 + 131 * 1); // f(1) = 32896 -- 9 diamonds:     (5 x A) + (4 x B) = [(1 x A)] + [(4 x A) + (4 x B)]
puzzle1(input2, 65 + 131 * 2); // f(2) = 91055 -- 25 diamonds:    (13 x A) + (12 x B) = [(5 x A) + (4 x B)] + [(8 x A) + (8 x B)]
puzzle1(input2, 65 + 131 * 3); // f(3) = 178202 -- 49 diamonds:   (25 x A) + (24 x B) = [(13 x A) + (12 x B)] + [(12 x A) + (12 x B)]
puzzle1(input2, 65 + 131 * 4); // f(4) = 294337 -- 81 diamonds:   (41 x A) + (40 x B) = [(25 x A) + (24 x B)] + [(16 x A) + (16 x B)]
puzzle1(input2, 65 + 131 * 5); // f(5) = 439460
puzzle1(input2, 65 + 131 * 6); // f(6) = 613571
puzzle1(input2, 65 + 131 * 7); // f(7) = 816670

/**
 * Differences:
 *
 * f(1) - f(0) = 29171
 * f(2) - f(1) = 58159
 * f(3) - f(2) = 87147
 * f(4) - f(3) = 116135
 * f(5) - f(4) = 145123
 * f(6) - f(5) = 174111
 * f(7) - f(6) = 203099
 *
 * Second differences:
 * 58159 - 29171 = 28988
 * 87147 - 58159 = 28988
 * 116135 - 87147 = 28988
 * 145123 - 116135 = 28988
 * 174111 - 145123 = 28988
 * 203099 - 174111 = 28988
 *
 * Since the second diffrences are constant, we're dealing with quadratic formula:
 * f(x) = ax^2 + bx + c
 *
 * a = 28988 / 2 = 14494
 *
 * f(0) = a * 0^2 + b * 0 + c = 3725      => c = 3725
 * f(1) = a * 1^2 + b * 1 + 3725 = 32896  => a = 29171 - b
 * f(2) = a * 2^2 + b * 2 + 3725 = 91055  => 4a = 91055 - 3725 - 2b
 *
 * a = 14494
 * b = 14677
 * c = 3725
 *
 * To get the answer, we need to solve quadratic formula for 202300
 *
 * puzzle1(65 + 131 * 0) = f(0)
 * puzzle1(65 + 131 * 1) = f(1)
 * puzzle1(65 + 131 * 2) = f(2)
 * puzzle1(65 + 131 * 3) = f(3)
 * puzzle1(65 + 131 * 4) = f(4)
 * puzzle1(65 + 131 * 5) = f(5)
 * puzzle1(65 + 131 * 6) = f(6)
 * puzzle1(65 + 131 * 7) = f(7)
 * puzzle1(65 + 131 * 202300) = f(202300)
 *
 * where 65 + 131 * 202300 = 26501365, the number asked in puzzle 2
 */

const a = 14494;
const b = 14677;
const c = 3725;
const x = 202300;
console.log("Puzzle 2", a * x * x + b * x + c); // 593174122420825
