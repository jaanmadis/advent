console.time("Running Time");
const fs = require("fs");

function readInput(fileName) {
  return fs
    .readFileSync(fileName, { encoding: "utf8", flag: "r" })
    .split("\r\n")
    .map((line) => line.split(""));
}

function processKey(graph, keys, newKey, oldKey) {
  if (graph[newKey] === undefined) {
    graph[newKey] = [];
    keys.push(newKey);
  }
  if (!graph[oldKey].includes(newKey)) {
    graph[oldKey].push(newKey);
  }
}

/**
 * Puzzle only allows only 3 steps in each direction.
 * We can't modify classic graph traversal algorithms with this restriction or we'll break these algorithms.
 * Instead, we must construct the input graph in such way that puzzle's restriction is satisfied.
 * Each number in the input file represents not one, but a collection of nodes that differ by entry direction and steps taken in that direction.
 */
function prepareData(input) {
  const graph = {};
  const keys = [];

  let startKey = ["0-0", "START", 0, 0].join(",");
  graph[startKey] = [];
  keys.push(startKey);

  let ptr = 0;
  do {
    const oldKey = keys[ptr];
    const [name, from, ...rest] = keys[ptr].split(",");
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
      processKey(graph, keys, newKey, oldKey);
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
      processKey(graph, keys, newKey, oldKey);
    }

    // Can go from Down to Up
    if (0 <= row - 1 && from != "UD" && (step < 3 || from != "DU")) {
      const newKey = [
        `${row - 1}-${col}`,
        "DU",
        from === "DU" ? step + 1 : 1,
        Number(input[row - 1][col]),
      ].join(",");
      processKey(graph, keys, newKey, oldKey);
    }

    // Can go from Up to Down
    if (row + 1 < input.length && from != "DU" && (step < 3 || from != "UD")) {
      const newKey = [
        `${row + 1}-${col}`,
        "UD",
        from === "UD" ? step + 1 : 1,
        Number(input[row + 1][col]),
      ].join(",");
      processKey(graph, keys, newKey, oldKey);
    }

    ptr++;
  } while (ptr < keys.length);

  return { graph, keys, input };
}

const MAX_NUMBER = Number.MAX_SAFE_INTEGER;

/**
 * However, this is too slow.
 * The bottleneck is sorting the unvisited records array to find the next node with smallest heat.
 * There are a lot of nodes and sorting needs to be done for every iteration.
 */
function dijkstra(start, finish, data) {
  const travels = {};
  const unvisitedSet = new Set(data.keys);
  const unvisitedRecords = [];
  unvisitedSet.forEach((key) => {
    const record = {
      key,
      heat: MAX_NUMBER,
    };
    unvisitedRecords.push(record);
    travels[key] = record;
  });

  travels[start].heat = 0;
  unvisitedSet.delete(start);
  let current = unvisitedRecords.shift().key;

  while (true) {
    data.graph[current].forEach((neighbor) => {
      if (unvisitedSet.has(neighbor)) {
        const splits = neighbor.split(",");
        const neighborHeat = Number(splits[splits.length - 1]);
        let accumulatedHeat = travels[current].heat + neighborHeat;
        if (travels[neighbor].heat > accumulatedHeat) {
          travels[neighbor].heat = accumulatedHeat;
        }
      }
    });

    const splits = current.split(",");
    const currentName = splits[0];
    if (currentName === finish) {
      console.log("Result: ", travels[current].heat);
      break;
    } else {
      unvisitedRecords.sort((a, b) => a.heat - b.heat);
      current = unvisitedRecords.shift().key;
      unvisitedSet.delete(current);
    }
  }
}

function puzzle1(data) {
  const start = data.keys[0];
  const finish = `${data.input.length - 1}-${
    data.input[data.input.length - 1].length - 1
  }`;
  dijkstra(start, finish, data);
}

// const input = readInput("d17-input-smol.txt");
const input = readInput("d17-input.txt");
const data = prepareData(input);
puzzle1(data); // 861

console.timeEnd("Running Time");
