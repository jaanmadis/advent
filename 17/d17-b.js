console.time("Running Time");
const fs = require("fs");

function readInput(fileName) {
  return fs
    .readFileSync(fileName, { encoding: "utf8", flag: "r" })
    .split("\r\n")
    .map((line) => line.split(""));
}

function addNeighbors(currentKey, input) {
  const neighbors = [];

  const [name, from, ...rest] = currentKey.split(",");
  const step = Number(rest[0]);
  const heat = Number(rest[1]);
  const split = name.split("-");
  const row = Number(split[0]);
  const col = Number(split[1]);

  // Can go from Right to Left
  // Also, can't go back.
  // Also, can't move more than maxSteps in same direction.
  if (0 <= col - 1 && from != "LR" && (step < 3 || from != "RL")) {
    const newKey = [
      `${row}-${col - 1}`,
      "RL",
      from === "RL" ? step + 1 : 1,
      Number(input[row][col - 1]),
    ].join(",");
    neighbors.push(newKey);
  }

  // Can go from Left to Right
  if (
    col + 1 < input[row].length &&
    from != "RL" &&
    (step < 3 || from != "LR")
  ) {
    const newKey = [
      `${row}-${col + 1}`,
      "LR",
      from === "LR" ? step + 1 : 1,
      Number(input[row][col + 1]),
    ].join(",");
    neighbors.push(newKey);
  }

  // Can go from Down to Up
  if (0 <= row - 1 && from != "UD" && (step < 3 || from != "DU")) {
    const newKey = [
      `${row - 1}-${col}`,
      "DU",
      from === "DU" ? step + 1 : 1,
      Number(input[row - 1][col]),
    ].join(",");
    neighbors.push(newKey);
  }

  // Can go from Up to Down
  if (row + 1 < input.length && from != "DU" && (step < 3 || from != "UD")) {
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
 * Puzzle only allows only 3 steps in each direction.
 * We can't modify classic graph traversal algorithms with this restriction or we'll break these algorithms.
 * Instead, we must construct the input graph in such way that puzzle's restriction is satisfied.
 * Each number in the input file represents not one, but a collection of nodes that differ by entry direction and steps taken in that direction.
 *
 * Instead of building the entire huge graph and then running the algorithm on it,
 * we can only get the immidiate neighbors of the current node and start the algorithm on this limited amount of data.
 *
 * This will improve the performance, sorting is done on a much smaller array.
 * However, even with only few thousand records in unvisited array, sorting and shifting the array on every iteration is still noticeable.
 */
function dijkstra(finish, input) {
  const travels = {};
  const unvisitedRecords = [];
  const unvisitedSet = new Set();

  const startKey = "0-0,START,0,0";
  const record = { key: startKey, heat: 0 };

  travels[startKey] = record;
  unvisitedRecords.push(record);
  unvisitedSet.add(startKey);

  while (true) {
    const currentRecord = unvisitedRecords.shift();
    unvisitedSet.delete(currentRecord.key);

    const currentName = currentRecord.key.split(",")[0];
    if (currentName === finish) {
      console.log("Result: ", travels[currentRecord.key].heat);
      break;
    }

    const neighbors = addNeighbors(currentRecord.key, input);

    neighbors.forEach((neighbor) => {
      if (travels[neighbor] === undefined) {
        const record = {
          key: neighbor,
          heat: MAX_NUMBER,
        };
        travels[neighbor] = record;
        unvisitedRecords.push(record);
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

    unvisitedRecords.sort((a, b) => a.heat - b.heat);
  }
}

function puzzle1(input) {
  const finish = `${input.length - 1}-${input[input.length - 1].length - 1}`;
  dijkstra(finish, input);
}

// const input = readInput("d17-input-smol.txt");
const input = readInput("d17-input.txt");
puzzle1(input); // 861

console.timeEnd("Running Time");
