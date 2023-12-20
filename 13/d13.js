const fs = require("fs");

function getInput(fileName) {
  const input = fs.readFileSync(fileName, { encoding: "utf8", flag: "r" });
  const patterns = [];
  input.split("\r\n\r\n").forEach((item) => {
    patterns.push(item.split("\r\n"));
  });
  return patterns;
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

/**
 * Convert to a number, read input as a binary.
 * . is 0
 * # is 1
 *
 * This makes smudge detection easier (part 2).
 */
function convert(pattern) {
  const result = [];
  pattern.forEach((line) => {
    const binaryString = line.replace(/\./g, 0).replace(/\#/g, 1);
    const digit = parseInt(binaryString, 2);
    result.push(digit);
  });
  return result;
}

/**
 * Mirror candidate must be an even number
 *
 * This can't be a mirror:
 * #..#
 * .##.
 * #..#
 *
 * This can be a mirror:
 * #..#
 * .##.
 * .##.
 * #..#
 */
function distanceIsEven(top, bottom) {
  return (bottom - top - 1) % 2 === 0;
}

/**
 * Exactly one "bit" must differ between two lines for it to be a smudge.
 * We can detect a smudge, if we xor two lines together and result is a power of 2.
 *
 * ...##..#. -> 000110010
 * #..##..#. -> 100110010
 *
 * 000110010 xor 100110010 = 100000000 = 256 = 2 pow 8
 *
 * If the result is 0, then numbers are exactly equal.
 * If the result is not a power of 2, then more than one "bit" is different and this is not a smudge. *
 */
function isPow2(x) {
  return (x & (x - 1)) === 0;
}

/**
 * Numbers have to be exactly equal.
 * Or differ exactly by one bit (smudge) and we only allow one smudge.
 */
function isEqual(a, b, smudgeTolerance) {
  if (a === b) return true;
  if (isPow2(a ^ b)) {
    if (smudgeTolerance && smudgeTolerance.value === 1) {
      smudgeTolerance.value = 0;
      return true;
    }
  }
  return false;
}

/**
 * Check the pairs of lines.
 * If every pair from top to bottom were equal (considering smudges).
 * Then return top + 1 as result.
 */
function isMirror(pattern, top, bottom, smudgeTolerance) {
  while (isEqual(pattern[top], pattern[bottom], smudgeTolerance)) {
    if (top === bottom - 1) {
      return top + 1;
    }
    top++;
    bottom--;
    if (top > bottom) return 0;
  }
  return 0;
}

/**
 * Mirror must reach an edge.
 * Keep the top line same and check for mirror for every line from bottom to top.
 * Keep the bottom line same and check for mirror for every line from top to bottom.
 */
function solvePattern(pattern, smudgeToleranceValue) {
  let result = 0;
  let resultTop = 0;
  let resultBottom = 0;
  let smudgeTolerance;

  for (index = pattern.length - 1; index > 0; index--) {
    if (distanceIsEven(0, index)) {
      smudgeTolerance = { value: smudgeToleranceValue };
      result = isMirror(pattern, 0, index, smudgeTolerance);
      // Must have a smudge if smudge was allowed.
      if (result && smudgeTolerance && smudgeTolerance.value !== 0) {
        result = 0;
      }
    }
    if (result) {
      if (resultTop) {
        resultTop = Math.min(result, resultTop);
      } else {
        resultTop = result;
      }
    }
  }

  for (index = 0; index < pattern.length; index++) {
    if (distanceIsEven(index, pattern.length - 1)) {
      smudgeTolerance = { value: smudgeToleranceValue };
      result = isMirror(pattern, index, pattern.length - 1, smudgeTolerance);
      // Must have a smudge if smudge was allowed.
      if (result && smudgeTolerance && smudgeTolerance.value !== 0) {
        result = 0;
      }
    }
    if (result) {
      if (resultBottom) {
        resultBottom = Math.min(result, resultBottom);
      } else {
        resultBottom = result;
      }
    }
  }

  return resultTop !== 0 && resultBottom !== 0
    ? Math.min(resultTop, resultBottom)
    : resultTop || resultBottom;
}

/**
 * Check for horizontal mirrors, transpose and check for vertical mirrors.
 */
function puzzle(patterns, smudgeToleranceValue) {
  let result = 0;
  patterns.forEach((pattern) => {
    const converted = convert(pattern);
    const resultH = solvePattern(converted, smudgeToleranceValue);

    const transposed = transpose(pattern);
    const convertedAndTransposed = convert(transposed);
    const resultV = solvePattern(convertedAndTransposed, smudgeToleranceValue);

    if (
      (resultH !== 0 && resultV !== 0 && resultH < resultV) ||
      resultH !== 0
    ) {
      result += 100 * resultH;
    } else if (
      (resultH !== 0 && resultV !== 0 && resultH > resultV) ||
      resultV !== 0
    ) {
      result += resultV;
    }
  });
  console.log("Puzzle: ", result);
}

const input = getInput("d13-input.txt");
puzzle(input, 0); // 37975
puzzle(input, 1); // 32497
