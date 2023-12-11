const fs = require("fs");

function readInput(fileName) {
  return fs
    .readFileSync(fileName, { encoding: "utf8", flag: "r" })
    .split("\r\n");
}

function getGalaxies(map) {
  const galaxies = [];
  map.forEach((line, rowIndex) => {
    let colIndex = -1;
    while (true) {
      colIndex = line.indexOf("#", colIndex + 1);
      if (colIndex === -1) {
        break;
      } else {
        galaxies.push({ row: rowIndex, col: colIndex });
      }
    }
  });
  return galaxies;
}

function getExpandedRows(map) {
  const rows = [];
  map.forEach((line, index) => {
    if (line.indexOf("#") === -1) {
      rows.push(index);
    }
  });
  return rows;
}

function getExpandedCols(map) {
  const cols = [];
  for (let index = 0; index < map[0].length; index++) {
    let found = map.some((line) => line[index] === "#");
    if (!found) {
      cols.push(index);
    }
  }
  return cols;
}

function getDistance(g1, g2) {
  return Math.abs(g1.row - g2.row) + Math.abs(g1.col - g2.col);
}

function expandLine(cols, line) {
  if (cols.length === 0) {
    return line;
  }
  let result = line.substring(0, cols[0]);
  let begin = 0;
  let end = 1;
  while (end < cols.length) {
    result = result + "." + line.substring(cols[begin], cols[end]);
    begin++;
    end++;
  }
  result = result + "." + line.substring(cols[cols.length - 1]);
  return result;
}

function expand(map) {
  const expanded = [];

  // Expand rows
  map.forEach((line) => {
    if (line.indexOf("#") === -1) {
      expanded.push(line);
    }
    expanded.push(line);
  });

  // Expand columns
  const cols = getExpandedCols(expanded);
  expanded.forEach((line, index) => {
    expanded[index] = expandLine(cols, line);
  });

  return expanded;
}

/**
 * Expand the input by creating new, expanded map in memory and get distances from it.
 */
function puzzle1(input) {
  const map = expand(input);
  const galaxies = getGalaxies(map);
  const sum = galaxies.reduce((prev, curr, index1) => {
    for (let index2 = index1 + 1; index2 < galaxies.length; index2++) {
      prev = prev + getDistance(curr, galaxies[index2]);
    }
    return prev;
  }, 0);
  console.log("Result 1:", sum); // 10228230 // 374
}

function getDistanceWithExpansion(g1, g2, rows, cols, rate) {
  let distance = getDistance(g1, g2);

  rows.forEach((expanded) => {
    minRow = Math.min(Math.abs(g1.row), Math.abs(g2.row));
    maxRow = Math.max(Math.abs(g1.row), Math.abs(g2.row));
    if (minRow < expanded && expanded < maxRow) {
      distance = distance + rate - 1;
    }
  });

  cols.forEach((expanded) => {
    minCol = Math.min(Math.abs(g1.col), Math.abs(g2.col));
    maxCol = Math.max(Math.abs(g1.col), Math.abs(g2.col));
    if (minCol < expanded && expanded < maxCol) {
      distance = distance + rate - 1;
    }
  });

  return distance;
}

/**
 * Get distances without expansion and then add expansions to distances where needed.
 */
function puzzle2(input) {
  const EXPANSION_RATE = 1000000;

  const map = input;
  const expandedRows = getExpandedRows(map);
  const expandedCols = getExpandedCols(map);

  const galaxies = getGalaxies(map);
  const sum = galaxies.reduce((prev, curr, index1) => {
    for (let index2 = index1 + 1; index2 < galaxies.length; index2++) {
      prev =
        prev +
        getDistanceWithExpansion(
          curr,
          galaxies[index2],
          expandedRows,
          expandedCols,
          EXPANSION_RATE
        );
    }
    return prev;
  }, 0);
  console.log("Result 2:", sum); // 447073334102
}

const input = readInput("d11-input.txt");
puzzle1(input);
puzzle2(input);
