const fs = require("fs");

function readInput(fileName) {
  return fs
    .readFileSync(fileName, { encoding: "utf8", flag: "r" })
    .split("\r\n");
}

/**
 * Flip columns <> rows.
 */
function transpose(pattern) {
  const result = new Array(pattern[0].length).fill("");
  pattern.forEach((line) => {
    for (let charIndex = 0; charIndex < line.length; charIndex++) {
      result[charIndex] = result[charIndex] + line[charIndex];
    }
  });
  return result;
}

function compWest(a, b) {
  if (a === "." && b === "O") return 1;
  if (a === "O" && b === ".") return -1;
  if (a === b) return 1;
}

function compEast(a, b) {
  if (a === "." && b === "O") return -1;
  if (a === "O" && b === ".") return 1;
  if (a === b) return 1;
}

/**
 * Split by #.
 * Sort each split, so that O-s are either on the left or right, depending on given comp function.
 * Join by #.
 */
function tilt(input, comp) {
  input.forEach((line, idxLine) => {
    const splits = line.split("#");
    splits.forEach((split, idxSplit) => {
      splitter = split.split("");
      splitter.sort(comp);
      splits[idxSplit] = splitter.join("");
    });
    input[idxLine] = splits.join("#");
  });
  return input;
}

/**
 * Transpose, so that north ends up on the left/west.
 * Tilt to west: O before .
 * Transpose back.
 */
function tiltNorth(input) {
  const transposed = transpose(input);
  const tilted = tilt(transposed, compWest);
  return transpose(tilted);
}

/**
 * Tilt to west: O before .
 */
function tiltWest(input) {
  return tilt(input, compWest);
}

/**
 * Transpose, so that south ends up on the right/east.
 * Tilt to east: . before O
 * Transpose back.
 */
function tiltSouth(input) {
  const transposed = transpose(input);
  const tilted = tilt(transposed, compEast);
  return transpose(tilted);
}

/**
 * Tilt to east: . before O
 */
function tiltEast(input) {
  return tilt(input, compEast);
}

function calculateResult(input) {
  let result = 0;
  input.forEach((line, idxLine) => {
    const matches = line.match(/O/g);
    if (matches) result += line.match(/O/g).length * (input.length - idxLine);
  });
  return result;
}

/**
 * Tilt north and calculate.
 */
function puzzle1(input) {
  const tilted = tiltNorth(input);
  console.log("Result 1: ", calculateResult(tilted)); // 105208
}

/**
 * Keep track of layouts using map and an array.
 * When loop is found, then calculate the index of the last layout after all rotations would be done and calculate it.
 */
function puzzle2(input) {
  const lookup = new Map();
  const layouts = [];
  const rotations = 1000000000;
  let final = input;

  console.log("Rotations: ", rotations);
  for (let i = 0; i < rotations; i++) {
    const layout = input.join("x");
    if (lookup.has(layout)) {
      const loopStart = lookup.get(layout);
      const loopLength = i - lookup.get(layout);
      const finalIndex =
        ((rotations + loopLength - loopStart) % loopLength) + loopStart;
      final = layouts[finalIndex].split("x");

      console.log(`Loop found: ${i} is the same as ${loopStart}.`);
      console.log(`Loop length is ${loopLength}.`);
      console.log(`Index after ${rotations} rotations is ${finalIndex}.`);
      break;
    } else {
      lookup.set(layout, i);
      layouts.push(layout);
    }

    input = tiltNorth(input);
    input = tiltWest(input);
    input = tiltSouth(input);
    input = tiltEast(input);
  }
  console.log("Result 1: ", calculateResult(final)); // 102943
}

// const input = readInput("d14-input-smol.txt");
const input = readInput("d14-input.txt");
puzzle1(input);
puzzle2(input);
