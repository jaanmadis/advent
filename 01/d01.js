const fs = require("fs");

function getItems(fileName) {
  return fs
    .readFileSync(fileName, { encoding: "utf8", flag: "r" })
    .split("\r\n");
}

function getSum(items) {
  let sum = 0;
  items.forEach((item) => {
    const matches = item.match(/\d/g);
    const number = matches[0] + matches[matches.length - 1];
    sum = sum + +number;
  });
  return sum;
}

const items = getItems("d01-input.txt");
const sum = getSum(items);

console.log(sum);
