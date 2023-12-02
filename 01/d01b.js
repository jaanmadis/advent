const fs = require("fs");

function getItems(fileName) {
  return fs
    .readFileSync(fileName, { encoding: "utf8", flag: "r" })
    .split("\r\n");
}

function stringDigitToNumber(digit) {
  switch (digit) {
    case "one":
      return 1;
    case "two":
      return 2;
    case "three":
      return 3;
    case "four":
      return 4;
    case "five":
      return 5;
    case "six":
      return 6;
    case "seven":
      return 7;
    case "eight":
      return 8;
    case "nine":
      return 9;
    default:
      return +digit;
  }
}

function getSum(items) {
  let sum = 0;
  items.forEach((item) => {
    const iteratorOfMatches = item.matchAll(
      /(?=(one|two|three|four|five|six|seven|eight|nine|\d))/g
    );
    const matches = [...iteratorOfMatches];
    const number =
      stringDigitToNumber(matches[0][1]) * 10 +
      stringDigitToNumber(matches[matches.length - 1][1]);
    sum = sum + number;
  });
  return sum;
}

const items = getItems("d01-input.txt");
const sum = getSum(items);

console.log(sum);
