console.time("Running Time");
const fs = require("fs");
const heapjs = require("heap-js");

function readInput(fileName) {
  return fs
    .readFileSync(fileName, { encoding: "utf8", flag: "r" })
    .split("\r\n")
    .map((line) => line.split(""));
}

function addNeighbors(currentKey, input, maxStep, minTurn) {
  const neighbors = [];

  const [name, from, ...rest] = currentKey.split(",");
  const step = Number(rest[0]);
  const heat = Number(rest[1]);
  const split = name.split("-");
  const row = Number(split[0]);
  const col = Number(split[1]);

  // Can go from Right to Left.
  // Also, can't go back.
  // Also, can't move more than maxSteps in same direction.
  // Also, can't turn if we haven't taken minTurn steps in same direction.
  // Also, can't turn into a wall if we're closer to a wall than minTurn.
  if (
    0 <= col - 1 &&
    from != "LR" &&
    (step < maxStep || from != "RL") &&
    (minTurn <= step || from === "RL" || from === "START") &&
    (0 <= col - minTurn || from === "RL")
  ) {
    const newKey = [
      `${row}-${col - 1}`,
      "RL",
      from === "RL" ? step + 1 : 1,
      Number(input[row][col - 1]),
    ].join(",");
    neighbors.push(newKey);
  }

  // Can go from Left to Right.
  if (
    col + 1 < input[row].length &&
    from != "RL" &&
    (step < maxStep || from != "LR") &&
    (minTurn <= step || from === "LR" || from === "START") &&
    (col + minTurn < input[row].length || from === "LR")
  ) {
    const newKey = [
      `${row}-${col + 1}`,
      "LR",
      from === "LR" ? step + 1 : 1,
      Number(input[row][col + 1]),
    ].join(",");
    neighbors.push(newKey);
  }

  // Can go from Down to Up.
  if (
    0 <= row - 1 &&
    from != "UD" &&
    (step < maxStep || from != "DU") &&
    (minTurn <= step || from === "DU" || from === "START") &&
    (0 <= row - minTurn || from === "DU")
  ) {
    const newKey = [
      `${row - 1}-${col}`,
      "DU",
      from === "DU" ? step + 1 : 1,
      Number(input[row - 1][col]),
    ].join(",");
    neighbors.push(newKey);
  }

  // Can go from Up to Down.
  if (
    row + 1 < input.length &&
    from != "DU" &&
    (step < maxStep || from != "UD") &&
    (minTurn <= step || from === "UD" || from === "START") &&
    (row + minTurn < input.length || from === "UD")
  ) {
    const newKey = [
      `${row + 1}-${col}`,
      "UD",
      from === "UD" ? step + 1 : 1,
      Number(input[row + 1][col]),
    ].join(",");
    neighbors.push(newKey);
  }

  return neighbors;
}

const MAX_NUMBER = Number.MAX_SAFE_INTEGER;

/**
 * Puzzle only allows only 3 (or 10) steps in each direction.
 * We can't modify classic graph traversal algorithms with this restriction or we'll break these algorithms.
 * Instead, we must construct the input graph in such way that puzzle's restriction is satisfied.
 * Each number in the input file represents not one, but a collection of nodes that differ by entry direction and steps taken in that direction.
 *
 * Instead of building the entire huge graph and then running the algorithm on it,
 * we can only get the immidiate neighbors of the current node and start the algorithm on this limited amount of data.
 * Unvisited records are stored in a min-heat heap which offers much better performance than holding records in an array.
 */
function dijkstra(input, maxStep, minTurn) {
  const finishName = `${input.length - 1}-${
    input[input.length - 1].length - 1
  }`;

  const travels = {};
  const unvisitedHeap = new heapjs.Heap((a, b) => a.heat - b.heat);
  const unvisitedSet = new Set();

  const startKey = "0-0,START,0,0";
  const record = { key: startKey, heat: 0 };

  travels[startKey] = record;
  unvisitedHeap.push(record);
  unvisitedSet.add(startKey);

  while (true) {
    const currentRecord = unvisitedHeap.pop();
    unvisitedSet.delete(currentRecord.key);

    const currentName = currentRecord.key.split(",")[0];
    if (currentName === finishName) {
      console.log("Result: ", travels[currentRecord.key].heat);
      break;
    }

    const neighbors = addNeighbors(currentRecord.key, input, maxStep, minTurn);

    neighbors.forEach((neighbor) => {
      if (travels[neighbor] === undefined) {
        const record = {
          key: neighbor,
          heat: MAX_NUMBER,
        };
        travels[neighbor] = record;
        unvisitedHeap.push(record);
        unvisitedSet.add(neighbor);
      }

      if (unvisitedSet.has(neighbor)) {
        const splits = neighbor.split(",");
        const neighborHeat = Number(splits[splits.length - 1]);
        let accumulatedHeat = travels[currentRecord.key].heat + neighborHeat;
        if (travels[neighbor].heat > accumulatedHeat) {
          travels[neighbor].heat = accumulatedHeat;
        }
      }
    });
  }
}

function puzzle1(input) {
  dijkstra(input, 3, 0);
}

function puzzle2(input) {
  dijkstra(input, 10, 4);
}

// const input = readInput("d17-input-smol.txt");
const input = readInput("d17-input.txt");
puzzle1(input); // 861
puzzle2(input); // 1037

console.timeEnd("Running Time");
