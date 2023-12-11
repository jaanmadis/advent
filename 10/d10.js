const fs = require("fs");

function readInput(fileName) {
  return fs
    .readFileSync(fileName, { encoding: "utf8", flag: "r" })
    .split("\r\n");
}

function writeOutput(fileName, output) {
  return fs.writeFileSync(fileName, output.join("\r\n"));
}

function getStartingPoint(input) {
  let start;
  input.some((line, rowIndex) => {
    const colIndex = line.indexOf("S");
    if (colIndex > -1) {
      start = [rowIndex, colIndex];
      return true;
    }
  });
  return start;
}

function getNext(prev, curr, pipe) {
  switch (pipe) {
    case "|":
      return curr[0] > prev[0]
        ? [curr[0] + 1, curr[1]]
        : [curr[0] - 1, curr[1]];
    case "F":
      return curr[0] === prev[0]
        ? [curr[0] + 1, curr[1]]
        : [curr[0], curr[1] + 1];
    case "7":
      return curr[0] === prev[0]
        ? [curr[0] + 1, curr[1]]
        : [curr[0], curr[1] - 1];
    case "-":
      return curr[1] > prev[1]
        ? [curr[0], curr[1] + 1]
        : [curr[0], curr[1] - 1];
    case "L":
      return curr[0] === prev[0]
        ? [curr[0] - 1, curr[1]]
        : [curr[0], curr[1] + 1];
    case "J":
      return curr[0] === prev[0]
        ? [curr[0] - 1, curr[1]]
        : [curr[0], curr[1] - 1];
  }
}

const canGoNorth = ["|", "F", "7"];
const canGoSouth = ["|", "L", "J"];
const canGoEast = ["-", "J", "7"];
const canGoWest = ["-", "L", "F"];

const cleanPipe = {
  7: "┐",
  F: "┌",
  L: "└",
  J: "┘",
  "|": "│",
  "-": "─",
};

function travel(map, first, final, finalAlias, cleanMap) {
  let prev = final;
  let curr = first;
  let pipe = map[first[0]][first[1]];
  cleanMap[first[0]][first[1]] = cleanPipe[pipe];

  let steps = 1;
  while (true) {
    let next = getNext(prev, curr, pipe);

    prev = curr;
    curr = next;
    pipe = map[next[0]][next[1]];
    cleanMap[next[0]][next[1]] = cleanPipe[pipe];
    steps++;

    if (next[0] === final[0] && next[1] === final[1]) {
      cleanMap[next[0]][next[1]] = cleanPipe[finalAlias];
      break;
    }
  }

  console.log("Steps to get from", first, "to", final, ":", steps);
  console.log("Furthest", steps / 2);
}

function countEnclosed(cleanMap) {
  let sum = 0;
  cleanMap.forEach((cleanLine) => {
    let enclosed = false;
    let bendF = false;
    let bendL = false;
    cleanLine.forEach((cleanChar) => {
      // │ swicth in/out
      // ┌ swicth if followed by ┘, no swicth if followed by ┐
      // └ swicth if followed by ┐, no swicth if followed by ┘
      if (cleanChar === "." && enclosed) {
        sum++;
      } else if (cleanChar === "│") {
        enclosed = !enclosed;
      } else if (cleanChar === "┌") {
        bendF = true;
      } else if (cleanChar === "└") {
        bendL = true;
      } else if (cleanChar === "┐") {
        if (bendL) {
          enclosed = !enclosed;
        }
        bendF = false;
        bendL = false;
      } else if (cleanChar === "┘") {
        if (bendF) {
          enclosed = !enclosed;
        }
        bendF = false;
        bendL = false;
      }
    });
  });
  console.log("Enclosed", sum);
}

function puzzle(input) {
  const start = getStartingPoint(input);

  const cleanMap = Array(input.length);
  input.forEach((line, index) => {
    cleanMap[index] = Array(line.length);
    cleanMap[index].fill(".");
  });

  let north;
  let south;
  let east;
  let west;

  let northPipe;
  let southPipe;
  let eastPipe;
  let westPipe;

  if (start[0] - 1 > 0) {
    north = [start[0] - 1, start[1]];
    northPipe = input[north[0]][north[1]];
  }
  if (start[0] + 1 < input.length) {
    south = [start[0] + 1, start[1]];
    southPipe = input[south[0]][south[1]];
  }
  if (start[1] + 1 < input[0].length) {
    east = [start[0], start[1] + 1];
    eastPipe = input[east[0]][east[1]];
  }
  if (start[1] - 1 > 0) {
    west = [start[0], start[1] - 1];
    westPipe = input[west[0]][west[1]];
  }

  if (canGoNorth.includes(northPipe) && canGoSouth.includes(southPipe)) {
    travel(input, north, start, "|", cleanMap);
  } else if (canGoNorth.includes(northPipe) && canGoEast.includes(eastPipe)) {
    travel(input, north, start, "L", cleanMap);
  } else if (canGoNorth.includes(northPipe) && canGoWest.includes(westPipe)) {
    travel(input, north, start, "J", cleanMap);
  } else if (canGoSouth.includes(southPipe) && canGoEast.includes(eastPipe)) {
    travel(input, south, start, "F", cleanMap);
  } else if (canGoSouth.includes(southPipe) && canGoWest.includes(westPipe)) {
    travel(input, south, start, "7", cleanMap);
  } else if (canGoEast.includes(eastPipe) && canGoWest.includes(westPipe)) {
    travel(input, east, start, "-", cleanMap);
  }

  countEnclosed(cleanMap);

  const output = Array(cleanMap.length);
  cleanMap.forEach((cleanLine, index) => {
    output[index] = cleanLine.join("");
  });
  writeOutput("d10-output.txt", output);
}

// 6956
// 455

const input = readInput("d10-input.txt");
puzzle(input);
